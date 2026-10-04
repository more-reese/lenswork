import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  CaseInputSchema,
  DEFAULT_STAGE_MODELS,
  type CaseFile,
} from "@/lib/schema";
import { listCases, newCaseId, writeCase } from "@/lib/storage";
import { SAMPLE_SEEDS } from "@/lib/llm/mock";

export async function GET() {
  try {
    return NextResponse.json(await listCases());
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to list cases." },
      { status: 500 }
    );
  }
}

const CreateSchema = z.union([
  z.object({ input: CaseInputSchema }),
  z.object({ sampleKey: z.string() }),
]);

export async function POST(req: NextRequest) {
  try {
    const body = CreateSchema.parse(await req.json());
    const now = new Date().toISOString();
    const id = newCaseId();

    let file: CaseFile;
    if ("sampleKey" in body) {
      const seed = SAMPLE_SEEDS.find((s) => s.key === body.sampleKey);
      if (!seed) {
        return NextResponse.json({ error: `Unknown sample: ${body.sampleKey}` }, { status: 400 });
      }
      file = {
        schemaVersion: 1,
        id,
        createdAt: now,
        updatedAt: now,
        input: seed.input,
        caseModel: undefined,
        caseModelApproved: false,
        analyses: {},
        synthesis: undefined,
        settings: { models: DEFAULT_STAGE_MODELS, depth: seed.input.depth },
        log: [{ at: now, kind: "created", description: `Created from sample "${seed.input.title}".` }],
        isSample: true,
      };
    } else {
      file = {
        schemaVersion: 1,
        id,
        createdAt: now,
        updatedAt: now,
        input: body.input,
        caseModel: undefined,
        caseModelApproved: false,
        analyses: {},
        synthesis: undefined,
        settings: { models: DEFAULT_STAGE_MODELS, depth: body.input.depth },
        log: [{ at: now, kind: "created", description: "Case created." }],
        isSample: false,
      };
    }
    await writeCase(file);
    return NextResponse.json(file, { status: 201 });
  } catch (err) {
    const message =
      err instanceof z.ZodError
        ? err.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ")
        : err instanceof Error
          ? err.message
          : "Failed to create case.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
