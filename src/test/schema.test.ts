import { describe, expect, it } from "vitest";
import {
  CaseModelSchema,
  LensAnalysisSchema,
  SynthesisSchema,
  diagramIntegrityErrors,
  lensAnalysisSchemaFor,
  type LensAnalysis,
} from "@/lib/schema";
import { officeAnalyses, officeModel, officeSynthesis } from "@/lib/llm/mock/sample-office";

describe("schema validation", () => {
  it("accepts the curated case model", () => {
    expect(() => CaseModelSchema.parse(officeModel)).not.toThrow();
  });

  it("rejects a case item with an invalid epistemic type", () => {
    const bad = {
      ...officeModel,
      items: [{ ...officeModel.items[0], epistemicType: "vibes" }],
    };
    expect(CaseModelSchema.safeParse(bad).success).toBe(false);
  });

  it("rejects a lens analysis whose extras belong to a different lens", () => {
    const mismatched = {
      ...officeAnalyses.deduction,
      extras: officeAnalyses.systems.extras,
    };
    expect(LensAnalysisSchema.safeParse(mismatched).success).toBe(false);
  });

  it("rejects an analysis with zero self-challenges", () => {
    const bad = { ...officeAnalyses.deduction, challenges: [] };
    expect(LensAnalysisSchema.safeParse(bad).success).toBe(false);
  });

  it("per-lens narrowed schema rejects the wrong lens literal", () => {
    const schema = lensAnalysisSchemaFor("causal");
    expect(schema.safeParse(officeAnalyses.deduction).success).toBe(false);
    expect(schema.safeParse(officeAnalyses.causal).success).toBe(true);
  });

  it("accepts the curated synthesis", () => {
    expect(() => SynthesisSchema.parse(officeSynthesis)).not.toThrow();
  });
});

describe("diagram referential integrity", () => {
  it("curated analyses have no dangling references", () => {
    for (const analysis of Object.values(officeAnalyses)) {
      expect(diagramIntegrityErrors(analysis)).toEqual([]);
    }
  });

  it("catches an edge pointing at a missing node", () => {
    const broken: LensAnalysis = {
      ...officeAnalyses.deduction,
      diagram: {
        ...officeAnalyses.deduction.diagram,
        edges: [
          ...officeAnalyses.deduction.diagram.edges,
          { id: "x", from: "ded-p1", to: "ghost-node", relation: "supports", traceRefs: [] },
        ],
      },
    };
    const errors = diagramIntegrityErrors(broken);
    expect(errors.length).toBe(1);
    expect(errors[0]).toContain("ghost-node");
  });

  it("catches extras referencing a missing node (hypotheses)", () => {
    const abd = officeAnalyses.abduction;
    if (abd.extras.lens !== "abduction") throw new Error("wrong extras");
    const broken: LensAnalysis = {
      ...abd,
      extras: {
        ...abd.extras,
        hypotheses: [{ ...abd.extras.hypotheses[0], nodeId: "missing-h" }],
      },
    };
    expect(diagramIntegrityErrors(broken).some((e) => e.includes("missing-h"))).toBe(true);
  });
});
