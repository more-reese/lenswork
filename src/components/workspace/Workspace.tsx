"use client";
/**
 * The case workspace: top bar (save state, provider badge, teach toggle,
 * provenance filter, theme), left rail (phases + lens atlas in guided
 * order), center view, right inspector. Collapses to a single column with a
 * horizontal lens switcher below the top bar on narrow screens.
 */
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useWorkspace, type Selection, type View } from "@/lib/store";
import { LENSES, LENS_ORDER } from "@/lib/lenses/registry";
import { Button, Spinner, ThemeToggle } from "@/components/ui/primitives";
import { LensGlyph } from "@/components/overview/OverviewView";
import IntakeForm from "@/components/intake/IntakeForm";
import CaseModelReview from "@/components/casemodel/CaseModelReview";
import OverviewView from "@/components/overview/OverviewView";
import SynthesisView from "@/components/synthesis/SynthesisView";
import CompareView from "@/components/compare/CompareView";
import LensShell from "@/components/lens/LensShell";
import Inspector from "@/components/inspector/Inspector";

function statusColor(st: string): string {
  switch (st) {
    case "done": return "var(--ok)";
    case "error": return "var(--danger)";
    case "stale": return "var(--warn)";
    case "running":
    case "queued": return "var(--accent)";
    default: return "var(--line-strong)";
  }
}

