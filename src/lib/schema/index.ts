/**
 * Lenswork schema — the single structured-output contract shared by the LLM
 * pipeline, the mock provider, persistence, and every view.
 *
 * Design notes (deviations from the original spec draft, distinctions kept):
 * - Case-model entries live in one flat `items` array with a `category`
 *   field instead of seven parallel arrays. Reclassifying a misparsed item is
 *   a field edit (id stays stable, trace refs never break).
 * - `epistemicType` (who vouches for it / what kind of commitment it is) is
 *   kept separate from `category` (which bucket of the case model it fills).
 * - Every lens analysis carries a lens-specific `extras` payload so each view
 *   can render its own structure (validity verdicts, hypothesis matrices,
 *   loops, dialectic moves…) rather than a generic node dump.
 */
import { z } from "zod";

// ---------------------------------------------------------------------------
// Epistemic core
// ---------------------------------------------------------------------------

export const EPISTEMIC_TYPES = [
  "user_fact",
  "user_claim",
  "assumption",
  "model_inference",
  "value_judgment",
  "unknown",
  "external_source",
] as const;
export const EpistemicTypeSchema = z.enum(EPISTEMIC_TYPES);
export type EpistemicType = z.infer<typeof EpistemicTypeSchema>;

export const CONFIDENCE_LEVELS = ["low", "medium", "high", "not_applicable"] as const;
export const ConfidenceSchema = z.enum(CONFIDENCE_LEVELS);
export type Confidence = z.infer<typeof ConfidenceSchema>;

/** Who put this item into the case model. */
export const OriginSchema = z.enum(["user", "model", "revision"]);
export type Origin = z.infer<typeof OriginSchema>;

// ---------------------------------------------------------------------------
// Case model (Stage A output, user-correctable)
// ---------------------------------------------------------------------------

export const CASE_CATEGORIES = [
  "fact",
  "claim",
  "assumption",
  "value",
  "unknown",
  "constraint",
] as const;
export const CaseCategorySchema = z.enum(CASE_CATEGORIES);
export type CaseCategory = z.infer<typeof CaseCategorySchema>;

export const CaseItemSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(1),
  category: CaseCategorySchema,
  epistemicType: EpistemicTypeSchema,
  origin: OriginSchema,
  /** Exact user wording this item was derived from, when it came from input. */
  sourceText: z.string().optional(),
  sourceUrl: z.string().optional(),
  /** Model's one-line rationale for the classification. */
  note: z.string().optional(),
});
export type CaseItem = z.infer<typeof CaseItemSchema>;

export const StakeholderSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  origin: OriginSchema,
});
export type Stakeholder = z.infer<typeof StakeholderSchema>;

export const CaseOptionSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  description: z.string().optional(),
  origin: OriginSchema,
});
export type CaseOption = z.infer<typeof CaseOptionSchema>;

export const CaseModelSchema = z.object({
  title: z.string().min(1),
  narrative: z.string().min(1),
  centralQuestion: z.string().min(1),
  items: z.array(CaseItemSchema),
  stakeholders: z.array(StakeholderSchema),
  options: z.array(CaseOptionSchema),
  timeHorizon: z.string().optional(),
});
export type CaseModel = z.infer<typeof CaseModelSchema>;

// ---------------------------------------------------------------------------
// Diagrams (shared node/edge vocabulary for every lens)
// ---------------------------------------------------------------------------

export const DiagramNodeSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  /** Lens-specific role, e.g. premise | hypothesis | variable | loop_node. */
  nodeType: z.string().min(1),
  epistemicType: EpistemicTypeSchema,
  confidence: ConfidenceSchema,
  confidenceRationale: z.string().optional(),
  /** Longer text for the inspector. */
  detail: z.string().optional(),
  traceRefs: z.array(z.string()),
});
export type DiagramNode = z.infer<typeof DiagramNodeSchema>;

