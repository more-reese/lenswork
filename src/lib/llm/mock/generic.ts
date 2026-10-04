/**
 * Deterministic generic mock builder. Produces schema-valid, honest lens
 * analyses from any case model — used in demo mode (no API key) for cases
 * without curated content. It templates structure from the user's own
 * material and never fabricates evidence: where information is missing it
 * says so and renders plans/questions instead.
 */
import type {
  CaseInput,
  CaseItem,
  CaseModel,
  DiagramEdge,
  DiagramNode,
  Finding,
  LensAnalysis,
  LensId,
  Synthesis,
  SynthesisClaim,
} from "@/lib/schema";
import { itemsOf } from "@/lib/schema";
import { LENSES } from "@/lib/lenses/registry";

const DEMO_NOTE =
  "Demo mode: this analysis is a deterministic template built only from your own input — useful for exploring the app's structure. Connect an API key for a real analysis.";

function node(
  id: string,
  label: string,
  nodeType: string,
  epistemicType: DiagramNode["epistemicType"],
  traceRefs: string[],
  extra?: Partial<DiagramNode>
): DiagramNode {
  return {
    id,
    label,
    nodeType,
    epistemicType,
    confidence: epistemicType === "user_fact" ? "high" : "low",
    traceRefs,
    ...extra,
  };
}

function edge(
  id: string,
  from: string,
  to: string,
  relation: string,
  extra?: Partial<DiagramEdge>
): DiagramEdge {
  return { id, from, to, relation, traceRefs: [], ...extra };
}

function finding(
  id: string,
  statement: string,
  traceRefs: string[],
  confidence: Finding["confidence"] = "low"
): Finding {
  return {
    id,
    statement,
    epistemicType: "model_inference",
    confidence,
    confidenceRationale: "Template inference from the case model alone (demo mode).",
    traceRefs,
  };
}

function clamp(s: string, n = 72): string {
  return s.length > n ? `${s.slice(0, n - 1)}…` : s;
}

const base = (lens: LensId, model: CaseModel) => ({
  lens,
  guidingQuestion: LENSES[lens].guidingQuestion,
  plainLanguageSummary: "",
  findings: [] as Finding[],
  challenges: [
    "This is a deterministic demo-mode template: it organizes your input but performs no genuine reasoning over it.",
  ],
  missingEvidence: [] as string[],
  canEstablish: [] as string[],
  cannotEstablish: [...LENSES[lens].education.cannotEstablish],
  nextQuestions: [] as string[],
  handoffs: [] as LensAnalysis["handoffs"],
  _model: model,
});

export function buildMockAnalysis(lens: LensId, model: CaseModel): LensAnalysis {
  switch (lens) {
    case "interpretive": return interpretive(model);
    case "induction": return induction(model);
    case "abduction": return abduction(model);
    case "deduction": return deduction(model);
    case "causal": return causal(model);
    case "systems": return systems(model);
    case "practical": return practical(model);
    case "dialectical": return dialectical(model);
  }
}

// ---------------------------------------------------------------------------

