"use client";
/**
 * Case-model review & correction. The parse separates facts, claims,
 * assumptions, values, unknowns, and constraints; the user corrects any
 * misclassification before the lenses run. Reclassification is an explicit,
 * logged act — an assumption never silently becomes a fact.
 */
import React, { useState } from "react";
import {
  CASE_CATEGORIES,
  type CaseCategory,
  type CaseItem,
  type CaseModel,
  type EpistemicType,
} from "@/lib/schema";
import { useWorkspace } from "@/lib/store";
import { ORIGIN_LABEL } from "@/lib/epistemic";
import { Button, EpistemicBadge, inputClass } from "@/components/ui/primitives";

const CATEGORY_META: Record<CaseCategory, { title: string; blurb: string; defaultType: EpistemicType }> = {
  fact: { title: "Facts (as you stated them)", blurb: "Things stated as having happened or being the case.", defaultType: "user_fact" },
  claim: { title: "Claims", blurb: "Assertions by someone in the case — contested or unverified.", defaultType: "user_claim" },
  assumption: { title: "Assumptions", blurb: "Load-bearing but unestablished. Conclusions citing these inherit their risk.", defaultType: "assumption" },
  value: { title: "Values & goals", blurb: "What matters in this decision.", defaultType: "value_judgment" },
  unknown: { title: "Unknowns", blurb: "Missing information that matters — kept visible throughout.", defaultType: "unknown" },
  constraint: { title: "Constraints", blurb: "Hard limits on action.", defaultType: "user_fact" },
};

let addCounter = 0;

/** Module-scope id factory: impure by design, called from event handlers only. */
function newItemId(): string {
  return `usr-${Date.now().toString(36)}-${addCounter++}`;
}

