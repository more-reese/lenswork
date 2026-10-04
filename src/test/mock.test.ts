import { describe, expect, it } from "vitest";
import {
  LENS_IDS,
  LensAnalysisSchema,
  SynthesisSchema,
  CaseModelSchema,
  diagramIntegrityErrors,
  type CaseInput,
  type LensAnalysis,
  type LensId,
} from "@/lib/schema";
import { buildMockAnalysis, buildMockSynthesis, mockNormalize } from "@/lib/llm/mock/generic";
import { SAMPLE_SEEDS } from "@/lib/llm/mock";

const arbitraryInput: CaseInput = {
  title: "Should I take the new job?",
  narrative:
    "I have an offer from a smaller company. The pay is similar. My current team is stable but I have stopped learning. The new role involves a product I care about, but the company had layoffs last year.",
  centralQuestion: "Should I accept the offer?",
  knownFacts: "Offer in hand, similar pay.\nLayoffs at the new company last year.",
  claims: "A recruiter claims the new team is well funded.",
  assumptions: "I assume my current role will stay stable.",
  valuesGoals: "Learning. Stability.",
  stakeholders: "Me\nMy partner",
  possibleActions: "Accept\nDecline\nNegotiate a later start",
  depth: "standard",
};

describe("generic mock builder", () => {
  const model = mockNormalize(arbitraryInput);

  it("normalizes arbitrary input into a valid case model", () => {
    expect(() => CaseModelSchema.parse(model)).not.toThrow();
    expect(model.items.some((i) => i.category === "fact")).toBe(true);
    expect(model.items.some((i) => i.category === "unknown")).toBe(true);
    expect(model.stakeholders.length).toBe(2);
    expect(model.options.length).toBe(3);
  });

  it("is deterministic", () => {
    expect(mockNormalize(arbitraryInput)).toEqual(mockNormalize(arbitraryInput));
    expect(buildMockAnalysis("systems", model)).toEqual(buildMockAnalysis("systems", model));
  });

  it("produces schema-valid, referentially intact analyses for every lens", () => {
    for (const lens of LENS_IDS) {
      const analysis = buildMockAnalysis(lens, model);
      const parsed = LensAnalysisSchema.safeParse(analysis);
      expect(parsed.success, `${lens}: ${JSON.stringify(parsed.success ? "" : parsed.error.issues)}`).toBe(true);
      expect(diagramIntegrityErrors(analysis)).toEqual([]);
      expect(analysis.lens).toBe(lens);
      expect(analysis.challenges.length).toBeGreaterThan(0);
    }
  });

  it("never fabricates evidence: no user observations → evidence plan, no matrix", () => {
    const bare = mockNormalize({
      title: "A puzzle",
      narrative: "Something odd keeps happening and nobody knows why it happens.",
      centralQuestion: "Why does it happen?",
      depth: "standard",
    });
    const induction = buildMockAnalysis("induction", bare);
    if (induction.extras.lens !== "induction") throw new Error("wrong extras");
    expect(induction.extras.hasUserEvidence).toBe(false);
    expect(induction.extras.evidenceMatrix).toBeUndefined();
    expect(induction.extras.evidencePlan?.length).toBeGreaterThan(0);
  });

  it("builds a valid synthesis from partial analyses", () => {
    const analyses: Partial<Record<LensId, LensAnalysis>> = {
      induction: buildMockAnalysis("induction", model),
      practical: buildMockAnalysis("practical", model),
    };
    const syn = buildMockSynthesis(model, analyses);
    expect(() => SynthesisSchema.parse(syn)).not.toThrow();
    // Demo synthesis must not manufacture a judgment.
    expect(syn.provisionalJudgment).toBeUndefined();
  });
});

describe("seeded samples", () => {
  it("every seed's case model validates", () => {
    for (const seed of SAMPLE_SEEDS) {
      expect(() => CaseModelSchema.parse(seed.caseModel), seed.key).not.toThrow();
    }
  });

  it("every curated analysis validates with intact references", () => {
    for (const seed of SAMPLE_SEEDS) {
      if (!seed.curatedAnalyses) continue;
      for (const lens of LENS_IDS) {
        const a = seed.curatedAnalyses[lens];
        expect(LensAnalysisSchema.safeParse(a).success, `${seed.key}/${lens}`).toBe(true);
        expect(diagramIntegrityErrors(a), `${seed.key}/${lens}`).toEqual([]);
      }
    }
  });

  it("generic builder covers seeds without curated analyses", () => {
    for (const seed of SAMPLE_SEEDS.filter((s) => !s.curatedAnalyses)) {
      for (const lens of LENS_IDS) {
        const a = buildMockAnalysis(lens, seed.caseModel);
        expect(LensAnalysisSchema.safeParse(a).success, `${seed.key}/${lens}`).toBe(true);
      }
    }
  });
});
