"use client";
/**
 * Progressive case intake: three core fields first, optional structure
 * expandable below, per-stage model choice with a visible cost estimate,
 * an optional identifier scan (off by default), and a plain data notice.
 */
import React, { useMemo, useState } from "react";
import type { CaseInput, Depth, ModelChoice, StageModels } from "@/lib/schema";
import { useWorkspace } from "@/lib/store";
import { MODEL_INFO, estimateRunCost, formatUsd } from "@/lib/cost";
import { Button, Collapsible, Field, Spinner, inputClass } from "@/components/ui/primitives";

const OPTIONAL_FIELDS: Array<{ key: keyof CaseInput; label: string; hint: string; rows?: number }> = [
  { key: "knownFacts", label: "Known facts", hint: "What happened or is the case — one per line.", rows: 3 },
  { key: "claims", label: "Claims being made", hint: "What people assert, with who says it when known.", rows: 3 },
  { key: "stakeholders", label: "Stakeholders", hint: "Who is affected or involved — one per line.", rows: 2 },
  { key: "possibleActions", label: "Possible actions", hint: "Options on the table — one per line.", rows: 2 },
  { key: "suspectedCauses", label: "Suspected causes", hint: "Treated as claims to test, never as facts.", rows: 2 },
  { key: "assumptions", label: "Assumptions", hint: "What the discussion takes for granted.", rows: 2 },
  { key: "valuesGoals", label: "Values & goals", hint: "What matters in this decision.", rows: 2 },
  { key: "constraints", label: "Constraints", hint: "Hard limits on action.", rows: 2 },
  { key: "evidenceLinks", label: "Evidence or source links", hint: "URLs or references, one per line.", rows: 2 },
  { key: "timeHorizon", label: "Time horizon", hint: "When does this decide / play out?" },
];

// ---------------------------------------------------------------------------
// Lightweight identifier scan (runs locally; nothing leaves the machine)
// ---------------------------------------------------------------------------

