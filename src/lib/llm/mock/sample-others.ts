/**
 * Seeded sample cases 2 and 3: congestion pricing and a school phone ban.
 * Curated inputs and case models; their lens analyses are produced by the
 * deterministic generic builder (see generic.ts).
 */
import type { CaseInput, CaseModel } from "@/lib/schema";

export const congestionInput: CaseInput = {
  title: "Congestion pricing downtown",
  narrative:
    "A city of 1.2 million is considering a congestion charge for its downtown core: $9 on weekdays, 6am–7pm, to reduce traffic and emissions. Average downtown traffic speed is 11 mph at peak. Transit covers the core but several outer districts have limited service. Retailers fear lost customers; two comparable cities saw traffic fall 15–20% after similar schemes, with mixed retail effects. A council vote is expected next quarter.",
  centralQuestion: "Should the city adopt the proposed downtown congestion charge?",
  knownFacts:
    "Peak downtown speed 11 mph. Proposed charge $9 weekdays 6am–7pm. Transit strong in core, weak in several outer districts. Two comparable cities: traffic −15–20% after pricing, mixed retail effects.",
  claims:
    "Proponents: pricing will cut traffic and emissions and fund transit. Retail association: the charge will push shoppers to suburban malls. Outer-district representatives: residents without transit options will bear the cost.",
  stakeholders:
    "Downtown residents; outer-district commuters; retailers; delivery and trade workers; transit riders; the council.",
  constraints: "Revenue must fund transit by charter. Political window closes after next quarter's vote.",
  possibleActions:
    "Adopt as proposed; adopt with outer-district exemptions or credits; start with a smaller zone or off-peak-free variant; reject and expand transit first.",
  suspectedCauses: "Through-traffic using downtown as a shortcut; cheap on-street parking; limited transit alternatives from outer districts.",
  assumptions: "Council discussion assumes drivers can switch to transit, and that comparable cities' results transfer to this one.",
  valuesGoals: "Mobility, air quality, downtown economic vitality, fairness to lower-income commuters, climate goals.",
  depth: "standard",
};

export const congestionModel: CaseModel = {
  title: congestionInput.title,
  narrative: congestionInput.narrative,
  centralQuestion: congestionInput.centralQuestion,
  timeHorizon: "Vote next quarter; effects over 1–5 years.",
  items: [
    { id: "cg-f1", text: "Average downtown traffic speed is 11 mph at peak.", category: "fact", epistemicType: "user_fact", origin: "user" },
    { id: "cg-f2", text: "The proposal is $9 on weekdays, 6am–7pm, for the downtown core.", category: "fact", epistemicType: "user_fact", origin: "user" },
    { id: "cg-f3", text: "Transit coverage is strong in the core and limited in several outer districts.", category: "fact", epistemicType: "user_fact", origin: "user" },
    { id: "cg-f4", text: "Two comparable cities saw traffic fall 15–20% after similar schemes, with mixed retail effects.", category: "fact", epistemicType: "external_source", origin: "user", note: "Reported comparison; sources not attached — treat as citable but unverified here." },
    { id: "cg-c1", text: "Pricing will cut traffic and emissions and fund transit. (proponents)", category: "claim", epistemicType: "user_claim", origin: "user" },
    { id: "cg-c2", text: "The charge will push shoppers to suburban malls. (retail association)", category: "claim", epistemicType: "user_claim", origin: "user" },
    { id: "cg-c3", text: "Residents without transit options will bear the cost. (outer districts)", category: "claim", epistemicType: "user_claim", origin: "user" },
    { id: "cg-a1", text: "Drivers can switch to transit.", category: "assumption", epistemicType: "assumption", origin: "user" },
    { id: "cg-a2", text: "Comparable cities' results transfer to this city.", category: "assumption", epistemicType: "assumption", origin: "user" },
    { id: "cg-v1", text: "Mobility.", category: "value", epistemicType: "value_judgment", origin: "user" },
    { id: "cg-v2", text: "Air quality and climate goals.", category: "value", epistemicType: "value_judgment", origin: "user" },
    { id: "cg-v3", text: "Downtown economic vitality.", category: "value", epistemicType: "value_judgment", origin: "user" },
    { id: "cg-v4", text: "Fairness to lower-income commuters.", category: "value", epistemicType: "value_judgment", origin: "user" },
    { id: "cg-u1", text: "How much downtown traffic is through-traffic vs. destination traffic.", category: "unknown", epistemicType: "unknown", origin: "model" },
    { id: "cg-u2", text: "Income and transit-access profile of current peak drivers.", category: "unknown", epistemicType: "unknown", origin: "model" },
    { id: "cg-u3", text: "How this city differs from the two comparison cities (transit, geography, retail mix).", category: "unknown", epistemicType: "unknown", origin: "model" },
    { id: "cg-k1", text: "Revenue must fund transit by charter.", category: "constraint", epistemicType: "user_fact", origin: "user" },
    { id: "cg-k2", text: "The political window closes after next quarter's vote.", category: "constraint", epistemicType: "user_fact", origin: "user" },
  ],
  stakeholders: [
    { id: "cg-s1", name: "Downtown residents", origin: "user" },
    { id: "cg-s2", name: "Outer-district commuters", description: "Limited transit alternatives.", origin: "user" },
    { id: "cg-s3", name: "Retailers", origin: "user" },
    { id: "cg-s4", name: "Delivery & trade workers", description: "Cannot shift mode; costs pass through or compress wages.", origin: "user" },
    { id: "cg-s5", name: "Transit riders", description: "Beneficiaries of the funded improvements.", origin: "user" },
  ],
  options: [
    { id: "cg-o1", label: "Adopt as proposed", origin: "user" },
    { id: "cg-o2", label: "Adopt with outer-district credits/exemptions", origin: "user" },
    { id: "cg-o3", label: "Smaller zone or off-peak-free variant first", origin: "user" },
    { id: "cg-o4", label: "Reject; expand transit first", origin: "user" },
  ],
};