function ItemRow({
  item,
  onChange,
  onDelete,
}: {
  item: CaseItem;
  onChange: (next: CaseItem, description: string) => void;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(item.text);

  return (
    <li className="rounded border border-line bg-surface p-2.5">
      {editing ? (
        <div className="space-y-2">
          <textarea
            className={inputClass}
            rows={2}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            aria-label="Edit item text"
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="primary"
              onClick={() => {
                onChange({ ...item, text: draft, origin: "revision" }, `Edited item ${item.id}.`);
                setEditing(false);
              }}
              disabled={draft.trim().length === 0}
            >
              Save
            </Button>
            <Button size="sm" variant="ghost" onClick={() => { setDraft(item.text); setEditing(false); }}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <>
          <p className="text-sm text-ink">{item.text}</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[12px] text-ink-faint">
            <EpistemicBadge type={item.epistemicType} compact />
            <span>{ORIGIN_LABEL[item.origin]}</span>
            {item.note && <span title={item.note}>· note ⓘ</span>}
            {item.sourceText && item.sourceText !== item.text && (
              <span title={`Your wording: “${item.sourceText}”`}>· reworded ⓘ</span>
            )}
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-1.5 text-[12.5px] text-ink-muted">
              Category
              <select
                className="rounded border border-line bg-surface px-1.5 py-1 text-[12.5px] text-ink min-h-[32px]"
                value={item.category}
                onChange={(e) => {
                  const category = e.target.value as CaseCategory;
                  onChange(
                    { ...item, category, epistemicType: CATEGORY_META[category].defaultType, origin: "revision" },
                    `Reclassified "${item.text.slice(0, 50)}" from ${item.category} to ${category}.`
                  );
                }}
              >
                {CASE_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </label>
            <Button size="sm" variant="ghost" onClick={() => setEditing(true)}>Edit</Button>
            <Button size="sm" variant="ghost" onClick={onDelete}>Remove</Button>
          </div>
        </>
      )}
    </li>
  );
}

export default function CaseModelReview() {
  const caseFile = useWorkspace((s) => s.caseFile);
  const updateCaseModel = useWorkspace((s) => s.updateCaseModel);
  const approveModel = useWorkspace((s) => s.approveModel);
  const normalize = useWorkspace((s) => s.normalize);
  const normalizing = useWorkspace((s) => s.normalizing);
  const [adding, setAdding] = useState<CaseCategory | null>(null);
  const [addText, setAddText] = useState("");

  const model = caseFile?.caseModel;
  if (!model) return null;

  const apply = (next: CaseModel, description: string) => updateCaseModel(next, description);

  const changeItem = (item: CaseItem, description: string) =>
    apply({ ...model, items: model.items.map((i) => (i.id === item.id ? item : i)) }, description);

  const deleteItem = (id: string) =>
    apply({ ...model, items: model.items.filter((i) => i.id !== id) }, `Removed item ${id}.`);

  const addItem = (category: CaseCategory, text: string) => {
    const id = newItemId();
    apply(
      {
        ...model,
        items: [
          ...model.items,
          { id, text, category, epistemicType: CATEGORY_META[category].defaultType, origin: "revision", sourceText: text },
        ],
      },
      `Added ${category}: "${text.slice(0, 50)}".`
    );
  };

  return (
    <div className="mx-auto w-full max-w-4xl space-y-5 pb-10">
      <header>
        <h2 className="font-brand text-[28px] font-semibold text-ink">Check the case model</h2>
        <p className="mt-1 max-w-[70ch] text-[15px] text-ink-muted">
          The parser separated your case into the categories below. All eight lenses will work from
          exactly this model — correct anything misclassified before continuing. Nothing you stated
          as an assumption has been upgraded to a fact; if something looks upgraded, fix it here.
        </p>
      </header>

      <div className="rounded-lg border border-line bg-surface p-3.5">
        <p className="text-[12px] font-semibold uppercase tracking-wide text-ink-faint">Central question</p>
        <p className="mt-1 text-[15px] font-medium text-ink">{model.centralQuestion}</p>
        {model.timeHorizon && <p className="mt-1 text-[13px] text-ink-muted">Time horizon: {model.timeHorizon}</p>}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {CASE_CATEGORIES.map((cat) => {
          const items = model.items.filter((i) => i.category === cat);
          const meta = CATEGORY_META[cat];
          return (
            <section key={cat} className="rounded-lg border border-line bg-surface-2/40 p-3" aria-label={meta.title}>
              <h3 className="text-sm font-semibold text-ink">
                {meta.title} <span className="text-ink-faint">({items.length})</span>
              </h3>
              <p className="mb-2 text-[12.5px] text-ink-faint">{meta.blurb}</p>
              <ul className="space-y-2">
                {items.map((item) => (
                  <ItemRow key={item.id} item={item} onChange={changeItem} onDelete={() => deleteItem(item.id)} />
                ))}
                {items.length === 0 && <li className="text-[13px] text-ink-faint">None identified.</li>}
              </ul>
              {adding === cat ? (
                <div className="mt-2 space-y-2">
                  <textarea
                    className={inputClass}
                    rows={2}
                    value={addText}
                    onChange={(e) => setAddText(e.target.value)}
                    aria-label={`New ${cat}`}
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <Button size="sm" variant="primary" disabled={addText.trim().length === 0}
                      onClick={() => { addItem(cat, addText.trim()); setAddText(""); setAdding(null); }}>
                      Add
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => { setAddText(""); setAdding(null); }}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <Button size="sm" variant="ghost" className="mt-2" onClick={() => setAdding(cat)}>
                  + Add {cat}
                </Button>
              )}
            </section>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-lg border border-line bg-surface-2/40 p-3" aria-label="Stakeholders">
          <h3 className="mb-2 text-sm font-semibold text-ink">Stakeholders ({model.stakeholders.length})</h3>
          <ul className="space-y-1.5 text-sm">
            {model.stakeholders.map((s) => (
              <li key={s.id} className="flex items-start justify-between gap-2 rounded border border-line bg-surface px-2.5 py-1.5">
                <span>
                  <span className="font-medium text-ink">{s.name}</span>
                  {s.description && <span className="text-ink-muted"> — {s.description}</span>}
                </span>
                <button
                  className="text-[12px] text-ink-faint hover:text-danger"
                  aria-label={`Remove stakeholder ${s.name}`}
                  onClick={() => apply({ ...model, stakeholders: model.stakeholders.filter((x) => x.id !== s.id) }, `Removed stakeholder ${s.name}.`)}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </section>
        <section className="rounded-lg border border-line bg-surface-2/40 p-3" aria-label="Candidate actions">
          <h3 className="mb-2 text-sm font-semibold text-ink">Candidate actions ({model.options.length})</h3>
          <ul className="space-y-1.5 text-sm">
            {model.options.map((o) => (
              <li key={o.id} className="flex items-start justify-between gap-2 rounded border border-line bg-surface px-2.5 py-1.5">
                <span>
                  <span className="font-medium text-ink">{o.label}</span>
                  {o.description && <span className="text-ink-muted"> — {o.description}</span>}
                </span>
                <button
                  className="text-[12px] text-ink-faint hover:text-danger"
                  aria-label={`Remove option ${o.label}`}
                  onClick={() => apply({ ...model, options: model.options.filter((x) => x.id !== o.id) }, `Removed option ${o.label}.`)}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button variant="primary" onClick={approveModel}>
          Looks right — continue to analysis
        </Button>
        <Button onClick={() => void normalize()} disabled={normalizing}>
          Re-parse from the case text
        </Button>
      </div>
    </div>
  );
}
