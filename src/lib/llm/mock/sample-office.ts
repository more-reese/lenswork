/**
 * Seeded sample case 1: the three-day office mandate.
 * Hand-curated case model and all eight lens analyses plus synthesis,
 * grounded in the project reference ("Eight Lenses for Better Reasoning").
 * Everything here is deterministic demo content for a fictional company.
 */
import type {
  CaseInput,
  CaseModel,
  LensAnalysis,
  LensId,
  Synthesis,
} from "@/lib/schema";

export const officeInput: CaseInput = {
  title: "The three-day office mandate",
  narrative:
    "A mid-sized company (~800 employees) adopted a hybrid-work policy six months ago requiring everyone in the office three days per week. Since then, annualized voluntary turnover has risen from 11% to 18%, and median project cycle time is up 22%. About 15% of staff were hired fully remote in the prior two years. Office attendance is uneven across teams, and engagement scores fell in two departments. A reorganization of the product group began one quarter after the mandate. Executives disagree about whether to keep, revise, or repeal the policy.",
  centralQuestion: "Should the company keep, revise, or repeal the three-day office mandate?",
  knownFacts:
    "Mandate in force 6 months (3 fixed days). Turnover 11% → 18% annualized. Median cycle time +22%. ~15% of staff hired fully remote. Attendance uneven across teams. Engagement down in two departments. Product-group reorg began one quarter after the mandate.",
  claims:
    "COO: \"The mandate is hurting performance, so we should repeal it.\" CEO: \"In-person time improves collaboration.\" Several managers: commuting burden is driving the departures.",
  stakeholders:
    "Executives; middle managers; employees hired as fully remote; caregivers and long-distance commuters; junior staff in their first two years.",
  constraints:
    "Office leases run three more years. The board expects a visible office culture. A fully randomized trial is not acceptable to leadership.",
  possibleActions:
    "Keep the mandate as is; reduce to two coordinated team days; run a six-month team-designed pilot with coordination rules; repeal and go remote-first.",
  suspectedCauses:
    "Commute burden; teams lost working remote routines without gaining useful in-person coordination; inconsistent enforcement by managers; the concurrent reorganization; a strong external job market.",
  assumptions:
    "Leadership discussion assumes the turnover rise is caused by the mandate, and that office time benefits all kinds of work equally.",
  valuesGoals: "Retention, delivery speed, collaboration quality, fairness across life situations, trust and autonomy.",
  depth: "standard",
};

export const officeModel: CaseModel = {
  title: officeInput.title,
  narrative: officeInput.narrative,
  centralQuestion: officeInput.centralQuestion,
  timeHorizon: "Decision within this quarter; effects over 6–24 months.",
  items: [
    // Facts (user-stated)
    { id: "of-f1", text: "A three-fixed-day office mandate has been in force for six months.", category: "fact", epistemicType: "user_fact", origin: "user", sourceText: "Mandate in force 6 months (3 fixed days)." },
    { id: "of-f2", text: "Annualized voluntary turnover rose from 11% to 18% after the mandate.", category: "fact", epistemicType: "user_fact", origin: "user", sourceText: "Turnover 11% → 18% annualized." },
    { id: "of-f3", text: "Median project cycle time increased 22% over the same period.", category: "fact", epistemicType: "user_fact", origin: "user", sourceText: "Median cycle time +22%." },
    { id: "of-f4", text: "About 15% of staff were hired as fully remote in the prior two years.", category: "fact", epistemicType: "user_fact", origin: "user" },
    { id: "of-f5", text: "Office attendance is uneven across teams.", category: "fact", epistemicType: "user_fact", origin: "user" },
    { id: "of-f6", text: "Engagement scores fell in two departments.", category: "fact", epistemicType: "user_fact", origin: "user" },
    { id: "of-f7", text: "A product-group reorganization began one quarter after the mandate.", category: "fact", epistemicType: "user_fact", origin: "user" },
    // Claims
    { id: "of-c1", text: "The mandate is hurting performance, so the company should repeal it. (COO)", category: "claim", epistemicType: "user_claim", origin: "user" },
    { id: "of-c2", text: "In-person time improves collaboration. (CEO)", category: "claim", epistemicType: "user_claim", origin: "user" },
    { id: "of-c3", text: "Commuting burden is driving the departures. (several managers)", category: "claim", epistemicType: "user_claim", origin: "user" },
    { id: "of-c4", text: "The external job market is strong, making departures easier.", category: "claim", epistemicType: "user_claim", origin: "user", note: "Stated as a suspected cause; treated as a claim pending evidence." },
    // Assumptions
    { id: "of-a1", text: "The turnover rise was caused by the mandate.", category: "assumption", epistemicType: "assumption", origin: "user", note: "Named by the user as an assumption in the leadership discussion." },
    { id: "of-a2", text: "Office time benefits all kinds of work equally.", category: "assumption", epistemicType: "assumption", origin: "user" },
    { id: "of-a3", text: "The people who left are representative of those who remain.", category: "assumption", epistemicType: "assumption", origin: "model", note: "Implicit whenever turnover statistics are read as a verdict on the policy." },
    // Values
    { id: "of-v1", text: "Retention of valued employees.", category: "value", epistemicType: "value_judgment", origin: "user" },
    { id: "of-v2", text: "Delivery speed and reliability.", category: "value", epistemicType: "value_judgment", origin: "user" },
    { id: "of-v3", text: "Collaboration quality.", category: "value", epistemicType: "value_judgment", origin: "user" },
    { id: "of-v4", text: "Fairness across life situations (commute, caregiving, disability).", category: "value", epistemicType: "value_judgment", origin: "user" },
    { id: "of-v5", text: "Trust and autonomy between leadership and staff.", category: "value", epistemicType: "value_judgment", origin: "user" },
    // Unknowns
    { id: "of-u1", text: "Who exactly left: tenure, role, commute distance, caregiving status.", category: "unknown", epistemicType: "unknown", origin: "model" },
    { id: "of-u2", text: "What turnover would have been without the mandate (the counterfactual).", category: "unknown", epistemicType: "unknown", origin: "model" },
    { id: "of-u3", text: "What changed inside delivery: process, staffing, scope, or the reorg.", category: "unknown", epistemicType: "unknown", origin: "model" },
    { id: "of-u4", text: "How consistently managers enforce the mandate team by team.", category: "unknown", epistemicType: "unknown", origin: "model" },
    { id: "of-u5", text: "How employees in different situations actually experience the mandate.", category: "unknown", epistemicType: "unknown", origin: "model" },
    // Constraints
    { id: "of-k1", text: "Office leases run three more years.", category: "constraint", epistemicType: "user_fact", origin: "user" },
    { id: "of-k2", text: "The board expects a visible office culture.", category: "constraint", epistemicType: "user_fact", origin: "user" },
    { id: "of-k3", text: "A fully randomized trial is not acceptable to leadership.", category: "constraint", epistemicType: "user_fact", origin: "user" },
  ],
  stakeholders: [
    { id: "of-s1", name: "Executives", description: "Accountable for performance and board expectations.", origin: "user" },
    { id: "of-s2", name: "Middle managers", description: "Enforce the policy and absorb team frustration.", origin: "user" },
    { id: "of-s3", name: "Remote-hired employees", description: "Joined under a different working agreement.", origin: "user" },
    { id: "of-s4", name: "Caregivers & long commuters", description: "Bear the largest fixed costs of office days.", origin: "user" },
    { id: "of-s5", name: "Junior staff", description: "First two years; mentoring and learning at stake.", origin: "user" },
  ],
  options: [
    { id: "of-o1", label: "Keep the mandate as is", description: "Three fixed office days for everyone.", origin: "user" },
    { id: "of-o2", label: "Two coordinated team days", description: "Reduce days; coordinate them within teams.", origin: "user" },
    { id: "of-o3", label: "Team-designed six-month pilot", description: "Teams set coordinated in-person time for work with a clear face-to-face advantage, with fairness standards and pre-defined measures.", origin: "user" },
    { id: "of-o4", label: "Repeal — remote-first", description: "Remove the mandate entirely.", origin: "user" },
  ],
};

// ---------------------------------------------------------------------------
// Curated lens analyses
// ---------------------------------------------------------------------------

