/**
 * Analysis orchestrator. One stage per request so the client can run the
 * eight lens passes concurrently with native per-lens progress, retry, and
 * partial failure. LLM calls run outside the per-case lock; the
 * read-modify-write of the case file runs inside it.
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  LensIdSchema,
  ModelChoiceSchema,
  type CaseFile,
  type LensRun,
} from "@/lib/schema";
import { readCase, withCaseLock, writeCase } from "@/lib/storage";
import { getProvider } from "@/lib/llm";
import { ProviderError } from "@/lib/llm/provider";

const RequestSchema = z.object({
  caseId: z.string(),
  stage: z.enum(["normalize", "lens", "synthesis", "refine"]),
  lens: LensIdSchema.optional(),
  message: z.string().optional(),
  provider: z.enum(["auto", "mock"]).default("auto"),
  model: ModelChoiceSchema.optional(),
});

function errorPayload(err: unknown): { error: string; kind: string; retryable: boolean } {
  if (err instanceof ProviderError) {
    return { error: err.message, kind: err.kind, retryable: err.retryable };
  }
  return {
    error: err instanceof Error ? err.message : "Unknown error.",
    kind: "unknown",
    retryable: false,
  };
}

async function persist(caseId: string, mutate: (file: CaseFile) => CaseFile): Promise<CaseFile> {
  return withCaseLock(caseId, async () => {
    const current = await readCase(caseId);
    if (!current) throw Object.assign(new Error("Case not found."), { status: 404 });
    const next = mutate(current);
    next.updatedAt = new Date().toISOString();
    await writeCase(next);
    return next;
  });
}

export async function POST(req: NextRequest) {
  let body: z.infer<typeof RequestSchema>;
  try {
    body = RequestSchema.parse(await req.json());
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Bad request." },
      { status: 400 }
    );
  }

  const file = await readCase(body.caseId);
  if (!file) return NextResponse.json({ error: "Case not found." }, { status: 404 });

  const provider = getProvider(body.provider);
  const now = () => new Date().toISOString();

  // ---- Stage A: normalize --------------------------------------------------
  if (body.stage === "normalize") {
    try {
      const caseModel = await provider.normalize(file.input, {
        model: body.model ?? file.settings.models.normalize,
        depth: file.settings.depth,
      });
      const updated = await persist(body.caseId, (f) => ({
        ...f,
        caseModel,
        caseModelApproved: false,
        log: [...f.log, { at: now(), kind: "normalized", description: `Case parsed by ${provider.name} into ${caseModel.items.length} items.` }],
      }));
      return NextResponse.json({ caseFile: updated });
    } catch (err) {
      return NextResponse.json(errorPayload(err), { status: 502 });
    }
  }

  if (!file.caseModel) {
    return NextResponse.json({ error: "Case has no case model yet. Run normalize first." }, { status: 409 });
  }
  const caseModel = file.caseModel;

  // ---- Stage B: one lens pass ----------------------------------------------
  if (body.stage === "lens") {
    if (!body.lens) return NextResponse.json({ error: "Missing lens." }, { status: 400 });
    const lens = body.lens;
    const model = body.model ?? file.settings.models.lenses;
    let run: LensRun;
    try {
      const analysis = await provider.analyzeLens(lens, caseModel, {
        model,
        depth: file.settings.depth,
      });
      run = {
        status: "done",
        model: provider.name === "mock" ? "mock" : model,
        analysis,
        revisions: file.analyses[lens]?.revisions ?? [],
        updatedAt: now(),
      };
    } catch (err) {
      const payload = errorPayload(err);
      run = {
        status: "error",
        model: provider.name === "mock" ? "mock" : model,
        error: payload.error,
        analysis: file.analyses[lens]?.analysis,
        revisions: file.analyses[lens]?.revisions ?? [],
        updatedAt: now(),
      };
      const updated = await persist(body.caseId, (f) => ({
        ...f,
        analyses: { ...f.analyses, [lens]: run },
        log: [...f.log, { at: now(), kind: "lens_error", description: `${lens}: ${payload.error}` }],
      }));
      return NextResponse.json({ lens, run, updatedAt: updated.updatedAt, ...payload }, { status: 502 });
    }
    const updated = await persist(body.caseId, (f) => ({
      ...f,
      analyses: { ...f.analyses, [lens]: run },
      synthesis: f.synthesis ? { ...f.synthesis, status: "stale" as const } : f.synthesis,
      log: [...f.log, { at: now(), kind: "lens_done", description: `${lens} analysis complete.` }],
    }));
    return NextResponse.json({ lens, run, updatedAt: updated.updatedAt });
  }

  // ---- Stage C: synthesis ----------------------------------------------------
  if (body.stage === "synthesis") {
    const done = Object.fromEntries(
      Object.entries(file.analyses)
        .filter(([, r]) => r.status === "done" && r.analysis)
        .map(([l, r]) => [l, r.analysis!])
    );
    if (Object.keys(done).length === 0) {
      return NextResponse.json({ error: "No completed lens analyses to synthesize." }, { status: 409 });
    }
    const model = body.model ?? file.settings.models.synthesis;
    try {
      const result = await provider.synthesize(caseModel, done, {
        model,
        depth: file.settings.depth,
      });
      const synthesis: CaseFile["synthesis"] = {
        status: "done",
        model: provider.name === "mock" ? "mock" : model,
        result,
        updatedAt: now(),
      };
      const updated = await persist(body.caseId, (f) => ({
        ...f,
        synthesis,
        log: [...f.log, { at: now(), kind: "synthesis_done", description: `Synthesis complete over ${Object.keys(done).length} lenses.` }],
      }));
      return NextResponse.json({ synthesis, updatedAt: updated.updatedAt });
    } catch (err) {
      const payload = errorPayload(err);
      const synthesis: CaseFile["synthesis"] = {
        status: "error",
        model: provider.name === "mock" ? "mock" : model,
        error: payload.error,
        result: file.synthesis?.result,
        updatedAt: now(),
      };
      await persist(body.caseId, (f) => ({ ...f, synthesis }));
      return NextResponse.json({ synthesis, ...payload }, { status: 502 });
    }
  }

  // ---- Conversational refine -------------------------------------------------
  if (body.stage === "refine") {
    if (!body.lens || !body.message) {
      return NextResponse.json({ error: "Refine requires lens and message." }, { status: 400 });
    }
    const lens = body.lens;
    const existing = file.analyses[lens];
    if (!existing?.analysis) {
      return NextResponse.json({ error: "No analysis to refine for this lens." }, { status: 409 });
    }
    // Refine reuses the model that produced the current analysis, unless overridden.
    const reusable = ModelChoiceSchema.safeParse(existing.model);
    const model = body.model ?? (reusable.success ? reusable.data : file.settings.models.lenses);
    try {
      const { analysis, note } = await provider.refineLens(lens, caseModel, existing.analysis, body.message, {
        model,
        depth: file.settings.depth,
      });
      const run: LensRun = {
        status: "done",
        model: provider.name === "mock" ? "mock" : model,
        analysis,
        revisions: [
          ...existing.revisions,
          { at: now(), trigger: "refine", note, previous: existing.analysis },
        ],
        updatedAt: now(),
      };
      const updated = await persist(body.caseId, (f) => ({
        ...f,
        analyses: { ...f.analyses, [lens]: run },
        synthesis: f.synthesis ? { ...f.synthesis, status: "stale" as const } : f.synthesis,
        log: [...f.log, { at: now(), kind: "refined", description: `${lens} revised: ${note}` }],
      }));
      return NextResponse.json({ lens, run, updatedAt: updated.updatedAt });
    } catch (err) {
      return NextResponse.json(errorPayload(err), { status: 502 });
    }
  }

  return NextResponse.json({ error: "Unknown stage." }, { status: 400 });
}