function interpretive(m: CaseModel): LensAnalysis {
  const b = base("interpretive", m);
  const nodes: DiagramNode[] = [
    node("int-case", clamp(m.title), "subject", "user_fact", []),
  ];
  const edges: DiagramEdge[] = [];
  const standpoints = m.stakeholders.map((s, i) => {
    const id = `int-s${i + 1}`;
    nodes.push(node(id, `${s.name}: standpoint to be established`, "standpoint", "model_inference", [s.id]));
    edges.push(edge(`int-e${i + 1}`, id, "int-case", "interprets"));
    return {
      nodeId: id,
      stakeholderName: s.name,
      framing: s.description
        ? `Role as described: ${s.description}`
        : "No description supplied; framing unknown.",
      inquiryPrompt: `A person in ${s.name}'s position might experience this situation differently than the narrative suggests; verify through direct inquiry before relying on any framing.`,
      keyTerms: [],
    };
  });
  return {
    ...b,
    plainLanguageSummary: `${m.stakeholders.length > 0
      ? `The case names ${m.stakeholders.length} stakeholder group(s); each is likely to frame "${clamp(m.title, 48)}" differently, and none of those framings has been verified.`
      : "No stakeholders were supplied, so no standpoints can be mapped — add the people affected."} ${DEMO_NOTE}`,
    diagram: { diagramType: "perspective_map", nodes, edges },
    findings: [
      finding("int-fd1", m.stakeholders.length > 0
        ? "Each listed stakeholder's reading of the situation is currently a placeholder: nothing in the input reports their actual experience."
        : "The case model lists no stakeholders; interpretive analysis has nothing to work on yet.",
        m.stakeholders.map((s) => s.id)),
    ],
    missingEvidence: ["First-person accounts (interviews, open responses) from each stakeholder group."],
    canEstablish: ["Which standpoints exist to be investigated, and which voices are missing from the input."],
    nextQuestions: m.stakeholders.slice(0, 3).map((s) => `How does ${s.name} describe this situation in their own words?`),
    handoffs: [{ targetLens: "practical", reason: "Standpoints determine whose burdens count in the deliberation.", payloadIds: ["int-fd1"] }],
    extras: {
      lens: "interpretive",
      standpoints,
      contestedMeanings: [],
      missingVoices: ["Anyone affected who is not listed among the stakeholders.", "Those who have already exited the situation."],
      contextLayers: {
        immediate: clamp(m.narrative, 180),
        institutional: "Not supplied — add institutional context (rules, bodies, commitments) to the case input.",
        historical: "Not supplied — add relevant history to the case input.",
      },
    },
  };
}

function induction(m: CaseModel): LensAnalysis {
  const b = base("induction", m);
  const facts = itemsOf(m, "fact");
  const has = facts.length >= 2;
  const nodes: DiagramNode[] = facts.map((f, i) =>
    node(`ind-o${i + 1}`, clamp(f.text), "observation", f.epistemicType, [f.id], {
      confidence: "high",
    })
  );
  const edges: DiagramEdge[] = [];
  if (has) {
    nodes.push(node("ind-g1", "No generalization warranted yet: observations are single data points, not repeated cases", "generalization", "model_inference", facts.map((f) => f.id)));
    facts.forEach((_, i) => edges.push(edge(`ind-e${i + 1}`, `ind-o${i + 1}`, "ind-g1", "informs")));
  }
  return {
    ...b,
    plainLanguageSummary: `${has
      ? `The input supplies ${facts.length} stated fact(s). They are individual observations; no repeated pattern across cases, groups, or time was supplied, so any generalization would outrun the evidence.`
      : "No observations were supplied, so this lens renders an evidence-collection plan instead of a pattern."} ${DEMO_NOTE}`,
    diagram: { diagramType: "evidence_flow", nodes, edges },
    findings: [
      finding("ind-fd1", has
        ? "The stated facts do not yet form a pattern: each is a single reading with no comparison group or baseline."
        : "There is no evidence base; collection must precede pattern-finding.",
        facts.map((f) => f.id), has ? "medium" : "high"),
    ],
    missingEvidence: [
      "The same measurements broken down by group, period, and condition.",
      "A baseline: what did these indicators look like before, or elsewhere?",
    ],
    canEstablish: ["What evidence exists, and precisely what breakdowns are missing before a pattern claim is responsible."],
    nextQuestions: ["Which single breakdown of the existing numbers would be most informative?"],
    handoffs: [{ targetLens: "abduction", reason: "Any explanation proposed must be scored against these observations once patterns exist.", payloadIds: ["ind-fd1"] }],
    extras: {
      lens: "induction",
      hasUserEvidence: has,
      generalization: {
        statement: has
          ? "No generalization is warranted from the supplied observations alone."
          : "No evidence supplied; no generalization possible.",
        scopeConditions: ["Applies to this case's supplied observations only."],
      },
      coverageGaps: ["No group-level breakdowns supplied.", "No time series or baseline supplied."],
      biasQuestions: [
        "Who collected these observations, and what would they be unlikely to see?",
        "Could the observations cover only those easiest to observe? (selection)",
        "Is the implicit baseline the right comparison?",
      ],
      ...(has
        ? {
            evidenceMatrix: {
              columns: ["Source", "Baseline supplied?", "Broken down by group?"],
              rows: facts.map((f, i) => ({
                observationId: `ind-o${i + 1}`,
                cells: [f.epistemicType === "external_source" ? "External source" : "User-stated", "Unknown", "No"],
              })),
            },
          }
        : {
            evidencePlan: [
              "Define the outcome(s) in the central question precisely enough to measure.",
              "Collect the same measurement across at least two groups or periods.",
              "Record who/what is excluded from the collection, not just what is in it.",
            ],
          }),
    },
  };
}

