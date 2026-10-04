"use client";
/**
 * DiagramPanel = canvas + structured-list equivalent + legend.
 * The structured list is a full-fidelity textual twin of the diagram
 * (not a courtesy summary): every node and edge, keyboard-navigable.
 */
import React, { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import type { Diagram, DiagramNode, EpistemicType } from "@/lib/schema";
import { EPISTEMIC_STYLES } from "@/lib/epistemic";
import { ConfidenceBadge, EpistemicBadge, EpistemicGlyph, Skeleton } from "@/components/ui/primitives";

const DiagramCanvas = dynamic(() => import("./DiagramCanvas"), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full" />,
});

// ---------------------------------------------------------------------------

export function DiagramLegend({ compact = false }: { compact?: boolean }) {
  const [open, setOpen] = useState(!compact);
  const types = Object.keys(EPISTEMIC_STYLES) as EpistemicType[];
  return (
    <div className="rounded border border-line bg-surface text-[12px]">
      <button
        className="flex w-full items-center justify-between px-2.5 py-1.5 font-medium text-ink-muted hover:text-ink"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        Legend: epistemic categories
        <span aria-hidden>{open ? "–" : "+"}</span>
      </button>
      {open && (
        <div className="grid grid-cols-2 gap-x-3 gap-y-1 px-2.5 pb-2 sm:grid-cols-4">
          {types.map((t) => (
            <span key={t} className="inline-flex items-center gap-1.5 text-ink-muted" title={EPISTEMIC_STYLES[t].description}>
              <EpistemicGlyph type={t} size={11} />
              {EPISTEMIC_STYLES[t].short}
            </span>
          ))}
          <span className="col-span-2 mt-0.5 inline-flex items-center gap-1.5 text-ink-faint sm:col-span-4">
            <svg width="40" height="8" aria-hidden>
              <line x1="0" y1="4" x2="16" y2="4" stroke="var(--edge-neutral)" strokeWidth="1.5" strokeDasharray="5 3" />
              <line x1="24" y1="4" x2="40" y2="4" stroke="var(--edge-neutral)" strokeWidth="1.5" />
            </svg>
            dashed edge = uncertain / hypothesized · ⊗ = contradiction · ‖ = delay
          </span>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------

function OutlineView({
  diagram,
  onSelect,
  selectedId,
}: {
  diagram: Diagram;
  onSelect: (id: string | null) => void;
  selectedId?: string;
}) {
  const byType = useMemo(() => {
    const groups = new Map<string, DiagramNode[]>();
    for (const n of diagram.nodes) {
      const key = n.nodeType.replace(/_/g, " ");
      groups.set(key, [...(groups.get(key) ?? []), n]);
    }
    return [...groups.entries()];
  }, [diagram.nodes]);

  const labelOf = useMemo(() => {
    const m = new Map(diagram.nodes.map((n) => [n.id, n.label]));
    return (id: string) => m.get(id) ?? id;
  }, [diagram.nodes]);

  return (
    <div className="lw-scroll h-full overflow-auto p-3 text-sm">
      {byType.map(([type, nodes]) => (
        <section key={type} className="mb-4">
          <h4 className="mb-1.5 text-[12px] font-semibold uppercase tracking-wide text-ink-faint">
            {type} ({nodes.length})
          </h4>
          <ul className="space-y-1">
            {nodes.map((n) => (
              <li key={n.id}>
                <button
                  onClick={() => onSelect(n.id)}
                  className={`w-full rounded border px-2.5 py-1.5 text-left hover:bg-surface-2 ${
                    selectedId === n.id ? "border-accent" : "border-line"
                  }`}
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="text-ink">{n.label}</span>
                    <span className="flex shrink-0 items-center gap-2">
                      <EpistemicBadge type={n.epistemicType} compact />
                      <ConfidenceBadge value={n.confidence} />
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      ))}
      {diagram.edges.length > 0 && (
        <section>
          <h4 className="mb-1.5 text-[12px] font-semibold uppercase tracking-wide text-ink-faint">
            Relations ({diagram.edges.length})
          </h4>
          <ul className="space-y-1 text-ink-muted">
            {diagram.edges.map((e) => (
              <li key={e.id} className="rounded border border-line px-2.5 py-1.5">
                “{labelOf(e.from)}” <strong className="text-ink">{e.relation.replace(/_/g, " ")}</strong> “{labelOf(e.to)}”
                {e.polarity && e.polarity !== "unknown" && ` (${e.polarity})`}
                {e.delayed && " — with delay"}
                {e.certainty && e.certainty !== "not_applicable" && ` · certainty: ${e.certainty}`}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------

export interface DiagramPanelProps {
  diagram: Diagram;
  title: string;
  selectedId?: string;
  onSelect: (id: string | null) => void;
  highlightIds?: Set<string>;
  flowClassName?: string;
  hiddenIds?: Set<string>;
  /** Short plain-language description used for the SR summary. */
  description?: string;
  heightClass?: string;
}

export default function DiagramPanel({
  diagram,
  title,
  selectedId,
  onSelect,
  highlightIds,
  flowClassName,
  hiddenIds,
  description,
  heightClass = "h-[480px] lg:h-[560px]",
}: DiagramPanelProps) {
  const [mode, setMode] = useState<"canvas" | "outline">("canvas");
  const summary =
    description ??
    `${title}: ${diagram.nodes.length} elements and ${diagram.edges.length} relations.`;

  return (
    <figure className="rounded-lg border border-line bg-surface" aria-label={title}>
      <figcaption className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-3 py-2">
        <span className="text-sm font-medium text-ink">{title}</span>
        <div role="tablist" aria-label="Diagram presentation" className="flex rounded border border-line text-[12.5px]">
          {(["canvas", "outline"] as const).map((m) => (
            <button
              key={m}
              role="tab"
              aria-selected={mode === m}
              onClick={() => setMode(m)}
              className={`px-2.5 py-1.5 min-h-[36px] ${
                mode === m ? "bg-surface-2 font-medium text-ink" : "text-ink-muted hover:text-ink"
              }`}
            >
              {m === "canvas" ? "Diagram" : "Structured list"}
            </button>
          ))}
        </div>
      </figcaption>
      <p className="sr-only">{summary}</p>
      <div className={`${heightClass}`}>
        {mode === "canvas" ? (
          <DiagramCanvas
            diagram={diagram}
            selectedId={selectedId}
            onSelect={onSelect}
            highlightIds={highlightIds}
            flowClassName={flowClassName}
            hiddenIds={hiddenIds}
          />
        ) : (
          <OutlineView diagram={diagram} onSelect={onSelect} selectedId={selectedId} />
        )}
      </div>
      <div className="border-t border-line p-2">
        <DiagramLegend compact />
      </div>
    </figure>
  );
}