export const DiagramEdgeSchema = z.object({
  id: z.string().min(1),
  from: z.string().min(1),
  to: z.string().min(1),
  /** e.g. supports | contradicts | causes | associated | explains | challenges */
  relation: z.string().min(1),
  polarity: z.enum(["positive", "negative", "unknown"]).optional(),
  certainty: ConfidenceSchema.optional(),
  delayed: z.boolean().optional(),
  label: z.string().optional(),
  /** Longer text for the inspector. */
  detail: z.string().optional(),
  traceRefs: z.array(z.string()),
});
export type DiagramEdge = z.infer<typeof DiagramEdgeSchema>;

export const DiagramGroupSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  nodeIds: z.array(z.string()),
});
export type DiagramGroup = z.infer<typeof DiagramGroupSchema>;

export const DiagramSchema = z.object({
  diagramType: z.string().min(1),
  nodes: z.array(DiagramNodeSchema),
  edges: z.array(DiagramEdgeSchema),
  groups: z.array(DiagramGroupSchema).optional(),
});
export type Diagram = z.infer<typeof DiagramSchema>;

// ---------------------------------------------------------------------------
// Lens identity
// ---------------------------------------------------------------------------

export const LENS_IDS = [
  "interpretive",
  "induction",
  "abduction",
  "deduction",
  "causal",
  "systems",
  "practical",
  "dialectical",
] as const;
export const LensIdSchema = z.enum(LENS_IDS);
export type LensId = z.infer<typeof LensIdSchema>;

// ---------------------------------------------------------------------------
// Lens-specific extras (what makes each view genuinely different)
// ---------------------------------------------------------------------------

export const DeductionExtrasSchema = z.object({
  lens: z.literal("deduction"),
  /** Validity of the mapped argument structure — separate from premise truth. */
  validityStatus: z.enum(["valid", "invalid", "indeterminate"]),
  validityNote: z.string(),
  /** Answer to: could every premise be true while the conclusion is false? */
  premisesTrueConclusionFalse: z.string(),
});

export const InductionExtrasSchema = z.object({
  lens: z.literal("induction"),
  /** False when the user supplied no observations — render a collection plan. */
  hasUserEvidence: z.boolean(),
  generalization: z.object({
    statement: z.string(),
    scopeConditions: z.array(z.string()),
  }),
  coverageGaps: z.array(z.string()),
  /** Bias questions phrased as questions, not accusations. */
  biasQuestions: z.array(z.string()),
  /** Observation rows × comparison columns; row ids are diagram node ids. */
  evidenceMatrix: z
    .object({
      columns: z.array(z.string()),
      rows: z.array(z.object({ observationId: z.string(), cells: z.array(z.string()) })),
    })
    .optional(),
  /** Present instead of a matrix when there is no user evidence. */
  evidencePlan: z.array(z.string()).optional(),
});

export const HypothesisSchema = z.object({
  nodeId: z.string(),
  label: z.string(),
  explains: z.array(z.string()),
  failsToExplain: z.array(z.string()),
  assumptionsRequired: z.array(z.string()),
  predictions: z.array(z.string()),
  disconfirmedBy: z.array(z.string()),
  discriminatingTest: z.string(),
  plausibility: ConfidenceSchema,
  plausibilityRationale: z.string(),
  /** nodeIds of hypotheses this one can coexist with. */
  compatibleWith: z.array(z.string()),
});
export type Hypothesis = z.infer<typeof HypothesisSchema>;

export const AbductionExtrasSchema = z.object({
  lens: z.literal("abduction"),
  hypotheses: z.array(HypothesisSchema),
});

export const CausalExtrasSchema = z.object({
  lens: z.literal("causal"),
  interventionNodeId: z.string().optional(),
  outcomeNodeIds: z.array(z.string()),
  counterfactual: z.object({
    intervention: z.string(),
    observedWorld: z.string(),
    interventionWorld: z.string(),
    caveats: z.array(z.string()),
  }),
  testPlan: z.array(z.string()),
});

export const PracticalOptionSchema = z.object({
  nodeId: z.string(),
  label: z.string(),
  summary: z.string(),
  benefits: z.array(z.string()),
  burdens: z.array(z.string()),
  dutiesAndRights: z.array(z.string()),
  reversibility: z.string(),
  uncertainty: z.string(),
  distribution: z.object({
    whoBenefits: z.string(),
    whoPays: z.string(),
    whoDecides: z.string(),
  }),
});
export type PracticalOption = z.infer<typeof PracticalOptionSchema>;

