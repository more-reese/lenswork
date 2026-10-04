"use client";
/** Shared helpers for lens views: selection wiring, provenance filtering, callouts. */
import React, { useMemo } from "react";
import type { Diagram, LensId } from "@/lib/schema";
import { useWorkspace, type ProvenanceFilter } from "@/lib/store";

export function useDiagramSelection(lens: LensId) {
  const select = useWorkspace((s) => s.select);
  const selection = useWorkspace((s) => s.selection);
  return {
    selectedId: selection?.scope === lens ? selection.refId : undefined,
    onSelect: (id: string | null) => select(id ? { scope: lens, refId: id } : null),
  };
}

function passesFilter(epistemicType: string, filter: ProvenanceFilter): boolean {
  switch (filter) {
    case "all":
      return true;
    case "user":
      return ["user_fact", "user_claim", "value_judgment"].includes(epistemicType);
    case "model":
      return ["model_inference", "assumption", "unknown"].includes(epistemicType);
    case "sourced":
      return epistemicType === "external_source";
  }
}

/** Node ids hidden by the global provenance filter. */
export function useProvenanceHidden(diagram: Diagram): Set<string> | undefined {
  const filter = useWorkspace((s) => s.provenanceFilter);
  return useMemo(() => {
    if (filter === "all") return undefined;
    return new Set(diagram.nodes.filter((n) => !passesFilter(n.epistemicType, filter)).map((n) => n.id));
  }, [diagram, filter]);
}

export function Callout({
  title,
  tone = "neutral",
  children,
}: {
  title: string;
  tone?: "neutral" | "warn" | "ok" | "danger" | "accent";
  children: React.ReactNode;
}) {
  const colors: Record<string, { border: string; bg: string }> = {
    neutral: { border: "var(--line-strong)", bg: "var(--surface-2)" },
    warn: { border: "var(--warn)", bg: "var(--ep-assumption-soft)" },
    ok: { border: "var(--ok)", bg: "var(--ep-external-soft)" },
    danger: { border: "var(--danger)", bg: "var(--danger-soft)" },
    accent: { border: "var(--accent)", bg: "var(--accent-soft)" },
  };
  const c = colors[tone];
  return (
    <div className="rounded border-l-4 px-3 py-2.5" style={{ borderColor: c.border, background: c.bg }}>
      <p className="text-[13px] font-semibold text-ink">{title}</p>
      <div className="mt-1 text-sm text-ink-muted">{children}</div>
    </div>
  );
}

export function MiniTable({
  columns,
  rows,
  caption,
}: {
  columns: string[];
  rows: Array<Array<React.ReactNode>>;
  caption: string;
}) {
  return (
    <div className="lw-scroll overflow-x-auto rounded border border-line">
      <table className="w-full min-w-[560px] border-collapse text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="bg-surface-2 text-left">
            {columns.map((c) => (
              <th key={c} scope="col" className="border-b border-line px-2.5 py-2 text-[12.5px] font-semibold text-ink-muted">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="align-top odd:bg-surface even:bg-surface-2/40">
              {r.map((cell, j) => (
                <td key={j} className="border-b border-line px-2.5 py-2 text-ink-muted">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
