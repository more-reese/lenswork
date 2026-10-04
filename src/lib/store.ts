"use client";
/**
 * Workspace store. The server analyze endpoints persist results and return
 * per-slot updates; this store merges them locally so eight concurrent lens
 * runs can complete out of order without clobbering each other. Full-file
 * saves (user edits) are debounced and deferred while runs are in flight.
 */
import { create } from "zustand";
import {
  LENS_IDS,
  type CaseFile,
  type CaseInput,
  type CaseModel,
  type LensId,
  type LensRun,
  type StageModels,
  type Depth,
} from "@/lib/schema";
import { LENS_ORDER } from "@/lib/lenses/registry";

export type ClientRunStatus = "idle" | "queued" | "running" | "done" | "error" | "stale";

export type View =
  | { kind: "intake" }
  | { kind: "model" }
  | { kind: "overview" }
  | { kind: "lens"; lens: LensId }
  | { kind: "synthesis" }
  | { kind: "compare" };

export interface Selection {
  /** Where the selected element lives. */
  scope: LensId | "model" | "synthesis";
  refId: string;
}

export type ProvenanceFilter = "all" | "user" | "model" | "sourced";

interface WorkspaceState {
  caseFile: CaseFile | null;
  providerReal: boolean;
  loading: boolean;
  loadError?: string;
  saving: "idle" | "saving" | "error";
  view: View;
  runStatus: Record<LensId, ClientRunStatus>;
  normalizing: boolean;
  normalizeError?: string;
  synthesisStatus: "idle" | "running" | "done" | "error" | "stale";
  synthesisError?: string;
  selection: Selection | null;
  teachMode: boolean;
  provenanceFilter: ProvenanceFilter;
  refineBusy: Partial<Record<LensId, boolean>>;
  /** Pre-filled refine message set by a cross-lens handoff; consumed once. */
  refinePrefill: Partial<Record<LensId, string>>;
  consumeRefinePrefill: (lens: LensId) => string | undefined;
  handoffTo: (lens: LensId, message: string) => void;

  fetchStatus: () => Promise<void>;
  loadCase: (id: string) => Promise<void>;
  setView: (v: View) => void;
  select: (s: Selection | null) => void;
  toggleTeach: () => void;
  setProvenanceFilter: (f: ProvenanceFilter) => void;
  updateInput: (input: CaseInput) => void;
  updateCaseModel: (model: CaseModel, description: string) => void;
  updateSettings: (models: StageModels, depth: Depth) => void;
  approveModel: () => void;
  normalize: () => Promise<void>;
  runLens: (lens: LensId) => Promise<void>;
  runAll: () => Promise<void>;
  runSynthesis: () => Promise<void>;
  refine: (lens: LensId, message: string) => Promise<void>;
}

function initialRunStatus(file: CaseFile | null): Record<LensId, ClientRunStatus> {
  const out = Object.fromEntries(LENS_IDS.map((l) => [l, "idle"])) as Record<LensId, ClientRunStatus>;
  if (!file) return out;
  for (const lens of LENS_IDS) {
    const run = file.analyses[lens];
    if (run) out[lens] = run.status === "done" ? "done" : run.status === "stale" ? "stale" : "error";
  }
  return out;
}

function initialSynthesis(file: CaseFile | null): WorkspaceState["synthesisStatus"] {
  if (!file?.synthesis) return "idle";
  return file.synthesis.status === "done" ? "done" : file.synthesis.status === "stale" ? "stale" : "error";
}

function initialView(file: CaseFile | null): View {
  if (!file?.caseModel) return { kind: "intake" };
  if (!file.caseModelApproved) return { kind: "model" };
  return { kind: "overview" };
}

let saveTimer: ReturnType<typeof setTimeout> | undefined;

