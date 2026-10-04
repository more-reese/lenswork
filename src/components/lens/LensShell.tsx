"use client";
/**
 * Generic lens view chrome: header with guiding question + status, summary,
 * lens-specific body (from views/), then the shared epistemic sections:
 * findings, self-challenges, missing evidence, can/cannot establish,
 * next questions, and cross-lens handoffs.
 */
import React from "react";
import type { LensAnalysis, LensId, LensRun } from "@/lib/schema";
import { LENSES } from "@/lib/lenses/registry";
import { useWorkspace } from "@/lib/store";
import { Button, ConfidenceBadge, EpistemicBadge, Skeleton } from "@/components/ui/primitives";
import DeductionView from "./views/DeductionView";
import InductionView from "./views/InductionView";
import AbductionView from "./views/AbductionView";
import CausalView from "./views/CausalView";
import PracticalView from "./views/PracticalView";
import SystemsView from "./views/SystemsView";
import InterpretiveView from "./views/InterpretiveView";
import DialecticalView from "./views/DialecticalView";

export interface LensViewProps {
  analysis: LensAnalysis;
}

const VIEWS: Record<LensId, React.ComponentType<LensViewProps>> = {
  deduction: DeductionView,
  induction: InductionView,
  abduction: AbductionView,
  causal: CausalView,
  practical: PracticalView,
  systems: SystemsView,
  interpretive: InterpretiveView,
  dialectical: DialecticalView,
};

// ---------------------------------------------------------------------------

export function SectionCard({
  title,
  children,
  tone = "default",
}: {
  title: string;
  children: React.ReactNode;
  tone?: "default" | "warn" | "accent";
}) {
  const border =
    tone === "warn" ? "border-l-4" : tone === "accent" ? "border-l-4" : "";
  const borderColor =
    tone === "warn" ? "var(--warn)" : tone === "accent" ? "var(--accent)" : undefined;
  return (
    <section
      className={`rounded-lg border border-line bg-surface p-3.5 ${border}`}
      style={borderColor ? { borderLeftColor: borderColor } : undefined}
    >
      <h3 className="mb-2 text-[13px] font-semibold uppercase tracking-wide text-ink-muted">{title}</h3>
      {children}
    </section>
  );
}

