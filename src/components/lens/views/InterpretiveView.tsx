"use client";
/**
 * Interpretive & phenomenological: perspective map with context layers,
 * standpoint re-centering, contested meanings side by side, and missing
 * voices. All experience statements are inquiry prompts, never assertions.
 */
import React, { useMemo, useState } from "react";
import type { LensViewProps } from "../LensShell";
import DiagramPanel from "@/components/diagram/DiagramPanel";
import { Callout, MiniTable, useDiagramSelection, useProvenanceHidden } from "../shared";
import { SectionCard } from "../LensShell";

export default function InterpretiveView({ analysis }: LensViewProps) {
  const { selectedId, onSelect } = useDiagramSelection("interpretive");
  const hiddenIds = useProvenanceHidden(analysis.diagram);
  const [centered, setCentered] = useState<string | undefined>();
  const [layer, setLayer] = useState<"experience" | "interpretation" | "context">("interpretation");
  const extras = analysis.extras;

  const highlightIds = useMemo(() => {
    if (extras.lens !== "interpretive" || !centered) return undefined;
    const ids = new Set<string>([centered]);
    for (const e of analysis.diagram.edges) {
      if (e.from === centered) ids.add(e.to);
      if (e.to === centered) ids.add(e.from);
    }
    return ids;
  }, [extras, centered, analysis.diagram.edges]);

  if (extras.lens !== "interpretive") return null;
  const active = extras.standpoints.find((s) => s.nodeId === centered);

  return (
    <div className="space-y-3">
      <Callout title="Standpoints are inquiry prompts, not reports" tone="warn">
        Nothing below asserts what anyone actually felt or experienced. Each standpoint says what a
        person in that position <em>might</em> experience — to be verified through direct inquiry.
      </Callout>
      <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Re-center on a standpoint">
        <span className="text-[12.5px] text-ink-faint">Re-center on:</span>
        {extras.standpoints.map((s) => (
          <button
            key={s.nodeId}
            onClick={() => setCentered((c) => (c === s.nodeId ? undefined : s.nodeId))}
            aria-pressed={centered === s.nodeId}
            className={`rounded border px-2.5 py-1.5 text-[13px] min-h-[36px] ${
              centered === s.nodeId ? "border-accent bg-accent-soft text-ink" : "border-line text-ink-muted hover:bg-surface-2"
            }`}
          >
            {s.stakeholderName}
          </button>
        ))}
      </div>
      <DiagramPanel
        diagram={analysis.diagram}
        title="Perspective map"
        selectedId={selectedId}
        onSelect={onSelect}
        highlightIds={highlightIds}
        hiddenIds={hiddenIds}
        description="Perspective map: the case at the center, stakeholder standpoints around it, contested meanings between, and context layers on the outer ring."
      />
      {active && (
        <SectionCard title={`From ${active.stakeholderName}'s standpoint`} tone="accent">
          <div role="tablist" aria-label="Standpoint layer" className="mb-2 flex rounded border border-line text-[13px] w-fit">
            {(["experience", "interpretation", "context"] as const).map((l) => (
              <button
                key={l}
                role="tab"
                aria-selected={layer === l}
                onClick={() => setLayer(l)}
                className={`px-3 py-1.5 min-h-[36px] capitalize ${
                  layer === l ? "bg-surface-2 font-medium text-ink" : "text-ink-muted hover:text-ink"
                }`}
              >
                {l}
              </button>
            ))}
          </div>
          {layer === "experience" && (
            <p className="text-sm text-ink-muted">
              <span className="mr-1.5 rounded bg-surface-2 px-1.5 py-0.5 text-[11px] uppercase tracking-wide text-ink-faint">verify</span>
              {active.inquiryPrompt}
            </p>
          )}
          {layer === "interpretation" && <p className="text-sm text-ink-muted">{active.framing}</p>}
          {layer === "context" && (
            <div className="text-sm text-ink-muted">
              {active.keyTerms.length > 0 ? (
                <dl className="space-y-1">
                  {active.keyTerms.map((t) => (
                    <div key={t.term}>
                      <dt className="inline font-medium text-ink">“{t.term}”: </dt>
                      <dd className="inline">{t.meaning}</dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <p>No standpoint-specific terms recorded.</p>
              )}
            </div>
          )}
        </SectionCard>
      )}
      {extras.contestedMeanings.length > 0 && (
        <SectionCard title="Same words, different meanings">
          {extras.contestedMeanings.map((m, i) => (
            <div key={i} className={i > 0 ? "mt-3" : ""}>
              <p className="mb-1 text-sm font-medium text-ink">{m.subject}</p>
              <MiniTable
                caption={`Readings of ${m.subject} across standpoints`}
                columns={["Standpoint", "Reading"]}
                rows={m.readings.map((r) => [
                  <span key="s" className="font-medium text-ink">{r.standpoint}</span>,
                  r.reading,
                ])}
              />
            </div>
          ))}
        </SectionCard>
      )}
      <div className="grid gap-3 lg:grid-cols-2">
        <SectionCard title="Missing voices" tone="warn">
          <ul className="list-disc space-y-1 pl-4 text-sm text-ink-muted">
            {extras.missingVoices.map((v, i) => <li key={i}>{v}</li>)}
          </ul>
        </SectionCard>
        <SectionCard title="Context layers">
          <dl className="space-y-2 text-sm">
            <div>
              <dt className="font-medium text-ink">Immediate</dt>
              <dd className="text-ink-muted">{extras.contextLayers.immediate}</dd>
            </div>
            <div>
              <dt className="font-medium text-ink">Institutional</dt>
              <dd className="text-ink-muted">{extras.contextLayers.institutional}</dd>
            </div>
            <div>
              <dt className="font-medium text-ink">Historical</dt>
              <dd className="text-ink-muted">{extras.contextLayers.historical}</dd>
            </div>
          </dl>
        </SectionCard>
      </div>
    </div>
  );
}