const interpretive: LensAnalysis = {
  lens: "interpretive",
  guidingQuestion: "What does the mandate mean in context, and how is it experienced?",
  plainLanguageSummary:
    "The same policy carries different meanings: restored cohesion to executives, a broken agreement to remote hires, lost control of a constrained day to caregivers, access to learning — or noise — to junior staff. The policy communicates trust, status, and whose circumstances count, not just a schedule.",
  diagram: {
    diagramType: "perspective_map",
    nodes: [
      { id: "int-case", label: "Three-day office mandate", nodeType: "subject", epistemicType: "user_fact", confidence: "high", traceRefs: ["of-f1"] },
      { id: "int-s1", label: "Executives: restoring cohesion after disruption", nodeType: "standpoint", epistemicType: "model_inference", confidence: "medium", detail: "Leadership may read the office as the visible form of a working culture the board also expects.", traceRefs: ["of-s1", "of-k2"] },
      { id: "int-s2", label: "Managers: caught between policy and team reality", nodeType: "standpoint", epistemicType: "model_inference", confidence: "medium", detail: "Managers enforce a rule they did not set; uneven attendance suggests uneven conviction.", traceRefs: ["of-s2", "of-f5", "of-u4"] },
      { id: "int-s3", label: "Remote hires: a changed agreement", nodeType: "standpoint", epistemicType: "model_inference", confidence: "medium", detail: "15% of staff joined under fully-remote terms; a mandate can read as a broken commitment regardless of intent.", traceRefs: ["of-s3", "of-f4"] },
      { id: "int-s4", label: "Caregivers & commuters: loss of control over a constrained day", nodeType: "standpoint", epistemicType: "model_inference", confidence: "medium", traceRefs: ["of-s4", "of-c3"] },
      { id: "int-s5", label: "Junior staff: access to learning — or noisy interruption", nodeType: "standpoint", epistemicType: "model_inference", confidence: "low", detail: "Both readings are plausible; which dominates is an empirical question about how office days are actually run.", traceRefs: ["of-s5", "of-u5"] },
      { id: "int-ctx1", label: "Institutional context: board expectation of office culture", nodeType: "context", epistemicType: "user_fact", confidence: "high", traceRefs: ["of-k2"] },
      { id: "int-ctx2", label: "Historical context: two years of remote hiring and remote routines", nodeType: "context", epistemicType: "user_fact", confidence: "high", traceRefs: ["of-f4"] },
      { id: "int-m1", label: "\"Low attendance\" read as resistance by managers, as empty offices by employees", nodeType: "meaning", epistemicType: "model_inference", confidence: "medium", traceRefs: ["of-f5"] },
    ],
    edges: [
      { id: "int-e1", from: "int-s1", to: "int-case", relation: "interprets", traceRefs: [] },
      { id: "int-e2", from: "int-s2", to: "int-case", relation: "interprets", traceRefs: [] },
      { id: "int-e3", from: "int-s3", to: "int-case", relation: "interprets", traceRefs: [] },
      { id: "int-e4", from: "int-s4", to: "int-case", relation: "interprets", traceRefs: [] },
      { id: "int-e5", from: "int-s5", to: "int-case", relation: "interprets", traceRefs: [] },
      { id: "int-e6", from: "int-ctx1", to: "int-s1", relation: "shapes", traceRefs: [] },
      { id: "int-e7", from: "int-ctx2", to: "int-s3", relation: "shapes", traceRefs: [] },
      { id: "int-e8", from: "int-m1", to: "int-s2", relation: "diverges", label: "contested meaning", traceRefs: [] },
    ],
  },
  findings: [
    { id: "int-fd1", statement: "The mandate functions as a message about trust and whose circumstances count, in addition to being a schedule.", epistemicType: "model_inference", confidence: "medium", confidenceRationale: "Consistent with the stated stakeholder positions and uneven attendance; not yet verified by direct inquiry.", traceRefs: ["of-f5", "of-s3", "of-s4"] },
    { id: "int-fd2", statement: "For remote-hired staff, the policy plausibly reads as a changed agreement — a meaning no attendance metric captures.", epistemicType: "model_inference", confidence: "medium", confidenceRationale: "Follows from the hiring history; the actual experience is unverified.", traceRefs: ["of-f4", "of-u5"] },
    { id: "int-fd3", statement: "\"Collaboration\" and \"office culture\" are contested terms: executives, managers, and employees may not mean the same thing by them.", epistemicType: "model_inference", confidence: "medium", confidenceRationale: "The disagreement among executives itself suggests the terms are doing unexamined work.", traceRefs: ["of-c2", "of-k2"] },
  ],
  challenges: [
    "These standpoints are constructions from role descriptions, not reports. Interviews could contradict any of them — notably, some remote hires may welcome the office.",
    "Centering the most vivid standpoint (remote hires as wronged) risks mistaking one perspective for the whole.",
  ],
  missingEvidence: [
    "Direct accounts from each stakeholder group (interviews, open-ended survey responses, exit interviews).",
    "How office days actually run: observation or diaries, not just attendance counts.",
  ],
  canEstablish: [
    "A map of plausible framings and where they diverge.",
    "Which terms (collaboration, culture, attendance) are contested.",
    "Which voices are missing: nobody has reported the departed employees' own accounts.",
  ],
  cannotEstablish: [
    "What anyone actually experienced — every standpoint above is an inquiry prompt, not a finding.",
    "Which framing should drive the decision.",
  ],
  nextQuestions: [
    "What did departing employees say in exit interviews, in their own words?",
    "Do executives and employees mean the same thing by 'collaboration'?",
  ],
  handoffs: [
    { targetLens: "induction", reason: "The divergent framings predict different patterns: if commute burden dominates, departures should cluster by distance; if broken agreements dominate, by remote-hire status.", payloadIds: ["int-fd2", "int-fd3"] },
    { targetLens: "practical", reason: "Fairness judgments depend on whose burdens are real — carry the standpoint map into the option comparison.", payloadIds: ["int-fd1"] },
  ],
  extras: {
    lens: "interpretive",
    standpoints: [
      { nodeId: "int-s1", stakeholderName: "Executives", framing: "The office as restored cohesion and visible culture.", inquiryPrompt: "An executive in this position might experience the empty office as organizational drift; verify through direct conversation.", keyTerms: [{ term: "culture", meaning: "Visible co-presence; what the board can see." }] },
      { nodeId: "int-s2", stakeholderName: "Middle managers", framing: "A rule to enforce that they did not set, with team trust at stake.", inquiryPrompt: "A manager might experience each enforcement conversation as spending credibility; verify with managers directly.", keyTerms: [{ term: "attendance", meaning: "A compliance number they are judged on." }] },
      { nodeId: "int-s3", stakeholderName: "Remote-hired employees", framing: "A changed working agreement.", inquiryPrompt: "A remote hire might experience the mandate as a broken commitment regardless of its intent; verify through interviews or exit data.", keyTerms: [{ term: "hybrid", meaning: "Previously: a promise; now: a requirement." }] },
      { nodeId: "int-s4", stakeholderName: "Caregivers & long commuters", framing: "Loss of control over an already constrained day.", inquiryPrompt: "A caregiver might experience fixed days as removing their only slack; verify — do not assume.", keyTerms: [{ term: "flexibility", meaning: "The difference between manageable and unmanageable weeks." }] },
      { nodeId: "int-s5", stakeholderName: "Junior staff", framing: "Office time as access to learning — or as noise.", inquiryPrompt: "A junior employee might experience office days as their main source of mentoring, or as interruption without seniors present; verify which.", keyTerms: [{ term: "mentoring", meaning: "Unplanned access to seniors — only if seniors are there." }] },
    ],
    contestedMeanings: [
      {
        subject: "Low office attendance",
        readings: [
          { standpoint: "Managers", reading: "Resistance to the policy." },
          { standpoint: "Employees", reading: "Evidence that colleagues are elsewhere, so commuting is pointless." },
        ],
      },
      {
        subject: "\"Collaboration\"",
        readings: [
          { standpoint: "CEO", reading: "Spontaneous, in-person exchange." },
          { standpoint: "Delivery teams", reading: "Uninterrupted coordinated work, wherever it happens." },
        ],
      },
    ],
    missingVoices: [
      "Employees who already left (exit accounts).",
      "Staff with disabilities, for whom office days may carry distinct costs or benefits.",
      "Customers, if delivery changes reach them.",
    ],
    contextLayers: {
      immediate: "Six months of a three-day mandate; rising turnover; slower delivery; uneven attendance.",
      institutional: "Board expectation of visible office culture; three years of lease commitments; a product-group reorg in progress.",
      historical: "Two years of remote hiring and remote work routines preceding the mandate.",
    },
  },
};

const induction: LensAnalysis = {
  lens: "induction",
  guidingQuestion: "What pattern does the evidence support?",
  plainLanguageSummary:
    "The supplied evidence shows two aggregate shifts after the mandate — turnover up, delivery slower — plus uneven attendance and localized engagement drops. That supports 'something changed around the mandate period', but the sample has no breakdowns by commute, team, or tenure, so no one explanation's pattern can yet be confirmed.",
  diagram: {
    diagramType: "evidence_flow",
    nodes: [
      { id: "ind-o1", label: "Turnover 11% → 18%", nodeType: "observation", epistemicType: "user_fact", confidence: "high", traceRefs: ["of-f2"] },
      { id: "ind-o2", label: "Cycle time +22%", nodeType: "observation", epistemicType: "user_fact", confidence: "high", traceRefs: ["of-f3"] },
      { id: "ind-o3", label: "Attendance uneven across teams", nodeType: "observation", epistemicType: "user_fact", confidence: "high", traceRefs: ["of-f5"] },
      { id: "ind-o4", label: "Engagement down in two departments", nodeType: "observation", epistemicType: "user_fact", confidence: "high", traceRefs: ["of-f6"] },
      { id: "ind-o5", label: "Reorg began one quarter in", nodeType: "observation", epistemicType: "user_fact", confidence: "high", traceRefs: ["of-f7"] },
      { id: "ind-p1", label: "Pattern: deterioration concentrated after the mandate period", nodeType: "pattern", epistemicType: "model_inference", confidence: "medium", traceRefs: ["of-f2", "of-f3", "of-f6"] },
      { id: "ind-p2", label: "Pattern: effects are uneven, not uniform", nodeType: "pattern", epistemicType: "model_inference", confidence: "medium", detail: "Uneven attendance and department-specific engagement drops suggest the policy lands differently across teams.", traceRefs: ["of-f5", "of-f6"] },
      { id: "ind-x1", label: "Exception risk: the reorg overlaps the same window", nodeType: "exception", epistemicType: "model_inference", confidence: "medium", traceRefs: ["of-f7"] },
      { id: "ind-g1", label: "Bounded generalization: post-mandate deterioration is real but unattributed", nodeType: "generalization", epistemicType: "model_inference", confidence: "medium", traceRefs: ["of-f2", "of-f3", "of-f7"] },
    ],
    edges: [
      { id: "ind-e1", from: "ind-o1", to: "ind-p1", relation: "supports", traceRefs: [] },
      { id: "ind-e2", from: "ind-o2", to: "ind-p1", relation: "supports", traceRefs: [] },
      { id: "ind-e3", from: "ind-o4", to: "ind-p1", relation: "supports", traceRefs: [] },
      { id: "ind-e4", from: "ind-o3", to: "ind-p2", relation: "supports", traceRefs: [] },
      { id: "ind-e5", from: "ind-o4", to: "ind-p2", relation: "supports", traceRefs: [] },
      { id: "ind-e6", from: "ind-o5", to: "ind-x1", relation: "supports", traceRefs: [] },
      { id: "ind-e7", from: "ind-p1", to: "ind-g1", relation: "supports", traceRefs: [] },
      { id: "ind-e8", from: "ind-x1", to: "ind-g1", relation: "qualifies", label: "limits attribution", traceRefs: [] },
    ],
  },
  findings: [
    { id: "ind-fd1", statement: "Across the supplied observations, deterioration (turnover, cycle time, engagement) consistently appears after the mandate period.", epistemicType: "model_inference", confidence: "medium", confidenceRationale: "Three independent aggregate indicators point the same direction; none is broken down by group.", traceRefs: ["of-f2", "of-f3", "of-f6"] },
    { id: "ind-fd2", statement: "Effects are uneven across teams and departments, which is inconsistent with a single uniform cause operating equally everywhere.", epistemicType: "model_inference", confidence: "medium", confidenceRationale: "Uneven attendance and localized engagement drops both indicate heterogeneity.", traceRefs: ["of-f5", "of-f6"] },
    { id: "ind-fd3", statement: "No supplied observation distinguishes the mandate's effects from the reorg's — the pattern is real, the attribution is open.", epistemicType: "model_inference", confidence: "high", confidenceRationale: "The reorg overlaps the measurement window and no group-level comparison was supplied.", traceRefs: ["of-f7", "of-u2"] },
  ],
  challenges: [
    "Four aggregate numbers are a very thin base: seasonality, labor-market shifts, or one large team's exit could produce the same aggregates.",
    "Survivorship bias: engagement scores come from people who stayed. The signal from those who left is missing entirely.",
  ],
  missingEvidence: [
    "Turnover broken down by commute distance, remote-hire status, tenure, department, and manager.",
    "Cycle-time trend before the mandate (was it already rising?), and by team location-split.",
    "Comparable firms' turnover over the same period (labor-market baseline).",
  ],
  canEstablish: [
    "That the supplied indicators moved together after the mandate, with uneven incidence.",
    "Exactly which breakdowns would let a pattern discriminate between explanations.",
  ],
  cannotEstablish: [
    "Why any of it happened — pattern is not cause.",
    "That the pattern would hold in the breakdowns not yet collected.",
  ],
  nextQuestions: [
    "Does departure probability rise with commute distance?",
    "Are delivery delays concentrated in teams split across offices?",
    "Did turnover rise at comparable firms without mandates?",
  ],
  handoffs: [
    { targetLens: "abduction", reason: "The uneven-incidence pattern is the key explanandum: hypotheses should be scored on explaining who is affected, not just that averages moved.", payloadIds: ["ind-fd2"] },
    { targetLens: "causal", reason: "The reorg confound found here must appear explicitly in any causal model.", payloadIds: ["ind-fd3"] },
  ],
  extras: {
    lens: "induction",
    hasUserEvidence: true,
    generalization: {
      statement: "In this company, in the six months after the mandate, aggregate turnover, delivery time, and (locally) engagement deteriorated, with uneven incidence across teams.",
      scopeConditions: [
        "This company and period only — no cross-firm baseline supplied.",
        "Aggregate level only — group-level patterns unverified.",
        "Attribution to the mandate not included in the generalization.",
      ],
    },
    coverageGaps: [
      "No data on who left (the central missing breakdown).",
      "No pre-mandate trend lines for cycle time or engagement.",
      "No observations from employees who left.",
    ],
    biasQuestions: [
      "Could the engagement drop reflect who answers surveys rather than how people feel? (selection)",
      "Are the two affected departments the ones most touched by the reorg? (confounding)",
      "Is 11% → 18% large for this industry this year, or typical? (baseline)",
    ],
    evidenceMatrix: {
      columns: ["What it shows", "Broken down by group?", "Pre-mandate baseline?", "What it cannot show"],
      rows: [
        { observationId: "ind-o1", cells: ["Departures accelerated", "No", "Yes (11%)", "Who left, or why"] },
        { observationId: "ind-o2", cells: ["Delivery slowed", "No", "Point value only", "Whether the reorg or the mandate drove it"] },
        { observationId: "ind-o3", cells: ["Policy lands unevenly", "Partly (by team)", "No", "Whether unevenness is enforcement or conviction"] },
        { observationId: "ind-o4", cells: ["Localized morale effect", "Yes (2 departments)", "Implied", "How leavers felt (survivorship)"] },
        { observationId: "ind-o5", cells: ["A rival cause exists", "—", "—", "Its size relative to the mandate"] },
      ],
    },
  },
};