function abduction(m: CaseModel): LensAnalysis {
  const b = base("abduction", m);
  const candidates = [...itemsOf(m, "claim"), ...itemsOf(m, "assumption")].slice(0, 4);
  const facts = itemsOf(m, "fact");
  const nodes: DiagramNode[] = [
    node("abd-obs", `Observed: ${clamp(m.centralQuestion, 60)}`, "observation", "user_fact", facts.map((f) => f.id)),
  ];
  const edges: DiagramEdge[] = [];
  const hypotheses = candidates.map((c, i) => {
    const id = `abd-h${i + 1}`;
    nodes.push(node(id, `H${i + 1}: ${clamp(c.text)}`, "hypothesis", "model_inference", [c.id]));
    edges.push(edge(`abd-e${i + 1}`, id, "abd-obs", "explains", { label: "candidate" }));
    return {
      nodeId: id,
      label: clamp(c.text, 90),
      explains: ["To be scored against each observation — not yet done."],
      failsToExplain: ["Unknown until compared observation by observation."],
      assumptionsRequired: [c.category === "assumption" ? "Itself an assumption from the case model." : "That the claim's implied mechanism operates here."],
      predictions: ["If true, some observable difference should exist between affected and unaffected groups — specify it."],
      disconfirmedBy: ["The predicted difference failing to appear."],
      discriminatingTest: "Name one observation that would differ between this hypothesis and its nearest rival.",
      plausibility: "low" as const,
      plausibilityRationale: "Drawn from the case model without evaluation (demo mode).",
      compatibleWith: candidates.filter((_, j) => j !== i).map((_, j) => `abd-h${j >= i ? j + 2 : j + 1}`),
    };
  });
  return {
    ...b,
    plainLanguageSummary: `${hypotheses.length >= 2
      ? `${hypotheses.length} candidate explanations were lifted from your claims and assumptions. None has been scored against the evidence — the comparison matrix shows what scoring would require.`
      : "Fewer than two candidate explanations exist in the input; abduction needs rivals. Add suspected causes or claims."} ${DEMO_NOTE}`,
    diagram: { diagramType: "hypothesis_tree", nodes, edges },
    findings: [
      finding("abd-fd1", hypotheses.length >= 2
        ? "The live explanations come entirely from the case input; explanations nobody has suspected are invisible to this analysis."
        : "The hypothesis field is too thin for inference to the best explanation.",
        candidates.map((c) => c.id), "high"),
    ],
    missingEvidence: ["One discriminating observation per pair of leading hypotheses."],
    canEstablish: ["Which explanations are on the table and what each would predict."],
    nextQuestions: ["What explanation would an outsider propose that nobody inside has?"],
    handoffs: [{ targetLens: "causal", reason: "The leading hypotheses define candidate causal links that an intervention design should test.", payloadIds: hypotheses.map((h) => h.nodeId) }],
    extras: { lens: "abduction", hypotheses },
  };
}

