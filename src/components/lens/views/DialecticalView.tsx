"use client";
/**
 * Dialectical: steelman first, then the challenger–defender transcript,
 * ending in a revised thesis and the objections still standing. Cooperative
 * by design — the format is adapted from Socratic questioning and Tibetan
 * monastic debate (an adaptation, not a reproduction).
 */
import React, { useState } from "react";
import type { LensViewProps } from "../LensShell";
import DiagramPanel from "@/components/diagram/DiagramPanel";
import { Callout, useDiagramSelection, useProvenanceHidden } from "../shared";
import { SectionCard } from "../LensShell";
import { useWorkspace } from "@/lib/store";
import { Button } from "@/components/ui/primitives";

const MOVE_LABEL: Record<string, string> = {
  thesis: "Thesis",
  steelman: "Steelman",
  definition: "Definition requested",
  consequence: "Consequence drawn",
  counterexample: "Counterexample",
  contradiction: "Contradiction pressed",
  reply: "Reply",
  concession: "Concession",
  revision: "Revision",
};

export default function DialecticalView({ analysis }: LensViewProps) {
  const { selectedId, onSelect } = useDiagramSelection("dialectical");
  const hiddenIds = useProvenanceHidden(analysis.diagram);
  const [showDiagram, setShowDiagram] = useState(false);
  const handoffTo = useWorkspace((s) => s.handoffTo);
  const extras = analysis.extras;
  if (extras.lens !== "dialectical") return null;

  return (
    <div className="space-y-3">
      <div className="grid gap-3 md:grid-cols-2">
        <SectionCard title="Original thesis">
          <p className="text-sm text-ink">{extras.thesis}</p>
        </SectionCard>
        <SectionCard title="Steelmanned before challenge" tone="accent">
          <p className="text-sm text-ink">{extras.steelmannedThesis}</p>
        </SectionCard>
      </div>

      <SectionCard title="The exchange">
        <p className="mb-3 text-[12.5px] text-ink-faint">
          A cooperative challenger–defender format adapted from Socratic questioning and Tibetan
          monastic debate. Take either role yourself in the “Respond to this lens” box — your
          message continues the exchange.
        </p>
        <ol className="space-y-2" aria-label="Debate moves in order">
          {extras.moves.map((m) => {
            const isChallenger = m.role === "challenger";
            return (
              <li
                key={m.id}
                className={`flex ${isChallenger ? "justify-start" : "justify-end"}`}
              >
                <div
                  className={`max-w-[85%] rounded-lg border px-3 py-2 text-sm md:max-w-[70%] ${
                    isChallenger ? "border-line bg-surface-2" : "border-line bg-surface"
                  }`}
                  style={
                    m.moveType === "concession"
                      ? { borderColor: "var(--warn)" }
                      : m.moveType === "revision"
                        ? { borderColor: "var(--ok)" }
                        : undefined
                  }
                >
                  <p className="mb-0.5 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-ink-faint">
                    <span>{isChallenger ? "Challenger" : "Defender"}</span>
                    <span className="rounded bg-surface-3 px-1.5 py-0.5 normal-case tracking-normal text-ink-muted">
                      {MOVE_LABEL[m.moveType] ?? m.moveType}
                    </span>
                  </p>
                  <p className="text-ink">{m.text}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </SectionCard>

      <Callout title="Revised thesis — what survived" tone="ok">
        {extras.revisedThesis}
      </Callout>

      <div className="grid gap-3 lg:grid-cols-2">
        <SectionCard title="Objections still standing" tone="warn">
          <ul className="list-disc space-y-1.5 pl-4 text-sm text-ink-muted">
            {extras.remainingObjections.map((o, i) => <li key={i}>{o}</li>)}
          </ul>
        </SectionCard>
        {extras.unresolvedTension && (
          <SectionCard title="Unresolved tension — preserved, not dissolved">
            <p className="text-sm text-ink-muted">{extras.unresolvedTension}</p>
          </SectionCard>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          onClick={() =>
            handoffTo(
              "causal",
              `The dialectical lens revised the thesis to: "${extras.revisedThesis}". As a question, not a fact: what test design would check this revised claim?`
            )
          }
        >
          Send revised thesis to causal lens
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setShowDiagram((s) => !s)} aria-expanded={showDiagram}>
          {showDiagram ? "Hide" : "Show"} claim-revision diagram
        </Button>
      </div>

      {showDiagram && (
        <DiagramPanel
          diagram={analysis.diagram}
          title="Challenge–response trace"
          selectedId={selectedId}
          onSelect={onSelect}
          hiddenIds={hiddenIds}
          description="Dialectic sequence: challenges on the left, replies and concessions on the right, thesis and revisions in the center column, in chronological order."
        />
      )}
    </div>
  );
}
