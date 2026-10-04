/**
 * Deterministic mock provider. Curated content for the seeded office-mandate
 * sample; honest generic templates for everything else. Never needs a key,
 * never fabricates evidence, always schema-valid.
 */
import {
  CaseModelSchema,
  LensAnalysisSchema,
  SynthesisSchema,
  type CaseInput,
  type CaseModel,
  type LensAnalysis,
  type LensId,
  type Synthesis,
} from "@/lib/schema";
import type { LLMProvider, RefineResult, StageOptions } from "@/lib/llm/provider";
import { officeAnalyses, officeInput, officeModel, officeSynthesis } from "./sample-office";
import { congestionInput, congestionModel, phoneInput, phoneModel } from "./sample-others";
import { buildMockAnalysis, buildMockSynthesis, mockNormalize } from "./generic";

export interface SampleSeed {
  key: string;
  input: CaseInput;
  caseModel: CaseModel;
  curatedAnalyses?: Record<LensId, LensAnalysis>;
  curatedSynthesis?: Synthesis;
}

export const SAMPLE_SEEDS: SampleSeed[] = [
  { key: "office", input: officeInput, caseModel: officeModel, curatedAnalyses: officeAnalyses, curatedSynthesis: officeSynthesis },
  { key: "congestion", input: congestionInput, caseModel: congestionModel },
  { key: "phones", input: phoneInput, caseModel: phoneModel },
];

function seedForModel(caseModel: CaseModel): SampleSeed | undefined {
  return SAMPLE_SEEDS.find((s) =>
    caseModel.items.some((i) => s.caseModel.items.some((si) => si.id === i.id))
  );
}

function seedForInput(input: CaseInput): SampleSeed | undefined {
  return SAMPLE_SEEDS.find((s) => s.input.title === input.title);
}

/** Small deterministic delay so loading sequences are visible in demo mode. */
function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export class MockProvider implements LLMProvider {
  readonly name = "mock" as const;

  async normalize(input: CaseInput, _opts: StageOptions): Promise<CaseModel> {
    await delay(700);
    const seed = seedForInput(input);
    const model = seed ? seed.caseModel : mockNormalize(input);
    return CaseModelSchema.parse(model);
  }

  async analyzeLens(lens: LensId, caseModel: CaseModel, _opts: StageOptions): Promise<LensAnalysis> {
    await delay(500 + ((lens.length * 137) % 600));
    const seed = seedForModel(caseModel);
    const analysis = seed?.curatedAnalyses?.[lens] ?? buildMockAnalysis(lens, caseModel);
    return LensAnalysisSchema.parse(analysis);
  }

  async synthesize(
    caseModel: CaseModel,
    analyses: Partial<Record<LensId, LensAnalysis>>,
    _opts: StageOptions
  ): Promise<Synthesis> {
    await delay(900);
    const seed = seedForModel(caseModel);
    const synthesis = seed?.curatedSynthesis ?? buildMockSynthesis(caseModel, analyses);
    return SynthesisSchema.parse(synthesis);
  }

  async refineLens(
    lens: LensId,
    _caseModel: CaseModel,
    current: LensAnalysis,
    message: string,
    _opts: StageOptions
  ): Promise<RefineResult> {
    await delay(600);
    // Demo mode cannot genuinely re-reason; it records the user's point
    // honestly as a standing challenge instead of pretending to address it.
    const analysis: LensAnalysis = LensAnalysisSchema.parse({
      ...current,
      challenges: [
        ...current.challenges,
        `User challenge (recorded in demo mode, not yet addressed): ${message}`,
      ],
    });
    return {
      analysis,
      note: "Demo mode: your point was recorded as a standing challenge. Connect an API key for a real revision.",
    };
  }
}