function deduction(m: CaseModel): LensAnalysis {
  const b = base("deduction", m);
  const claims = itemsOf(m, "claim");
  const facts = itemsOf(m, "fact");
  const c = claims[0];
  const nodes: DiagramNode[] = [];
  const edges: DiagramEdge[] = [];
  if (c) {
    nodes.push(node("ded-c1", `C: ${clamp(c.text)}`, "conclusion", "user_claim", [c.id]));
    facts.slice(0, 3).forEach((f, i) => {
      nodes.push(node(`ded-p${i + 1}`, `P${i + 1}: ${clamp(f.text)}`, "premise", f.epistemicType, [f.id], { confidence: "high" }));
      edges.push(edge(`ded-e${i + 1}`, `ded-p${i + 1}`, "ded-c1", "supports", { label: "claimed support" }));
    });
    nodes.push(
      node("ded-hp1", "Hidden premise: something must connect the stated facts to this conclusion — state it", "hidden_premise", "assumption", [], {
        detail: "As supplied, the argument is an enthymeme: the facts do not entail the conclusion without at least one bridging premise.",
      })
    );
    edges.push(edge("ded-eh1", "ded-hp1", "ded-c1", "supports", { label: "required bridge" }));
  }
  return {
    ...b,
    plainLanguageSummary: `${c
      ? `Taking "${clamp(c.text, 70)}" as the conclusion: the stated facts alone do not entail it. At least one bridging premise is hidden; validity cannot be assessed until it is stated.`
      : "No claims were supplied, so there is no argument to map. Add the conclusion someone is urging."} ${DEMO_NOTE}`,
    diagram: { diagramType: "argument_map", nodes, edges },
    findings: [
      finding("ded-fd1", c
        ? "The argument as supplied is incomplete (an enthymeme); its force depends on unstated premises that should be made explicit and examined."
        : "No argument present in the input.",
        c ? [c.id] : [], "high"),
    ],
    missingEvidence: ["The arguer's own statement of the bridging premise(s)."],
    canEstablish: ["That the stated material under-determines the conclusion, and where the gap is."],
    nextQuestions: ["Could every stated fact be true while the conclusion is false? If yes, what premise closes the gap?"],
    handoffs: [{ targetLens: "dialectical", reason: "The hidden premise is the natural first target for structured challenge.", payloadIds: ["ded-fd1"] }],
    extras: {
      lens: "deduction",
      validityStatus: "indeterminate",
      validityNote: c
        ? "Validity cannot be assessed: the argument is incomplete until its hidden premises are stated."
        : "No argument supplied.",
      premisesTrueConclusionFalse: c
        ? "Yes, as it stands: nothing in the stated facts rules out the conclusion being false — which is exactly why the bridging premise matters."
        : "Not applicable.",
    },
  };
}

function causal(m: CaseModel): LensAnalysis {
  const b = base("causal", m);
  const causes = [...itemsOf(m, "claim"), ...itemsOf(m, "assumption")].slice(0, 3);
  const nodes: DiagramNode[] = [
    node("cau-out", `Outcome: ${clamp(m.centralQuestion, 60)}`, "outcome", "user_fact", []),
    node("cau-conf", "Unmeasured common causes (confounders)?", "confounder", "unknown", [], {
      detail: "Placeholder for whatever could drive both the suspected causes and the outcome.",
    }),
  ];
  const edges: DiagramEdge[] = [
    edge("cau-ec", "cau-conf", "cau-out", "causal_hypothesis", { certainty: "low", label: "possible" }),
  ];
  causes.forEach((c, i) => {
    nodes.push(node(`cau-v${i + 1}`, clamp(c.text), "variable", c.epistemicType, [c.id]));
    edges.push(edge(`cau-e${i + 1}`, `cau-v${i + 1}`, "cau-out", "association", { certainty: "low", label: "association claimed, not identified" }));
  });
  const firstOption = m.options[0];
  return {
    ...b,
    plainLanguageSummary: `Every arrow in this graph is an association or hypothesis — nothing in the input identifies a causal effect. The decision-relevant quantity is the counterfactual: what the outcome would be under a deliberate change versus without it. ${DEMO_NOTE}`,
    diagram: { diagramType: "causal_graph", nodes, edges },
    findings: [
      finding("cau-fd1", "No causal relationship in this case is identified by the supplied material; timing and co-occurrence are all that exist.", causes.map((c) => c.id), "high"),
    ],
    missingEvidence: ["A comparison (before/after with controls, or between matched groups) for the main claimed link."],
    canEstablish: ["The structure of the causal question and what a feasible test would need."],
    nextQuestions: ["What is the cheapest comparison that would separate the leading cause from coincidence?"],
    handoffs: [{ targetLens: "systems", reason: "Feedback effects are excluded from this simplified graph and belong in the systems view.", payloadIds: ["cau-fd1"] }],
    extras: {
      lens: "causal",
      outcomeNodeIds: ["cau-out"],
      counterfactual: {
        intervention: firstOption ? `Candidate intervention: ${firstOption.label}.` : "No candidate action supplied.",
        observedWorld: clamp(m.narrative, 160),
        interventionWorld: "Not observed — and not estimable until a comparison is designed.",
        caveats: ["Without a comparison group, any estimate is storytelling."],
      },
      testPlan: [
        "Define the outcome measurably before intervening.",
        "Find or construct a comparison: matched group, phased rollout, or at minimum a pre-period baseline.",
        "List rival explanations the design must control for.",
      ],
    },
  };
}