const abduction: LensAnalysis = {
  lens: "abduction",
  guidingQuestion: "What explanation best accounts for the rise in turnover and the slower delivery?",
  plainLanguageSummary:
    "Five candidate explanations are live. The strongest current account is a two-mechanism story: commute burden drives departures while lost coordination routines slow delivery — because one universal cause poorly explains the uneven incidence. The reorg and job market remain serious rivals that the current evidence cannot exclude.",
  diagram: {
    diagramType: "hypothesis_tree",
    nodes: [
      { id: "abd-obs", label: "Observed: turnover up, delivery slower, unevenly", nodeType: "observation", epistemicType: "user_fact", confidence: "high", traceRefs: ["of-f2", "of-f3", "of-f5"] },
      { id: "abd-h1", label: "H1: Commute burden pushed people out", nodeType: "hypothesis", epistemicType: "model_inference", confidence: "medium", traceRefs: ["of-c3"] },
      { id: "abd-h2", label: "H2: Teams lost remote routines without gaining in-person coordination", nodeType: "hypothesis", epistemicType: "model_inference", confidence: "medium", traceRefs: ["of-f5"] },
      { id: "abd-h3", label: "H3: Inconsistent enforcement bred distrust", nodeType: "hypothesis", epistemicType: "model_inference", confidence: "low", traceRefs: ["of-u4", "of-f5"] },
      { id: "abd-h4", label: "H4: The reorg caused both delay and departures", nodeType: "hypothesis", epistemicType: "model_inference", confidence: "medium", traceRefs: ["of-f7"] },
      { id: "abd-h5", label: "H5: A hot job market made leaving easier", nodeType: "hypothesis", epistemicType: "model_inference", confidence: "low", traceRefs: ["of-c4"] },
      { id: "abd-h6", label: "H6 (combined): two mechanisms — commutes drive exits, lost routines drive delay", nodeType: "hypothesis", epistemicType: "model_inference", confidence: "medium", traceRefs: ["of-c3", "of-f5"] },
      { id: "abd-t1", label: "Discriminator: does departure risk rise with commute distance?", nodeType: "test", epistemicType: "model_inference", confidence: "not_applicable", traceRefs: ["of-u1"] },
      { id: "abd-t2", label: "Discriminator: are delays concentrated in teams split across offices?", nodeType: "test", epistemicType: "model_inference", confidence: "not_applicable", traceRefs: ["of-u3"] },
      { id: "abd-t3", label: "Discriminator: compare affected vs. unaffected-by-reorg teams", nodeType: "test", epistemicType: "model_inference", confidence: "not_applicable", traceRefs: ["of-f7"] },
    ],
    edges: [
      { id: "abd-e1", from: "abd-h1", to: "abd-obs", relation: "explains", label: "turnover, partly", traceRefs: [] },
      { id: "abd-e2", from: "abd-h2", to: "abd-obs", relation: "explains", label: "delay, partly", traceRefs: [] },
      { id: "abd-e3", from: "abd-h3", to: "abd-obs", relation: "explains", label: "weakly", traceRefs: [] },
      { id: "abd-e4", from: "abd-h4", to: "abd-obs", relation: "explains", label: "both, if timing fits", traceRefs: [] },
      { id: "abd-e5", from: "abd-h5", to: "abd-obs", relation: "explains", label: "turnover only", traceRefs: [] },
      { id: "abd-e6", from: "abd-h6", to: "abd-obs", relation: "explains", label: "uneven incidence", traceRefs: [] },
      { id: "abd-e7", from: "abd-t1", to: "abd-h1", relation: "tests", traceRefs: [] },
      { id: "abd-e8", from: "abd-t2", to: "abd-h2", relation: "tests", traceRefs: [] },
      { id: "abd-e9", from: "abd-t3", to: "abd-h4", relation: "tests", traceRefs: [] },
    ],
  },
  findings: [
    { id: "abd-fd1", statement: "The combined two-mechanism explanation (H6) currently accounts for the most observations with the fewest strained assumptions, chiefly because it predicts uneven incidence.", epistemicType: "model_inference", confidence: "medium", confidenceRationale: "Ranking rests on explanatory fit to four aggregate observations; no discriminating data yet.", traceRefs: ["of-f2", "of-f3", "of-f5"] },
    { id: "abd-fd2", statement: "H4 (reorg) is the strongest rival: it explains both outcomes with one cause and the right timing, and nothing supplied rules it out.", epistemicType: "model_inference", confidence: "medium", confidenceRationale: "Overlapping timing is confirmed; relative magnitude unknown.", traceRefs: ["of-f7"] },
    { id: "abd-fd3", statement: "Several hypotheses can be true together — this is a decomposition problem, not a single-winner contest.", epistemicType: "model_inference", confidence: "high", confidenceRationale: "The mechanisms operate on different outcomes and populations.", traceRefs: [] },
  ],
  challenges: [
    "Ranking by 'explains uneven incidence' leans on one observation (of-f5) that itself has no breakdown behind it — if attendance unevenness is mismeasured, the ranking flips.",
    "All six hypotheses were generated from the user's own suspected causes; a cause nobody suspected (e.g. a pay-band change) would be invisible here.",
  ],
  missingEvidence: [
    "Exit-interview themes coded by commute, remote-hire status, and team.",
    "Delivery-delay decomposition: which stage of the cycle lengthened?",
    "Industry turnover benchmark for the same two quarters.",
  ],
  canEstablish: [
    "A ranked field of explanations and what each predicts.",
    "The single most informative next observation (commute-distance gradient).",
    "That the explanations are largely compatible, which changes the decision from 'pick the cause' to 'size the contributions'.",
  ],
  cannotEstablish: [
    "That the leading explanation is true — it is the best current story, not proof.",
    "Effect sizes; abduction ranks stories, it does not measure them.",
  ],
  nextQuestions: [
    "If commute distance does not predict departures, which hypothesis gains the most? (H4)",
    "What would each hypothesis predict about the two low-engagement departments?",
  ],
  handoffs: [
    { targetLens: "deduction", reason: "Spell out what each leading hypothesis strictly implies, so predictions can be checked rather than vibes compared.", payloadIds: ["abd-fd1", "abd-fd2"] },
    { targetLens: "causal", reason: "H6 and H4 need an intervention design that can separate them — they are the two arms the causal test must discriminate.", payloadIds: ["abd-fd1", "abd-fd2"] },
  ],
  extras: {
    lens: "abduction",
    hypotheses: [
      {
        nodeId: "abd-h1", label: "Commute burden pushed people out",
        explains: ["Turnover rise", "Plausibly uneven incidence (distance varies)"],
        failsToExplain: ["Why delivery slowed (commuters who stay still work)"],
        assumptionsRequired: ["Departures concentrate among long commuters"],
        predictions: ["Departure probability rises with commute distance", "Exit interviews cite commuting"],
        disconfirmedBy: ["Flat commute–departure gradient"],
        discriminatingTest: "Cross departures with commute distance and remote-hire status.",
        plausibility: "medium", plausibilityRationale: "Directly asserted by managers but untested.",
        compatibleWith: ["abd-h2", "abd-h4", "abd-h5"],
      },
      {
        nodeId: "abd-h2", label: "Lost remote routines without gaining in-person coordination",
        explains: ["Cycle-time increase", "Pointless-commute resentment if days are uncoordinated"],
        failsToExplain: ["Turnover magnitude on its own"],
        assumptionsRequired: ["Office days are largely uncoordinated (consistent with of-f5)"],
        predictions: ["Delays concentrate in teams split across offices or with uncoordinated days"],
        disconfirmedBy: ["Delays uniform across co-located and split teams"],
        discriminatingTest: "Compare cycle time between teams with coordinated vs. uncoordinated office days.",
        plausibility: "medium", plausibilityRationale: "Fits uneven attendance; mechanism specific to delivery.",
        compatibleWith: ["abd-h1", "abd-h3", "abd-h4"],
      },
      {
        nodeId: "abd-h3", label: "Inconsistent enforcement bred distrust",
        explains: ["Engagement drop in specific departments"],
        failsToExplain: ["Cycle time directly"],
        assumptionsRequired: ["Enforcement actually varies by manager (of-u4, unverified)"],
        predictions: ["Engagement drop correlates with enforcement style, not with commute"],
        disconfirmedBy: ["Uniform enforcement found in audit"],
        discriminatingTest: "Map enforcement practice by team against engagement deltas.",
        plausibility: "low", plausibilityRationale: "Mechanism plausible but no direct evidence supplied.",
        compatibleWith: ["abd-h1", "abd-h2"],
      },
      {
        nodeId: "abd-h4", label: "The reorg caused both delay and departures",
        explains: ["Both headline outcomes with one cause, right timing"],
        failsToExplain: ["Unevenness tied to attendance patterns, if that holds up"],
        assumptionsRequired: ["Reorg disruption reached beyond the product group"],
        predictions: ["Effects concentrate in reorged teams; non-reorged teams look flat"],
        disconfirmedBy: ["Equal deterioration in untouched teams"],
        discriminatingTest: "Difference-in-differences: reorged vs. non-reorged teams, before/after.",
        plausibility: "medium", plausibilityRationale: "Timing fits; scope unknown.",
        compatibleWith: ["abd-h1", "abd-h2", "abd-h5"],
      },
      {
        nodeId: "abd-h5", label: "A hot job market made leaving easier",
        explains: ["Turnover rise (as an enabler, lowering the exit threshold)"],
        failsToExplain: ["Delivery slowdown", "Department-specific engagement drops"],
        assumptionsRequired: ["Market actually tightened for these roles (of-c4 unverified)"],
        predictions: ["Comparable firms show rising turnover too"],
        disconfirmedBy: ["Flat industry benchmark"],
        discriminatingTest: "Benchmark turnover against comparable firms, same quarters.",
        plausibility: "low", plausibilityRationale: "An amplifier more than a cause; explains the least alone.",
        compatibleWith: ["abd-h1", "abd-h4"],
      },
      {
        nodeId: "abd-h6", label: "Two mechanisms: commutes drive exits; lost routines drive delay",
        explains: ["Both outcomes and their uneven incidence"],
        failsToExplain: ["Nothing major — but it has more moving parts to verify"],
        assumptionsRequired: ["Each component mechanism holds in its own domain"],
        predictions: ["Commute gradient in departures AND split-team concentration in delays, simultaneously"],
        disconfirmedBy: ["Either component prediction failing"],
        discriminatingTest: "Run abd-t1 and abd-t2 together; H6 requires both to come back positive.",
        plausibility: "medium", plausibilityRationale: "Best current fit, bought at the price of complexity.",
        compatibleWith: ["abd-h4", "abd-h5"],
      },
    ],
  },
};

