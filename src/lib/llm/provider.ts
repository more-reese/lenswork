/**
 * Provider abstraction for the two-stage analysis pipeline.
 * Implementations: AnthropicProvider (real) and MockProvider (deterministic).
 */
import type {
  CaseInput,
  CaseModel,
  Depth,
  LensAnalysis,
  LensId,
  ModelChoice,
  Synthesis,
} from "@/lib/schema";

export interface StageOptions {
  model: ModelChoice;
  depth: Depth;
}

export interface RefineResult {
  analysis: LensAnalysis;
  /** Short note describing what changed and why (shown in revision history). */
  note: string;
}

export interface LLMProvider {
  readonly name: "anthropic" | "mock";
  /** Stage A: convert raw input into a structured case model. */
  normalize(input: CaseInput, opts: StageOptions): Promise<CaseModel>;
  /** Stage B: one independent lens pass against the frozen case model. */
  analyzeLens(lens: LensId, caseModel: CaseModel, opts: StageOptions): Promise<LensAnalysis>;
  /** Stage C: synthesis that must preserve disagreement. */
  synthesize(
    caseModel: CaseModel,
    analyses: Partial<Record<LensId, LensAnalysis>>,
    opts: StageOptions
  ): Promise<Synthesis>;
  /** Conversational loop: revise one lens in light of a user message/challenge. */
  refineLens(
    lens: LensId,
    caseModel: CaseModel,
    current: LensAnalysis,
    message: string,
    opts: StageOptions
  ): Promise<RefineResult>;
}

export class ProviderError extends Error {
  constructor(
    message: string,
    public readonly kind: "auth" | "rate_limit" | "network" | "invalid_output" | "unknown",
    public readonly retryable: boolean
  ) {
    super(message);
    this.name = "ProviderError";
  }
}
