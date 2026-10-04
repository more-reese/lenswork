"use client";
/**
 * Practical & moral: a decision landscape, not a weighted scorecard.
 * Option cards carry benefits, burdens, duties, reversibility, and
 * distribution (who benefits / pays / decides); value tensions and the five
 * ethical traditions' questions stand beside them. No mechanical winner.
 */
import React, { useState } from "react";
import type { LensViewProps } from "../LensShell";
import DiagramPanel from "@/components/diagram/DiagramPanel";
import { Callout, useDiagramSelection, useProvenanceHidden } from "../shared";
import { SectionCard } from "../LensShell";
import type { PracticalOption } from "@/lib/schema";

function OptionCard({ o, emphasized, onFocus }: { o: PracticalOption; emphasized: boolean; onFocus: () => void }) {
  return (
    <article
      className={`rounded-lg border bg-surface p-3 text-sm ${emphasized ? "border-accent" : "border-line"}`}
    >
      <button className="text-left" onClick={onFocus}>
        <h4 className="font-medium text-ink">{o.label}</h4>
      </button>
      <p className="mt-1 text-ink-muted">{o.summary}</p>
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        <div>
          <p className="text-[11.5px] font-semibold uppercase tracking-wide" style={{ color: "var(--ok)" }}>Benefits</p>
          <ul className="mt-0.5 list-disc space-y-0.5 pl-4 text-ink-muted">
            {o.benefits.map((b, i) => <li key={i}>{b}</li>)}
          </ul>
        </div>
        <div>
          <p className="text-[11.5px] font-semibold uppercase tracking-wide" style={{ color: "var(--danger)" }}>Burdens</p>
          <ul className="mt-0.5 list-disc space-y-0.5 pl-4 text-ink-muted">
            {o.burdens.map((b, i) => <li key={i}>{b}</li>)}
          </ul>
        </div>
      </div>
      {o.dutiesAndRights.length > 0 && (
        <div className="mt-2">
          <p className="text-[11.5px] font-semibold uppercase tracking-wide text-ink-faint">Duties & rights</p>
          <ul className="mt-0.5 list-disc space-y-0.5 pl-4 text-ink-muted">
            {o.dutiesAndRights.map((d, i) => <li key={i}>{d}</li>)}
          </ul>
        </div>
      )}
      <div className="mt-2 grid gap-1 text-[13px] text-ink-muted sm:grid-cols-2">
        <p><span className="font-medium text-ink">Reversibility:</span> {o.reversibility}</p>
        <p><span className="font-medium text-ink">Uncertainty:</span> {o.uncertainty}</p>
      </div>
      <table className="mt-2 w-full border-collapse text-[13px]">
        <caption className="sr-only">Distribution of effects for {o.label}</caption>
        <tbody>
          {([
            ["Who benefits", o.distribution.whoBenefits],
            ["Who pays", o.distribution.whoPays],
            ["Who decides", o.distribution.whoDecides],
          ] as const).map(([k, v]) => (
            <tr key={k} className="border-t border-line">
              <th scope="row" className="py-1 pr-2 text-left font-medium text-ink whitespace-nowrap">{k}</th>
              <td className="py-1 text-ink-muted">{v}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </article>
  );
}

export default function PracticalView({ analysis }: LensViewProps) {
  const { selectedId, onSelect } = useDiagramSelection("practical");
  const hiddenIds = useProvenanceHidden(analysis.diagram);
  const [focusedOption, setFocusedOption] = useState<string | undefined>();
  const extras = analysis.extras;
  if (extras.lens !== "practical") return null;

  return (
    <div className="space-y-3">
      <Callout title="Values are commitments, not findings" tone="accent">
        Nothing below sums to a verdict. The landscape shows what trades off, who carries it, and
        which tensions survive every weighting — the choice of weights remains yours.
      </Callout>
      <DiagramPanel
        diagram={analysis.diagram}
        title="Decision landscape"
        selectedId={selectedId ?? focusedOption}
        onSelect={onSelect}
        hiddenIds={hiddenIds}
        description="Decision landscape: options, goals and values, constraints, and tensions arranged in columns, with support and conflict edges between them."
        heightClass="h-[420px]"
      />
      <SectionCard title={`Options (${extras.options.length})`}>
        <div className="grid gap-3 xl:grid-cols-2">
          {extras.options.map((o) => (
            <OptionCard
              key={o.nodeId}
              o={o}
              emphasized={focusedOption === o.nodeId || selectedId === o.nodeId}
              onFocus={() => {
                setFocusedOption(o.nodeId);
                onSelect(o.nodeId);
              }}
            />
          ))}
        </div>
      </SectionCard>
      <div className="grid gap-3 lg:grid-cols-2">
        <SectionCard title="Value tensions no metric resolves" tone="warn">
          <ul className="space-y-2 text-sm">
            {extras.valueTensions.map((t, i) => (
              <li key={i}>
                <p className="font-medium text-ink">{t.label}</p>
                <p className="text-ink-muted">{t.description}</p>
              </li>
            ))}
            {extras.valueTensions.length === 0 && (
              <li className="text-ink-faint">No tensions identified — which is itself worth questioning.</li>
            )}
          </ul>
        </SectionCard>
        <SectionCard title="Five traditions, five questions">
          <dl className="space-y-2 text-sm">
            {([
              ["Consequences", extras.ethicalPerspectives.consequence],
              ["Duty", extras.ethicalPerspectives.duty],
              ["Virtue", extras.ethicalPerspectives.virtue],
              ["Care", extras.ethicalPerspectives.care],
              ["Procedural fairness", extras.ethicalPerspectives.fairness],
            ] as const).map(([k, v]) => (
              <div key={k}>
                <dt className="font-medium text-ink">{k}</dt>
                <dd className="text-ink-muted">{v}</dd>
              </div>
            ))}
          </dl>
        </SectionCard>
      </div>
    </div>
  );
}