const deduction: LensAnalysis = {
  lens: "deduction",
  guidingQuestion: "Does 'we should repeal it' follow from the stated premises?",
  plainLanguageSummary:
    "The COO's argument is valid only after its hidden premises are added — and then its weight shifts entirely onto two doubtful premises: that the policy causes net harm, and that harm requires repeal rather than revision. The structure is fine; the premises are where the argument lives or dies.",
  diagram: {
    diagramType: "argument_map",
    nodes: [
      { id: "ded-p1", label: "P1: If the policy causes net harm, the company should repeal it", nodeType: "premise", epistemicType: "assumption", confidence: "low", detail: "Normative bridge premise. 'Net harm' is undefined, and the premise ignores revision as an alternative to repeal.", traceRefs: ["of-c1"] },
      { id: "ded-p2", label: "P2: The policy causes net harm", nodeType: "premise", epistemicType: "user_claim", confidence: "low", detail: "Empirical premise. Rests on post-hoc timing; the causal lens owns its verification.", traceRefs: ["of-c1", "of-a1"] },
      { id: "ded-hp1", label: "Hidden: 'net harm' = the observed turnover + delay, on balance", nodeType: "hidden_premise", epistemicType: "assumption", confidence: "low", detail: "Requires weighing harms against unmeasured benefits (collaboration, culture) — a value judgment smuggled in as accounting.", traceRefs: ["of-f2", "of-f3", "of-v3"] },
      { id: "ded-hp2", label: "Hidden: no revision would preserve benefits while reducing harm", nodeType: "hidden_premise", epistemicType: "assumption", confidence: "low", detail: "If a revision (e.g. coordinated days) could fix the harm, repeal does not follow even from net harm.", traceRefs: ["of-o2", "of-o3"] },
      { id: "ded-c1", label: "C: The company should repeal the mandate", nodeType: "conclusion", epistemicType: "user_claim", confidence: "low", traceRefs: ["of-c1"] },
      { id: "ded-alt", label: "Refined argument: substantial avoidable harm + a benefit-preserving revision ⇒ revise rather than retain unchanged", nodeType: "inference", epistemicType: "model_inference", confidence: "medium", detail: "A sounder structure: it survives the counterexample that revision beats repeal.", traceRefs: ["of-o3"] },
    ],
    edges: [
      { id: "ded-e1", from: "ded-p1", to: "ded-c1", relation: "supports", traceRefs: [] },
      { id: "ded-e2", from: "ded-p2", to: "ded-c1", relation: "supports", traceRefs: [] },
      { id: "ded-e3", from: "ded-hp1", to: "ded-p2", relation: "supports", label: "defines its terms", traceRefs: [] },
      { id: "ded-e4", from: "ded-hp2", to: "ded-p1", relation: "supports", label: "props up 'repeal'", traceRefs: [] },
      { id: "ded-e5", from: "ded-alt", to: "ded-c1", relation: "contradicts", label: "undercuts repeal-only", traceRefs: [] },
    ],
  },
  findings: [
    { id: "ded-fd1", statement: "With P1 and P2 granted, the argument is valid (modus ponens): accepting both premises commits you to repeal.", epistemicType: "model_inference", confidence: "high", confidenceRationale: "Structural property of the mapped argument; independent of premise truth.", traceRefs: ["of-c1"] },
    { id: "ded-fd2", statement: "Validity transfers nothing to the conclusion unless both premises are true — and P2 is exactly what the causal lens has not yet established.", epistemicType: "model_inference", confidence: "high", confidenceRationale: "Validity/soundness distinction; P2's support is post-hoc timing only.", traceRefs: ["of-a1"] },
    { id: "ded-fd3", statement: "P1 fails a counterexample test: if revising would preserve benefits while removing harm, net harm would be true and repeal still wrong.", epistemicType: "model_inference", confidence: "high", confidenceRationale: "The counterexample is constructible from the user's own options list.", traceRefs: ["of-o2", "of-o3"] },
  ],
  challenges: [
    "The mapping itself is contestable: the COO might intend 'repeal' loosely, to mean 'substantially change', in which case the hidden-premise critique attacks a strawman.",
    "Treating P1's weighing of harms as a 'hidden premise' already takes a side — a strict consequentialist would call it a definition, not an assumption.",
  ],
  missingEvidence: [
    "A stated definition of 'net harm' from the people making the argument.",
    "The causal lens's verdict on P2.",
  ],
  canEstablish: [
    "That the repeal argument is an enthymeme whose force depends on two suppressed premises.",
    "Exactly which premise each piece of future evidence would strengthen or sink.",
    "A refined argument structure that survives the revision counterexample.",
  ],
  cannotEstablish: [
    "Whether P2 (the policy causes net harm) is true — no amount of logic settles an empirical premise.",
    "Whether repeal is the right decision; that requires the practical lens even if the argument were sound.",
  ],
  nextQuestions: [
    "What would the COO accept as a definition of net harm — and would the CEO accept the same one?",
    "Could all premises be true under a definition of harm that excludes collaboration losses, and false under one that includes them?",
  ],
  handoffs: [
    { targetLens: "causal", reason: "P2 is an empirical causal claim; deduction can only hand it over for testing.", payloadIds: ["ded-p2"] },
    { targetLens: "practical", reason: "P1 is a decision rule in disguise — the practical lens should examine what it hides.", payloadIds: ["ded-p1", "ded-hp1"] },
  ],
  extras: {
    lens: "deduction",
    validityStatus: "valid",
    validityNote:
      "As mapped (modus ponens with the hidden premises made explicit), the structure is valid: true premises would guarantee the conclusion. Without the hidden premises, the everyday argument is an enthymeme — persuasive but incomplete.",
    premisesTrueConclusionFalse:
      "If only P1 and P2 are granted as stated: no — that is what validity means. But under the everyday reading, yes: all stated premises could hold while revision (not repeal) is the right act, because 'net harm' could be real yet fixable. The conclusion's safety depends on hidden premise HP2.",
  },
};