export const PracticalExtrasSchema = z.object({
  lens: z.literal("practical"),
  options: z.array(PracticalOptionSchema),
  valueTensions: z.array(z.object({ label: z.string(), description: z.string() })),
  /** Question-phrased prompts from each ethical tradition, when relevant. */
  ethicalPerspectives: z.object({
    consequence: z.string(),
    duty: z.string(),
    virtue: z.string(),
    care: z.string(),
    fairness: z.string(),
  }),
});

export const SystemLoopSchema = z.object({
  id: z.string(),
  type: z.enum(["R", "B"]),
  label: z.string(),
  nodeIds: z.array(z.string()),
  story: z.string(),
});
export type SystemLoop = z.infer<typeof SystemLoopSchema>;

export const SystemsExtrasSchema = z.object({
  lens: z.literal("systems"),
  loops: z.array(SystemLoopSchema),
  boundary: z.object({
    included: z.array(z.string()),
    excluded: z.array(z.string()),
    rationale: z.string(),
  }),
  leveragePoints: z.array(
    z.object({ label: z.string(), description: z.string(), caution: z.string().optional() })
  ),
  horizons: z.object({ short: z.string(), medium: z.string(), long: z.string() }),
});

export const StandpointSchema = z.object({
  nodeId: z.string(),
  stakeholderName: z.string(),
  framing: z.string(),
  /** Inquiry-phrased, never asserted lived experience. */
  inquiryPrompt: z.string(),
  keyTerms: z.array(z.object({ term: z.string(), meaning: z.string() })),
});
export type Standpoint = z.infer<typeof StandpointSchema>;

export const InterpretiveExtrasSchema = z.object({
  lens: z.literal("interpretive"),
  standpoints: z.array(StandpointSchema),
  contestedMeanings: z.array(
    z.object({
      subject: z.string(),
      readings: z.array(z.object({ standpoint: z.string(), reading: z.string() })),
    })
  ),
  missingVoices: z.array(z.string()),
  contextLayers: z.object({
    immediate: z.string(),
    institutional: z.string(),
    historical: z.string(),
  }),
});

export const DIALECTIC_MOVE_TYPES = [
  "thesis",
  "steelman",
  "definition",
  "consequence",
  "counterexample",
  "contradiction",
  "reply",
  "concession",
  "revision",
] as const;

export const DialecticMoveSchema = z.object({
  id: z.string(),
  role: z.enum(["challenger", "defender"]),
  moveType: z.enum(DIALECTIC_MOVE_TYPES),
  text: z.string(),
});
export type DialecticMove = z.infer<typeof DialecticMoveSchema>;

export const DialecticalExtrasSchema = z.object({
  lens: z.literal("dialectical"),
  thesis: z.string(),
  steelmannedThesis: z.string(),
  moves: z.array(DialecticMoveSchema),
  revisedThesis: z.string(),
  remainingObjections: z.array(z.string()),
  unresolvedTension: z.string().optional(),
});

export const LensExtrasSchema = z.discriminatedUnion("lens", [
  DeductionExtrasSchema,
  InductionExtrasSchema,
  AbductionExtrasSchema,
  CausalExtrasSchema,
  PracticalExtrasSchema,
  SystemsExtrasSchema,
  InterpretiveExtrasSchema,
  DialecticalExtrasSchema,
]);
export type LensExtras = z.infer<typeof LensExtrasSchema>;

export type DeductionExtras = z.infer<typeof DeductionExtrasSchema>;
export type InductionExtras = z.infer<typeof InductionExtrasSchema>;
export type AbductionExtras = z.infer<typeof AbductionExtrasSchema>;
export type CausalExtras = z.infer<typeof CausalExtrasSchema>;
export type PracticalExtras = z.infer<typeof PracticalExtrasSchema>;
export type SystemsExtras = z.infer<typeof SystemsExtrasSchema>;
export type InterpretiveExtras = z.infer<typeof InterpretiveExtrasSchema>;
export type DialecticalExtras = z.infer<typeof DialecticalExtrasSchema>;

