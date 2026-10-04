# Design rationale

## Visual semantics

The product's core risk is epistemic laundering — model inferences reading like facts. The
design counters it with a **semantic visual language applied identically everywhere** (diagrams,
badges, case-model review, legend), and never encoded by color alone:

| Epistemic type | Color token | Shape / line | Rationale |
|---|---|---|---|
| User-stated fact | ink | solid square, solid border | The most "settled" treatment is reserved for what *you* said. |
| Claim | blue | outlined square | Hollow: asserted, not established. |
| Assumption | amber | dashed border | Dashes read as provisional at any size. |
| Model inference | teal | tinted fill, inner block | Visibly "filled in by the machine." |
| Value judgment | plum | diamond / tag shape | A different *kind* of thing, not a weaker fact. |
| Unknown | gray | dotted circle | Deliberately unfinished. |
| External source | green | square + link arrow | Follow the citation. |

Edge meaning uses line style + labels: dotted = observed association, dashed = hypothesized or
low-certainty, thick solid = identified; `⊗` marks contradictions, `‖` marks delays, `+/−` mark
polarity. A collapsible legend sits under every diagram.

Each lens gets a **structurally different default visual** (argument map, evidence flow,
hypothesis tree, causal graph, decision landscape, causal-loop circle, concentric perspective
map, alternating debate timeline) with its own layout algorithm — the differences between
reasoning methods are carried by the diagrams' shapes, not by prose.

The palette is neutral paper/ink surfaces with one warm sienna accent; the hues above are
reserved for semantics. Serif (Source Serif 4) appears only in the brand and page titles; all
controls and body copy use a legible sans (Geist). Page titles stay ≤ 30px; body is 16px, small
labels ≥ 12px.

## Accessibility

- **Every diagram has a full-fidelity textual twin** — the "Structured list" tab renders every
  node (with epistemic badge + confidence) and every relation as a sentence. It is the same
  data, not a summary, and it is the keyboard path of least resistance.
- Diagram nodes are focusable buttons (Enter/Space opens the inspector); canvas offers zoom,
  pan, fit, and reset controls; a skip link jumps past chrome; focus is always visible.
- Color never carries meaning alone (shapes, line styles, labels, and badges double it);
  light and dark themes are both token-defined and contrast-checked; `prefers-reduced-motion`
  disables the loop animation and skeleton pulses.
- Native elements first: `<details>` for collapsibles, real `<table>` for matrices with captions,
  radio groups for depth, labels wired to inputs, `role="alert"` on errors next to their fields.
- Touch targets are ≥ 44px for primary actions and mobile controls; dense desktop-only toolbar
  controls are ≥ 36px.

## Responsive behavior

- **Desktop (≥1280px):** three panes — left rail (phases + lens atlas in guided order), center
  canvas, right inspector (provenance, education, refine loop).
- **Tablet (≥1024px):** left rail persists; the inspector becomes a bottom sheet that opens on
  selection.
- **Mobile (≥375px):** single column with a horizontal lens switcher under the top bar; diagrams
  remain pannable/zoomable canvases, with the structured list as the comfortable alternative;
  the inspector is a dismissible bottom sheet.

## Interaction principles

- Progressive disclosure: three intake fields before ten optional ones; summaries before
  diagrams; diagrams before detail tables; "Teach me" adds contextual explanations only when on.
- The analysis run shows a meaningful sequence — eight chips in the guided order, each carrying
  a micro-silhouette of its eventual diagram, moving queued → running → done — not a spinner.
- Everything substantive is clickable into the inspector, and every inspector view ends in
  "Traces to", keeping the provenance chain one click away at all times.
- The user's words are authoritative: the case-model review is a first-class phase, every
  rewrite keeps `sourceText`, and reclassification is an explicit, logged act.