function systems(m: CaseModel): LensAnalysis {
  const b = base("systems", m);
  const key = [...itemsOf(m, "fact").slice(0, 3), ...itemsOf(m, "claim").slice(0, 2)];
  const nodes: DiagramNode[] = key.map((k, i) => node(`sys-n${i + 1}`, clamp(k.text, 60), "loop_node", k.epistemicType, [k.id]));
  return {
    ...b,
    plainLanguageSummary: `No feedback loops can be responsibly asserted from the supplied information — the elements below are candidates for loop-finding, not a loop map. Ask of each: does its consequence eventually feed back to its cause? ${DEMO_NOTE}`,
    diagram: { diagramType: "causal_loop", nodes, edges: [] },
    findings: [
      finding("sys-fd1", "The input describes elements but no feedback structure; a systems view requires asking how outcomes recirculate into causes over time.", key.map((k) => k.id), "high"),
    ],
    missingEvidence: ["Time-series for the key variables — loops reveal themselves as trajectories, not snapshots."],
    canEstablish: ["Which variables belong inside the boundary and which loop questions to ask."],
    nextQuestions: ["Does the main outcome make its own causes stronger (reinforcing) or weaker (balancing) over time?"],
    handoffs: [{ targetLens: "practical", reason: "If loops exist, the option set should include structural changes, not just parameter changes.", payloadIds: ["sys-fd1"] }],
    extras: {
      lens: "systems",
      loops: [],
      boundary: {
        included: key.map((k) => clamp(k.text, 50)),
        excluded: ["Everything not mentioned in the case input — note that this exclusion is a choice made by the input, not an analysis."],
        rationale: "Boundary drawn at the edge of the supplied material (demo mode).",
      },
      leveragePoints: m.options.slice(0, 3).map((o) => ({
        label: o.label,
        description: "Candidate intervention from your options list; its leverage depends on loop structure not yet mapped.",
        caution: "Parameter changes are usually weaker leverage than rule or information changes.",
      })),
      horizons: {
        short: "Immediate responses to any announcement or change.",
        medium: "Where feedback loops, if any, would begin to dominate.",
        long: "Where accumulations (skills, trust, capacity) decide the outcome.",
      },
    },
  };
}