// ---------------------------------------------------------------------------
// Lens analysis (Stage B output)
// ---------------------------------------------------------------------------

export const FindingSchema = z.object({
  id: z.string().min(1),
  statement: z.string().min(1),
  epistemicType: EpistemicTypeSchema,
  confidence: ConfidenceSchema,
  confidenceRationale: z.string(),
  traceRefs: z.array(z.string()),
});
export type Finding = z.infer<typeof FindingSchema>;

export const HandoffSchema = z.object({
  targetLens: LensIdSchema,
  reason: z.string().min(1),
  /** Finding or node ids whose content the target lens should take as a question. */
  payloadIds: z.array(z.string()),
});
export type Handoff = z.infer<typeof HandoffSchema>;

const LensAnalysisObjectSchema = z.object({
  lens: LensIdSchema,
  guidingQuestion: z.string().min(1),
  plainLanguageSummary: z.string().min(1),
  diagram: DiagramSchema,
  findings: z.array(FindingSchema),
  /** At least one challenge to the lens's own analysis is required. */
  challenges: z.array(z.string()).min(1),
  missingEvidence: z.array(z.string()),
  canEstablish: z.array(z.string()),
  cannotEstablish: z.array(z.string()),
  nextQuestions: z.array(z.string()),
  handoffs: z.array(HandoffSchema),
  extras: LensExtrasSchema,
});

export const LensAnalysisSchema = LensAnalysisObjectSchema.refine(
  (a) => a.extras.lens === a.lens,
  { message: "extras.lens must match the analysis lens" }
);
export type LensAnalysis = z.infer<typeof LensAnalysisSchema>;

const EXTRAS_BY_LENS = {
  deduction: DeductionExtrasSchema,
  induction: InductionExtrasSchema,
  abduction: AbductionExtrasSchema,
  causal: CausalExtrasSchema,
  practical: PracticalExtrasSchema,
  systems: SystemsExtrasSchema,
  interpretive: InterpretiveExtrasSchema,
  dialectical: DialecticalExtrasSchema,
} as const;

/**
 * Per-lens narrowed schema for structured-output API calls: pins `lens` to a
 * literal and `extras` to that lens's exact shape (no union, no refine),
 * so it compiles cleanly to an output grammar and is stricter than the
 * general schema.
 */
export function lensAnalysisSchemaFor(lens: LensId) {
  return LensAnalysisObjectSchema.extend({
    lens: z.literal(lens),
    extras: EXTRAS_BY_LENS[lens],
  });
}

// ---------------------------------------------------------------------------
// Synthesis (Stage C output)
// ---------------------------------------------------------------------------

export const SynthesisClaimSchema = z.object({
  id: z.string().min(1),
  statement: z.string().min(1),
  lenses: z.array(LensIdSchema),
  traceRefs: z.array(z.string()),
});
export type SynthesisClaim = z.infer<typeof SynthesisClaimSchema>;

export const SynthesisSchema = z.object({
  convergence: z.array(SynthesisClaimSchema),
  conflicts: z.array(SynthesisClaimSchema),
  unresolvedUnknowns: z.array(SynthesisClaimSchema),
  assumptionDependencies: z.array(SynthesisClaimSchema),
  valueDependencies: z.array(SynthesisClaimSchema),
  evidencePriorities: z.array(SynthesisClaimSchema),
  testsOrNextSteps: z.array(SynthesisClaimSchema),
  provisionalJudgment: z
    .object({
      statement: z.string(),
      conditions: z.array(z.string()),
      confidence: ConfidenceSchema,
      rationale: z.string(),
    })
    .optional(),
});
export type Synthesis = z.infer<typeof SynthesisSchema>;

// ---------------------------------------------------------------------------
// Case input (intake form) and persisted case file
// ---------------------------------------------------------------------------

export const DepthSchema = z.enum(["quick", "standard", "deep"]);
export type Depth = z.infer<typeof DepthSchema>;

