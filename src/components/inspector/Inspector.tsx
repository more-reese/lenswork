"use client";
/**
 * Right contextual inspector: provenance and detail for the selected element,
 * the educational layer for the active lens, the conversational refine loop,
 * and per-lens revision history.
 */
import React, { useMemo, useState } from "react";
import {
  LENS_IDS,
  resolveTraceRef,
  type LensAnalysis,
  type LensId,
} from "@/lib/schema";
import { useWorkspace } from "@/lib/store";
import { LENSES } from "@/lib/lenses/registry";
import { EPISTEMIC_STYLES, ORIGIN_LABEL } from "@/lib/epistemic";
import {
  Button,
  Collapsible,
  ConfidenceBadge,
  EpistemicBadge,
  Spinner,
} from "@/components/ui/primitives";

function useAnalyses(): Partial<Record<LensId, LensAnalysis>> {
  const caseFile = useWorkspace((s) => s.caseFile);
  return useMemo(() => {
    const out: Partial<Record<LensId, LensAnalysis>> = {};
    if (!caseFile) return out;
    for (const lens of LENS_IDS) {
      const a = caseFile.analyses[lens]?.analysis;
      if (a) out[lens] = a;
    }
    return out;
  }, [caseFile]);
}

// ---------------------------------------------------------------------------

