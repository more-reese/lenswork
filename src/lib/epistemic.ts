/**
 * Presentation metadata for epistemic types: label, meaning, and the visual
 * encoding (color token + border style + glyph shape). Meaning is never
 * carried by color alone — shape and line style always accompany it.
 */
import type { EpistemicType, Confidence, Origin } from "@/lib/schema";

export interface EpistemicStyle {
  label: string;
  short: string;
  description: string;
  /** CSS custom property stems: --ep-<token>, --ep-<token>-soft */
  token: string;
  borderStyle: "solid" | "dashed" | "dotted";
  /** Glyph shape drawn in badges and the legend. */
  shape: "square-solid" | "square-outline" | "square-dashed" | "square-tinted" | "diamond" | "circle-dotted" | "link";
}

export const EPISTEMIC_STYLES: Record<EpistemicType, EpistemicStyle> = {
  user_fact: {
    label: "User-stated fact",
    short: "Fact",
    description: "Stated by you as something that happened or is the case.",
    token: "fact",
    borderStyle: "solid",
    shape: "square-solid",
  },
  user_claim: {
    label: "Claim",
    short: "Claim",
    description: "Asserted by someone in the case; contested or unverified.",
    token: "claim",
    borderStyle: "solid",
    shape: "square-outline",
  },
  assumption: {
    label: "Assumption",
    short: "Assumption",
    description: "Load-bearing but unestablished; conclusions that cite it inherit its risk.",
    token: "assumption",
    borderStyle: "dashed",
    shape: "square-dashed",
  },
  model_inference: {
    label: "Model inference",
    short: "Inference",
    description: "Produced by the analysis, not by you; check its trace references.",
    token: "inference",
    borderStyle: "solid",
    shape: "square-tinted",
  },
  value_judgment: {
    label: "Value judgment",
    short: "Value",
    description: "Normative — about what matters, not about what is.",
    token: "value",
    borderStyle: "solid",
    shape: "diamond",
  },
  unknown: {
    label: "Unknown",
    short: "Unknown",
    description: "Missing information that matters.",
    token: "unknown",
    borderStyle: "dotted",
    shape: "circle-dotted",
  },
  external_source: {
    label: "External source",
    short: "Source",
    description: "From a user-supplied outside source; follow the citation.",
    token: "external",
    borderStyle: "solid",
    shape: "link",
  },
};

export const CONFIDENCE_LABEL: Record<Confidence, string> = {
  low: "Low confidence",
  medium: "Medium confidence",
  high: "High confidence",
  not_applicable: "Confidence n/a",
};

export const ORIGIN_LABEL: Record<Origin, string> = {
  user: "You supplied this",
  model: "Added by the model",
  revision: "Added in a later revision",
};

export function epColor(type: EpistemicType): string {
  return `var(--ep-${EPISTEMIC_STYLES[type].token})`;
}

export function epSoft(type: EpistemicType): string {
  return `var(--ep-${EPISTEMIC_STYLES[type].token}-soft)`;
}
