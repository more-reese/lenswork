"use client";
/**
 * Causal: directed graph with an observed-world / intervention-world toggle,
 * explicit confounders, the counterfactual comparison, and a test plan.
 * Association, causal hypothesis, and identified relations are visually
 * distinct (dotted / dashed / solid-thick) and labeled.
 */
import React, { useMemo, useState } from "react";
import type { LensViewProps } from "../LensShell";
import DiagramPanel from "@/components/diagram/DiagramPanel";
import { Callout, useDiagramSelection, useProvenanceHidden } from "../shared";
import { SectionCard } from "../LensShell";

export default function CausalView({ analysis }: LensViewProps) {
  const { selectedId, onSelect } = useDiagramSelection("causal");
  const hiddenIds = useProvenanceHidden(analysis.diagram);
  const [world, setWorld] = useState<"observed" | "intervention">("observed");
  const extras = analysis.extras;

  const highlightIds = useMemo(() => {
    if (extras.lens !== "causal" || world === "observed") return undefined;
    const ids = new Set<string>();
    if (extras.interventionNodeId) ids.add(extras.interventionNodeId);
    extras.outcomeNodeIds.forEach((id) => ids.add(id));
    // Include mediators/moderators on paths by simply highlighting neighbors
    // of the intervention node.
    for (const e of analysis.diagram.edges) {
      if (extras.interventionNodeId && e.from === extras.interventionNodeId) ids.add(e.to);
    }
    return ids;
  }, [extras, world, analysis.diagram.edges]);

  if (extras.lens !== "causal") return null;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div role="tablist" aria-label="World view" className="flex rounded border border-line text-sm">
          {(["observed", "intervention"] as const).map((w) => (
            <button
              key={w}
              role="tab"
              aria-selected={world === w}
              onClick={() => setWorld(w)}
              className={`px-3 py-2 min-h-[40px] ${
                world === w ? "bg-surface-2 font-medium text-ink" : "text-ink-muted hover:text-ink"
              }`}
            >
              {w === "observed" ? "Observed world" : "Intervention world"}
            </button>
          ))}
        </div>
        <p className="text-[12.5px] text-ink-faint">
          {world === "observed"
            ? "What co-occurred — associations and hypotheses, with rival causes visible."
            : "The paths a deliberate change would travel; everything else dims."}
        </p>
      </div>
      <DiagramPanel
        diagram={analysis.diagram}
        title="Causal graph"
        selectedId={selectedId}
        onSelect={onSelect}
        highlightIds={highlightIds}
        hiddenIds={hiddenIds}
        description="Directed causal graph: dotted edges are observed associations, dashed edges causal hypotheses, thick solid edges identified relationships. Confounder nodes sit beside both outcomes."
      />
      <div className="grid gap-3 lg:grid-cols-2">
        <SectionCard title="Counterfactual comparison">
          <dl className="space-y-2 text-sm">
            <div>
              <dt className="font-medium text-ink">Intervention</dt>
              <dd className="text-ink-muted">{extras.counterfactual.intervention}</dd>
            </div>
            <div>
              <dt className="font-medium text-ink">Observed world</dt>
              <dd className="text-ink-muted">{extras.counterfactual.observedWorld}</dd>
            </div>
            <div>
              <dt className="font-medium text-ink">Intervention world (not observed)</dt>
              <dd className="text-ink-muted">{extras.counterfactual.interventionWorld}</dd>
            </div>
          </dl>
          {extras.counterfactual.caveats.length > 0 && (
            <div className="mt-2">
              <Callout title="Caveats" tone="warn">
                <ul className="list-disc space-y-1 pl-4">
                  {extras.counterfactual.caveats.map((c, i) => <li key={i}>{c}</li>)}
                </ul>
              </Callout>
            </div>
          )}
        </SectionCard>
        <SectionCard title="Test plan — ethical and feasible">
          <ol className="list-decimal space-y-1.5 pl-5 text-sm text-ink-muted">
            {extras.testPlan.map((t, i) => <li key={i}>{t}</li>)}
          </ol>
        </SectionCard>
      </div>
    </div>
  );
}