function TraceList({ refs }: { refs: string[] }) {
  const caseFile = useWorkspace((s) => s.caseFile);
  const select = useWorkspace((s) => s.select);
  const setView = useWorkspace((s) => s.setView);
  const analyses = useAnalyses();
  if (refs.length === 0) {
    return <p className="text-[13px] text-ink-faint">No trace references (structural element).</p>;
  }
  return (
    <ul className="space-y-1.5">
      {refs.map((ref) => {
        const target = resolveTraceRef(ref, caseFile?.caseModel, analyses);
        if (!target) {
          return (
            <li key={ref} className="rounded border border-dashed border-line px-2 py-1.5 text-[13px] text-ink-faint">
              {ref} — unresolved reference
            </li>
          );
        }
        if (target.kind === "case_item") {
          const it = target.item;
          return (
            <li key={ref} className="rounded border border-line bg-surface-2 px-2 py-1.5 text-[13px]">
              <button
                className="text-left hover:underline"
                onClick={() => {
                  setView({ kind: "model" });
                  select({ scope: "model", refId: it.id });
                }}
              >
                <span className="mr-1.5 align-middle"><EpistemicBadge type={it.epistemicType} compact /></span>
                <span className="text-ink">{it.text}</span>
              </button>
              <span className="mt-0.5 block text-[12px] text-ink-faint">{ORIGIN_LABEL[it.origin]}</span>
            </li>
          );
        }
        if (target.kind === "stakeholder") {
          return (
            <li key={ref} className="rounded border border-line bg-surface-2 px-2 py-1.5 text-[13px] text-ink">
              Stakeholder: {target.stakeholder.name}
            </li>
          );
        }
        if (target.kind === "option") {
          return (
            <li key={ref} className="rounded border border-line bg-surface-2 px-2 py-1.5 text-[13px] text-ink">
              Option: {target.option.label}
            </li>
          );
        }
        const lensName = LENSES[target.lens].shortName;
        const label = target.kind === "node" ? target.node.label : target.finding.statement;
        return (
          <li key={ref} className="rounded border border-line bg-surface-2 px-2 py-1.5 text-[13px]">
            <button
              className="text-left hover:underline text-ink"
              onClick={() => {
                setView({ kind: "lens", lens: target.lens });
                select({ scope: target.lens, refId: ref });
              }}
            >
              <span className="mr-1 text-[11px] font-semibold uppercase tracking-wide text-accent">{lensName}</span>
              {label}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

// ---------------------------------------------------------------------------

function SelectionDetails() {
  const selection = useWorkspace((s) => s.selection);
  const caseFile = useWorkspace((s) => s.caseFile);
  const analyses = useAnalyses();

  const content = useMemo(() => {
    if (!selection || !caseFile) return null;
    if (selection.scope === "model") {
      const item = caseFile.caseModel?.items.find((i) => i.id === selection.refId);
      if (!item) return null;
      return {
        kind: "Case item",
        title: item.text,
        epistemicType: item.epistemicType,
        confidence: undefined,
        confidenceRationale: undefined,
        detail: item.note,
        source: item.sourceText,
        origin: item.origin,
        traceRefs: [] as string[],
        connections: [] as string[],
      };
    }
    if (selection.scope === "synthesis") {
      const syn = caseFile.synthesis?.result;
      if (!syn) return null;
      const all = [
        ...syn.convergence, ...syn.conflicts, ...syn.unresolvedUnknowns,
        ...syn.assumptionDependencies, ...syn.valueDependencies,
        ...syn.evidencePriorities, ...syn.testsOrNextSteps,
      ];
      const claim = all.find((c) => c.id === selection.refId);
      if (!claim) return null;
      return {
        kind: "Synthesis claim",
        title: claim.statement,
        epistemicType: undefined,
        confidence: undefined,
        confidenceRationale: undefined,
        detail: claim.lenses.length > 0 ? `Supported by: ${claim.lenses.map((l) => LENSES[l].shortName).join(", ")}` : undefined,
        source: undefined,
        origin: undefined,
        traceRefs: claim.traceRefs,
        connections: [],
      };
    }
    const a = analyses[selection.scope];
    if (!a) return null;
    const node = a.diagram.nodes.find((n) => n.id === selection.refId);
    if (node) {
      const connected = a.diagram.edges
        .filter((e) => e.from === node.id || e.to === node.id)
        .map((e) => {
          const otherId = e.from === node.id ? e.to : e.from;
          const other = a.diagram.nodes.find((n) => n.id === otherId);
          const dir = e.from === node.id ? "→" : "←";
          return `${dir} ${e.relation.replace(/_/g, " ")} ${dir === "→" ? "" : "from "}“${other?.label ?? otherId}”${e.detail ? ` — ${e.detail}` : ""}`;
        });
      return {
        kind: `${node.nodeType.replace(/_/g, " ")} (${LENSES[selection.scope].shortName} lens)`,
        title: node.label,
        epistemicType: node.epistemicType,
        confidence: node.confidence,
        confidenceRationale: node.confidenceRationale,
        detail: node.detail,
        source: undefined,
        origin: undefined,
        traceRefs: node.traceRefs,
        connections: connected,
      };
    }
    const f = a.findings.find((x) => x.id === selection.refId);
    if (f) {
      return {
        kind: `Finding (${LENSES[selection.scope].shortName} lens)`,
        title: f.statement,
        epistemicType: f.epistemicType,
        confidence: f.confidence,
        confidenceRationale: f.confidenceRationale,
        detail: undefined,
        source: undefined,
        origin: undefined,
        traceRefs: f.traceRefs,
        connections: [],
      };
    }
    return null;
  }, [selection, caseFile, analyses]);

  if (!content) {
    return (
      <p className="text-[13px] text-ink-faint">
        Select any node, finding, or claim to see its definition, provenance, and connections.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-faint">{content.kind}</p>
        <p className="mt-1 text-sm font-medium text-ink">{content.title}</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {content.epistemicType && <EpistemicBadge type={content.epistemicType} />}
        {content.confidence && <ConfidenceBadge value={content.confidence} />}
      </div>
      {content.epistemicType && (
        <p className="text-[13px] text-ink-muted">{EPISTEMIC_STYLES[content.epistemicType].description}</p>
      )}
      {content.confidenceRationale && (
        <p className="text-[13px] text-ink-muted">
          <span className="font-medium text-ink">Why this confidence:</span> {content.confidenceRationale}
        </p>
      )}
      {content.detail && <p className="text-[13px] text-ink-muted">{content.detail}</p>}
      {content.origin && (
        <p className="text-[13px] text-ink-muted">
          <span className="font-medium text-ink">Origin:</span> {ORIGIN_LABEL[content.origin]}
        </p>
      )}
      {content.source && (
        <p className="rounded border border-line bg-surface-2 px-2 py-1.5 text-[13px] text-ink-muted">
          <span className="font-medium text-ink">Your original wording:</span> “{content.source}”
        </p>
      )}
      {content.connections.length > 0 && (
        <div>
          <p className="mb-1 text-[12px] font-semibold uppercase tracking-wide text-ink-faint">Connections</p>
          <ul className="space-y-1 text-[13px] text-ink-muted">
            {content.connections.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </div>
      )}
      <div>
        <p className="mb-1 text-[12px] font-semibold uppercase tracking-wide text-ink-faint">Traces to</p>
        <TraceList refs={content.traceRefs} />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------

function EducationPanel({ lens }: { lens: LensId }) {
  const meta = LENSES[lens];
  const teach = useWorkspace((s) => s.teachMode);
  return (
    <div className="space-y-2">
      {teach && (
        <p className="rounded border border-accent-soft bg-accent-soft px-2.5 py-2 text-[13px] text-ink">
          {meta.guidedPathReason}
        </p>
      )}
      <Collapsible summary="In plain language">{meta.education.plainLanguage}</Collapsible>
      <Collapsible summary="What to look for">
        <ul className="list-disc space-y-1 pl-4">
          {meta.education.whatToLookFor.map((w, i) => <li key={i}>{w}</li>)}
        </ul>
      </Collapsible>
      <Collapsible summary="What this lens can establish">
        <ul className="list-disc space-y-1 pl-4">
          {meta.education.canEstablish.map((w, i) => <li key={i}>{w}</li>)}
        </ul>
      </Collapsible>
      <Collapsible summary="What this lens cannot establish">
        <ul className="list-disc space-y-1 pl-4">
          {meta.education.cannotEstablish.map((w, i) => <li key={i}>{w}</li>)}
        </ul>
      </Collapsible>
      <p className="text-[12px] text-ink-faint">
        Sources:{" "}
        {meta.sources.map((s, i) => (
          <span key={s.url}>
            {i > 0 && " · "}
            <a className="underline hover:text-ink" href={s.url} target="_blank" rel="noreferrer">
              {s.label}
            </a>
          </span>
        ))}
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------

function RefinePanel({ lens }: { lens: LensId }) {
  const refine = useWorkspace((s) => s.refine);
  const busy = useWorkspace((s) => Boolean(s.refineBusy[lens]));
  const run = useWorkspace((s) => s.caseFile?.analyses[lens]);
  const consumePrefill = useWorkspace((s) => s.consumeRefinePrefill);
  const hasPrefill = useWorkspace((s) => s.refinePrefill[lens] !== undefined);
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | undefined>();

  React.useEffect(() => {
    if (hasPrefill) {
      const msg = consumePrefill(lens);
      // Syncing a one-shot handoff message from the store into the local
      // draft is the intended behavior here.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (msg) setMessage(msg);
    }
  }, [hasPrefill, consumePrefill, lens]);

  const submit = async (text: string) => {
    setError(undefined);
    try {
      await refine(lens, text);
      setMessage("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Refine failed.");
    }
  };

  if (!run?.analysis) return null;

  return (
    <div className="space-y-2">
      <label htmlFor={`refine-${lens}`} className="text-[12px] font-semibold uppercase tracking-wide text-ink-faint">
        Respond to this lens
      </label>
      <textarea
        id={`refine-${lens}`}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Challenge a finding, correct a premise, add evidence…"
        rows={3}
        className="w-full rounded border border-line-strong bg-surface px-2.5 py-2 text-[13.5px] text-ink placeholder:text-ink-faint"
        disabled={busy}
      />
      <div className="flex flex-wrap gap-2">
        <Button variant="primary" size="sm" disabled={busy || message.trim().length < 3} onClick={() => submit(message.trim())}>
          Send & revise
        </Button>
        <Button
          size="sm"
          disabled={busy}
          onClick={() =>
            submit(
              "Challenge this lens: generate the strongest criticism of your current analysis of this case, then revise the analysis to address it or concede it explicitly."
            )
          }
          title="Generate the strongest criticism of the current analysis"
        >
          Challenge this lens
        </Button>
        {busy && <Spinner label="Revising…" />}
      </div>
      {error && <p role="alert" className="text-[13px] text-danger">{error}</p>}
      {run.revisions.length > 0 && (
        <Collapsible summary={`Revision history (${run.revisions.length})`}>
          <ol className="space-y-2">
            {[...run.revisions].reverse().map((r, i) => (
              <li key={i} className="rounded border border-line px-2 py-1.5">
                <p className="text-[12px] text-ink-faint">
                  {new Date(r.at).toLocaleString()} · {r.trigger}
                </p>
                <p className="text-[13px] text-ink">{r.note}</p>
                <details className="mt-1">
                  <summary className="cursor-pointer text-[12px] text-ink-faint hover:text-ink">
                    Summary before this revision
                  </summary>
                  <p className="mt-1 text-[13px] text-ink-muted">{r.previous.plainLanguageSummary}</p>
                </details>
              </li>
            ))}
          </ol>
        </Collapsible>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------

export default function Inspector() {
  const view = useWorkspace((s) => s.view);
  const lens = view.kind === "lens" ? view.lens : undefined;
  return (
    <aside
      aria-label="Inspector"
      className="lw-scroll flex h-full flex-col gap-4 overflow-y-auto border-l border-line bg-surface p-3"
    >
      <section aria-label="Selection details">
        <h3 className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-ink-faint">Inspector</h3>
        <SelectionDetails />
      </section>
      {lens && (
        <>
          <hr className="border-line" />
          <section aria-label="Respond to this lens">
            <RefinePanel lens={lens} />
          </section>
          <hr className="border-line" />
          <section aria-label="About this lens">
            <h3 className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-ink-faint">
              About the {LENSES[lens].shortName.toLowerCase()} lens
            </h3>
            <EducationPanel lens={lens} />
          </section>
        </>
      )}
    </aside>
  );
}