const causal: LensAnalysis = {
  lens: "causal",
  guidingQuestion: "What would turnover and delivery look like if the mandate were changed, compared with leaving it alone?",
  plainLanguageSummary:
    "The observed changes are associations, not yet causal findings: the reorg and job market could each produce the same signature. Because full randomization is off the table, the strongest feasible design is a phased team-level comparison — some teams keep three days, matched teams move to two coordinated days — with outcomes defined before the switch.",
  diagram: {
    diagramType: "causal_graph",
    nodes: [
      { id: "cau-mandate", label: "Three-day mandate", nodeType: "intervention", epistemicType: "user_fact", confidence: "high", traceRefs: ["of-f1"] },
      { id: "cau-commute", label: "Commute burden", nodeType: "mediator", epistemicType: "model_inference", confidence: "medium", traceRefs: ["of-c3"] },
      { id: "cau-coord", label: "Coordination of in-person time", nodeType: "moderator", epistemicType: "model_inference", confidence: "medium", detail: "Moderates whether office days help or just cost: uncoordinated days = commuting to video calls.", traceRefs: ["of-f5"] },
      { id: "cau-trust", label: "Perceived trust / autonomy", nodeType: "mediator", epistemicType: "model_inference", confidence: "low", traceRefs: ["of-v5"] },
      { id: "cau-turnover", label: "Voluntary turnover", nodeType: "outcome", epistemicType: "user_fact", confidence: "high", traceRefs: ["of-f2"] },
      { id: "cau-delivery", label: "Delivery cycle time", nodeType: "outcome", epistemicType: "user_fact", confidence: "high", traceRefs: ["of-f3"] },
      { id: "cau-reorg", label: "Reorganization", nodeType: "confounder", epistemicType: "user_fact", confidence: "high", detail: "Began one quarter in; could independently drive both outcomes.", traceRefs: ["of-f7"] },
      { id: "cau-market", label: "External job market", nodeType: "confounder", epistemicType: "user_claim", confidence: "low", traceRefs: ["of-c4"] },
    ],
    edges: [
      { id: "cau-e1", from: "cau-mandate", to: "cau-commute", relation: "causes", polarity: "positive", certainty: "high", traceRefs: [] },
      { id: "cau-e2", from: "cau-commute", to: "cau-turnover", relation: "causal_hypothesis", polarity: "positive", certainty: "low", label: "H1, untested", traceRefs: ["of-c3"] },
      { id: "cau-e3", from: "cau-mandate", to: "cau-trust", relation: "causal_hypothesis", polarity: "negative", certainty: "low", traceRefs: [] },
      { id: "cau-e4", from: "cau-trust", to: "cau-turnover", relation: "causal_hypothesis", polarity: "negative", certainty: "low", traceRefs: [] },
      { id: "cau-e5", from: "cau-mandate", to: "cau-delivery", relation: "association", certainty: "low", label: "observed timing only", traceRefs: ["of-f3"] },
      { id: "cau-e6", from: "cau-coord", to: "cau-delivery", relation: "causal_hypothesis", polarity: "negative", certainty: "low", label: "moderates the mandate's effect", traceRefs: [] },
      { id: "cau-e7", from: "cau-reorg", to: "cau-delivery", relation: "causal_hypothesis", polarity: "positive", certainty: "medium", label: "rival cause", traceRefs: ["of-f7"] },
      { id: "cau-e8", from: "cau-reorg", to: "cau-turnover", relation: "causal_hypothesis", polarity: "positive", certainty: "low", traceRefs: ["of-f7"] },
      { id: "cau-e9", from: "cau-market", to: "cau-turnover", relation: "causal_hypothesis", polarity: "positive", certainty: "low", traceRefs: ["of-c4"] },
    ],
  },
  findings: [
    { id: "cau-fd1", statement: "Nothing supplied identifies a causal effect of the mandate on either outcome: the evidence is 'after', not yet 'because'.", epistemicType: "model_inference", confidence: "high", confidenceRationale: "Two credible confounders (reorg, market) sit on both paths and no comparison controls for them.", traceRefs: ["of-f7", "of-c4"] },
    { id: "cau-fd2", statement: "The decision-relevant quantity is the counterfactual difference — turnover and delivery under a changed policy vs. unchanged — and it is currently unknown, not merely imprecise.", epistemicType: "model_inference", confidence: "high", confidenceRationale: "No comparison group exists yet; the counterfactual is unobserved by definition.", traceRefs: ["of-u2"] },
    { id: "cau-fd3", statement: "A phased team-level comparison with pre-registered outcomes is feasible within the stated constraints and would bound the mandate's contribution.", epistemicType: "model_inference", confidence: "medium", confidenceRationale: "Quasi-experimental designs fit the no-full-randomization constraint; weaker than an RCT but informative.", traceRefs: ["of-k3"] },
  ],
  challenges: [
    "Team-level assignment invites selection: teams that volunteer for two coordinated days may differ exactly in the ways that matter (morale, manager quality).",
    "Six months of post-period data may be too short for turnover effects that operate with delay (people leave after finding a job, not when annoyed).",
  ],
  missingEvidence: [
    "Pre-mandate trends for both outcomes (to rule out pre-existing drift).",
    "Reorg exposure by team (to separate the rival cause).",
    "Industry turnover benchmark (to size the market confounder).",
  ],
  canEstablish: [
    "The causal structure under debate, with confounders and the moderator explicit.",
    "A feasible, ethical test that would discriminate the mandate's contribution from the reorg's.",
    "The difference between what is observed (association) and what is claimed (causation).",
  ],
  cannotEstablish: [
    "The counterfactual itself — only a designed comparison can estimate it.",
    "Whether changing the policy is right, even if the effect were identified.",
  ],
  nextQuestions: [
    "Which teams are untouched by the reorg and could anchor a clean comparison?",
    "What effect size would actually change the decision — and can the design detect it?",
  ],
  handoffs: [
    { targetLens: "systems", reason: "Feedback (attrition → workload → attrition) was deliberately excluded from this simplified graph; the systems lens should model it.", payloadIds: ["cau-fd2"] },
    { targetLens: "practical", reason: "The test plan has costs and fairness implications (who gets which arm) that need deliberation.", payloadIds: ["cau-fd3"] },
  ],
  extras: {
    lens: "causal",
    interventionNodeId: "cau-mandate",
    outcomeNodeIds: ["cau-turnover", "cau-delivery"],
    counterfactual: {
      intervention: "Move matched teams to two coordinated office days for six months; hold comparison teams at three fixed days.",
      observedWorld: "Three fixed days everywhere: turnover 18% annualized, cycle time +22%, with reorg and market effects mixed in.",
      interventionWorld: "Not observed. The design estimates it: outcome paths of switched teams vs. matched holdouts, with reorg exposure recorded per team.",
      caveats: [
        "Team self-selection into arms can mimic a policy effect.",
        "Spillovers (people compare themselves across teams) can contaminate the comparison.",
        "Short horizon may miss delayed turnover effects.",
      ],
    },
    testPlan: [
      "Define outcomes now: voluntary departures, time-to-fill, cycle time by stage, engagement, and stated turnover intent.",
      "Match teams on size, function, commute mix, and reorg exposure; switch half to two coordinated days.",
      "Record enforcement and actual attendance in both arms (the treatment is attendance, not the memo).",
      "Pre-commit the analysis: difference-in-differences with reorg exposure as a covariate.",
      "Review at six months against thresholds agreed in advance.",
    ],
  },
};

