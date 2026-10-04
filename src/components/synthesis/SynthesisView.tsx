"use client";
/**
 * Cross-lens synthesis: convergence matrix, conflicts preserved with their
 * force intact, unknowns, assumption/value dependencies, evidence
 * priorities, next steps, and a provisional (revisable) judgment. Every
 * claim is clickable and traceable in the inspector.
 */
import React, { useMemo } from "react";
import {
  LENS_IDS,
  type LensAnalysis,
  type LensId,
  type SynthesisClaim,
} from "@/lib/schema";
import { useWorkspace } from "@/lib/store";
import { LENSES, LENS_ORDER } from "@/lib/lenses/registry";
import { Button, ConfidenceBadge, Spinner } from "@/components/ui/primitives";
import { SectionCard } from "@/components/lens/LensShell";
import { Callout } from "@/components/lens/shared";
import { LensGlyph } from "@/components/overview/OverviewView";

function ClaimList({
  claims,
  tone,
}: {
  claims: SynthesisClaim[];
  tone?: "warn" | "default";
}) {
  const select = useWorkspace((s) => s.select);
  const selection = useWorkspace((s) => s.selection);
  if (claims.length === 0) return <p className="text-sm text-ink-faint">None recorded.</p>;
  return (
    <ul className="space-y-2">
      {claims.map((c) => (
        <li key={c.id}>
          <button
            onClick={() => select({ scope: "synthesis", refId: c.id })}
            className={`w-full rounded border px-3 py-2 text-left text-sm hover:bg-surface-2 ${
              selection?.refId === c.id ? "border-accent" : tone === "warn" ? "border-line" : "border-line"
            }`}
          >
            <span className="text-ink">{c.statement}</span>
            {c.lenses.length > 0 && (
              <span className="mt-1 flex flex-wrap gap-1">
                {c.lenses.map((l) => (
                  <span key={l} className="rounded bg-surface-2 px-1.5 py-0.5 text-[11px] font-medium text-ink-muted">
                    {LENSES[l].shortName}
                  </span>
                ))}
              </span>
            )}
          </button>
        </li>
      ))}
    </ul>
  );
}