function FindingsList({ analysis }: { analysis: LensAnalysis }) {
  const select = useWorkspace((s) => s.select);
  const selection = useWorkspace((s) => s.selection);
  if (analysis.findings.length === 0) return <p className="text-sm text-ink-faint">No findings recorded.</p>;
  return (
    <ul className="space-y-2">
      {analysis.findings.map((f) => (
        <li key={f.id}>
          <button
            onClick={() => select({ scope: analysis.lens, refId: f.id })}
            className={`w-full rounded border px-3 py-2 text-left text-sm hover:bg-surface-2 ${
              selection?.refId === f.id ? "border-accent" : "border-line"
            }`}
          >
            <span className="text-ink">{f.statement}</span>
            <span className="mt-1.5 flex flex-wrap items-center gap-2">
              <EpistemicBadge type={f.epistemicType} compact />
              <ConfidenceBadge value={f.confidence} />
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}

function Handoffs({ analysis }: { analysis: LensAnalysis }) {
  const handoffTo = useWorkspace((s) => s.handoffTo);
  const caseFile = useWorkspace((s) => s.caseFile);
  if (analysis.handoffs.length === 0) return null;
  return (
    <SectionCard title="Hand off to another lens" tone="accent">
      <ul className="space-y-2.5">
        {analysis.handoffs.map((h, i) => {
          const target = LENSES[h.targetLens];
          const payloadTexts = h.payloadIds
            .map((id) => {
              const n = analysis.diagram.nodes.find((x) => x.id === id);
              if (n) return n.label;
              const f = analysis.findings.find((x) => x.id === id);
              return f?.statement;
            })
            .filter(Boolean) as string[];
          const targetHasAnalysis = Boolean(caseFile?.analyses[h.targetLens]?.analysis);
          const message = `Handoff from the ${LENSES[analysis.lens].name} lens — take this up as a QUESTION, not an established fact: ${payloadTexts.join(" / ") || h.reason}. Context: ${h.reason}`;
          return (
            <li key={i} className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0 flex-1 text-sm text-ink-muted">
                <span className="font-medium text-ink">→ {target.shortName}:</span> {h.reason}
              </div>
              <Button
                size="sm"
                onClick={() => handoffTo(h.targetLens, message)}
                title={
                  targetHasAnalysis
                    ? `Open the ${target.shortName} lens with this question pre-filled`
                    : `Open the ${target.shortName} lens (run it first, then send the question)`
                }
              >
                Send as question
              </Button>
            </li>
          );
        })}
      </ul>
    </SectionCard>
  );
}

// ---------------------------------------------------------------------------

export function LensSkeleton({ lens }: { lens: LensId }) {
  // Skeleton shaped like the eventual layout: header, summary, diagram, sections.
  return (
    <div className="space-y-4" aria-label={`${LENSES[lens].name} analysis loading`} role="status">
      <div className="space-y-2">
        <Skeleton className="h-6 w-56" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-[420px] w-full" />
      <div className="grid gap-3 md:grid-cols-2">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
      <span className="sr-only">Running the {LENSES[lens].name} analysis…</span>
    </div>
  );
}

export default function LensShell({ lens }: { lens: LensId }) {
  const meta = LENSES[lens];
  const caseFile = useWorkspace((s) => s.caseFile);
  const status = useWorkspace((s) => s.runStatus[lens]);
  const runLens = useWorkspace((s) => s.runLens);
  const teach = useWorkspace((s) => s.teachMode);

  const run: LensRun | undefined = caseFile?.analyses[lens];
  const analysis = run?.analysis;
  const Body = VIEWS[lens];

  const header = (
    <header className="space-y-1">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="font-brand text-[26px] font-semibold text-ink">{meta.name}</h2>
        {run && (
          <span className="rounded bg-surface-2 px-2 py-0.5 text-[12px] text-ink-muted" title="Model that produced this analysis">
            {run.model}
          </span>
        )}
        {status === "stale" && (
          <span className="rounded px-2 py-0.5 text-[12px]" style={{ background: "var(--ep-assumption-soft)", color: "var(--warn)" }}>
            Case changed since this ran — re-run to refresh
          </span>
        )}
        {(status === "done" || status === "stale" || status === "error") && (
          <Button size="sm" onClick={() => runLens(lens)} disabled={false}>
            Re-run lens
          </Button>
        )}
      </div>
      <p className="text-[15px] italic text-ink-muted">
        {analysis?.guidingQuestion ?? meta.guidingQuestion}
      </p>
      {teach && (
        <p className="text-[13px] text-ink-faint">
          This lens&apos;s output: {meta.primaryOutput.toLowerCase()}. Its key limitation: {meta.keyLimitation.toLowerCase()}
        </p>
      )}
    </header>
  );

  if (status === "running" || status === "queued") {
    return (
      <div className="space-y-4">
        {header}
        <LensSkeleton lens={lens} />
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="space-y-4">
        {header}
        <div className="rounded-lg border border-line bg-surface p-6 text-center">
          {status === "error" ? (
            <>
              <p className="mb-1 text-sm font-medium text-danger">This lens failed to run.</p>
              {run?.error && <p className="mb-3 text-[13px] text-ink-muted">{run.error}</p>}
              <Button variant="primary" onClick={() => runLens(lens)}>Retry this lens</Button>
            </>
          ) : (
            <>
              <p className="mb-3 text-sm text-ink-muted">This lens hasn&apos;t been run yet.</p>
              <Button variant="primary" onClick={() => runLens(lens)} disabled={!caseFile?.caseModel}>
                Run {meta.shortName.toLowerCase()} analysis
              </Button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {header}
      {status === "error" && run?.error && (
        <div role="alert" className="rounded border border-danger bg-danger-soft px-3 py-2 text-sm text-danger">
          Latest run failed ({run.error}); showing the previous result.{" "}
          <button className="underline" onClick={() => runLens(lens)}>Retry</button>
        </div>
      )}
      <p className="max-w-[72ch] text-[15px] leading-relaxed text-ink">{analysis.plainLanguageSummary}</p>

      <Body analysis={analysis} />

      <div className="grid gap-3 lg:grid-cols-2">
        <SectionCard title="Findings">
          <FindingsList analysis={analysis} />
        </SectionCard>
        <div className="space-y-3">
          <SectionCard title="Challenges to this analysis" tone="warn">
            <ul className="list-disc space-y-1.5 pl-4 text-sm text-ink-muted">
              {analysis.challenges.map((c, i) => <li key={i}>{c}</li>)}
            </ul>
          </SectionCard>
          <SectionCard title="Missing evidence">
            <ul className="list-disc space-y-1.5 pl-4 text-sm text-ink-muted">
              {analysis.missingEvidence.map((c, i) => <li key={i}>{c}</li>)}
            </ul>
          </SectionCard>
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <SectionCard title="What this pass established">
          <ul className="list-disc space-y-1.5 pl-4 text-sm text-ink-muted">
            {analysis.canEstablish.map((c, i) => <li key={i}>{c}</li>)}
          </ul>
        </SectionCard>
        <SectionCard title="What it cannot establish">
          <ul className="list-disc space-y-1.5 pl-4 text-sm text-ink-muted">
            {analysis.cannotEstablish.map((c, i) => <li key={i}>{c}</li>)}
          </ul>
        </SectionCard>
      </div>

      {analysis.nextQuestions.length > 0 && (
        <SectionCard title="Next questions">
          <ul className="list-disc space-y-1.5 pl-4 text-sm text-ink-muted">
            {analysis.nextQuestions.map((c, i) => <li key={i}>{c}</li>)}
          </ul>
        </SectionCard>
      )}

      <Handoffs analysis={analysis} />
    </div>
  );
}
