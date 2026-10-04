"use client";
/**
 * Induction: evidence-to-pattern flow, the evidence matrix (or an
 * evidence-collection plan when no observations exist), a bounded
 * generalization with scope conditions, and bias questions.
 */
import React from "react";
import type { LensViewProps } from "../LensShell";
import DiagramPanel from "@/components/diagram/DiagramPanel";
import { Callout, MiniTable, useDiagramSelection, useProvenanceHidden } from "../shared";
import { SectionCard } from "../LensShell";

export default function InductionView({ analysis }: LensViewProps) {
  const { selectedId, onSelect } = useDiagramSelection("induction");
  const hiddenIds = useProvenanceHidden(analysis.diagram);
  const extras = analysis.extras;
  if (extras.lens !== "induction") return null;

  const labelOf = (id: string) =>
    analysis.diagram.nodes.find((n) => n.id === id)?.label ?? id;

  return (
    <div className="space-y-3">
      {!extras.hasUserEvidence && (
        <Callout title="No observations supplied — nothing is simulated" tone="warn">
          This lens does not invent data. Below is the evidence-collection plan that would make a
          pattern claim possible.
        </Callout>
      )}
      <DiagramPanel
        diagram={analysis.diagram}
        title="Evidence-to-pattern flow"
        selectedId={selectedId}
        onSelect={onSelect}
        hiddenIds={hiddenIds}
        description="Evidence flow: observations on the left feed patterns, exceptions qualify them, and a bounded generalization sits at the right."
      />
      <div className="grid gap-3 lg:grid-cols-2">
        <SectionCard title="Bounded generalization">
          <p className="text-sm text-ink">{extras.generalization.statement}</p>
          {extras.generalization.scopeConditions.length > 0 && (
            <>
              <p className="mt-2 text-[12px] font-semibold uppercase tracking-wide text-ink-faint">Scope conditions</p>
              <ul className="mt-1 list-disc space-y-1 pl-4 text-sm text-ink-muted">
                {extras.generalization.scopeConditions.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </>
          )}
        </SectionCard>
        <SectionCard title="Bias questions — questions, not accusations">
          <ul className="list-disc space-y-1.5 pl-4 text-sm text-ink-muted">
            {extras.biasQuestions.map((q, i) => <li key={i}>{q}</li>)}
          </ul>
          {extras.coverageGaps.length > 0 && (
            <>
              <p className="mt-2 text-[12px] font-semibold uppercase tracking-wide text-ink-faint">Coverage gaps</p>
              <ul className="mt-1 list-disc space-y-1 pl-4 text-sm text-ink-muted">
                {extras.coverageGaps.map((g, i) => <li key={i}>{g}</li>)}
              </ul>
            </>
          )}
        </SectionCard>
      </div>
      {extras.evidenceMatrix && (
        <SectionCard title="Evidence matrix">
          <MiniTable
            caption="Each observation against coverage and limitation columns"
            columns={["Observation", ...extras.evidenceMatrix.columns]}
            rows={extras.evidenceMatrix.rows.map((r) => [
              <span key="o" className="font-medium text-ink">{labelOf(r.observationId)}</span>,
              ...r.cells,
            ])}
          />
        </SectionCard>
      )}
      {extras.evidencePlan && extras.evidencePlan.length > 0 && (
        <SectionCard title="Evidence-collection plan">
          <ol className="list-decimal space-y-1.5 pl-5 text-sm text-ink-muted">
            {extras.evidencePlan.map((p, i) => <li key={i}>{p}</li>)}
          </ol>
        </SectionCard>
      )}
    </div>
  );
}
