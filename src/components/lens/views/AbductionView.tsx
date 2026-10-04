"use client";
/**
 * Abduction: hypothesis tree, full comparison matrix, and a pairwise
 * side-by-side compare. The top-ranked explanation is never presented
 * as established.
 */
import React, { useMemo, useState } from "react";
import type { LensViewProps } from "../LensShell";
import DiagramPanel from "@/components/diagram/DiagramPanel";
import { Callout, MiniTable, useDiagramSelection, useProvenanceHidden } from "../shared";
import { SectionCard } from "../LensShell";
import { ConfidenceBadge } from "@/components/ui/primitives";
import type { Hypothesis } from "@/lib/schema";

function HypoCard({ h }: { h: Hypothesis }) {
  return (
    <div className="rounded-lg border border-line bg-surface p-3 text-sm">
      <p className="font-medium text-ink">{h.label}</p>
      <p className="mt-1 flex items-center gap-2 text-[12.5px] text-ink-muted">
        <ConfidenceBadge value={h.plausibility} /> {h.plausibilityRationale}
      </p>
      {([
        ["Explains", h.explains],
        ["Fails to explain", h.failsToExplain],
        ["Assumes", h.assumptionsRequired],
        ["Predicts", h.predictions],
        ["Disconfirmed by", h.disconfirmedBy],
      ] as const).map(([label, items]) =>
        items.length > 0 ? (
          <div key={label} className="mt-2">
            <p className="text-[11.5px] font-semibold uppercase tracking-wide text-ink-faint">{label}</p>
            <ul className="mt-0.5 list-disc space-y-0.5 pl-4 text-ink-muted">
              {items.map((x, i) => <li key={i}>{x}</li>)}
            </ul>
          </div>
        ) : null
      )}
      <div className="mt-2 rounded bg-surface-2 px-2 py-1.5">
        <p className="text-[11.5px] font-semibold uppercase tracking-wide text-ink-faint">Discriminating test</p>
        <p className="text-ink-muted">{h.discriminatingTest}</p>
      </div>
    </div>
  );
}

export default function AbductionView({ analysis }: LensViewProps) {
  const { selectedId, onSelect } = useDiagramSelection("abduction");
  const hiddenIds = useProvenanceHidden(analysis.diagram);
  const [pair, setPair] = useState<string[]>([]);
  const extras = analysis.extras;
  const hypotheses = useMemo(
    () => (extras.lens === "abduction" ? extras.hypotheses : []),
    [extras]
  );
  if (extras.lens !== "abduction") return null;

  const togglePair = (nodeId: string) => {
    setPair((p) =>
      p.includes(nodeId) ? p.filter((x) => x !== nodeId) : [...p.slice(-1), nodeId]
    );
  };
  const compared = hypotheses.filter((h) => pair.includes(h.nodeId));
  const labelFor = (nodeId: string) =>
    hypotheses.find((h) => h.nodeId === nodeId)?.label ?? nodeId;

  return (
    <div className="space-y-3">
      <Callout title="Explanation is not proof" tone="warn">
        The ranking below reflects current explanatory quality only. The best story can be wrong;
        the discriminating tests are what would move any of this toward knowledge.
      </Callout>
      <DiagramPanel
        diagram={analysis.diagram}
        title="Hypothesis tree"
        selectedId={selectedId}
        onSelect={onSelect}
        hiddenIds={hiddenIds}
        description="Hypothesis tree: candidate explanations point at the observations they explain; discriminating tests point at the hypotheses they test."
      />
      <SectionCard title="Comparison matrix">
        <MiniTable
          caption="All hypotheses compared on what they explain, fail to explain, assume, and how to test them"
          columns={["Hypothesis", "Plausibility", "Explains", "Fails to explain", "Discriminating test", "Can coexist with"]}
          rows={hypotheses.map((h) => [
            <span key="l" className="font-medium text-ink">{h.label}</span>,
            <ConfidenceBadge key="p" value={h.plausibility} />,
            h.explains.join("; "),
            h.failsToExplain.join("; "),
            h.discriminatingTest,
            h.compatibleWith.map(labelFor).join("; ") || "—",
          ])}
        />
      </SectionCard>
      <SectionCard title="Compare two hypotheses side by side">
        <div className="mb-2 flex flex-wrap gap-1.5">
          {hypotheses.map((h) => (
            <button
              key={h.nodeId}
              onClick={() => togglePair(h.nodeId)}
              aria-pressed={pair.includes(h.nodeId)}
              className={`rounded border px-2.5 py-1.5 text-[13px] min-h-[36px] ${
                pair.includes(h.nodeId)
                  ? "border-accent bg-accent-soft text-ink"
                  : "border-line text-ink-muted hover:bg-surface-2"
              }`}
            >
              {h.label.length > 44 ? `${h.label.slice(0, 43)}…` : h.label}
            </button>
          ))}
        </div>
        {compared.length === 2 ? (
          <div className="grid gap-3 md:grid-cols-2">
            {compared.map((h) => <HypoCard key={h.nodeId} h={h} />)}
          </div>
        ) : (
          <p className="text-[13px] text-ink-faint">Pick two hypotheses to compare.</p>
        )}
      </SectionCard>
    </div>
  );
}