const systems: LensAnalysis = {
  lens: "systems",
  guidingQuestion: "What happens across the wider organizational system over time?",
  plainLanguageSummary:
    "Four loops plausibly surround the mandate: an attrition spiral, a trust spiral, a mentoring loop, and a coordination loop whose collapse makes office days pointless. If these loops operate, adjusting 'three' to 'two' is weak leverage; redesigning coordination rules and feedback channels is stronger. This is a qualitative map — every loop is a hypothesis, not a measurement.",
  diagram: {
    diagramType: "causal_loop",
    nodes: [
      { id: "sys-dep", label: "Departures", nodeType: "loop_node", epistemicType: "user_fact", confidence: "high", traceRefs: ["of-f2"] },
      { id: "sys-wkld", label: "Workload on remaining staff", nodeType: "loop_node", epistemicType: "model_inference", confidence: "medium", traceRefs: [] },
      { id: "sys-burn", label: "Burnout", nodeType: "loop_node", epistemicType: "model_inference", confidence: "low", traceRefs: [] },
      { id: "sys-mand", label: "Mandate strictness", nodeType: "loop_node", epistemicType: "user_fact", confidence: "high", traceRefs: ["of-f1"] },
      { id: "sys-trust", label: "Perceived trust", nodeType: "loop_node", epistemicType: "model_inference", confidence: "low", traceRefs: ["of-v5"] },
      { id: "sys-eng", label: "Engagement & discretionary effort", nodeType: "loop_node", epistemicType: "user_fact", confidence: "medium", traceRefs: ["of-f6"] },
      { id: "sys-ctl", label: "Leadership urge to control", nodeType: "loop_node", epistemicType: "model_inference", confidence: "low", traceRefs: [] },
      { id: "sys-att", label: "Attendance on any given day", nodeType: "loop_node", epistemicType: "user_fact", confidence: "high", traceRefs: ["of-f5"] },
      { id: "sys-val", label: "Value of showing up", nodeType: "loop_node", epistemicType: "model_inference", confidence: "medium", traceRefs: [] },
      { id: "sys-ment", label: "Mentoring & onboarding quality", nodeType: "loop_node", epistemicType: "model_inference", confidence: "low", traceRefs: ["of-s5"] },
      { id: "sys-sr", label: "Senior staff capacity", nodeType: "stock", epistemicType: "model_inference", confidence: "medium", detail: "An accumulation: drains with each senior departure, refills slowly.", traceRefs: [] },
    ],
    edges: [
      { id: "sys-e1", from: "sys-dep", to: "sys-wkld", relation: "causes", polarity: "positive", certainty: "medium", traceRefs: [] },
      { id: "sys-e2", from: "sys-wkld", to: "sys-burn", relation: "causes", polarity: "positive", certainty: "medium", traceRefs: [] },
      { id: "sys-e3", from: "sys-burn", to: "sys-dep", relation: "causes", polarity: "positive", certainty: "medium", delayed: true, traceRefs: [] },
      { id: "sys-e4", from: "sys-mand", to: "sys-trust", relation: "causes", polarity: "negative", certainty: "low", traceRefs: [] },
      { id: "sys-e5", from: "sys-trust", to: "sys-eng", relation: "causes", polarity: "positive", certainty: "low", traceRefs: [] },
      { id: "sys-e6", from: "sys-eng", to: "sys-ctl", relation: "causes", polarity: "negative", certainty: "low", traceRefs: [] },
      { id: "sys-e7", from: "sys-ctl", to: "sys-mand", relation: "causes", polarity: "positive", certainty: "low", delayed: true, traceRefs: [] },
      { id: "sys-e8", from: "sys-att", to: "sys-val", relation: "causes", polarity: "positive", certainty: "medium", traceRefs: [] },
      { id: "sys-e9", from: "sys-val", to: "sys-att", relation: "causes", polarity: "positive", certainty: "medium", delayed: true, detail: "Low attendance → low value of attending → lower attendance: a reinforcing decay.", traceRefs: ["of-f5"] },
      { id: "sys-e10", from: "sys-dep", to: "sys-sr", relation: "causes", polarity: "negative", certainty: "medium", traceRefs: [] },
      { id: "sys-e11", from: "sys-sr", to: "sys-ment", relation: "causes", polarity: "positive", certainty: "medium", traceRefs: [] },
      { id: "sys-e12", from: "sys-ment", to: "sys-wkld", relation: "causes", polarity: "negative", certainty: "low", delayed: true, label: "weak onboarding raises load later", traceRefs: [] },
    ],
  },
  findings: [
    { id: "sys-fd1", statement: "If the attrition loop (R1) is running, turnover becomes self-sustaining and will not fully respond to policy changes alone.", epistemicType: "model_inference", confidence: "low", confidenceRationale: "Loop is structurally plausible; no workload or burnout data supplied to confirm it is active.", traceRefs: ["of-f2"] },
    { id: "sys-fd2", statement: "The coordination loop (R3) implies a tipping dynamic: below some attendance level, office days lose their point for everyone — which would make uneven attendance self-deepening.", epistemicType: "model_inference", confidence: "medium", confidenceRationale: "Directly consistent with uneven attendance (of-f5) and the 'commuting to video calls' pattern.", traceRefs: ["of-f5"] },
    { id: "sys-fd3", statement: "The highest-leverage candidates are coordination rules and feedback channels (information and rules), not the number of mandated days (a parameter).", epistemicType: "model_inference", confidence: "medium", confidenceRationale: "Follows Meadows's leverage hierarchy: parameters are weak leverage; rules and information flows are stronger.", traceRefs: [] },
  ],
  challenges: [
    "This map could be drawn for almost any company — nothing in it is yet measured here. An impressive diagram is not evidence that any loop dominates.",
    "The boundary excludes customers, finance, and the labor market; a boundary that included them might relocate the problem entirely.",
  ],
  missingEvidence: [
    "Workload and burnout indicators over time (R1).",
    "Attendance time series per team (R3's tipping signature).",
    "Mentoring/onboarding metrics (R4).",
  ],
  canEstablish: [
    "Which feedback structures would amplify or absorb any policy change.",
    "Where unintended consequences would surface first (onboarding, senior load).",
    "Why parameter-tweaking (3 days → 2) may underperform rule redesign.",
  ],
  cannotEstablish: [
    "Quantitative trajectories — no parameters were supplied and none were invented.",
    "That any loop is actually operating; each is a hypothesis to check against the missing time series.",
  ],
  nextQuestions: [
    "Is attendance decaying over time within teams (R3's signature), or stably uneven?",
    "Are senior staff disproportionately represented among leavers (R4's trigger)?",
  ],
  handoffs: [
    { targetLens: "causal", reason: "The loops imply that the simple intervention estimate will drift over time — the test design should measure at multiple horizons.", payloadIds: ["sys-fd1", "sys-fd2"] },
    { targetLens: "practical", reason: "If leverage lies in coordination rules rather than day counts, the option set itself should be reframed.", payloadIds: ["sys-fd3"] },
  ],
  extras: {
    lens: "systems",
    loops: [
      { id: "R1", type: "R", label: "Attrition spiral", nodeIds: ["sys-dep", "sys-wkld", "sys-burn"], story: "Departures raise workload on those who stay; sustained workload produces burnout; burnout produces more departures — after a delay, which hides the loop from quarterly reviews." },
      { id: "R2", type: "R", label: "Trust–control spiral", nodeIds: ["sys-mand", "sys-trust", "sys-eng", "sys-ctl"], story: "A uniform mandate reads as distrust; lower trust reduces engagement; leaders read falling engagement as confirmation that control is needed; control tightens." },
      { id: "R3", type: "R", label: "Coordination decay", nodeIds: ["sys-att", "sys-val"], story: "When days are uncoordinated, each person who skips lowers the value of everyone else's attendance, so more skip — a reinforcing decay toward empty-but-mandated offices." },
      { id: "R4", type: "R", label: "Mentoring erosion", nodeIds: ["sys-dep", "sys-sr", "sys-ment", "sys-wkld"], story: "Senior departures drain the mentoring stock; weaker onboarding slows new hires; slower ramp raises senior workload; loaded seniors become the next leavers." },
    ],
    boundary: {
      included: ["Policy, attendance, trust, workload, mentoring, delivery, turnover"],
      excluded: ["Customer outcomes", "Compensation structure", "Real-estate finance", "Labor-market dynamics (held at the causal lens)"],
      rationale: "Drawn around what leadership can directly influence this quarter. Note what this hides: if compensation is the real driver, this map cannot see it.",
    },
    leveragePoints: [
      { label: "Coordination rules (who is in, together, for what)", description: "Changes the value of every office day without changing the count — attacks R3 directly.", caution: "Requires real team-level authority, or it becomes another mandate." },
      { label: "Feedback channels that leadership actually reads", description: "Shortens the delay that keeps R1 and R2 invisible until they are expensive.", caution: "Channels without visible response teach people to stop reporting." },
      { label: "Onboarding/mentoring design", description: "Buffers R4 against senior departures.", caution: "Slow-acting; will not move this quarter's numbers." },
      { label: "The day count itself", description: "The most discussed lever and likely the weakest: a parameter inside unchanged structure.", caution: "Changing it may still be symbolically important (see interpretive lens)." },
    ],
    horizons: {
      short: "0–3 months: attendance and sentiment respond to any announcement; loops barely move.",
      medium: "3–12 months: R3 (coordination) and R2 (trust) dominate observable change.",
      long: "12–24 months: R1 (attrition) and R4 (mentoring) determine whether the organization compounds or decays.",
    },
  },
};

