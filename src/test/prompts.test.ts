import { describe, expect, it } from "vitest";
import { LENS_IDS } from "@/lib/schema";
import {
  lensPrompts,
  normalizePrompts,
  repairSuffix,
  synthesisPrompts,
  refinePrompts,
} from "@/lib/llm/prompts";
import { LENSES } from "@/lib/lenses/registry";
import { officeAnalyses, officeInput, officeModel } from "@/lib/llm/mock/sample-office";

describe("lens prompts meet the contract", () => {
  for (const lens of LENS_IDS) {
    it(`${lens}: defines the lens, guards overreach, requires self-challenge and handoffs`, () => {
      const { system, user } = lensPrompts(lens, officeModel, "standard");
      expect(system).toContain("THE LENS.");
      expect(system).toContain("GUIDING QUESTION:");
      expect(system).toContain(LENSES[lens].guidingQuestion);
      expect(system).toContain("VALID OUTPUT:");
      expect(system).toContain("OVERREACH ERRORS");
      expect(system).toContain("at least one serious challenge to YOUR OWN analysis");
      expect(system).toContain("missingEvidence");
      expect(system).toContain("Never fabricate");
      expect(system).toContain("handoffs: at least one");
      expect(user).toContain(officeModel.centralQuestion);
    });
  }

  it("depth changes the instruction", () => {
    expect(lensPrompts("causal", officeModel, "quick").system).toContain("quick scan");
    expect(lensPrompts("causal", officeModel, "deep").system).toContain("deep analysis");
  });
});

describe("other prompts", () => {
  it("normalization forbids upgrading assumptions and demands provenance", () => {
    const { system } = normalizePrompts(officeInput);
    expect(system).toContain("suspected cause is a CLAIM, never a fact");
    expect(system).toContain("sourceText");
  });

  it("synthesis demands preserved disagreement", () => {
    const { system } = synthesisPrompts(officeModel, { deduction: officeAnalyses.deduction });
    expect(system).toContain("PRESERVE DISAGREEMENT");
    expect(system).toContain("Omitting it is a fully valid outcome");
  });

  it("refine treats user corrections as authoritative", () => {
    const { system, user } = refinePrompts("deduction", officeModel, officeAnalyses.deduction, "P1 is too strong.");
    expect(system).toContain("user corrections of their own case as authoritative");
    expect(user).toContain("P1 is too strong.");
  });

  it("repair suffix carries the validation errors", () => {
    const s = repairSuffix('edge e1: "from" references missing node "x"');
    expect(s).toContain("FAILED SCHEMA VALIDATION");
    expect(s).toContain('missing node "x"');
  });
});
