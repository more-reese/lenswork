"use client";
/**
 * Analysis hub: run controls with cost estimate, the guided-sequence
 * progress strip (skeleton chips shaped like each lens's diagram), the case
 * constellation, and the standing quality panels — unknowns and the
 * assumption audit.
 */
import React, { useMemo } from "react";
import {
  LENS_IDS,
  dependentsOfAssumption,
  itemsOf,
  type Diagram,
  type LensAnalysis,
  type LensId,
} from "@/lib/schema";
import { useWorkspace } from "@/lib/store";
import { GUIDED_SEQUENCE_NOTE, LENSES, LENS_ORDER } from "@/lib/lenses/registry";
import { estimateRunCost, formatUsd } from "@/lib/cost";
import DiagramPanel from "@/components/diagram/DiagramPanel";
import { Button, Spinner } from "@/components/ui/primitives";
import { SectionCard } from "@/components/lens/LensShell";

// ---------------------------------------------------------------------------
// Micro-glyphs: each lens chip carries the silhouette of its eventual diagram.
// ---------------------------------------------------------------------------

export function LensGlyph({ lens, size = 26 }: { lens: LensId; size?: number }) {
  const stroke = "currentColor";
  const common = { width: size, height: size, viewBox: "0 0 28 28", fill: "none", "aria-hidden": true as const };
  switch (LENSES[lens].diagramType) {
    case "argument_map":
      return (
        <svg {...common}>
          <rect x="11" y="2" width="7" height="5" rx="1" stroke={stroke} strokeWidth="1.5" />
          <rect x="3" y="20" width="7" height="5" rx="1" stroke={stroke} strokeWidth="1.5" />
          <rect x="18" y="20" width="7" height="5" rx="1" strokeDasharray="2.5 2" stroke={stroke} strokeWidth="1.5" />
          <path d="M7 20 L13 8 M21 20 L16 8" stroke={stroke} strokeWidth="1.3" />
        </svg>
      );
    case "evidence_flow":
      return (
        <svg {...common}>
          <circle cx="5" cy="6" r="2.4" stroke={stroke} strokeWidth="1.4" />
          <circle cx="5" cy="14" r="2.4" stroke={stroke} strokeWidth="1.4" />
          <circle cx="5" cy="22" r="2.4" stroke={stroke} strokeWidth="1.4" />
          <path d="M8 6 C14 6 14 13 18 13 M8 14 H18 M8 22 C14 22 14 15 18 15" stroke={stroke} strokeWidth="1.2" />
          <rect x="19" y="10" width="7" height="8" rx="1.5" stroke={stroke} strokeWidth="1.5" />
        </svg>
      );
    case "hypothesis_tree":
      return (
        <svg {...common}>
          <circle cx="23" cy="14" r="2.6" stroke={stroke} strokeWidth="1.5" />
          <rect x="2" y="3" width="8" height="5" rx="1" stroke={stroke} strokeWidth="1.4" />
          <rect x="2" y="11.5" width="8" height="5" rx="1" stroke={stroke} strokeWidth="1.4" />
          <rect x="2" y="20" width="8" height="5" rx="1" stroke={stroke} strokeWidth="1.4" />
          <path d="M10 5.5 C17 5.5 17 14 20.4 14 M10 14 H20 M10 22.5 C17 22.5 17 14 20.4 14" stroke={stroke} strokeWidth="1.2" />
        </svg>
      );
    case "causal_graph":
      return (
        <svg {...common}>
          <circle cx="5" cy="14" r="2.6" stroke={stroke} strokeWidth="1.5" />
          <circle cx="14" cy="6" r="2.6" stroke={stroke} strokeWidth="1.5" strokeDasharray="2 1.6" />
          <circle cx="14" cy="22" r="2.6" stroke={stroke} strokeWidth="1.5" />
          <circle cx="23" cy="14" r="2.6" stroke={stroke} strokeWidth="1.5" />
          <path d="M7.5 12.5 L12 8 M7.5 15.5 L12 20.5 M16.5 7.5 L21 12 M16.5 20.5 L21 15.8" stroke={stroke} strokeWidth="1.2" />
        </svg>
      );
    case "decision_landscape":
      return (
        <svg {...common}>
          <rect x="3" y="4" width="6" height="4.5" rx="1" stroke={stroke} strokeWidth="1.4" />
          <rect x="3" y="12" width="6" height="4.5" rx="1" stroke={stroke} strokeWidth="1.4" />
          <rect x="3" y="20" width="6" height="4.5" rx="1" stroke={stroke} strokeWidth="1.4" />
          <path d="M14 4 L18 9 L14 14 L10.5 9 Z" stroke={stroke} strokeWidth="1.4" transform="translate(7 5)" />
          <path d="M9 6.5 H14 M9 14 H13" stroke={stroke} strokeWidth="1.2" />
        </svg>
      );
    case "causal_loop":
      return (
        <svg {...common}>
          <path d="M14 4 A10 10 0 1 1 5 9" stroke={stroke} strokeWidth="1.5" />
          <path d="M5 4.5 L5 9.5 L10 9.5" stroke={stroke} strokeWidth="1.5" fill="none" />
          <text x="11" y="18" fontSize="9" fill={stroke} fontWeight="700">R</text>
        </svg>
      );
    case "perspective_map":
      return (
        <svg {...common}>
          <circle cx="14" cy="14" r="3" stroke={stroke} strokeWidth="1.5" />
          <circle cx="14" cy="14" r="7.5" stroke={stroke} strokeWidth="1.2" strokeDasharray="3 2.4" />
          <circle cx="14" cy="14" r="12" stroke={stroke} strokeWidth="1" strokeDasharray="1.6 2.6" />
        </svg>
      );
    case "dialectic_sequence":
      return (
        <svg {...common}>
          <rect x="3" y="3" width="10" height="5" rx="2" stroke={stroke} strokeWidth="1.4" />
          <rect x="15" y="10" width="10" height="5" rx="2" stroke={stroke} strokeWidth="1.4" />
          <rect x="3" y="17" width="10" height="5" rx="2" stroke={stroke} strokeWidth="1.4" />
          <path d="M13 6 L15 11 M15 14 L13 18" stroke={stroke} strokeWidth="1.2" />
        </svg>
      );
    default:
      return null;
  }
}