function practical(m: CaseModel): LensAnalysis {
  const b = base("practical", m);
  const values = itemsOf(m, "value");
  const constraints = itemsOf(m, "constraint");
  const opts = m.options.length > 0
    ? m.options
    : [
        { id: "auto-o1", label: "Keep the status quo", description: undefined, origin: "model" as const },
        { id: "auto-o2", label: "Intervene (specify how)", description: undefined, origin: "model" as const },
      ];
  const nodes: DiagramNode[] = [
    ...opts.map((o, i) => node(`pra-o${i + 1}`, o.label, "option", "user_claim", [o.id])),
    ...values.map((v, i) => node(`pra-g${i + 1}`, clamp(v.text, 50), "goal", "value_judgment", [v.id], { confidence: "not_applicable" })),
    ...constraints.map((k, i) => node(`pra-k${i + 1}`, clamp(k.text, 50), "constraint", k.epistemicType, [k.id], { confidence: "high" })),
  ];
  return {
    ...b,
    plainLanguageSummary: `${opts.length} option(s) against ${values.length} declared value(s) and ${constraints.length} constraint(s). The landscape below shows what a real deliberation must fill in: benefits, burdens, and who bears them — none of which can be derived from the input alone. ${DEMO_NOTE}`,
    diagram: { diagramType: "decision_landscape", nodes, edges: [] },
    findings: [
      finding("pra-fd1", values.length > 0
        ? "The decision will turn on how the declared values are weighed against each other; no weighing is given in the input, and none would be objective."
        : "No values were declared; any recommendation would smuggle them in. State what matters first.",
        values.map((v) => v.id), "high"),
    ],
    missingEvidence: ["Who bears the burdens of each option (the distributional facts)."],
    canEstablish: ["The live options, declared values, and binding constraints — the shape of the choice."],
    nextQuestions: ["Which option would you refuse even if it scored best on the averages — and what does that reveal about the real values?"],
    handoffs: [{ targetLens: "dialectical", reason: "Whichever option emerges as favored should be pressure-tested before it hardens.", payloadIds: ["pra-fd1"] }],
    extras: {
      lens: "practical",
      options: opts.map((o, i) => ({
        nodeId: `pra-o${i + 1}`,
        label: o.label,
        summary: o.description ?? "No description supplied.",
        benefits: ["Not derivable from input — assess against each declared value."],
        burdens: ["Not derivable from input — ask who carries the cost."],
        dutiesAndRights: ["Check: does any standing commitment constrain this option?"],
        reversibility: "Unassessed.",
        uncertainty: "Unassessed.",
        distribution: { whoBenefits: "Unknown", whoPays: "Unknown", whoDecides: "Unknown — and worth asking first" },
      })),
      valueTensions:
        values.length >= 2
          ? [{ label: `${clamp(values[0].text, 30)} vs. ${clamp(values[1].text, 30)}`, description: "The first tension to examine: these two values will not always point the same way. Where do they conflict in this case?" }]
          : [],
      ethicalPerspectives: {
        consequence: "Which option produces the best overall outcomes, counting everyone affected?",
        duty: "Do any promises, rights, or role obligations constrain the options regardless of outcomes?",
        virtue: "What would the person you are trying to be do here?",
        care: "What do the most dependent or burdened people in this situation need?",
        fairness: "Were the people affected heard, and would they accept the process even if they lose?",
      },
    },
  };
}

function dialectical(m: CaseModel): LensAnalysis {
  const b = base("dialectical", m);
  const claims = itemsOf(m, "claim");
  const thesis = claims[0]?.text ?? m.centralQuestion;
  const nodes: DiagramNode[] = [
    node("dia-n1", `Thesis: ${clamp(thesis)}`, "thesis", claims[0] ? "user_claim" : "user_fact", claims[0] ? [claims[0].id] : []),
    node("dia-n2", "Challenge: define the key term this thesis depends on", "challenge", "model_inference", []),
    node("dia-n3", "Challenge: what would show this thesis false?", "challenge", "model_inference", []),
    node("dia-n4", "Revision pending: the thesis has not yet been defended", "revision", "model_inference", []),
  ];
  const edges: DiagramEdge[] = [
    edge("dia-e1", "dia-n2", "dia-n1", "challenges"),
    edge("dia-e2", "dia-n3", "dia-n1", "challenges"),
    edge("dia-e3", "dia-n4", "dia-n1", "revises", { label: "awaiting defense" }),
  ];
  return {
    ...b,
    plainLanguageSummary: `The opening thesis is "${clamp(thesis, 80)}". Demo mode poses the two standard opening challenges (definition and falsifiability) but cannot play defender — use the refine box, or run a real analysis, to conduct the debate. ${DEMO_NOTE}`,
    diagram: { diagramType: "dialectic_sequence", nodes, edges },
    findings: [
      finding("dia-fd1", "The thesis has not yet faced a defense; its key terms and failure conditions are the first pressure points.", claims[0] ? [claims[0].id] : [], "high"),
    ],
    missingEvidence: ["A defender's actual replies — the user can take either role."],
    canEstablish: ["Where the first challenges should land."],
    nextQuestions: ["What is the strongest version of this thesis (steelman) before any attack?"],
    handoffs: [],
    extras: {
      lens: "dialectical",
      thesis,
      steelmannedThesis: "Not yet constructed — a steelman should strengthen the thesis before any challenge is scored.",
      moves: [
        { id: "dia-m1", role: "challenger", moveType: "definition", text: "Define the key term the thesis depends on." },
        { id: "dia-m2", role: "challenger", moveType: "consequence", text: "What observable consequence follows if the thesis is true — and what would show it false?" },
      ],
      revisedThesis: "Pending: no defense has been offered yet.",
      remainingObjections: ["All of them — the debate has not been run."],
    },
  };
}