export const CaseInputSchema = z.object({
  title: z.string().min(1),
  narrative: z.string().min(1),
  centralQuestion: z.string().min(1),
  knownFacts: z.string().optional(),
  claims: z.string().optional(),
  stakeholders: z.string().optional(),
  constraints: z.string().optional(),
  timeHorizon: z.string().optional(),
  possibleActions: z.string().optional(),
  suspectedCauses: z.string().optional(),
  assumptions: z.string().optional(),
  valuesGoals: z.string().optional(),
  evidenceLinks: z.string().optional(),
  depth: DepthSchema.default("standard"),
});
export type CaseInput = z.infer<typeof CaseInputSchema>;

export const ModelChoiceSchema = z.enum([
  "claude-haiku-4-5",
  "claude-sonnet-5-5",
  "claude-opus-5-5",
]);
export type ModelChoice = z.infer<typeof ModelChoiceSchema>;

export const StageModelsSchema = z.object({
  normalize: ModelChoiceSchema,
  lenses: ModelChoiceSchema,
  synthesis: ModelChoiceSchema,
});
export type StageModels = z.infer<typeof StageModelsSchema>;

export const DEFAULT_STAGE_MODELS: StageModels = {
  normalize: "claude-sonnet-5-5",
  lenses: "claude-opus-5-5",
  synthesis: "claude-opus-5-5",
};

export const RevisionSchema = z.object({
  at: z.string(),
  trigger: z.enum(["rerun", "refine", "challenge", "user_edit"]),
  note: z.string(),
  previous: LensAnalysisSchema,
});
export type Revision = z.infer<typeof RevisionSchema>;

export const LensRunSchema = z.object({
  status: z.enum(["done", "error", "stale"]),
  model: z.string(),
  error: z.string().optional(),
  analysis: LensAnalysisSchema.optional(),
  revisions: z.array(RevisionSchema).default([]),
  updatedAt: z.string(),
});
export type LensRun = z.infer<typeof LensRunSchema>;

export const LogEntrySchema = z.object({
  at: z.string(),
  kind: z.string(),
  description: z.string(),
});
export type LogEntry = z.infer<typeof LogEntrySchema>;

export const CaseFileSchema = z.object({
  schemaVersion: z.literal(1),
  id: z.string().min(1),
  createdAt: z.string(),
  updatedAt: z.string(),
  input: CaseInputSchema,
  caseModel: CaseModelSchema.optional(),
  /** User has reviewed/corrected the parse and unlocked analysis. */
  caseModelApproved: z.boolean().default(false),
  analyses: z.record(z.string(), LensRunSchema).default({}),
  synthesis: z
    .object({
      status: z.enum(["done", "error", "stale"]),
      model: z.string(),
      error: z.string().optional(),
      result: SynthesisSchema.optional(),
      updatedAt: z.string(),
    })
    .optional(),
  settings: z.object({
    models: StageModelsSchema,
    depth: DepthSchema,
  }),
  log: z.array(LogEntrySchema).default([]),
  /** True when this is a seeded demo case (safe to analyze without an API key). */
  isSample: z.boolean().default(false),
});
export type CaseFile = z.infer<typeof CaseFileSchema>;

// ---------------------------------------------------------------------------
// Referential integrity (beyond shape validation; feeds the repair loop)
// ---------------------------------------------------------------------------

