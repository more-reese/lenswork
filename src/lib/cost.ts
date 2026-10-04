/**
 * Rough, visible cost estimation for a full analysis run.
 * Prices are Anthropic first-party API rates (USD per million tokens),
 * cached 2026-09. Estimates are labeled as such in the UI — token counts
 * are heuristic (≈3.8 chars/token) and depth-dependent.
 */
import type { Depth, ModelChoice, StageModels } from "@/lib/schema";

export const MODEL_INFO: Record<
  ModelChoice,
  { label: string; inputPerMTok: number; outputPerMTok: number; blurb: string }
> = {
  "claude-haiku-4-5": {
    label: "Haiku 4.5",
    inputPerMTok: 1,
    outputPerMTok: 5,
    blurb: "Fastest and cheapest; fine for quick scans.",
  },
  "claude-sonnet-5-5": {
    label: "Sonnet 5.5",
    inputPerMTok: 2,
    outputPerMTok: 10,
    blurb: "Fast and capable; good default for parsing.",
  },
  "claude-opus-5-5": {
    label: "Opus 5.5",
    inputPerMTok: 4,
    outputPerMTok: 20,
    blurb: "Most capable; best for lens analysis and synthesis.",
  },
};

const CHARS_PER_TOKEN = 3.8;

/** Depth multipliers applied to expected output sizes. */
const DEPTH_FACTOR: Record<Depth, number> = { quick: 0.55, standard: 1, deep: 1.6 };

export interface CostEstimate {
  normalize: number;
  lenses: number;
  synthesis: number;
  total: number;
}

function stageCost(model: ModelChoice, inputTokens: number, outputTokens: number): number {
  const info = MODEL_INFO[model];
  return (inputTokens * info.inputPerMTok + outputTokens * info.outputPerMTok) / 1_000_000;
}

/**
 * Estimate a full run: 1 normalization pass, 8 lens passes, 1 synthesis pass.
 * `inputChars` is the raw case-input length.
 */
export function estimateRunCost(
  inputChars: number,
  models: StageModels,
  depth: Depth
): CostEstimate {
  const f = DEPTH_FACTOR[depth];
  const caseTokens = Math.max(300, inputChars / CHARS_PER_TOKEN);

  const normalize = stageCost(models.normalize, caseTokens + 1500, 2200 * f);

  // Each lens receives the frozen case model (~1.6x raw case) plus its prompt.
  const perLensIn = caseTokens * 1.6 + 1800;
  const perLensOut = 3500 * f;
  const lenses = 8 * stageCost(models.lenses, perLensIn, perLensOut);

  // Synthesis receives all eight outputs.
  const synthesis = stageCost(models.synthesis, 8 * perLensOut + 2000, 2800 * f);

  return {
    normalize,
    lenses,
    synthesis,
    total: normalize + lenses + synthesis,
  };
}

export function formatUsd(v: number): string {
  if (v < 0.01) return "<$0.01";
  return `$${v.toFixed(2)}`;
}
