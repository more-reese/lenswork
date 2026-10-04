# Known limitations & next-stage improvements

## Current limitations

1. **Exports are not built yet.** No JSON/PDF report export or per-diagram SVG/PNG export; the
   case JSON in `data/cases/` is the complete, portable record in the meantime. (Deliberately
   deferred to prioritize the real analysis loop.)
2. **No undo/redo.** Case-model edits are logged (and lens revisions keep full previous
   versions), but there is no general undo stack.
3. **Demo-mode analyses for non-sample cases are structural templates.** They organize your
   input honestly but perform no genuine reasoning; only the office-mandate sample carries fully
   curated content, and real analysis needs an API key.
4. **Source links are stored, not fetched.** `evidenceLinks` ride along as case input; there is
   no source drawer, fetching, or claim-level citation binding yet.
5. **Diagram editing is navigation-only.** You can drag nodes, but adding/cutting causal edges
   ("cut an edge and see which claim changes") currently goes through the refine box as a
   request rather than direct manipulation.
6. **Mobile is functional, not polished.** The single-column flow and bottom sheet work at
   375px, but dense tables scroll horizontally and the perspective map wants more tuning.
7. **Very large diagrams rely on zoom/pan.** Layouts stay finite and legible to ~75 nodes, but
   there is no clustering/progressive disclosure for bigger graphs yet.
8. **Cost estimates are heuristics** (character-based token guesses), not quotes; actual usage
   depends on model verbosity.
9. **Single-user by design.** API routes are unauthenticated; `data/cases/` is local filesystem
   state. Deploying beyond localhost needs auth and a storage swap first.
10. **Refusal fallbacks are not wired.** A safety refusal from the API surfaces as a per-lens
    error with retry, rather than automatically re-routing to a fallback model.

## Next-stage improvements

- Export: print-friendly HTML/PDF report, JSON bundle, per-diagram SVG/PNG.
- Source drawer: fetch user-supplied links, bind citations at the claim level, distinguish
  source statements from model interpretation in the diagram.
- Direct causal-graph manipulation (add/cut edges) with scoped re-derivation of affected claims.
- Cross-case memory: search and link recurring assumptions/values across your case library —
  the flat-file store was chosen partly to make this easy later.
- Dialectical live mode: take the challenger or defender role turn-by-turn (the refine loop
  already supports it conversationally; a dedicated UI would pace it as a debate).
- Clustering/progressive disclosure for 100+ node diagrams.
- Per-lens model overrides at re-run time (the plumbing accepts a model override already).
- Real token accounting from API usage responses, replacing the heuristic estimate.