/** Errors for edges/groups/extras that reference nonexistent diagram nodes. */
export function diagramIntegrityErrors(analysis: LensAnalysis): string[] {
  const errors: string[] = [];
  const nodeIds = new Set(analysis.diagram.nodes.map((n) => n.id));
  for (const e of analysis.diagram.edges) {
    if (!nodeIds.has(e.from)) errors.push(`edge ${e.id}: "from" references missing node "${e.from}"`);
    if (!nodeIds.has(e.to)) errors.push(`edge ${e.id}: "to" references missing node "${e.to}"`);
  }
  for (const g of analysis.diagram.groups ?? []) {
    for (const id of g.nodeIds) {
      if (!nodeIds.has(id)) errors.push(`group ${g.id}: references missing node "${id}"`);
    }
  }
  const ex = analysis.extras;
  const checkRef = (where: string, id: string) => {
    if (!nodeIds.has(id)) errors.push(`${where}: references missing node "${id}"`);
  };
  if (ex.lens === "abduction") ex.hypotheses.forEach((h) => checkRef(`hypothesis ${h.label}`, h.nodeId));
  if (ex.lens === "systems") ex.loops.forEach((l) => l.nodeIds.forEach((id) => checkRef(`loop ${l.id}`, id)));
  if (ex.lens === "practical") ex.options.forEach((o) => checkRef(`option ${o.label}`, o.nodeId));
  if (ex.lens === "interpretive") ex.standpoints.forEach((s) => checkRef(`standpoint ${s.stakeholderName}`, s.nodeId));
  if (ex.lens === "causal") {
    if (ex.interventionNodeId) checkRef("interventionNodeId", ex.interventionNodeId);
    ex.outcomeNodeIds.forEach((id) => checkRef("outcomeNodeIds", id));
  }
  if (ex.lens === "induction" && ex.evidenceMatrix) {
    ex.evidenceMatrix.rows.forEach((r) => checkRef("evidenceMatrix row", r.observationId));
  }
  return errors;
}

// ---------------------------------------------------------------------------
// Trace resolution helpers (used by inspector, synthesis traceability, tests)
// ---------------------------------------------------------------------------

export type TraceTarget =
  | { kind: "case_item"; item: CaseItem }
  | { kind: "stakeholder"; stakeholder: Stakeholder }
  | { kind: "option"; option: CaseOption }
  | { kind: "node"; lens: LensId; node: DiagramNode }
  | { kind: "finding"; lens: LensId; finding: Finding };

/** Resolve a trace ref against the case model and all completed analyses. */
export function resolveTraceRef(
  ref: string,
  caseModel: CaseModel | undefined,
  analyses: Partial<Record<LensId, LensAnalysis>>
): TraceTarget | undefined {
  if (caseModel) {
    const item = caseModel.items.find((i) => i.id === ref);
    if (item) return { kind: "case_item", item };
    const st = caseModel.stakeholders.find((s) => s.id === ref);
    if (st) return { kind: "stakeholder", stakeholder: st };
    const op = caseModel.options.find((o) => o.id === ref);
    if (op) return { kind: "option", option: op };
  }
  for (const lens of LENS_IDS) {
    const a = analyses[lens];
    if (!a) continue;
    const node = a.diagram.nodes.find((n) => n.id === ref);
    if (node) return { kind: "node", lens, node };
    const finding = a.findings.find((f) => f.id === ref);
    if (finding) return { kind: "finding", lens, finding };
  }
  return undefined;
}

/** Items of one case-model category, preserving order. */
export function itemsOf(model: CaseModel, category: CaseCategory): CaseItem[] {
  return model.items.filter((i) => i.category === category);
}

/** Every conclusion-bearing element that cites the given assumption id. */
export function dependentsOfAssumption(
  assumptionId: string,
  analyses: Partial<Record<LensId, LensAnalysis>>,
  synthesis?: Synthesis
): Array<{ lens: LensId | "synthesis"; label: string; id: string }> {
  const out: Array<{ lens: LensId | "synthesis"; label: string; id: string }> = [];
  for (const lens of LENS_IDS) {
    const a = analyses[lens];
    if (!a) continue;
    for (const f of a.findings) {
      if (f.traceRefs.includes(assumptionId)) {
        out.push({ lens, label: f.statement, id: f.id });
      }
    }
    for (const n of a.diagram.nodes) {
      if (n.traceRefs.includes(assumptionId)) {
        out.push({ lens, label: n.label, id: n.id });
      }
    }
  }
  if (synthesis) {
    const buckets: Array<[string, SynthesisClaim[]]> = [
      ["convergence", synthesis.convergence],
      ["conflicts", synthesis.conflicts],
      ["assumptionDependencies", synthesis.assumptionDependencies],
      ["testsOrNextSteps", synthesis.testsOrNextSteps],
    ];
    for (const [, claims] of buckets) {
      for (const c of claims) {
        if (c.traceRefs.includes(assumptionId)) {
          out.push({ lens: "synthesis", label: c.statement, id: c.id });
        }
      }
    }
  }
  return out;
}