export const phoneInput: CaseInput = {
  title: "Phones out of the school day",
  narrative:
    "A 1,400-student public high school is considering banning smartphones during the school day (lockable pouches, 8am–3pm). Teachers report classroom attention problems; two nearby schools that adopted pouches report calmer hallways and mixed academic results. Some parents object on safety grounds (contact during emergencies). Students are split. The district requires a decision before the next school year.",
  centralQuestion: "Should the school ban smartphones during the school day?",
  knownFacts:
    "1,400 students. Proposal: lockable pouches 8am–3pm. Teachers report attention problems. Two nearby schools adopted pouches: calmer hallways reported, mixed academic results. Decision required before next school year.",
  claims:
    "Many teachers: phones are a primary driver of attention problems. Some parents: students must be reachable in emergencies. Some students: phones are needed for logistics, work schedules, and translation apps.",
  stakeholders: "Students; teachers; parents; administrators; students with accessibility or translation needs.",
  constraints: "District policy requires an enforceable rule, applied uniformly. Budget for pouches is available once.",
  possibleActions:
    "Full-day pouch ban; classroom-hours-only restriction; teacher-discretion policy; keep current policy with enforcement push.",
  suspectedCauses: "Phone notifications fragment attention; social dynamics move online during the day; enforcement burden currently falls on individual teachers.",
  assumptions: "Discussion assumes attention problems are mainly caused by phones, and that nearby schools' outcomes transfer.",
  valuesGoals: "Learning, student wellbeing, safety and reachability, equity for students who rely on phones, teacher workload.",
  depth: "standard",
};

export const phoneModel: CaseModel = {
  title: phoneInput.title,
  narrative: phoneInput.narrative,
  centralQuestion: phoneInput.centralQuestion,
  timeHorizon: "Decision this term; effects over the next school year.",
  items: [
    { id: "ph-f1", text: "The school has 1,400 students; the proposal is lockable pouches, 8am–3pm.", category: "fact", epistemicType: "user_fact", origin: "user" },
    { id: "ph-f2", text: "Teachers report classroom attention problems.", category: "fact", epistemicType: "user_fact", origin: "user", note: "A report of reports: the underlying classroom data is not attached." },
    { id: "ph-f3", text: "Two nearby schools adopted pouches and report calmer hallways with mixed academic results.", category: "fact", epistemicType: "external_source", origin: "user" },
    { id: "ph-f4", text: "A decision is required before the next school year.", category: "fact", epistemicType: "user_fact", origin: "user" },
    { id: "ph-c1", text: "Phones are a primary driver of the attention problems. (teachers)", category: "claim", epistemicType: "user_claim", origin: "user" },
    { id: "ph-c2", text: "Students must be reachable during emergencies. (parents)", category: "claim", epistemicType: "user_claim", origin: "user" },
    { id: "ph-c3", text: "Phones are needed for logistics, work schedules, and translation. (students)", category: "claim", epistemicType: "user_claim", origin: "user" },
    { id: "ph-a1", text: "Attention problems are mainly caused by phones.", category: "assumption", epistemicType: "assumption", origin: "user" },
    { id: "ph-a2", text: "Nearby schools' outcomes transfer to this school.", category: "assumption", epistemicType: "assumption", origin: "user" },
    { id: "ph-v1", text: "Learning.", category: "value", epistemicType: "value_judgment", origin: "user" },
    { id: "ph-v2", text: "Student wellbeing.", category: "value", epistemicType: "value_judgment", origin: "user" },
    { id: "ph-v3", text: "Safety and reachability.", category: "value", epistemicType: "value_judgment", origin: "user" },
    { id: "ph-v4", text: "Equity for students who rely on phones.", category: "value", epistemicType: "value_judgment", origin: "user" },
    { id: "ph-v5", text: "Teacher workload.", category: "value", epistemicType: "value_judgment", origin: "user" },
    { id: "ph-u1", text: "What share of attention problems is attributable to phones vs. other causes.", category: "unknown", epistemicType: "unknown", origin: "model" },
    { id: "ph-u2", text: "How emergency communication actually worked at the pouch-adopting schools.", category: "unknown", epistemicType: "unknown", origin: "model" },
    { id: "ph-u3", text: "Which students depend on phones for work, caregiving, or translation, and how many.", category: "unknown", epistemicType: "unknown", origin: "model" },
    { id: "ph-k1", text: "District policy requires an enforceable, uniformly applied rule.", category: "constraint", epistemicType: "user_fact", origin: "user" },
    { id: "ph-k2", text: "Budget for pouches is available once.", category: "constraint", epistemicType: "user_fact", origin: "user" },
  ],
  stakeholders: [
    { id: "ph-s1", name: "Students", origin: "user" },
    { id: "ph-s2", name: "Teachers", origin: "user" },
    { id: "ph-s3", name: "Parents", origin: "user" },
    { id: "ph-s4", name: "Administrators", origin: "user" },
    { id: "ph-s5", name: "Students with accessibility or translation needs", origin: "user" },
  ],
  options: [
    { id: "ph-o1", label: "Full-day pouch ban", origin: "user" },
    { id: "ph-o2", label: "Classroom-hours-only restriction", origin: "user" },
    { id: "ph-o3", label: "Teacher-discretion policy", origin: "user" },
    { id: "ph-o4", label: "Keep current policy, push enforcement", origin: "user" },
  ],
};