// ---------------------------------------------------------------------------
// Generic synthesis + mock normalization
// ---------------------------------------------------------------------------

export function buildMockSynthesis(
  model: CaseModel,
  analyses: Partial<Record<LensId, LensAnalysis>>
): Synthesis {
  const lensIds = Object.keys(analyses) as LensId[];
  const claim = (id: string, statement: string, lenses: LensId[], traceRefs: string[]): SynthesisClaim => ({ id, statement, lenses, traceRefs });
  const assumptions = itemsOf(model, "assumption");
  const unknowns = itemsOf(model, "unknown");
  const values = itemsOf(model, "value");
  return {
    convergence: [
      claim("syn-cv1", "Every lens that touched the evidence flagged the same thing: the supplied material describes a situation but does not yet discriminate between explanations of it.", lensIds, []),
    ],
    conflicts: [
      claim("syn-cf1", "Acting now versus learning first is the unresolved tension that demo mode cannot adjudicate — and a real analysis would preserve rather than dissolve it.", lensIds.filter((l) => l === "practical" || l === "causal"), []),
    ],
    unresolvedUnknowns: unknowns.slice(0, 4).map((u, i) => claim(`syn-uk${i + 1}`, u.text, [], [u.id])),
    assumptionDependencies: assumptions.slice(0, 4).map((a, i) =>
      claim(`syn-ad${i + 1}`, `Conclusions leaning on "${clamp(a.text, 70)}" inherit its uncertainty — check which findings cite it in the assumption audit.`, [], [a.id])
    ),
    valueDependencies: values.slice(0, 3).map((v, i) =>
      claim(`syn-vd${i + 1}`, `The decision's weight on "${clamp(v.text, 60)}" is a commitment, not a finding.`, ["practical"], [v.id])
    ),
    evidencePriorities: unknowns.slice(0, 2).map((u, i) =>
      claim(`syn-ep${i + 1}`, `Resolve: ${u.text}`, [], [u.id])
    ),
    testsOrNextSteps: [
      claim("syn-ts1", "Run a real analysis (API key) or work lens by lens with the refine box — demo mode stops at structure.", [], []),
    ],
    provisionalJudgment: undefined,
  };
}

/** Heuristic demo-mode normalizer for arbitrary user input. */
export function mockNormalize(input: CaseInput): CaseModel {
  let n = 0;
  const id = (p: string) => `${p}-${(++n).toString(36)}`;
  const split = (s?: string): string[] =>
    (s ?? "")
      .split(/\n|(?<=[.;!?])\s+(?=[A-Z"“])/)
      .map((x) => x.trim().replace(/^[-•*]\s*/, ""))
      .filter((x) => x.length >= 2);

  const items: CaseItem[] = [];
  const push = (texts: string[], category: CaseItem["category"], epistemicType: CaseItem["epistemicType"]) => {
    for (const text of texts) {
      items.push({ id: id("mk"), text, category, epistemicType, origin: "user", sourceText: text });
    }
  };
  push(split(input.knownFacts), "fact", "user_fact");
  push(split(input.claims), "claim", "user_claim");
  push(split(input.assumptions), "assumption", "assumption");
  push(split(input.valuesGoals), "value", "value_judgment");
  push(split(input.constraints), "constraint", "user_fact");
  push(split(input.suspectedCauses), "claim", "user_claim");
  // Model-added unknowns every case has:
  items.push({ id: id("mk"), text: "What would have happened without any change (the counterfactual).", category: "unknown", epistemicType: "unknown", origin: "model", note: "Added by demo normalizer." });
  items.push({ id: id("mk"), text: "Whose accounts of this situation have not been heard directly.", category: "unknown", epistemicType: "unknown", origin: "model", note: "Added by demo normalizer." });

  const stakeholders = split(input.stakeholders).map((s) => ({ id: id("mk"), name: clamp(s, 60), description: undefined, origin: "user" as const }));
  const options = split(input.possibleActions).map((o) => ({ id: id("mk"), label: clamp(o, 80), description: undefined, origin: "user" as const }));

  return {
    title: input.title,
    narrative: input.narrative,
    centralQuestion: input.centralQuestion,
    timeHorizon: input.timeHorizon || undefined,
    items,
    stakeholders,
    options,
  };
}