// ---------------------------------------------------------------------------

function ProgressStrip() {
  const runStatus = useWorkspace((s) => s.runStatus);
  const setView = useWorkspace((s) => s.setView);
  const synthesisStatus = useWorkspace((s) => s.synthesisStatus);
  return (
    <ol className="flex flex-wrap gap-2" aria-label="Lens analysis progress, in the recommended order">
      {LENS_ORDER.map((lens, i) => {
        const st = runStatus[lens];
        const border =
          st === "done" ? "var(--ok)" : st === "error" ? "var(--danger)" : st === "stale" ? "var(--warn)" : "var(--line)";
        return (
          <li key={lens}>
            <button
              onClick={() => setView({ kind: "lens", lens })}
              className={`flex min-h-[44px] items-center gap-2 rounded border bg-surface px-2.5 py-1.5 text-[13px] hover:bg-surface-2 ${
                st === "running" ? "animate-pulse" : ""
              }`}
              style={{ borderColor: border }}
              aria-label={`${i + 1}. ${LENSES[lens].name}: ${st}`}
            >
              <span className="text-ink-faint">{i + 1}</span>
              <span className="text-ink-muted"><LensGlyph lens={lens} size={22} /></span>
              <span className="font-medium text-ink">{LENSES[lens].shortName}</span>
              <span className="text-[11px] uppercase tracking-wide text-ink-faint">
                {st === "idle" ? "" : st}
              </span>
            </button>
          </li>
        );
      })}
      <li>
        <span
          className="flex min-h-[44px] items-center gap-2 rounded border bg-surface px-2.5 py-1.5 text-[13px]"
          style={{
            borderColor:
              synthesisStatus === "done" ? "var(--ok)" : synthesisStatus === "error" ? "var(--danger)" : "var(--line)",
          }}
        >
          <span className="text-ink-faint">9</span>
          <span className="font-medium text-ink">Synthesis</span>
          <span className="text-[11px] uppercase tracking-wide text-ink-faint">
            {synthesisStatus === "idle" ? "" : synthesisStatus}
          </span>
        </span>
      </li>
    </ol>
  );
}

// ---------------------------------------------------------------------------