function NavButton({
  active,
  disabled,
  onClick,
  children,
  label,
}: {
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
  label?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-current={active ? "page" : undefined}
      aria-label={label}
      className={`flex w-full min-h-[40px] items-center gap-2 rounded px-2.5 py-1.5 text-left text-[13.5px] transition-colors disabled:opacity-40 ${
        active ? "bg-accent-soft font-medium text-ink" : "text-ink-muted hover:bg-surface-2 hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

function LeftNav() {
  const view = useWorkspace((s) => s.view);
  const setView = useWorkspace((s) => s.setView);
  const caseFile = useWorkspace((s) => s.caseFile);
  const runStatus = useWorkspace((s) => s.runStatus);
  const synthesisStatus = useWorkspace((s) => s.synthesisStatus);

  const hasModel = Boolean(caseFile?.caseModel);
  const approved = Boolean(caseFile?.caseModelApproved);

  const is = (k: View["kind"], lens?: string) =>
    view.kind === k && (k !== "lens" || (view.kind === "lens" && view.lens === lens));

  return (
    <nav aria-label="Workspace navigation" className="flex h-full flex-col gap-0.5 overflow-y-auto lw-scroll p-2">
      <p className="px-2.5 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-ink-faint">Case</p>
      <NavButton active={is("intake")} onClick={() => setView({ kind: "intake" })}>
        <span className="w-4 text-center text-ink-faint">1</span> Input
      </NavButton>
      <NavButton active={is("model")} disabled={!hasModel} onClick={() => setView({ kind: "model" })}>
        <span className="w-4 text-center text-ink-faint">2</span> Case model
      </NavButton>
      <NavButton active={is("overview")} disabled={!approved} onClick={() => setView({ kind: "overview" })}>
        <span className="w-4 text-center text-ink-faint">3</span> Overview & run
      </NavButton>

      <p className="px-2.5 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-wider text-ink-faint">
        Lens atlas <span className="font-normal normal-case">· guided order</span>
      </p>
      {LENS_ORDER.map((lens, i) => (
        <NavButton
          key={lens}
          active={is("lens", lens)}
          disabled={!approved}
          onClick={() => setView({ kind: "lens", lens })}
          label={`${i + 1}. ${LENSES[lens].name} — status: ${runStatus[lens]}`}
        >
          <span
            className={`h-2 w-2 shrink-0 rounded-full ${runStatus[lens] === "running" || runStatus[lens] === "queued" ? "animate-pulse" : ""}`}
            style={{ background: statusColor(runStatus[lens]) }}
            aria-hidden
          />
          <span className="text-ink-muted"><LensGlyph lens={lens} size={18} /></span>
          {LENSES[lens].shortName}
        </NavButton>
      ))}

      <p className="px-2.5 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-wider text-ink-faint">Across lenses</p>
      <NavButton active={is("synthesis")} disabled={!approved} onClick={() => setView({ kind: "synthesis" })}>
        <span
          className="h-2 w-2 shrink-0 rounded-full"
          style={{ background: statusColor(synthesisStatus) }}
          aria-hidden
        />
        Synthesis
      </NavButton>
      <NavButton active={is("compare")} disabled={!hasModel} onClick={() => setView({ kind: "compare" })}>
        <span className="w-2" aria-hidden />
        Compare questions
      </NavButton>
    </nav>
  );
}

function MobileLensBar() {
  const view = useWorkspace((s) => s.view);
  const setView = useWorkspace((s) => s.setView);
  const caseFile = useWorkspace((s) => s.caseFile);
  const runStatus = useWorkspace((s) => s.runStatus);
  const approved = Boolean(caseFile?.caseModelApproved);
  if (!approved) return null;
  return (
    <div className="lw-scroll flex gap-1 overflow-x-auto border-b border-line bg-surface px-2 py-1.5 lg:hidden" role="navigation" aria-label="Lens switcher">
      <button
        onClick={() => setView({ kind: "overview" })}
        className={`min-h-[44px] shrink-0 rounded px-2.5 text-[13px] ${view.kind === "overview" ? "bg-accent-soft font-medium text-ink" : "text-ink-muted"}`}
      >
        Overview
      </button>
      {LENS_ORDER.map((lens) => (
        <button
          key={lens}
          onClick={() => setView({ kind: "lens", lens })}
          className={`flex min-h-[44px] shrink-0 items-center gap-1.5 rounded px-2.5 text-[13px] ${
            view.kind === "lens" && view.lens === lens ? "bg-accent-soft font-medium text-ink" : "text-ink-muted"
          }`}
        >
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: statusColor(runStatus[lens]) }} aria-hidden />
          {LENSES[lens].shortName}
        </button>
      ))}
      <button
        onClick={() => setView({ kind: "synthesis" })}
        className={`min-h-[44px] shrink-0 rounded px-2.5 text-[13px] ${view.kind === "synthesis" ? "bg-accent-soft font-medium text-ink" : "text-ink-muted"}`}
      >
        Synthesis
      </button>
    </div>
  );
}

function TopBar() {
  const caseFile = useWorkspace((s) => s.caseFile);
  const saving = useWorkspace((s) => s.saving);
  const providerReal = useWorkspace((s) => s.providerReal);
  const teachMode = useWorkspace((s) => s.teachMode);
  const toggleTeach = useWorkspace((s) => s.toggleTeach);
  const provenanceFilter = useWorkspace((s) => s.provenanceFilter);
  const setProvenanceFilter = useWorkspace((s) => s.setProvenanceFilter);

  return (
    <header className="flex min-h-[52px] flex-wrap items-center gap-x-3 gap-y-1 border-b border-line bg-surface px-3 py-1.5">
      <Link href="/" className="flex items-center gap-2 font-brand text-[17px] font-semibold text-ink hover:text-accent">
        <svg width="20" height="20" viewBox="0 0 32 32" aria-hidden>
          <g fill="none" strokeWidth="2.6">
            <circle cx="13.5" cy="13.5" r="7.5" stroke="var(--accent)" />
            <circle cx="19" cy="16" r="7.5" stroke="var(--ep-claim)" opacity="0.8" />
            <circle cx="15" cy="19.5" r="7.5" stroke="var(--ep-inference)" opacity="0.8" />
          </g>
          <circle cx="15.8" cy="16.2" r="2.4" fill="var(--ink)" />
        </svg>
        Lenswork
      </Link>
      <span className="hidden text-line-strong sm:inline" aria-hidden>/</span>
      <h1 className="min-w-0 flex-1 truncate text-[15px] font-medium text-ink" title={caseFile?.input.title}>
        {caseFile?.input.title ?? "…"}
      </h1>
      <span
        className="rounded border px-2 py-0.5 text-[11.5px] font-medium"
        style={
          providerReal
            ? { borderColor: "var(--ok)", color: "var(--ok)" }
            : { borderColor: "var(--warn)", color: "var(--warn)" }
        }
        title={providerReal ? "Analyses run on the Anthropic API" : "No API key — deterministic local demo analyses"}
      >
        {providerReal ? "Live analysis" : "Demo mode"}
      </span>
      <span className="text-[12px] text-ink-faint" role="status">
        {saving === "saving" ? "Saving…" : saving === "error" ? <span className="text-danger">Save failed — retrying on next edit</span> : "Saved"}
      </span>
      <label className="hidden items-center gap-1.5 text-[12.5px] text-ink-muted md:flex">
        Show
        <select
          value={provenanceFilter}
          onChange={(e) => setProvenanceFilter(e.target.value as typeof provenanceFilter)}
          className="rounded border border-line bg-surface px-1.5 py-1 text-[12.5px] text-ink min-h-[32px]"
          aria-label="Provenance filter: which items to show in diagrams"
        >
          <option value="all">everything</option>
          <option value="user">your input only</option>
          <option value="model">model inferences only</option>
          <option value="sourced">sourced items only</option>
        </select>
      </label>
      <label className="flex cursor-pointer items-center gap-1.5 text-[12.5px] text-ink-muted" title="Reveal brief explanations as you explore reasoning structures">
        <input type="checkbox" checked={teachMode} onChange={toggleTeach} className="accent-[var(--accent)] h-4 w-4" />
        Teach me
      </label>
      <ThemeToggle />
    </header>
  );
}

function CenterView() {
  const view = useWorkspace((s) => s.view);
  switch (view.kind) {
    case "intake": return <IntakeForm />;
    case "model": return <CaseModelReview />;
    case "overview": return <OverviewView />;
    case "lens": return <LensShell lens={view.lens} />;
    case "synthesis": return <SynthesisView />;
    case "compare": return <CompareView />;
  }
}

export default function Workspace({ caseId }: { caseId: string }) {
  const loadCase = useWorkspace((s) => s.loadCase);
  const fetchStatus = useWorkspace((s) => s.fetchStatus);
  const loading = useWorkspace((s) => s.loading);
  const loadError = useWorkspace((s) => s.loadError);
  const selection = useWorkspace((s) => s.selection);
  const view = useWorkspace((s) => s.view);
  // The narrow-screen details sheet opens whenever a new selection is made
  // and closes when that same selection is dismissed — derived, no effect.
  const [dismissedSelection, setDismissedSelection] = useState<Selection | null>(null);
  const sheetOpen = selection !== null && selection !== dismissedSelection;

  useEffect(() => {
    void loadCase(caseId);
    void fetchStatus();
  }, [caseId, loadCase, fetchStatus]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg">
        <Spinner label="Loading case…" />
      </div>
    );
  }
  if (loadError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-bg px-4">
        <p role="alert" className="text-sm text-danger">{loadError}</p>
        <div className="flex gap-2">
          <Button onClick={() => void loadCase(caseId)}>Retry</Button>
          <Link href="/" className="inline-flex h-11 items-center rounded border border-line-strong bg-surface px-3.5 text-sm text-ink hover:bg-surface-2">
            Back to library
          </Link>
        </div>
      </div>
    );
  }

  const showInspector = view.kind === "lens" || view.kind === "overview" || view.kind === "synthesis";

  return (
    <div className="flex h-dvh flex-col bg-bg">
      <TopBar />
      <MobileLensBar />
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <div className="hidden w-[228px] shrink-0 border-r border-line bg-surface lg:block">
          <LeftNav />
        </div>
        <main id="main" className="lw-scroll min-w-0 flex-1 overflow-y-auto px-4 py-5 md:px-6">
          <CenterView />
        </main>
        {showInspector && (
          <div className="hidden w-[320px] shrink-0 xl:block">
            <Inspector />
          </div>
        )}
      </div>
      {/* Narrow screens: inspector as bottom sheet when something is selected */}
      {showInspector && sheetOpen && (
        <div className="fixed inset-x-0 bottom-0 z-40 max-h-[55vh] overflow-hidden rounded-t-lg border-t border-line bg-surface shadow-lg xl:hidden">
          <div className="flex items-center justify-between border-b border-line px-3 py-1.5">
            <span className="text-[12px] font-semibold uppercase tracking-wide text-ink-faint">Details</span>
            <Button size="sm" variant="ghost" onClick={() => setDismissedSelection(selection)} aria-label="Close details">
              Close
            </Button>
          </div>
          <div className="max-h-[calc(55vh-40px)] overflow-y-auto">
            <Inspector />
          </div>
        </div>
      )}
    </div>
  );
}