function scanIdentifiers(text: string): Array<{ kind: string; match: string }> {
  const found: Array<{ kind: string; match: string }> = [];
  const push = (kind: string, re: RegExp) => {
    for (const m of text.matchAll(re)) {
      if (found.length < 40) found.push({ kind, match: m[0] });
    }
  };
  push("Email", /[\w.+-]+@[\w-]+\.[\w.]+/g);
  push("Phone-like number", /(?:\+?\d[\s().-]?){7,15}\d/g);
  push("Long number (account/ID?)", /\b\d{8,}\b/g);
  // Capitalized pairs that look like personal names (very rough, for review only).
  push("Possible name", /\b[A-Z][a-z]{2,}\s+[A-Z][a-z]{2,}\b/g);
  const seen = new Set<string>();
  return found.filter((f) => {
    const k = `${f.kind}:${f.match}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

// ---------------------------------------------------------------------------

export default function IntakeForm() {
  const caseFile = useWorkspace((s) => s.caseFile);
  const updateInput = useWorkspace((s) => s.updateInput);
  const updateSettings = useWorkspace((s) => s.updateSettings);
  const normalize = useWorkspace((s) => s.normalize);
  const normalizing = useWorkspace((s) => s.normalizing);
  const normalizeError = useWorkspace((s) => s.normalizeError);
  const providerReal = useWorkspace((s) => s.providerReal);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [scan, setScan] = useState<Array<{ kind: string; match: string }> | null>(null);

  const input = caseFile?.input;
  const settings = caseFile?.settings;

  const totalChars = useMemo(() => {
    if (!input) return 0;
    return Object.values(input).filter((v): v is string => typeof v === "string").join(" ").length;
  }, [input]);

  const estimate = useMemo(() => {
    if (!settings) return null;
    return estimateRunCost(totalChars, settings.models, settings.depth);
  }, [settings, totalChars]);

  if (!input || !settings) return null;

  const set = (key: keyof CaseInput, value: string) => {
    updateInput({ ...input, [key]: value === "" ? undefined : value } as CaseInput);
  };

  const setModel = (stage: keyof StageModels, model: ModelChoice) => {
    updateSettings({ ...settings.models, [stage]: model }, settings.depth);
  };

  const submit = () => {
    const errs: Record<string, string> = {};
    if (!input.title.trim()) errs.title = "Give the case a short title.";
    if (input.narrative.trim().length < 20) errs.narrative = "Describe the case in at least a sentence or two.";
    if (!input.centralQuestion.trim()) errs.centralQuestion = "State the question or decision at the center.";
    setErrors(errs);
    if (Object.keys(errs).length === 0) void normalize();
  };

  const hasDownstream = Boolean(caseFile && Object.keys(caseFile.analyses).length > 0);

  return (
    <div className="mx-auto w-full max-w-3xl space-y-5">
      <header>
        <h2 className="font-brand text-[28px] font-semibold text-ink">
          {hasDownstream ? "Edit the case" : "Enter a case"}
        </h2>
        <p className="mt-1 max-w-[65ch] text-[15px] text-ink-muted">
          One case, examined through eight reasoning lenses. Start with the three essentials — add
          structure below if you have it, or let the parser extract it.
        </p>
        {hasDownstream && (
          <p className="mt-2 rounded border-l-4 px-3 py-2 text-[13.5px]" style={{ borderColor: "var(--warn)", background: "var(--ep-assumption-soft)", color: "var(--ink)" }}>
            This case already has analyses. Editing marks them stale (nothing is deleted); re-parse
            and re-run to refresh them.
          </p>
        )}
      </header>

      <Field id="title" label="Case title" error={errors.title}>
        <input
          id="title"
          className={inputClass}
          value={input.title}
          onChange={(e) => set("title", e.target.value)}
          aria-describedby={errors.title ? "title-error" : undefined}
          placeholder="e.g. The three-day office mandate"
        />
      </Field>

      <Field id="narrative" label="Case narrative" hint="What happened, who is involved, what is at stake." error={errors.narrative}>
        <textarea
          id="narrative"
          className={inputClass}
          rows={6}
          value={input.narrative}
          onChange={(e) => set("narrative", e.target.value)}
          aria-describedby={errors.narrative ? "narrative-error" : "narrative-hint"}
        />
      </Field>

      <Field id="centralQuestion" label="Central question or decision" error={errors.centralQuestion}>
        <input
          id="centralQuestion"
          className={inputClass}
          value={input.centralQuestion}
          onChange={(e) => set("centralQuestion", e.target.value)}
          aria-describedby={errors.centralQuestion ? "centralQuestion-error" : undefined}
          placeholder="e.g. Should we keep, revise, or repeal the policy?"
        />
      </Field>

      <Collapsible summary="Optional structure — facts, claims, stakeholders, options…">
        <div className="space-y-4 pt-1">
          {OPTIONAL_FIELDS.map((f) => (
            <Field key={f.key} id={f.key} label={f.label} hint={f.hint}>
              {f.rows ? (
                <textarea
                  id={f.key}
                  className={inputClass}
                  rows={f.rows}
                  value={(input[f.key] as string) ?? ""}
                  onChange={(e) => set(f.key, e.target.value)}
                  aria-describedby={`${f.key}-hint`}
                />
              ) : (
                <input
                  id={f.key}
                  className={inputClass}
                  value={(input[f.key] as string) ?? ""}
                  onChange={(e) => set(f.key, e.target.value)}
                  aria-describedby={`${f.key}-hint`}
                />
              )}
            </Field>
          ))}
        </div>
      </Collapsible>

      <Collapsible summary="Analysis settings — depth, models, estimated cost">
        <div className="space-y-4 pt-1">
          <fieldset>
            <legend className="mb-1.5 text-sm font-medium text-ink">Depth</legend>
            <div className="flex flex-wrap gap-2" role="radiogroup">
              {(["quick", "standard", "deep"] as Depth[]).map((d) => (
                <label
                  key={d}
                  className={`flex min-h-[44px] cursor-pointer items-center gap-2 rounded border px-3 py-2 text-sm ${
                    settings.depth === d ? "border-accent bg-accent-soft" : "border-line hover:bg-surface-2"
                  }`}
                >
                  <input
                    type="radio"
                    name="depth"
                    value={d}
                    checked={settings.depth === d}
                    onChange={() => updateSettings(settings.models, d)}
                    className="accent-[var(--accent)]"
                  />
                  <span className="capitalize text-ink">{d === "quick" ? "Quick scan" : d === "deep" ? "Deep analysis" : "Standard"}</span>
                </label>
              ))}
            </div>
          </fieldset>
          {(["normalize", "lenses", "synthesis"] as const).map((stage) => (
            <Field
              key={stage}
              id={`model-${stage}`}
              label={stage === "normalize" ? "Parsing model" : stage === "lenses" ? "Lens analysis model" : "Synthesis model"}
            >
              <select
                id={`model-${stage}`}
                className={inputClass}
                value={settings.models[stage]}
                onChange={(e) => setModel(stage, e.target.value as ModelChoice)}
              >
                {(Object.keys(MODEL_INFO) as ModelChoice[]).map((m) => (
                  <option key={m} value={m}>
                    {MODEL_INFO[m].label} — ${MODEL_INFO[m].inputPerMTok}/{MODEL_INFO[m].outputPerMTok} per MTok · {MODEL_INFO[m].blurb}
                  </option>
                ))}
              </select>
            </Field>
          ))}
          {estimate && (
            <p className="rounded border border-line bg-surface-2 px-3 py-2 text-[13.5px] text-ink-muted">
              Estimated cost for a full run (parse + 8 lenses + synthesis):{" "}
              <strong className="text-ink">{formatUsd(estimate.total)}</strong>{" "}
              <span className="text-ink-faint">
                (parse {formatUsd(estimate.normalize)} · lenses {formatUsd(estimate.lenses)} · synthesis {formatUsd(estimate.synthesis)})
                — heuristic estimate, not a quote.
              </span>
            </p>
          )}
        </div>
      </Collapsible>

      <div className="rounded border border-line bg-surface-2 px-3 py-2.5 text-[13px] text-ink-muted">
        {providerReal ? (
          <>Case material is sent to the Anthropic API for analysis. Cases are stored as plain JSON in <code className="text-ink">data/cases/</code> on this machine; delete a case and its file is gone.</>
        ) : (
          <>Demo mode — no API key configured, nothing leaves this machine. Analyses are deterministic templates; the seeded samples carry full curated content.</>
        )}{" "}
        <button
          className="underline hover:text-ink"
          onClick={() => {
            const text = Object.values(input).filter((v): v is string => typeof v === "string").join("\n");
            setScan(scanIdentifiers(text));
          }}
        >
          Scan for identifiers
        </button>
      </div>

      {scan !== null && (
        <div className="rounded border border-line bg-surface p-3" role="region" aria-label="Identifier scan results">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-ink">
              {scan.length === 0 ? "No obvious identifiers found." : `Possible identifiers (${scan.length}) — review before analyzing:`}
            </p>
            <Button size="sm" variant="ghost" onClick={() => setScan(null)}>Dismiss</Button>
          </div>
          {scan.length > 0 && (
            <>
              <ul className="mt-2 flex flex-wrap gap-1.5 text-[13px]">
                {scan.map((s, i) => (
                  <li key={i} className="rounded border border-line bg-surface-2 px-2 py-1">
                    <span className="text-ink-faint">{s.kind}:</span> <span className="font-mono text-ink">{s.match}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-[12.5px] text-ink-faint">
                The scan is heuristic and local. Edit the fields above to redact anything you&apos;d
                rather not send — initials or roles usually work as well as names for the analysis.
              </p>
            </>
          )}
        </div>
      )}

      {normalizeError && (
        <div role="alert" className="rounded border border-danger bg-danger-soft px-3 py-2.5 text-sm text-danger">
          {normalizeError}{" "}
          <button className="underline" onClick={() => void normalize()}>Retry</button>
        </div>
      )}

      <div className="flex items-center gap-3 pb-8">
        <Button variant="primary" onClick={submit} disabled={normalizing}>
          {hasDownstream ? "Re-parse the case" : "Parse the case"}
        </Button>
        {normalizing && <Spinner label="Separating facts, claims, assumptions, values, unknowns…" />}
      </div>
    </div>
  );
}