const practical: LensAnalysis = {
  lens: "practical",
  guidingQuestion: "What should the company do, given its goals, constraints, and obligations?",
  plainLanguageSummary:
    "Four options sit in a landscape shaped by five declared values and three hard constraints. The team-designed pilot scores best on reversibility and voice and respects the board constraint, but costs more to run and defers the decision. The real tensions — honoring remote-hire commitments vs. a uniform culture, efficiency vs. fairness of burden — cannot be reduced to one metric, and no option escapes them.",
  diagram: {
    diagramType: "decision_landscape",
    nodes: [
      { id: "pra-o1", label: "Keep as is", nodeType: "option", epistemicType: "user_claim", confidence: "not_applicable", traceRefs: ["of-o1"] },
      { id: "pra-o2", label: "Two coordinated days", nodeType: "option", epistemicType: "user_claim", confidence: "not_applicable", traceRefs: ["of-o2"] },
      { id: "pra-o3", label: "Team-designed pilot", nodeType: "option", epistemicType: "user_claim", confidence: "not_applicable", traceRefs: ["of-o3"] },
      { id: "pra-o4", label: "Repeal — remote-first", nodeType: "option", epistemicType: "user_claim", confidence: "not_applicable", traceRefs: ["of-o4"] },
      { id: "pra-g1", label: "Retention", nodeType: "goal", epistemicType: "value_judgment", confidence: "not_applicable", traceRefs: ["of-v1"] },
      { id: "pra-g2", label: "Delivery", nodeType: "goal", epistemicType: "value_judgment", confidence: "not_applicable", traceRefs: ["of-v2"] },
      { id: "pra-g3", label: "Collaboration", nodeType: "goal", epistemicType: "value_judgment", confidence: "not_applicable", traceRefs: ["of-v3"] },
      { id: "pra-g4", label: "Fairness", nodeType: "goal", epistemicType: "value_judgment", confidence: "not_applicable", traceRefs: ["of-v4"] },
      { id: "pra-g5", label: "Trust & autonomy", nodeType: "goal", epistemicType: "value_judgment", confidence: "not_applicable", traceRefs: ["of-v5"] },
      { id: "pra-k1", label: "Board expects office culture", nodeType: "constraint", epistemicType: "user_fact", confidence: "high", traceRefs: ["of-k2"] },
      { id: "pra-t1", label: "Tension: uniform culture vs. honoring remote-hire terms", nodeType: "tension", epistemicType: "value_judgment", confidence: "not_applicable", detail: "No weighting scheme dissolves this: it is a conflict between a collective aim and individual commitments.", traceRefs: ["of-f4", "of-k2"] },
      { id: "pra-t2", label: "Tension: efficient policy vs. unequal burden", nodeType: "tension", epistemicType: "value_judgment", confidence: "not_applicable", detail: "A policy can raise average output while concentrating its costs on caregivers and long commuters.", traceRefs: ["of-v4", "of-s4"] },
    ],
    edges: [
      { id: "pra-e1", from: "pra-o1", to: "pra-k1", relation: "satisfies", traceRefs: [] },
      { id: "pra-e2", from: "pra-o4", to: "pra-k1", relation: "conflicts", label: "board constraint", traceRefs: [] },
      { id: "pra-e3", from: "pra-o1", to: "pra-t2", relation: "raises", traceRefs: [] },
      { id: "pra-e4", from: "pra-o4", to: "pra-t1", relation: "raises", label: "inverts it", traceRefs: [] },
      { id: "pra-e5", from: "pra-o3", to: "pra-g5", relation: "supports", label: "voice", traceRefs: [] },
      { id: "pra-e6", from: "pra-o2", to: "pra-g2", relation: "supports", label: "if coordination holds", traceRefs: [] },
      { id: "pra-e7", from: "pra-o3", to: "pra-g4", relation: "supports", label: "with standards", traceRefs: [] },
    ],
  },
  findings: [
    { id: "pra-fd1", statement: "The pilot (of-o3) is the only option that is simultaneously reversible, evidence-generating, and compatible with the board constraint — at the cost of management effort and a deferred decision.", epistemicType: "model_inference", confidence: "medium", confidenceRationale: "Follows from the options' structure against stated constraints; assumes teams can actually exercise the authority it grants.", traceRefs: ["of-o3", "of-k2", "of-k3"] },
    { id: "pra-fd2", statement: "Whether remote hires are owed continuation of their terms is a genuine obligation question, not an efficiency question — it persists even if the mandate improves performance.", epistemicType: "value_judgment", confidence: "not_applicable", confidenceRationale: "Normative claim; flagged as such rather than scored.", traceRefs: ["of-f4"] },
    { id: "pra-fd3", statement: "Every option redistributes burden: keeping concentrates it on commuters and caregivers; repealing shifts it to those who depend on office structure (plausibly junior staff).", epistemicType: "model_inference", confidence: "medium", confidenceRationale: "Distributional reading of the stakeholder map; magnitudes unknown.", traceRefs: ["of-s4", "of-s5"] },
  ],
  challenges: [
    "Favoring the reversible option can itself be a bias — deferral has costs (continued attrition during the pilot) that this analysis may be undercounting.",
    "The option set is leadership's; employees might propose options (e.g. compensation for commute days) that reframe the landscape.",
  ],
  missingEvidence: [
    "What was actually promised to remote hires (offer letters, policies).",
    "Cost model of the pilot vs. continued attrition at current rates.",
  ],
  canEstablish: [
    "The live tradeoffs, who bears them, and which are value conflicts rather than information gaps.",
    "That 'performance' as a criterion already embeds contested weightings of the five values.",
  ],
  cannotEstablish: [
    "A uniquely correct choice — facts do not pick the weights.",
    "The empirical effects of each option (causal lens's job).",
  ],
  nextQuestions: [
    "Who decides the pilot's design — and are affected groups at that table?",
    "What accommodation floor (caregiving, disability, distance) applies under any option?",
  ],
  handoffs: [
    { targetLens: "dialectical", reason: "The emerging preference for the pilot should be pressure-tested before it hardens into a decision.", payloadIds: ["pra-fd1"] },
    { targetLens: "interpretive", reason: "Whether the pilot reads as genuine voice or as managed consent depends on meanings the interpretive lens maps.", payloadIds: ["pra-fd1"] },
  ],
  extras: {
    lens: "practical",
    options: [
      {
        nodeId: "pra-o1", label: "Keep the mandate as is",
        summary: "Hold the line; treat six months as too early to judge.",
        benefits: ["Satisfies board expectation directly", "No further change fatigue", "Preserves any real in-person gains"],
        burdens: ["Continued commute/caregiver burden", "Risks deepening attrition and trust loops if they are active", "Signals that the turnover signal was heard and dismissed"],
        dutiesAndRights: ["Weakest on remote-hire commitments — maintains the unilateral change"],
        reversibility: "High in form (can change later), low in effect: departed employees do not return.",
        uncertainty: "Bets that the deterioration is reorg/market noise; currently unverified.",
        distribution: { whoBenefits: "Leadership visibility; employees who thrive in office", whoPays: "Long commuters, caregivers, remote hires", whoDecides: "Executives alone" },
      },
      {
        nodeId: "pra-o2", label: "Two coordinated team days",
        summary: "Reduce the count, add coordination — the 'fix the parameter and the rule' middle path.",
        benefits: ["Attacks the coordination-decay loop directly", "Visible responsiveness", "Keeps office culture legible to the board"],
        burdens: ["Still a uniform mandate (trust critique persists)", "Coordination overhead for managers"],
        dutiesAndRights: ["Partial accommodation of remote hires; does not restore their terms"],
        reversibility: "High.",
        uncertainty: "Assumes coordination, not count, is the active ingredient — plausible but untested.",
        distribution: { whoBenefits: "Most office-based staff", whoPays: "Remote hires still bound; managers absorb scheduling", whoDecides: "Executives, with team input on which days" },
      },
      {
        nodeId: "pra-o3", label: "Team-designed six-month pilot",
        summary: "Teams set coordinated in-person time for work with a face-to-face advantage, within fairness standards and pre-defined measures.",
        benefits: ["Generates the missing causal evidence", "Gives affected people voice (procedural fairness)", "Reversible by design; thresholds set in advance"],
        burdens: ["Management effort; measurement discipline", "Six more months of ambiguity", "Risk of inter-team inequity without firm standards"],
        dutiesAndRights: ["Best available respect for voice; accommodation floor can be built in"],
        reversibility: "Highest — reversal criteria are part of the design.",
        uncertainty: "Defers rather than resolves; attrition continues during the pilot.",
        distribution: { whoBenefits: "Teams gain authority; leadership gains evidence", whoPays: "Managers run it; laggard teams may struggle", whoDecides: "Teams within executive guardrails — the most distributed option" },
      },
      {
        nodeId: "pra-o4", label: "Repeal — remote-first",
        summary: "Remove the mandate; invest in remote coordination instead.",
        benefits: ["Ends commute burden immediately", "Restores remote-hire terms", "Strong trust signal"],
        burdens: ["Directly violates the board constraint", "Forfeits possible in-person benefits before they were measured", "Leaves three years of lease cost stranded"],
        dutiesAndRights: ["Strongest on remote-hire commitments; weakest on any duty to junior staff's development, if office time serves it"],
        reversibility: "Low in practice: re-imposing a mandate after repeal would be a second broken expectation.",
        uncertainty: "Assumes the mandate is the dominant cause — exactly what is unestablished.",
        distribution: { whoBenefits: "Commuters, caregivers, remote hires", whoPays: "Possibly junior staff and mentoring; executives bear board conflict", whoDecides: "Executives" },
      },
    ],
    valueTensions: [
      { label: "Uniform culture vs. honored commitments", description: "A single visible culture (of-k2) and the terms remote hires accepted (of-f4) cannot both be fully satisfied. Any option chooses a loser; the choice should be explicit." },
      { label: "Efficiency vs. distribution of burden", description: "Average performance can improve while costs concentrate on caregivers and long commuters — 'efficient but possibly unfair'. The reverse also threatens: maximal accommodation could be fair in intent but operationally ineffective." },
      { label: "Evidence vs. decisiveness", description: "The pilot values knowing over acting; continued attrition during it is a real cost borne by current staff." },
    ],
    ethicalPerspectives: {
      consequence: "Which option produces the best overall outcomes across retention, delivery, and wellbeing — counting the costs borne during the evidence-gathering itself?",
      duty: "What was actually promised to remote hires, and does the company's word bind it even at a performance cost?",
      virtue: "What would a trustworthy leadership team — one worth working for — do when its policy shows signs of harm it cannot yet prove?",
      care: "What do the specific people most burdened (caregivers, long commuters, anxious juniors) need to stay whole through whatever is decided?",
      fairness: "Were the people affected heard before the rule was set — and does the chosen process correct that or repeat it?",
    },
  },
};

const dialectical: LensAnalysis = {
  lens: "dialectical",
  guidingQuestion: "Which assumptions behind 'three office days improve collaboration' survive pressure?",
  plainLanguageSummary:
    "Under challenge, the CEO's thesis survives only in a narrowed form. The defender concedes that uncoordinated presence does not produce collaboration and that delivery slowed on the thesis's watch. The revised claim — coordinated in-person time may improve specific collaborative tasks when the right people, purpose, and conditions are present — is weaker, testable, and compatible with the pilot. One objection remains standing: 'collaboration' still lacks an agreed measure.",
  diagram: {
    diagramType: "dialectic_sequence",
    nodes: [
      { id: "dia-n1", label: "Thesis: three office days improve collaboration", nodeType: "thesis", epistemicType: "user_claim", confidence: "low", traceRefs: ["of-c2"] },
      { id: "dia-n2", label: "Steelman: shared presence builds trust, mentoring, and fast decisions that remote tools demonstrably struggle to replicate", nodeType: "steelman", epistemicType: "model_inference", confidence: "medium", traceRefs: ["of-v3", "of-s5"] },
      { id: "dia-n3", label: "Challenge: define collaboration", nodeType: "challenge", epistemicType: "model_inference", confidence: "not_applicable", traceRefs: [] },
      { id: "dia-n4", label: "Defense: faster decisions, knowledge sharing, relationships", nodeType: "reply", epistemicType: "user_claim", confidence: "medium", traceRefs: [] },
      { id: "dia-n5", label: "Challenge: if presence improves those, why did delivery slow?", nodeType: "challenge", epistemicType: "model_inference", confidence: "not_applicable", traceRefs: ["of-f3"] },
      { id: "dia-n6", label: "Defense: the slowdown may have another cause (reorg)", nodeType: "reply", epistemicType: "user_claim", confidence: "medium", traceRefs: ["of-f7"] },
      { id: "dia-n7", label: "Challenge: then what evidence would show the policy improved collaboration despite slower delivery?", nodeType: "challenge", epistemicType: "model_inference", confidence: "not_applicable", traceRefs: [] },
      { id: "dia-n8", label: "Defense: network data, decision-cycle times, mentoring outcomes — concedes none are in hand", nodeType: "concession", epistemicType: "user_claim", confidence: "medium", traceRefs: ["of-u3"] },
      { id: "dia-n9", label: "Challenge: would three uncoordinated days still improve collaboration?", nodeType: "challenge", epistemicType: "model_inference", confidence: "not_applicable", traceRefs: ["of-f5"] },
      { id: "dia-n10", label: "Concession: no — the benefit requires the right people present together", nodeType: "concession", epistemicType: "user_claim", confidence: "high", traceRefs: ["of-f5"] },
      { id: "dia-n11", label: "Revised: coordinated in-person time may improve specific collaborative tasks when participants, purpose, and conditions align", nodeType: "revision", epistemicType: "model_inference", confidence: "medium", traceRefs: ["of-c2", "of-f5"] },
    ],
    edges: [
      { id: "dia-e1", from: "dia-n2", to: "dia-n1", relation: "strengthens", traceRefs: [] },
      { id: "dia-e2", from: "dia-n3", to: "dia-n2", relation: "challenges", traceRefs: [] },
      { id: "dia-e3", from: "dia-n4", to: "dia-n3", relation: "responds", traceRefs: [] },
      { id: "dia-e4", from: "dia-n5", to: "dia-n4", relation: "challenges", traceRefs: [] },
      { id: "dia-e5", from: "dia-n6", to: "dia-n5", relation: "responds", traceRefs: [] },
      { id: "dia-e6", from: "dia-n7", to: "dia-n6", relation: "challenges", traceRefs: [] },
      { id: "dia-e7", from: "dia-n8", to: "dia-n7", relation: "concedes", traceRefs: [] },
      { id: "dia-e8", from: "dia-n9", to: "dia-n8", relation: "challenges", traceRefs: [] },
      { id: "dia-e9", from: "dia-n10", to: "dia-n9", relation: "concedes", traceRefs: [] },
      { id: "dia-e10", from: "dia-n11", to: "dia-n1", relation: "revises", traceRefs: [] },
    ],
  },
  findings: [
    { id: "dia-fd1", statement: "The original thesis cannot survive its own concessions: uncoordinated presence (the current reality per of-f5) is admitted not to produce the claimed benefit.", epistemicType: "model_inference", confidence: "high", confidenceRationale: "Follows from the defender's own concession at dia-n10.", traceRefs: ["of-f5", "of-c2"] },
    { id: "dia-fd2", statement: "The revision converts a slogan into a testable proposition whose conditions (participants, purpose, coordination) are exactly what the pilot would vary.", epistemicType: "model_inference", confidence: "medium", confidenceRationale: "The revised claim's conditions map onto the pilot's design parameters.", traceRefs: ["of-o3"] },
    { id: "dia-fd3", statement: "Surviving the debate is not evidence the revised claim is true — it is evidence the claim is now clear enough to be wrong.", epistemicType: "model_inference", confidence: "high", confidenceRationale: "Standard limit of dialectic; recorded to prevent overreach.", traceRefs: [] },
  ],
  challenges: [
    "This trace was composed by one analyst playing both roles; a real defender with skin in the game might defend differently and better.",
    "The challenger focused on empirical weak points; a values-focused challenge (whose collaboration counts?) was not run and might cut deeper.",
  ],
  missingEvidence: [
    "An agreed operational measure of collaboration (the standing objection).",
    "The COO's symmetric debate: 'the mandate hurts performance, so repeal' deserves the same treatment (see deduction lens for its structure).",
  ],
  canEstablish: [
    "Which assumptions the thesis depends on (coordination, measurability, net benefit).",
    "A narrower claim both executives could potentially accept — common ground for the pilot.",
  ],
  cannotEstablish: [
    "That coordinated office time actually improves collaboration — that is an empirical question now properly posed.",
    "Who 'won'; the exercise is cooperative truth-seeking, scored by clarity gained.",
  ],
  nextQuestions: [
    "Run the symmetric debate on the repeal thesis.",
    "What measure of collaboration would both sides accept in advance?",
  ],
  handoffs: [
    { targetLens: "causal", reason: "The revised claim's conditions define the treatment arms a causal test should implement.", payloadIds: ["dia-n11"] },
  ],
  extras: {
    lens: "dialectical",
    thesis: "Three office days improve collaboration.",
    steelmannedThesis: "Regular shared presence builds trust, tacit knowledge transfer, and fast decision-making in ways remote tools have not replicated — so a baseline of coordinated in-person time protects capabilities the company cannot easily measure until they are gone.",
    moves: [
      { id: "dia-m1", role: "challenger", moveType: "definition", text: "What exactly counts as 'collaboration'? Name the behavior that improves." },
      { id: "dia-m2", role: "defender", moveType: "reply", text: "Faster decisions, knowledge sharing, and stronger working relationships." },
      { id: "dia-m3", role: "challenger", moveType: "contradiction", text: "If three office days improve those, why did delivery slow by 22% during six months of the policy?" },
      { id: "dia-m4", role: "defender", moveType: "reply", text: "The slowdown may have another cause — the reorganization overlapped the same period." },
      { id: "dia-m5", role: "challenger", moveType: "consequence", text: "Then the thesis implies some evidence should exist showing collaboration improved despite slower delivery. What is it?" },
      { id: "dia-m6", role: "defender", moveType: "concession", text: "Network data, decision-cycle times, mentoring outcomes would show it — and none of these are currently collected." },
      { id: "dia-m7", role: "challenger", moveType: "counterexample", text: "Teams attend on different days and commute to video calls (of-f5). Would three uncoordinated days still improve collaboration?" },
      { id: "dia-m8", role: "defender", moveType: "concession", text: "No. The benefit depends on the right colleagues being present together, with a reason to be." },
      { id: "dia-m9", role: "defender", moveType: "revision", text: "Revised: coordinated in-person time may improve specific collaborative tasks when the right participants, purpose, and working conditions are present." },
    ],
    revisedThesis: "Coordinated in-person time may improve specific collaborative tasks when the right participants, purpose, and working conditions are present.",
    remainingObjections: [
      "'Collaboration' still has no agreed measure; until it does, the revised claim cannot be scored either.",
      "The debate did not examine whose collaboration counts — senior staff's convenience may be purchased with junior staff's commutes.",
    ],
    unresolvedTension: "The steelman's strongest point — some benefits are invisible until lost — is structurally unfalsifiable on any short horizon, and the debate could not dissolve it; it can only be bounded by agreeing in advance what evidence would count.",
  },
};

