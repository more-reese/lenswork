/**
 * The lens registry: identity, guiding questions, guided-path order,
 * educational content, and reference links for all eight reasoning lenses.
 *
 * Educational copy is original prose grounded in the project reference
 * material; `sources` link to the anchoring academic references.
 */
import type { LensId } from "@/lib/schema";

export interface LensEducation {
  plainLanguage: string;
  whatToLookFor: string[];
  canEstablish: string[];
  cannotEstablish: string[];
}

export interface LensMeta {
  id: LensId;
  name: string;
  shortName: string;
  guidingQuestion: string;
  primaryOutput: string;
  keyLimitation: string;
  diagramType: string;
  diagramLabel: string;
  /** Why the guided path visits this lens at this point. */
  guidedPathReason: string;
  education: LensEducation;
  sources: Array<{ label: string; url: string }>;
}

export const LENS_ORDER: LensId[] = [
  "interpretive",
  "induction",
  "abduction",
  "deduction",
  "causal",
  "systems",
  "practical",
  "dialectical",
];

export const LENSES: Record<LensId, LensMeta> = {
  interpretive: {
    id: "interpretive",
    name: "Interpretive & phenomenological",
    shortName: "Interpretive",
    guidingQuestion: "What does this mean in context, and how is it experienced?",
    primaryOutput: "Perspective and context map",
    keyLimitation: "One vivid standpoint can be mistaken for the whole.",
    diagramType: "perspective_map",
    diagramLabel: "Perspective map with context layers",
    guidedPathReason:
      "Start by clarifying what the situation means to the people in it — later lenses inherit these framings whether you examine them or not.",
    education: {
      plainLanguage:
        "This lens asks what actions, words, and policies mean to the people involved, and how the situation shows up in their first-person experience. The same event can be a restoration of order to one person and a broken promise to another — and both readings shape what happens next.",
      whatToLookFor: [
        "Words that carry different meanings for different people",
        "Standpoints that have not been heard from directly",
        "Historical or institutional context that changes what an act signals",
        "Places where you are guessing at someone's experience instead of asking",
      ],
      canEstablish: [
        "How the situation is framed from each identified standpoint",
        "Which terms are contested and in what ways",
        "Which voices are missing from the current account",
      ],
      cannotEstablish: [
        "What anyone actually experienced — that requires direct inquiry",
        "Which interpretation is correct; context constrains readings but rarely picks one",
        "Causal effects or frequencies — those belong to other lenses",
      ],
    },
    sources: [
      { label: "SEP: Hermeneutics", url: "https://plato.stanford.edu/entries/hermeneutics/" },
      { label: "SEP: Phenomenology", url: "https://plato.stanford.edu/entries/phenomenology/" },
    ],
  },
  induction: {
    id: "induction",
    name: "Inductive reasoning",
    shortName: "Induction",
    guidingQuestion: "What pattern does the evidence support?",
    primaryOutput: "Pattern summary and bounded generalization",
    keyLimitation: "Can overgeneralize from biased or sparse evidence.",
    diagramType: "evidence_flow",
    diagramLabel: "Evidence-to-pattern flow",
    guidedPathReason:
      "With meanings on the table, look at what actually varies: which observations recur, for whom, and under what conditions.",
    education: {
      plainLanguage:
        "Induction moves from observed cases toward a broader pattern or forecast. Its conclusions are supported to a degree, never guaranteed: the pattern in your sample may not hold beyond it, and a pattern is not yet a cause.",
      whatToLookFor: [
        "How many observations there are, and who or what they cover",
        "Groups, periods, or conditions missing from the sample",
        "Exceptions, and whether they cluster somewhere meaningful",
        "Whether the baseline for comparison is the right one",
      ],
      canEstablish: [
        "That a pattern recurs in the observed evidence",
        "A bounded generalization with explicit scope conditions",
        "Where the evidence is too thin to generalize at all",
      ],
      cannotEstablish: [
        "Why the pattern exists — pattern is not cause",
        "That the pattern holds outside the observed sample",
        "Certainty of any strength; inductive support is always defeasible",
      ],
    },
    sources: [
      { label: "SEP: Scientific Method", url: "https://plato.stanford.edu/entries/scientific-method/" },
    ],
  },
  abduction: {
    id: "abduction",
    name: "Abductive reasoning",
    shortName: "Abduction",
    guidingQuestion: "What explanation best accounts for the observations?",
    primaryOutput: "Ranked hypotheses and discriminating tests",
    keyLimitation: "A plausible explanation is not proof.",
    diagramType: "hypothesis_tree",
    diagramLabel: "Hypothesis tree and comparison matrix",
    guidedPathReason:
      "Patterns in hand, generate several explanations that could account for them — and keep more than one alive.",
    education: {
      plainLanguage:
        "Abduction is inference to the best explanation: given surprising observations, propose candidate explanations and compare how well each accounts for the evidence. Explanatory quality does the work — but the best current story can still be wrong.",
      whatToLookFor: [
        "Whether at least three genuinely different explanations are on the table",
        "What each hypothesis explains, fails to explain, and must assume",
        "A test or observation that would discriminate between the leaders",
        "Whether competing explanations could both be true at once",
      ],
      canEstablish: [
        "A ranking of explanations by current explanatory quality",
        "What evidence would support or undermine each one",
        "Which single observation would be most informative next",
      ],
      cannotEstablish: [
        "That the best explanation is the true one — explanation is not proof",
        "Causal effect sizes, or what an intervention would change",
        "Anything about hypotheses nobody has thought of yet",
      ],
    },
    sources: [{ label: "SEP: Abduction", url: "https://plato.stanford.edu/entries/abduction/" }],
  },
  deduction: {
    id: "deduction",
    name: "Deductive reasoning",
    shortName: "Deduction",
    guidingQuestion: "Does the conclusion follow from the premises?",
    primaryOutput: "Argument map and validity check",
    keyLimitation: "Cannot establish whether empirical premises are true.",
    diagramType: "argument_map",
    diagramLabel: "Argument map",
    guidedPathReason:
      "Now make the argument explicit: if the leading explanation and stated premises were true, what would have to follow — and does the stated conclusion actually follow?",
    education: {
      plainLanguage:
        "Deduction checks whether a conclusion must be true if the premises are. Validity is a property of the argument's structure; it says nothing about whether the premises themselves are accurate. A valid argument with a false premise proves nothing.",
      whatToLookFor: [
        "Premises doing work without being stated (hidden premises)",
        "Terms that shift meaning between premises",
        "Whether all premises could be true while the conclusion is false",
        "Which single premise, if false, would sink the conclusion",
      ],
      canEstablish: [
        "Whether the conclusion follows from the stated premises",
        "Which hidden premises the argument depends on",
        "What each premise would commit you to elsewhere",
      ],
      cannotEstablish: [
        "Whether any empirical premise is actually true",
        "Soundness — validity plus true premises — without outside evidence",
        "What should be done; a valid argument can have an unacceptable premise",
      ],
    },
    sources: [
      { label: "SEP: Scientific Method", url: "https://plato.stanford.edu/entries/scientific-method/" },
    ],
  },
  causal: {
    id: "causal",
    name: "Causal reasoning",
    shortName: "Causal",
    guidingQuestion: "What would change under an intervention?",
    primaryOutput: "Causal model and counterfactual comparison",
    keyLimitation: "Counterfactuals are not directly observed.",
    diagramType: "causal_graph",
    diagramLabel: "Directed causal graph with intervention mode",
    guidedPathReason:
      "Explanations imply causal claims. Ask what would happen if you deliberately changed something — compared with what would have happened anyway.",
    education: {
      plainLanguage:
        "Causal reasoning asks what an intervention would change, compared with the unobserved alternative — the counterfactual. 'It happened after the policy' is an association; a causal claim needs an account of what would have happened without the policy.",
      whatToLookFor: [
        "Arrows that are actually associations dressed up as causes",
        "Confounders that could produce both the 'cause' and the 'effect'",
        "Mediators and moderators that change where an intervention bites",
        "A feasible comparison that would separate cause from coincidence",
      ],
      canEstablish: [
        "A candidate causal structure, with confounders made explicit",
        "What a well-designed test could identify, and how",
        "The difference between observed association and causal hypothesis",
      ],
      cannotEstablish: [
        "The counterfactual itself — it is never directly observed",
        "Causation from correlation alone, however strong",
        "Whether the intervention is wise or fair — that is practical reasoning",
      ],
    },
    sources: [
      { label: "SEP: Causal Models", url: "https://plato.stanford.edu/entries/causal-models/" },
      { label: "SEP: Causation and Manipulability", url: "https://plato.stanford.edu/entries/causation-mani/" },
    ],
  },
  systems: {
    id: "systems",
    name: "Systems reasoning",
    shortName: "Systems",
    guidingQuestion: "What happens across the wider system over time?",
    primaryOutput: "Feedback-loop model and leverage points",
    keyLimitation: "A complex map can become speculative or untestable.",
    diagramType: "causal_loop",
    diagramLabel: "Causal-loop diagram",
    guidedPathReason:
      "Single causal links sit inside loops. Widen the frame: feedback, delays, and second-order effects often matter more than the link you started with.",
    education: {
      plainLanguage:
        "Systems reasoning looks past single cause-effect links to feedback loops, accumulations, delays, and boundaries. Persistent patterns often come from structure, not from any one actor — and interventions can be amplified, absorbed, or reversed by the loops they enter.",
      whatToLookFor: [
        "Reinforcing loops (R) that amplify and balancing loops (B) that resist",
        "Delays between action and consequence",
        "Where the system boundary was drawn, and what that choice hides",
        "Leverage points — and whether they are rules and goals, not just numbers",
      ],
      canEstablish: [
        "A qualitative map of the feedback structure around the case",
        "Candidate unintended consequences and where they would show up",
        "Which loops an intervention would strengthen or weaken",
      ],
      cannotEstablish: [
        "Quantitative predictions without real parameters and data",
        "That the mapped loops actually operate — each link is a hypothesis",
        "A unique correct boundary; every boundary is a choice",
      ],
    },
    sources: [
      { label: "Meadows: Leverage Points", url: "http://www.donellameadows.org/wp-content/userfiles/Leverage_Points.pdf" },
      { label: "Meadows: Thinking in Systems", url: "https://research.fit.edu/media/site-specific/researchfitedu/coast-climate-adaptation-library/climate-communications/psychology-amp-behavior/Meadows-2008.-Thinking-in-Systems.pdf" },
    ],
  },
  practical: {
    id: "practical",
    name: "Practical & moral reasoning",
    shortName: "Practical",
    guidingQuestion: "What should be done?",
    primaryOutput: "Options, tradeoffs, duties, and justified action",
    keyLimitation: "Values can be hidden inside apparently neutral criteria.",
    diagramType: "decision_landscape",
    diagramLabel: "Decision landscape",
    guidedPathReason:
      "With structure and causes mapped, decide: weigh options against goals, constraints, obligations, and who bears the burdens.",
    education: {
      plainLanguage:
        "Practical reasoning weighs what to do given ends, options, constraints, and uncertainty; moral reasoning adds what you owe to others. Facts alone never pick the action — some weighing of values is always happening, and this lens makes it visible instead of hiding it inside words like 'efficiency'.",
      whatToLookFor: [
        "Value judgments smuggled inside apparently neutral criteria",
        "Who benefits, who pays, and who decides — and whether those differ",
        "Rights, commitments, or duties that constrain otherwise good options",
        "Whether an option is reversible, and what voice affected people had",
      ],
      canEstablish: [
        "The live options and the tradeoffs between them",
        "Which values the decision actually turns on",
        "Tensions — efficient-but-unfair, fair-but-ineffective — that no metric resolves",
      ],
      cannotEstablish: [
        "A uniquely correct choice derived from facts alone",
        "That chosen value weights are objective — they are commitments",
        "Empirical effects of each option — that is causal reasoning's job",
      ],
    },
    sources: [
      { label: "SEP: Practical Reason", url: "https://plato.stanford.edu/entries/practical-reason/" },
      { label: "SEP: Moral Reasoning", url: "https://plato.stanford.edu/entries/reasoning-moral/" },
    ],
  },
  dialectical: {
    id: "dialectical",
    name: "Dialectical reasoning",
    shortName: "Dialectical",
    guidingQuestion: "Which assumptions fail under pressure?",
    primaryOutput: "Challenge-response trace and revised claim",
    keyLimitation: "Debate can reward performance or dominance instead of inquiry.",
    diagramType: "dialectic_sequence",
    diagramLabel: "Challenger–defender sequence",
    guidedPathReason:
      "Before acting, pressure-test the emerging position: steelman it, attack it seriously, and keep whatever survives — revised.",
    education: {
      plainLanguage:
        "Dialectical reasoning tests a position through structured opposition: definitions demanded, consequences drawn, counterexamples raised, replies and concessions made. Done well — as in Socratic questioning, or the structured challenger-defender format adapted here from Tibetan monastic debate — it converts slogans into claims precise enough to test.",
      whatToLookFor: [
        "Terms the thesis depends on but never defines",
        "Consequences of the thesis its holder would not accept",
        "Whether the challenge attacks the strongest version (the steelman)",
        "What the thesis looks like after honest concessions",
      ],
      canEstablish: [
        "Which assumptions the position cannot survive without",
        "A narrower, more defensible revision of the original claim",
        "The objections that remain standing at the end",
      ],
      cannotEstablish: [
        "Empirical truth — surviving debate is not evidence about the world",
        "That the loser was wrong; debate rewards skill as well as truth",
        "Resolution of genuine value conflicts between the parties",
      ],
    },
    sources: [
      { label: "Plato, Meno (Perseus)", url: "https://www.perseus.tufts.edu/hopper/text?doc=Perseus:text:1999.01.0178:text=Meno" },
      { label: "Tibetan monastic debate (peer-reviewed)", url: "https://pure.rug.nl/ws/files/119647854/1_s2.0_S0079612318301572_main.pdf" },
    ],
  },
};

export const GUIDED_SEQUENCE_NOTE =
  "This order — interpret, find patterns, explain, deduce, test causes, map the system, deliberate, pressure-test — suits many cases, but it is not mandatory. A dispute about meaning may start interpretive; a decision deadline may start practical. Enter anywhere; the lenses hand off to each other.";

export function lensMeta(id: LensId): LensMeta {
  return LENSES[id];
}
