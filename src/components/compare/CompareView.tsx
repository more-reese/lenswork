"use client";
/**
 * "Same case, different question": the case stays constant while the
 * guiding question changes. Eight cards side by side show what each
 * question yields — and what it cannot.
 */
import React from "react";
import { useWorkspace } from "@/lib/store";
import { LENSES, LENS_ORDER } from "@/lib/lenses/registry";
import { LensGlyph } from "@/components/overview/OverviewView";

export default function CompareView() {
  const caseFile = useWorkspace((s) => s.caseFile);
  const setView = useWorkspace((s) => s.setView);
  const teach = useWorkspace((s) => s.teachMode);
  if (!caseFile?.caseModel) return null;

  return (
    <div className="space-y-4 pb-10">
      <header>
        <h2 className="font-brand text-[28px] font-semibold text-ink">Same case, different question</h2>
        <p className="mt-1 max-w-[75ch] text-[15px] text-ink-muted">
          The case never changes — only the question does. Each card shows what its question
          yields for <em className="text-ink">{caseFile.caseModel.title}</em>, and the one thing
          that question can never settle.
        </p>
      </header>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {LENS_ORDER.map((lens) => {
          const meta = LENSES[lens];
          const analysis = caseFile.analyses[lens]?.analysis;
          const firstSentence = analysis
            ? analysis.plainLanguageSummary.split(/(?<=\.)\s/)[0]
            : undefined;
          return (
            <button
              key={lens}
              onClick={() => setView({ kind: "lens", lens })}
              className="flex flex-col rounded-lg border border-line bg-surface p-3.5 text-left hover:border-accent"
            >
              <span className="flex items-center gap-2 text-ink-muted">
                <LensGlyph lens={lens} size={22} />
                <span className="text-[12px] font-semibold uppercase tracking-wide">{meta.shortName}</span>
              </span>
              <span className="mt-2 text-[15px] font-medium leading-snug text-ink">
                {analysis?.guidingQuestion ?? meta.guidingQuestion}
              </span>
              <span className="mt-2 flex-1 text-[13.5px] text-ink-muted">
                {firstSentence ?? <em className="text-ink-faint">Not yet run — open to run this lens.</em>}
              </span>
              <span className="mt-3 border-t border-line pt-2 text-[12.5px] text-ink-faint">
                {teach ? (
                  <>Cannot settle: {meta.keyLimitation.toLowerCase()}</>
                ) : (
                  <>Output: {meta.primaryOutput.toLowerCase()}</>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