export const useWorkspace = create<WorkspaceState>((set, get) => {
  function anyRunning(): boolean {
    const s = get();
    return (
      s.normalizing ||
      s.synthesisStatus === "running" ||
      Object.values(s.runStatus).some((r) => r === "running" || r === "queued") ||
      Object.values(s.refineBusy).some(Boolean)
    );
  }

  async function saveNow(): Promise<void> {
    const file = get().caseFile;
    if (!file) return;
    set({ saving: "saving" });
    try {
      const res = await fetch(`/api/cases/${file.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(file),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Save failed");
      const updated: CaseFile = await res.json();
      // Keep local content; adopt the server timestamp.
      set((s) => ({
        saving: "idle",
        caseFile: s.caseFile ? { ...s.caseFile, updatedAt: updated.updatedAt } : s.caseFile,
      }));
    } catch {
      set({ saving: "error" });
    }
  }

  function scheduleSave(): void {
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      if (anyRunning()) {
        scheduleSave(); // defer until runs settle; analyze endpoints own the file meanwhile
        return;
      }
      void saveNow();
    }, 800);
  }

  function log(kind: string, description: string): void {
    set((s) =>
      s.caseFile
        ? { caseFile: { ...s.caseFile, log: [...s.caseFile.log, { at: new Date().toISOString(), kind, description }] } }
        : {}
    );
  }

  return {
    caseFile: null,
    providerReal: false,
    loading: true,
    saving: "idle",
    view: { kind: "intake" },
    runStatus: initialRunStatus(null),
    normalizing: false,
    synthesisStatus: "idle",
    selection: null,
    teachMode: false,
    provenanceFilter: "all",
    refineBusy: {},
    refinePrefill: {},

    consumeRefinePrefill(lens) {
      const msg = get().refinePrefill[lens];
      if (msg !== undefined) {
        set((s) => {
          const next = { ...s.refinePrefill };
          delete next[lens];
          return { refinePrefill: next };
        });
      }
      return msg;
    },

    handoffTo(lens, message) {
      set((s) => ({
        refinePrefill: { ...s.refinePrefill, [lens]: message },
        view: { kind: "lens", lens },
        selection: null,
      }));
    },

    async fetchStatus() {
      try {
        const res = await fetch("/api/status");
        const data = await res.json();
        set({ providerReal: Boolean(data.anthropic) });
      } catch {
        set({ providerReal: false });
      }
    },

    async loadCase(id) {
      set({ loading: true, loadError: undefined });
      try {
        const res = await fetch(`/api/cases/${id}`);
        if (!res.ok) throw new Error((await res.json()).error ?? `Failed to load case ${id}`);
        const file: CaseFile = await res.json();
        let teach = false;
        try {
          teach = localStorage.getItem("lw-teach") === "1";
        } catch {}
        set({
          caseFile: file,
          loading: false,
          view: initialView(file),
          runStatus: initialRunStatus(file),
          synthesisStatus: initialSynthesis(file),
          selection: null,
          teachMode: teach,
        });
      } catch (err) {
        set({ loading: false, loadError: err instanceof Error ? err.message : "Failed to load case." });
      }
    },

    setView(view) {
      set({ view, selection: null });
    },

    select(selection) {
      set({ selection });
    },

    toggleTeach() {
      set((s) => {
        const next = !s.teachMode;
        try {
          localStorage.setItem("lw-teach", next ? "1" : "0");
        } catch {}
        return { teachMode: next };
      });
    },

    setProvenanceFilter(provenanceFilter) {
      set({ provenanceFilter });
    },

    updateInput(input) {
      set((s) => {
        if (!s.caseFile) return {};
        const hadAnalyses = Object.keys(s.caseFile.analyses).length > 0;
        return {
          caseFile: { ...s.caseFile, input },
          // Editing the case invalidates downstream results without deleting them.
          runStatus: hadAnalyses
            ? (Object.fromEntries(
                Object.entries(s.runStatus).map(([l, st]) => [l, st === "done" ? "stale" : st])
              ) as Record<LensId, ClientRunStatus>)
            : s.runStatus,
          synthesisStatus: s.synthesisStatus === "done" ? "stale" : s.synthesisStatus,
        };
      });
      scheduleSave();
    },

    updateCaseModel(model, description) {
      set((s) => {
        if (!s.caseFile) return {};
        const hadAnalyses = Object.keys(s.caseFile.analyses).length > 0;
        return {
          caseFile: {
            ...s.caseFile,
            caseModel: model,
            analyses: hadAnalyses
              ? Object.fromEntries(
                  Object.entries(s.caseFile.analyses).map(([l, r]) => [
                    l,
                    r.status === "done" ? { ...r, status: "stale" as const } : r,
                  ])
                )
              : s.caseFile.analyses,
            synthesis: s.caseFile.synthesis
              ? { ...s.caseFile.synthesis, status: "stale" as const }
              : undefined,
          },
          runStatus: hadAnalyses
            ? (Object.fromEntries(
                Object.entries(s.runStatus).map(([l, st]) => [l, st === "done" ? "stale" : st])
              ) as Record<LensId, ClientRunStatus>)
            : s.runStatus,
          synthesisStatus: s.synthesisStatus === "done" ? "stale" : s.synthesisStatus,
        };
      });
      log("model_edited", description);
      scheduleSave();
    },

    updateSettings(models, depth) {
      set((s) => (s.caseFile ? { caseFile: { ...s.caseFile, settings: { models, depth } } } : {}));
      scheduleSave();
    },

    approveModel() {
      set((s) => (s.caseFile ? { caseFile: { ...s.caseFile, caseModelApproved: true }, view: { kind: "overview" } } : {}));
      log("model_approved", "Case model reviewed and approved.");
      scheduleSave();
    },

    async normalize() {
      const file = get().caseFile;
      if (!file) return;
      // Flush pending input edits first so the server parses current text.
      if (saveTimer) clearTimeout(saveTimer);
      await saveNow();
      set({ normalizing: true, normalizeError: undefined });
      try {
        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ caseId: file.id, stage: "normalize" }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Normalization failed.");
        set({ caseFile: data.caseFile, normalizing: false, view: { kind: "model" } });
      } catch (err) {
        set({
          normalizing: false,
          normalizeError: err instanceof Error ? err.message : "Normalization failed.",
        });
      }
    },

    async runLens(lens) {
      const file = get().caseFile;
      if (!file?.caseModel) return;
      set((s) => ({ runStatus: { ...s.runStatus, [lens]: "running" } }));
      try {
        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ caseId: file.id, stage: "lens", lens }),
        });
        const data = await res.json();
        const run: LensRun | undefined = data.run;
        set((s) => ({
          caseFile:
            s.caseFile && run
              ? {
                  ...s.caseFile,
                  updatedAt: data.updatedAt ?? s.caseFile.updatedAt,
                  analyses: { ...s.caseFile.analyses, [lens]: run },
                  synthesis:
                    res.ok && s.caseFile.synthesis
                      ? { ...s.caseFile.synthesis, status: "stale" as const }
                      : s.caseFile.synthesis,
                }
              : s.caseFile,
          runStatus: { ...s.runStatus, [lens]: res.ok ? "done" : "error" },
          synthesisStatus: res.ok && s.synthesisStatus === "done" ? "stale" : s.synthesisStatus,
        }));
        if (!res.ok && !run) throw new Error(data.error ?? "Lens analysis failed.");
      } catch {
        set((s) => ({ runStatus: { ...s.runStatus, [lens]: "error" } }));
      }
    },

    async runAll() {
      const { runLens, runSynthesis } = get();
      set({
        runStatus: Object.fromEntries(LENS_ORDER.map((l) => [l, "queued"])) as Record<LensId, ClientRunStatus>,
      });
      // All eight lens passes run concurrently against the frozen case model.
      await Promise.allSettled(LENS_ORDER.map((lens) => runLens(lens)));
      const statuses = get().runStatus;
      if (Object.values(statuses).some((s) => s === "done")) {
        await runSynthesis();
      }
    },

    async runSynthesis() {
      const file = get().caseFile;
      if (!file) return;
      set({ synthesisStatus: "running", synthesisError: undefined });
      try {
        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ caseId: file.id, stage: "synthesis" }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Synthesis failed.");
        set((s) => ({
          caseFile: s.caseFile
            ? { ...s.caseFile, synthesis: data.synthesis, updatedAt: data.updatedAt ?? s.caseFile.updatedAt }
            : s.caseFile,
          synthesisStatus: "done",
        }));
      } catch (err) {
        set({
          synthesisStatus: "error",
          synthesisError: err instanceof Error ? err.message : "Synthesis failed.",
        });
      }
    },

    async refine(lens, message) {
      const file = get().caseFile;
      if (!file) return;
      set((s) => ({ refineBusy: { ...s.refineBusy, [lens]: true } }));
      try {
        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ caseId: file.id, stage: "refine", lens, message }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Refine failed.");
        set((s) => ({
          caseFile: s.caseFile
            ? {
                ...s.caseFile,
                updatedAt: data.updatedAt ?? s.caseFile.updatedAt,
                analyses: { ...s.caseFile.analyses, [lens]: data.run },
                synthesis: s.caseFile.synthesis
                  ? { ...s.caseFile.synthesis, status: "stale" as const }
                  : undefined,
              }
            : s.caseFile,
          synthesisStatus: s.synthesisStatus === "done" ? "stale" : s.synthesisStatus,
        }));
      } finally {
        set((s) => ({ refineBusy: { ...s.refineBusy, [lens]: false } }));
      }
    },
  };
});