function buildConstellation(caseFileModel: NonNullable<ReturnType<typeof useWorkspace.getState>["caseFile"]>["caseModel"]): Diagram {
  const model = caseFileModel!;
  const nodes: Diagram["nodes"] = [
    {
      id: "hub-center",
      label: model.centralQuestion,
      nodeType: "central question",
      epistemicType: "user_fact",
      confidence: "not_applicable",
      traceRefs: [],
    },
  ];
  const edges: Diagram["edges"] = [];
  const hubs: Array<{ id: string; label: string; items: Array<{ id: string; label: string; ep: Diagram["nodes"][0]["epistemicType"] }> }> = [
    { id: "hub-facts", label: "Facts", items: itemsOf(model, "fact").map((i) => ({ id: i.id, label: i.text, ep: i.epistemicType })) },
    { id: "hub-claims", label: "Claims", items: itemsOf(model, "claim").map((i) => ({ id: i.id, label: i.text, ep: i.epistemicType })) },
    { id: "hub-assumptions", label: "Assumptions", items: itemsOf(model, "assumption").map((i) => ({ id: i.id, label: i.text, ep: i.epistemicType })) },
    { id: "hub-values", label: "Values", items: itemsOf(model, "value").map((i) => ({ id: i.id, label: i.text, ep: i.epistemicType })) },
    { id: "hub-unknowns", label: "Unknowns", items: itemsOf(model, "unknown").map((i) => ({ id: i.id, label: i.text, ep: i.epistemicType })) },
    { id: "hub-constraints", label: "Constraints", items: itemsOf(model, "constraint").map((i) => ({ id: i.id, label: i.text, ep: i.epistemicType })) },
    { id: "hub-stakeholders", label: "Stakeholders", items: model.stakeholders.map((s) => ({ id: s.id, label: s.name, ep: "user_fact" as const })) },
    { id: "hub-options", label: "Candidate actions", items: model.options.map((o) => ({ id: o.id, label: o.label, ep: "user_claim" as const })) },
  ];
  for (const hub of hubs) {
    if (hub.items.length === 0) continue;
    nodes.push({
      id: hub.id,
      label: `${hub.label} (${hub.items.length})`,
      nodeType: "group",
      epistemicType: "model_inference",
      confidence: "not_applicable",
      traceRefs: [],
    });
    edges.push({ id: `e-${hub.id}`, from: "hub-center", to: hub.id, relation: "comprises", traceRefs: [] });
    for (const item of hub.items) {
      nodes.push({
        id: item.id,
        label: item.label,
        nodeType: hub.label.toLowerCase().replace(/\s.*$/, ""),
        epistemicType: item.ep,
        confidence: "not_applicable",
        traceRefs: [item.id],
      });
      edges.push({ id: `e-${hub.id}-${item.id}`, from: hub.id, to: item.id, relation: "contains", traceRefs: [] });
    }
  }
  return { diagramType: "constellation", nodes, edges };
}

// ---------------------------------------------------------------------------