export const officeAnalyses: Record<LensId, LensAnalysis> = {
  interpretive,
  induction,
  abduction,
  deduction,
  causal,
  systems,
  practical,
  dialectical,
};

export const officeSynthesis: Synthesis = {
  convergence: [
    { id: "syn-cv1", statement: "Every empirical lens lands on the same gap: nothing yet separates the mandate's effects from the reorg's and the market's.", lenses: ["induction", "abduction", "causal", "deduction"], traceRefs: ["ind-fd3", "abd-fd2", "cau-fd1", "ded-fd2"] },
    { id: "syn-cv2", statement: "Coordination — not the day count — keeps surfacing as the active ingredient: in the attendance pattern, the leading hypothesis, the systems leverage analysis, and the surviving dialectical claim.", lenses: ["induction", "abduction", "systems", "dialectical"], traceRefs: ["ind-fd2", "abd-fd1", "sys-fd3", "dia-fd2"] },
    { id: "syn-cv3", statement: "A team-designed, measured, reversible pilot is the convergence point of the causal test design, the practical deliberation, and the revised dialectical thesis.", lenses: ["causal", "practical", "dialectical"], traceRefs: ["cau-fd3", "pra-fd1", "dia-fd2"] },
  ],
  conflicts: [
    { id: "syn-cf1", statement: "Decisiveness vs. evidence: the practical lens itself flags that preferring the reversible pilot undercounts the cost of six more months of attrition — the COO's repeal argument is valid and would act now, if its causal premise were granted.", lenses: ["practical", "deduction", "causal"], traceRefs: ["pra-fd1", "ded-fd1", "cau-fd2"] },
    { id: "syn-cf2", statement: "Obligation vs. outcome: the duty reading (remote-hire terms bind regardless of performance) and the consequence reading (whatever performs best) genuinely diverge, and no lens adjudicates between them.", lenses: ["practical", "interpretive"], traceRefs: ["pra-fd2", "int-fd2"] },
    { id: "syn-cf3", statement: "The steelmanned culture argument (benefits invisible until lost) resists every short-horizon test the causal lens can build — a standing conflict between what leadership can measure and what it fears losing.", lenses: ["dialectical", "causal", "systems"], traceRefs: ["dia-fd3", "cau-fd2"] },
  ],
  unresolvedUnknowns: [
    { id: "syn-uk1", statement: "Who left — by commute, remote-hire status, tenure, seniority — remains the single highest-value unknown; three lenses rank it first.", lenses: ["induction", "abduction", "causal"], traceRefs: ["of-u1"] },
    { id: "syn-uk2", statement: "What departing and remaining employees actually experienced is unverified; all standpoints are inquiry prompts.", lenses: ["interpretive"], traceRefs: ["of-u5", "int-fd2"] },
    { id: "syn-uk3", statement: "Whether any mapped feedback loop is actually operating (attendance decay, attrition spiral) has no supporting time series yet.", lenses: ["systems"], traceRefs: ["sys-fd1", "sys-fd2"] },
  ],
  assumptionDependencies: [
    { id: "syn-ad1", statement: "The repeal conclusion depends on of-a1 (mandate caused the harm) — which deduction exposed as unproven, induction as unattributed, and causal as unidentified.", lenses: ["deduction", "induction", "causal"], traceRefs: ["of-a1", "ded-fd2", "ind-fd3", "cau-fd1"] },
    { id: "syn-ad2", statement: "The keep conclusion depends on of-a2 (office benefits all work equally) — which the dialectical concession (dia-n10) has already broken.", lenses: ["dialectical", "systems"], traceRefs: ["of-a2", "dia-fd1"] },
    { id: "syn-ad3", statement: "Reading the turnover numbers as a policy verdict assumes of-a3 (leavers resemble stayers); if seniors left disproportionately, the systems lens's mentoring-erosion loop makes the damage larger than the rate suggests.", lenses: ["systems", "induction"], traceRefs: ["of-a3", "sys-fd1"] },
  ],
  valueDependencies: [
    { id: "syn-vd1", statement: "The decision turns on how fairness-of-burden (of-v4) is weighed against collective culture (of-k2) — a value choice no evidence will make.", lenses: ["practical", "interpretive"], traceRefs: ["of-v4", "of-k2", "pra-fd3"] },
    { id: "syn-vd2", statement: "Whether 'performance' means delivery speed, collaboration quality, or retention is itself a value allocation hidden inside the COO/CEO dispute.", lenses: ["practical", "deduction", "dialectical"], traceRefs: ["of-v2", "of-v3", "ded-fd3"] },
  ],
  evidencePriorities: [
    { id: "syn-ep1", statement: "First: cross departures with commute distance, remote-hire status, tenure, and reorg exposure (discriminates H1/H4/H5 at once).", lenses: ["abduction", "causal"], traceRefs: ["abd-fd1", "of-u1"] },
    { id: "syn-ep2", statement: "Second: decompose the cycle-time increase by stage and team split-status (tests H2 directly).", lenses: ["abduction", "induction"], traceRefs: ["of-u3", "ind-fd2"] },
    { id: "syn-ep3", statement: "Third: exit-interview accounts and a short experience inquiry across the five stakeholder groups (the missing voices).", lenses: ["interpretive"], traceRefs: ["of-u5", "int-fd1"] },
  ],
  testsOrNextSteps: [
    { id: "syn-ts1", statement: "Run the phased comparison: matched teams move to two coordinated days vs. three fixed days, outcomes pre-registered, reorg exposure recorded.", lenses: ["causal", "practical"], traceRefs: ["cau-fd3", "pra-fd1"] },
    { id: "syn-ts2", statement: "Before it starts, agree the collaboration measure both executives accept — the dialectical lens's standing objection blocks every later claim if skipped.", lenses: ["dialectical"], traceRefs: ["dia-fd3"] },
    { id: "syn-ts3", statement: "Set an accommodation floor (caregiving, disability, distance) that applies under every arm — removes the worst distributional risk while testing proceeds.", lenses: ["practical", "interpretive"], traceRefs: ["pra-fd3", "int-fd1"] },
  ],
  provisionalJudgment: {
    statement:
      "Replace the uniform three-day mandate with a six-month, team-designed pilot requiring coordinated in-person time for work with a clear face-to-face advantage — under pre-agreed measures, an accommodation floor, and explicit reversal thresholds — while running the departure-data analysis immediately.",
    conditions: [
      "Revisable if the departure breakdown shows the reorg, not the mandate, is the dominant driver.",
      "Revisable if the pilot's coordination costs exceed its measured benefits.",
      "The remote-hire obligation question remains open either way and should be settled as a commitment decision, not a performance finding.",
    ],
    confidence: "medium",
    rationale:
      "Converges from three independent lens routes (causal test design, practical deliberation, dialectical revision) and respects every stated constraint; its weakest point is the acknowledged cost of six more months of ambiguity (syn-cf1).",
  },
};
