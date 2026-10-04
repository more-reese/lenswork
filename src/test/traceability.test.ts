import { describe, expect, it } from "vitest";
import {
  LENS_IDS,
  dependentsOfAssumption,
  resolveTraceRef,
  type LensAnalysis,
  type LensId,
} from "@/lib/schema";
import { officeAnalyses, officeModel, officeSynthesis } from "@/lib/llm/mock/sample-office";

const analyses = officeAnalyses as Partial<Record<LensId, LensAnalysis>>;

describe("trace resolution", () => {
  it("resolves case items, stakeholders, options, nodes, and findings", () => {
    expect(resolveTraceRef("of-f1", officeModel, analyses)?.kind).toBe("case_item");
    expect(resolveTraceRef("of-s3", officeModel, analyses)?.kind).toBe("stakeholder");
    expect(resolveTraceRef("of-o3", officeModel, analyses)?.kind).toBe("option");
    expect(resolveTraceRef("ded-p1", officeModel, analyses)?.kind).toBe("node");
    expect(resolveTraceRef("cau-fd1", officeModel, analyses)?.kind).toBe("finding");
    expect(resolveTraceRef("no-such-id", officeModel, analyses)).toBeUndefined();
  });

  it("every traceRef in every curated lens analysis resolves", () => {
    for (const lens of LENS_IDS) {
      const a = officeAnalyses[lens];
      const refs = [
        ...a.diagram.nodes.flatMap((n) => n.traceRefs),
        ...a.diagram.edges.flatMap((e) => e.traceRefs),
        ...a.findings.flatMap((f) => f.traceRefs),
        ...a.handoffs.flatMap((h) => h.payloadIds),
      ];
      for (const ref of refs) {
        expect(resolveTraceRef(ref, officeModel, analyses), `${lens} → ${ref}`).toBeDefined();
      }
    }
  });

  it("every traceRef in the curated synthesis resolves", () => {
    const buckets = [
      officeSynthesis.convergence,
      officeSynthesis.conflicts,
      officeSynthesis.unresolvedUnknowns,
      officeSynthesis.assumptionDependencies,
      officeSynthesis.valueDependencies,
      officeSynthesis.evidencePriorities,
      officeSynthesis.testsOrNextSteps,
    ];
    for (const bucket of buckets) {
      for (const claim of bucket) {
        for (const ref of claim.traceRefs) {
          expect(resolveTraceRef(ref, officeModel, analyses), `${claim.id} → ${ref}`).toBeDefined();
        }
      }
    }
  });
});

describe("assumption audit", () => {
  it("finds the conclusions leaning on the central causal assumption", () => {
    const deps = dependentsOfAssumption("of-a1", analyses, officeSynthesis);
    expect(deps.length).toBeGreaterThan(0);
    const lenses = new Set(deps.map((d) => d.lens));
    expect(lenses.has("deduction")).toBe(true);
    expect(lenses.has("synthesis")).toBe(true);
  });

  it("returns nothing for an id no element cites", () => {
    expect(dependentsOfAssumption("of-never-cited", analyses, officeSynthesis)).toEqual([]);
  });
});
