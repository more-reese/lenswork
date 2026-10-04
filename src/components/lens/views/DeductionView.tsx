"use client";
/**
 * Deduction: argument map plus a validity verdict kept visibly separate
 * from premise truth, and the "all premises true, conclusion false?" probe.
 */
import React from "react";
import type { LensViewProps } from "../LensShell";
import DiagramPanel from "@/components/diagram/DiagramPanel";
import { Callout, useDiagramSelection, useProvenanceHidden } from "../shared";

export default function DeductionView({ analysis }: LensViewProps) {
  const { selectedId, onSelect } = useDiagramSelection("deduction");
  const hiddenIds = useProvenanceHidden(analysis.diagram);
  const extras = analysis.extras;
  if (extras.lens !== "deduction") return null;

  const verdictTone =
    extras.validityStatus === "valid" ? "ok" : extras.validityStatus === "invalid" ? "danger" : "warn";
  const verdictLabel =
    extras.validityStatus === "valid"
      ? "Structure: valid"
      : extras.validityStatus === "invalid"
        ? "Structure: invalid"
        : "Structure: indeterminate";

  return (
    <div className="space-y-3">
      <div className="grid gap-3 md:grid-cols-2">
        <Callout title={verdictLabel} tone={verdictTone}>
          <p>{extras.validityNote}</p>
          <p className="mt-1.5 text-[12.5px] text-ink-faint">
            Validity is about structure only — a valid argument with a false premise establishes nothing.
            Premise truth is assessed by the inductive and causal lenses.
          </p>
        </Callout>
        <Callout title="Could all premises be true while the conclusion is false?" tone="neutral">
          {extras.premisesTrueConclusionFalse}
        </Callout>
      </div>
      <DiagramPanel
        diagram={analysis.diagram}
        title="Argument map"
        selectedId={selectedId}
        onSelect={onSelect}
        hiddenIds={hiddenIds}
        description="Argument map: premises and hidden premises below, flowing upward through inferences to the conclusion. Support edges are solid; contradiction edges are labeled."
      />
    </div>
  );
}
