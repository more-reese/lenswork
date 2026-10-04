"use client";
/**
 * Library: saved cases, the three seeded demo cases, and new-case entry.
 */
import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Spinner, ThemeToggle } from "@/components/ui/primitives";
import type { CaseSummary } from "@/lib/storage";

const SAMPLES = [
  {
    key: "office",
    title: "The three-day office mandate",
    blurb: "Turnover up, delivery slower, executives split. The flagship demo — fully curated analyses across all eight lenses.",
    tag: "Rich demo",
  },
  {
    key: "congestion",
    title: "Congestion pricing downtown",
    blurb: "A $9 charge to cut traffic and emissions — with outer districts, retailers, and a charter constraint in the frame.",
    tag: "Policy case",
  },
  {
    key: "phones",
    title: "Phones out of the school day",
    blurb: "Lockable pouches, safety objections, equity questions, and two nearby schools with mixed results.",
    tag: "Policy case",
  },
];

export default function Home() {
  const router = useRouter();
  const [cases, setCases] = useState<CaseSummary[] | null>(null);
  const [error, setError] = useState<string | undefined>();
  const [creating, setCreating] = useState<string | null>(null);
  const [live, setLive] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/cases");
      if (!res.ok) throw new Error("Failed to load case library.");
      setCases(await res.json());
      setError(undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load cases.");
      setCases([]);
    }
  }, []);

  const loadStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/status");
      const data = await res.json();
      setLive(Boolean(data.anthropic));
    } catch {
      // demo badge stays; status is cosmetic
    }
  }, []);

  // Fetch-on-mount for the library and provider badge; state updates happen
  // after awaits, not synchronously.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
    void loadStatus();
  }, [load, loadStatus]);

  const create = async (body: object, key: string) => {
    setCreating(key);
    try {
      const res = await fetch("/api/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed to create case.");
      const file = await res.json();
      router.push(`/case/${file.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create case.");
      setCreating(null);
    }
  };

  const newBlank = () =>
    create(
      {
        input: {
          title: "Untitled case",
          narrative: "Describe the case here: what happened, who is involved, what is at stake.",
          centralQuestion: "What is the central question or decision?",
          depth: "standard",
        },
      },
      "blank"
    );

  const remove = async (id: string) => {
    if (!confirm("Delete this case? Its file in data/cases/ is removed permanently.")) return;
    await fetch(`/api/cases/${id}`, { method: "DELETE" });
    void load();
  };

  return (
    <div className="min-h-screen bg-bg">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-4">
          <svg width="34" height="34" viewBox="0 0 32 32" aria-hidden>
            <g fill="none" strokeWidth="2.4">
              <circle cx="13.5" cy="13.5" r="7.5" stroke="var(--accent)" />
              <circle cx="19" cy="16" r="7.5" stroke="var(--ep-claim)" opacity="0.8" />
              <circle cx="15" cy="19.5" r="7.5" stroke="var(--ep-inference)" opacity="0.8" />
            </g>
            <circle cx="15.8" cy="16.2" r="2.6" fill="var(--ink)" />
          </svg>
          <div className="flex-1">
            <h1 className="font-brand text-[30px] font-semibold leading-tight text-ink">Lenswork</h1>
            <p className="text-[13.5px] text-ink-muted">One case, eight reasoning lenses.</p>
          </div>
          <span
            className="rounded border px-2 py-0.5 text-[11.5px] font-medium"
            style={live ? { borderColor: "var(--ok)", color: "var(--ok)" } : { borderColor: "var(--warn)", color: "var(--warn)" }}
          >
            {live ? "Live analysis" : "Demo mode"}
          </span>
          <ThemeToggle />
        </div>
      </header>

      <main id="main" className="mx-auto max-w-5xl space-y-8 px-4 py-7">
        {error && (
          <p role="alert" className="rounded border border-danger bg-danger-soft px-3 py-2 text-sm text-danger">
            {error} <button className="underline" onClick={() => void load()}>Retry</button>
          </p>
        )}

        <section aria-label="Start">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className="text-lg font-semibold text-ink">Start</h2>
              <p className="text-[13.5px] text-ink-muted">
                Enter your own case, or open a demo case — no API key or personal data needed.
              </p>
            </div>
            <Button variant="primary" onClick={newBlank} disabled={creating !== null}>
              {creating === "blank" ? "Creating…" : "New case"}
            </Button>
          </div>
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            {SAMPLES.map((s) => (
              <button
                key={s.key}
                onClick={() => create({ sampleKey: s.key }, s.key)}
                disabled={creating !== null}
                className="flex flex-col rounded-lg border border-line bg-surface p-4 text-left transition-colors hover:border-accent disabled:opacity-60"
              >
                <span className="mb-1 w-fit rounded bg-surface-2 px-1.5 py-0.5 text-[11px] font-medium uppercase tracking-wide text-ink-faint">
                  {s.tag}
                </span>
                <span className="text-[15px] font-medium text-ink">{s.title}</span>
                <span className="mt-1 flex-1 text-[13.5px] text-ink-muted">{s.blurb}</span>
                <span className="mt-2 text-[13px] font-medium text-accent">
                  {creating === s.key ? "Creating…" : "Use this demo case →"}
                </span>
              </button>
            ))}
          </div>
        </section>

        <section aria-label="Your cases">
          <h2 className="text-lg font-semibold text-ink">Your cases</h2>
          {cases === null ? (
            <div className="mt-3"><Spinner label="Loading…" /></div>
          ) : cases.length === 0 ? (
            <div className="mt-3 rounded-lg border border-dashed border-line-strong bg-surface p-6 text-center">
              <p className="text-sm text-ink-muted">
                Nothing here yet. Cases you create are saved as plain JSON files in{" "}
                <code className="rounded bg-surface-2 px-1 text-ink">data/cases/</code> — portable,
                greppable, yours. Open a demo case above to see the full analysis flow.
              </p>
            </div>
          ) : (
            <ul className="mt-3 divide-y divide-[var(--line)] rounded-lg border border-line bg-surface">
              {cases.map((c) => (
                <li key={c.id} className="flex items-center gap-3 px-4 py-3">
                  {c.corrupt ? (
                    <div className="flex-1">
                      <p className="text-sm text-danger">{c.title}</p>
                      <p className="text-[12.5px] text-ink-faint">File failed validation — fix or delete it in data/cases/.</p>
                    </div>
                  ) : (
                    <button className="min-w-0 flex-1 text-left" onClick={() => router.push(`/case/${c.id}`)}>
                      <p className="truncate text-[15px] font-medium text-ink hover:text-accent">{c.title}</p>
                      <p className="truncate text-[13px] text-ink-muted">{c.centralQuestion}</p>
                      <p className="mt-0.5 text-[12px] text-ink-faint">
                        {c.lensesDone}/8 lenses{c.hasSynthesis ? " · synthesized" : ""}
                        {c.isSample ? " · from sample" : ""}
                        {c.updatedAt ? ` · updated ${new Date(c.updatedAt).toLocaleDateString()}` : ""}
                      </p>
                    </button>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => void remove(c.id)} aria-label={`Delete case ${c.title}`}>
                    Delete
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <footer className="border-t border-line pt-4 text-[12.5px] text-ink-faint">
          <p>
            Lenswork analyzes one case through deduction, induction, abduction, causal, practical &
            moral, systems, interpretive, and dialectical reasoning — labeling what each lens can and
            cannot establish. {live ? "Case material is sent to the Anthropic API for analysis." : "Running locally in demo mode; nothing leaves this machine."}{" "}
            Not legal, medical, or financial advice; every output is a labeled, revisable analysis, not a verdict.
          </p>
        </footer>
      </main>
    </div>
  );
}
