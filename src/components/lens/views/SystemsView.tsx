"use client";
/**
 * Systems: causal-loop diagram with one-loop-at-a-time highlighting (slowly
 * animated unless reduced motion), R/B markers, time horizons, boundary
 * choices, and leverage points. Qualitative by declaration — no invented
 * simulation.
 */
import React, { useMemo, useState } from "react";
import type { LensViewProps } from "../LensShell";
import DiagramPanel from "@/components/diagram/DiagramPanel";
import { Callout, useDiagramSelection, useProvenanceHidden } from "../shared";
import { SectionCard } from "../LensShell";

export default function SystemsView({ analysis }: LensViewProps) {
  const { selectedId, onSelect } = useDiagramSelection("systems");
  const hiddenIds = useProvenanceHidden(analysis.diagram);
  const [activeLoop, setActiveLoop] = useState<string | undefined>();
  const [horizon, setHorizon] = useState<"short" | "medium" | "long">("medium");
  const extras = analysis.extras;

  const highlightIds = useMemo(() => {
    if (extras.lens !== "systems" || !activeLoop) return undefined;
    const loop = extras.loops.find((l) => l.id === activeLoop);
    return loop ? new Set(loop.nodeIds) : undefined;
  }, [extras, activeLoop]);

  if (extras.lens !== "systems") return null;
  const active = extras.loops.find((l) => l.id === activeLoop);

  return (
    <div className="space-y-3">
      <Callout title="Qualitative map — every loop is a hypothesis" tone="warn">
        No parameters were supplied, so nothing here is simulated. Each loop implies an observable
        signature; the missing-evidence list says what would confirm or kill it.
      </Callout>
      {extras.loops.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Highlight one loop">
          <span className="text-[12.5px] text-ink-faint">Highlight loop:</span>
          {extras.loops.map((l) => (
            <button
              key={l.id}
              onClick={() => setActiveLoop((a) => (a === l.id ? undefined : l.id))}
              aria-pressed={activeLoop === l.id}
              className={`inline-flex min-h-[36px] items-center gap-1.5 rounded border px-2.5 py-1 text-[13px] ${
                activeLoop === l.id ? "border-accent bg-accent-soft text-ink" : "border-line text-ink-muted hover:bg-surface-2"
              }`}
            >
              <span
                className="inline-flex h-4.5 w-4.5 items-center justify-center rounded-full text-[10px] font-bold"
                style={{
                  background: l.type === "R" ? "var(--ep-assumption-soft)" : "var(--ep-inference-soft)",
                  color: l.type === "R" ? "var(--ep-assumption)" : "var(--ep-inference)",
                  width: 18,
                  height: 18,
                }}
              >
                {l.type}
              </span>
              {l.label}
            </button>
          ))}
        </div>
      )}
      <DiagramPanel
        diagram={analysis.diagram}
        title="Causal-loop diagram"
        selectedId={selectedId}
        onSelect={onSelect}
        highlightIds={highlightIds}
        flowClassName={activeLoop ? "lw-loop-animated" : ""}
        hiddenIds={hiddenIds}
        description="Causal-loop diagram: nodes arranged in a circle with positive and negative polarity edges; ‖ marks delays; R loops reinforce, B loops balance. Select a loop chip to trace one loop at a time."
      />
      {active && (
        <Callout title={`${active.type === "R" ? "Reinforcing" : "Balancing"} loop — ${active.label}`} tone={active.type === "R" ? "warn" : "ok"}>
          {active.story}
        </Callout>
      )}
      <div className="grid gap-3 lg:grid-cols-2">
        <SectionCard title="Time horizons">
          <div role="tablist" aria-label="Time horizon" className="mb-2 flex rounded border border-line text-[13px] w-fit">
            {(["short", "medium", "long"] as const).map((h) => (
              <button
                key={h}
                role="tab"
                aria-selected={horizon === h}
                onClick={() => setHorizon(h)}
                className={`px-3 py-1.5 min-h-[36px] capitalize ${
                  horizon === h ? "bg-surface-2 font-medium text-ink" : "text-ink-muted hover:text-ink"
                }`}
              >
                {h}
              </button>
            ))}
          </div>
          <p className="text-sm text-ink-muted">{extras.horizons[horizon]}</p>
        </SectionCard>
        <SectionCard title="Boundary — a choice, not a fact">
          <p className="text-[12px] font-semibold uppercase tracking-wide text-ink-faint">Inside</p>
          <p className="text-sm text-ink-muted">{extras.boundary.included.join("; ")}</p>
          <p className="mt-1.5 text-[12px] font-semibold uppercase tracking-wide text-ink-faint">Outside</p>
          <p className="text-sm text-ink-muted">{extras.boundary.excluded.join("; ")}</p>
          <p className="mt-1.5 text-[13px] text-ink-faint">{extras.boundary.rationale}</p>
        </SectionCard>
      </div>
      <SectionCard title="Candidate leverage points">
        <ol className="space-y-2 text-sm">
          {extras.leveragePoints.map((p, i) => (
            <li key={i} className="rounded border border-line bg-surface-2/50 px-3 py-2">
              <p className="font-medium text-ink">{i + 1}. {p.label}</p>
              <p className="text-ink-muted">{p.description}</p>
              {p.caution && <p className="mt-0.5 text-[13px]" style={{ color: "var(--warn)" }}>Caution: {p.caution}</p>}
            </li>
          ))}
        </ol>
      </SectionCard>
    </div>
  );
}