export default function OverviewView() {
  const caseFile = useWorkspace((s) => s.caseFile);
  const runAll = useWorkspace((s) => s.runAll);
  const runStatus = useWorkspace((s) => s.runStatus);
  const providerReal = useWorkspace((s) => s.providerReal);
  const select = useWorkspace((s) => s.select);
  const selection = useWorkspace((s) => s.selection);
  const setView = useWorkspace((s) => s.setView);

  const model = caseFile?.caseModel;
  const constellation = useMemo(() => (model ? buildConstellation(model) : null), [model]);

  const analyses = useMemo(() => {
    const out: Partial<Record<LensId, LensAnalysis>> = {};
    if (!caseFile) return out;
    for (const lens of LENS_IDS) {
      const a = caseFile.analyses[lens]?.analysis;
      if (a) out[lens] = a;
    }
    return out;
  }, [caseFile]);

  if (!caseFile || !model || !constellation) return null;

  const anyRunning = Object.values(runStatus).some((s) => s === "running" || s === "queued");
  const noneRun = Object.values(runStatus).every((s) => s === "idle");
  const totalChars = JSON.stringify(caseFile.input).length;
  const estimate = estimateRunCost(totalChars, caseFile.settings.models, caseFile.settings.depth);
  const assumptions = itemsOf(model, "assumption");
  const unknowns = itemsOf(model, "unknown");

  return (
    <div className="space-y-5 pb-10">
      <header className="space-y-1">
        <h2 className="font-brand text-[28px] font-semibold text-ink">{model.title}</h2>
        <p className="text-[15px] italic text-ink-muted">{model.centralQuestion}</p>
      </header>

      <section className="rounded-lg border border-line bg-surface p-3.5" aria-label="Run analysis">
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="primary" onClick={() => void runAll()} disabled={anyRunning}>
            {noneRun ? "Run all eight lenses" : "Re-run all lenses"}
          </Button>
          {anyRunning && <Spinner label="Eight independent passes over the same frozen case model…" />}
          <span className="text-[13px] text-ink-muted">
            {providerReal ? (
              <>Estimated cost ≈ <strong className="text-ink">{formatUsd(estimate.total)}</strong> · models set in intake</>
            ) : (
              <>Demo mode — deterministic, free, local.</>
            )}
          </span>
        </div>
        <div className="mt-3">
          <ProgressStrip />
        </div>
        <p className="mt-2 max-w-[90ch] text-[12.5px] text-ink-faint">{GUIDED_SEQUENCE_NOTE}</p>
      </section>

      <DiagramPanel
        diagram={constellation}
        title="Case constellation"
        selectedId={selection?.scope === "model" ? selection.refId : undefined}
        onSelect={(id) => {
          if (!id || id.startsWith("hub-")) {
            select(null);
          } else {
            select({ scope: "model", refId: id });
          }
        }}
        description="Case constellation: the central question connected to facts, claims, assumptions, values, unknowns, constraints, stakeholders, and candidate actions. Click any node to see its source and provenance in the inspector."
        heightClass="h-[440px]"
      />

      <div className="grid gap-3 lg:grid-cols-2">
        <SectionCard title="Unknowns — kept visible on purpose" tone="warn">
          <ul className="space-y-1.5 text-sm">
            {unknowns.map((u) => (
              <li key={u.id}>
                <button
                  className="text-left text-ink-muted hover:text-ink hover:underline"
                  onClick={() => select({ scope: "model", refId: u.id })}
                >
                  {u.text}
                </button>
              </li>
            ))}
            {unknowns.length === 0 && <li className="text-ink-faint">No unknowns recorded — suspicious in itself.</li>}
          </ul>
        </SectionCard>
        <SectionCard title="Assumption audit — what leans on what">
          <ul className="space-y-2 text-sm">
            {assumptions.map((a) => {
              const deps = dependentsOfAssumption(a.id, analyses, caseFile.synthesis?.result);
              return (
                <li key={a.id} className="rounded border border-line bg-surface px-2.5 py-2">
                  <button
                    className="text-left font-medium text-ink hover:underline"
                    onClick={() => select({ scope: "model", refId: a.id })}
                  >
                    {a.text}
                  </button>
                  {deps.length > 0 ? (
                    <ul className="mt-1 space-y-0.5 text-[13px] text-ink-muted">
                      {deps.slice(0, 6).map((d) => (
                        <li key={`${d.lens}-${d.id}`}>
                          <button
                            className="text-left hover:underline"
                            onClick={() => {
                              if (d.lens === "synthesis") {
                                setView({ kind: "synthesis" });
                                select({ scope: "synthesis", refId: d.id });
                              } else {
                                setView({ kind: "lens", lens: d.lens });
                                select({ scope: d.lens, refId: d.id });
                              }
                            }}
                          >
                            <span className="text-[11px] font-semibold uppercase tracking-wide text-accent">
                              {d.lens === "synthesis" ? "SYN" : LENSES[d.lens].shortName}
                            </span>{" "}
                            {d.label}
                          </button>
                        </li>
                      ))}
                      {deps.length > 6 && <li className="text-ink-faint">… and {deps.length - 6} more</li>}
                    </ul>
                  ) : (
                    <p className="mt-0.5 text-[13px] text-ink-faint">
                      {noneRun ? "Dependencies appear after the lenses run." : "Nothing currently cites this assumption."}
                    </p>
                  )}
                </li>
              );
            })}
            {assumptions.length === 0 && <li className="text-ink-faint">No assumptions recorded.</li>}
          </ul>
        </SectionCard>
      </div>
    </div>
  );
}