function ConvergenceMatrix({ claims }: { claims: SynthesisClaim[] }) {
  const select = useWorkspace((s) => s.select);
  if (claims.length === 0) return null;
  return (
    <div className="lw-scroll overflow-x-auto rounded border border-line">
      <table className="w-full min-w-[720px] border-collapse text-sm">
        <caption className="sr-only">
          Convergence matrix: which lenses support or contest each synthesis claim
        </caption>
        <thead>
          <tr className="bg-surface-2">
            <th scope="col" className="border-b border-line px-2.5 py-2 text-left text-[12.5px] font-semibold text-ink-muted">
              Claim
            </th>
            {LENS_ORDER.map((l) => (
              <th key={l} scope="col" className="border-b border-line px-1.5 py-2 text-center text-[11px] font-semibold text-ink-muted">
                <span className="inline-flex flex-col items-center gap-0.5" title={LENSES[l].name}>
                  <LensGlyph lens={l} size={18} />
                  {LENSES[l].shortName.slice(0, 4)}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {claims.map((c) => (
            <tr key={c.id} className="odd:bg-surface even:bg-surface-2/40">
              <td className="border-b border-line px-2.5 py-2">
                <button className="text-left text-ink hover:underline" onClick={() => select({ scope: "synthesis", refId: c.id })}>
                  {c.statement.length > 110 ? `${c.statement.slice(0, 109)}…` : c.statement}
                </button>
              </td>
              {LENS_ORDER.map((l) => (
                <td key={l} className="border-b border-line px-1.5 py-2 text-center">
                  {c.lenses.includes(l) ? (
                    <span className="font-bold" style={{ color: "var(--ok)" }} aria-label={`${LENSES[l].name} supports`}>●</span>
                  ) : (
                    <span className="text-line-strong" aria-label={`${LENSES[l].name}: silent`}>–</span>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ReasoningPipeline({ analyses }: { analyses: Partial<Record<LensId, LensAnalysis>> }) {
  const setView = useWorkspace((s) => s.setView);
  return (
    <ol className="space-y-1.5" aria-label="Reasoning pipeline: what each lens took in, established, and handed off">
      {LENS_ORDER.map((lens) => {
        const a = analyses[lens];
        if (!a) return null;
        const handoff = a.handoffs[0];
        return (
          <li key={lens} className="grid gap-1 rounded border border-line bg-surface px-3 py-2 text-[13px] md:grid-cols-[150px_1fr_240px]">
            <button
              className="flex items-center gap-2 text-left font-medium text-ink hover:underline"
              onClick={() => setView({ kind: "lens", lens })}
            >
              <span className="text-ink-muted"><LensGlyph lens={lens} size={20} /></span>
              {LENSES[lens].shortName}
            </button>
            <span className="text-ink-muted">
              {a.canEstablish[0] ?? a.plainLanguageSummary.split(".")[0] + "."}
            </span>
            <span className="text-ink-faint">
              {handoff ? (
                <>→ hands {LENSES[handoff.targetLens].shortName.toLowerCase()}: {handoff.reason.length > 80 ? `${handoff.reason.slice(0, 79)}…` : handoff.reason}</>
              ) : (
                "—"
              )}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

export default function SynthesisView() {
  const caseFile = useWorkspace((s) => s.caseFile);
  const synthesisStatus = useWorkspace((s) => s.synthesisStatus);
  const synthesisError = useWorkspace((s) => s.synthesisError);
  const runSynthesis = useWorkspace((s) => s.runSynthesis);
  const runStatus = useWorkspace((s) => s.runStatus);

  const analyses = useMemo(() => {
    const out: Partial<Record<LensId, LensAnalysis>> = {};
    if (!caseFile) return out;
    for (const lens of LENS_IDS) {
      const a = caseFile.analyses[lens]?.analysis;
      if (a) out[lens] = a;
    }
    return out;
  }, [caseFile]);

  const syn = caseFile?.synthesis?.result;
  const doneCount = Object.values(runStatus).filter((s) => s === "done" || s === "stale").length;

  const header = (
    <header className="space-y-1">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="font-brand text-[28px] font-semibold text-ink">Synthesis</h2>
        {caseFile?.synthesis && (
          <span className="rounded bg-surface-2 px-2 py-0.5 text-[12px] text-ink-muted">{caseFile.synthesis.model}</span>
        )}
        {synthesisStatus === "stale" && (
          <span className="rounded px-2 py-0.5 text-[12px]" style={{ background: "var(--ep-assumption-soft)", color: "var(--warn)" }}>
            Lenses changed since this ran
          </span>
        )}
        {(syn || synthesisStatus === "stale" || synthesisStatus === "error") && (
          <Button size="sm" onClick={() => void runSynthesis()} disabled={synthesisStatus === "running"}>
            Re-synthesize
          </Button>
        )}
      </div>
      <p className="max-w-[75ch] text-[14px] text-ink-muted">
        Where the lenses converge, where they genuinely conflict, and what remains unknown. The
        synthesis preserves disagreement — it is a map of the analytical landscape, not a verdict.
      </p>
    </header>
  );

  if (synthesisStatus === "running") {
    return (
      <div className="space-y-4">
        {header}
        <div className="rounded-lg border border-line bg-surface p-8 text-center">
          <Spinner label={`Synthesizing across ${doneCount} completed lenses — preserving conflicts…`} />
        </div>
      </div>
    );
  }

  if (!syn) {
    return (
      <div className="space-y-4">
        {header}
        <div className="rounded-lg border border-line bg-surface p-6 text-center">
          {synthesisStatus === "error" ? (
            <>
              <p className="mb-1 text-sm font-medium text-danger">Synthesis failed.</p>
              {synthesisError && <p className="mb-3 text-[13px] text-ink-muted">{synthesisError}</p>}
              <Button variant="primary" onClick={() => void runSynthesis()}>Retry synthesis</Button>
            </>
          ) : doneCount === 0 ? (
            <p className="text-sm text-ink-muted">Run the lenses first — synthesis needs their outputs.</p>
          ) : (
            <>
              <p className="mb-3 text-sm text-ink-muted">{doneCount} lens analyses are ready to synthesize.</p>
              <Button variant="primary" onClick={() => void runSynthesis()}>Synthesize</Button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-10">
      {header}

      {syn.provisionalJudgment && (
        <Callout title="Provisional judgment — explicitly revisable" tone="accent">
          <p className="text-ink">{syn.provisionalJudgment.statement}</p>
          <div className="mt-1.5 flex items-center gap-2">
            <ConfidenceBadge value={syn.provisionalJudgment.confidence} />
            <span className="text-[12.5px]">{syn.provisionalJudgment.rationale}</span>
          </div>
          {syn.provisionalJudgment.conditions.length > 0 && (
            <>
              <p className="mt-2 text-[12px] font-semibold uppercase tracking-wide text-ink-faint">Revise if</p>
              <ul className="mt-0.5 list-disc space-y-0.5 pl-4">
                {syn.provisionalJudgment.conditions.map((c, i) => <li key={i}>{c}</li>)}
              </ul>
            </>
          )}
        </Callout>
      )}

      <SectionCard title="Convergence matrix — who agrees on what">
        <ConvergenceMatrix claims={[...syn.convergence, ...syn.conflicts]} />
        <p className="mt-1.5 text-[12px] text-ink-faint">● = this lens supports or carries the claim · – = silent. Conflicts appear here too: their dots show who is party to the tension.</p>
      </SectionCard>

      <div className="grid gap-3 lg:grid-cols-2">
        <SectionCard title="Where the lenses converge">
          <ClaimList claims={syn.convergence} />
        </SectionCard>
        <SectionCard title="Where they conflict — preserved, not averaged" tone="warn">
          <ClaimList claims={syn.conflicts} tone="warn" />
        </SectionCard>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <SectionCard title="Still unknown">
          <ClaimList claims={syn.unresolvedUnknowns} />
        </SectionCard>
        <SectionCard title="Conclusions that lean on assumptions">
          <ClaimList claims={syn.assumptionDependencies} />
        </SectionCard>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <SectionCard title="Where values, not facts, decide">
          <ClaimList claims={syn.valueDependencies} />
        </SectionCard>
        <SectionCard title="Evidence to gather, in order">
          <ClaimList claims={syn.evidencePriorities} />
        </SectionCard>
      </div>

      <SectionCard title="Tests & next steps">
        <ClaimList claims={syn.testsOrNextSteps} />
      </SectionCard>

      <SectionCard title="Reasoning pipeline — what each lens established and handed on">
        <ReasoningPipeline analyses={analyses} />
      </SectionCard>
    </div>
  );
}
