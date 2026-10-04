/**
 * Diagram layout engine. Produces top-left positions for React Flow from a
 * schema Diagram, with a strategy per diagramType:
 *  - dagre (layered DAG): argument_map, hypothesis_tree, causal_graph, evidence_flow
 *  - circle: causal_loop
 *  - radial rings: perspective_map (subject center, standpoints mid, context outer)
 *  - typed columns: decision_landscape
 *  - alternating timeline: dialectic_sequence
 */
import dagre from "@dagrejs/dagre";
import type { Diagram, DiagramNode } from "@/lib/schema";

export const NODE_WIDTH = 216;

export function estimateNodeHeight(node: DiagramNode): number {
  const charsPerLine = 30;
  const lines = Math.max(1, Math.ceil(node.label.length / charsPerLine));
  return 34 + lines * 17;
}

export type Positions = Record<string, { x: number; y: number }>;

function dagreLayout(diagram: Diagram, rankdir: "TB" | "BT" | "LR" | "RL"): Positions {
  const g = new dagre.graphlib.Graph();
  g.setGraph({ rankdir, nodesep: 36, ranksep: 64, marginx: 24, marginy: 24 });
  g.setDefaultEdgeLabel(() => ({}));
  for (const n of diagram.nodes) {
    g.setNode(n.id, { width: NODE_WIDTH, height: estimateNodeHeight(n) });
  }
  for (const e of diagram.edges) {
    if (g.hasNode(e.from) && g.hasNode(e.to)) g.setEdge(e.from, e.to);
  }
  dagre.layout(g);
  const out: Positions = {};
  for (const n of diagram.nodes) {
    const pos = g.node(n.id);
    out[n.id] = { x: pos.x - NODE_WIDTH / 2, y: pos.y - estimateNodeHeight(n) / 2 };
  }
  return out;
}

function circleLayout(diagram: Diagram): Positions {
  const ring = diagram.nodes.filter((n) => n.nodeType !== "stock");
  const stocks = diagram.nodes.filter((n) => n.nodeType === "stock");
  const n = Math.max(ring.length, 1);
  const radius = Math.max(220, n * 46);
  const cx = radius + NODE_WIDTH;
  const cy = radius + 80;
  const out: Positions = {};
  ring.forEach((node, i) => {
    const angle = (2 * Math.PI * i) / n - Math.PI / 2;
    out[node.id] = {
      x: cx + radius * Math.cos(angle) - NODE_WIDTH / 2,
      y: cy + radius * Math.sin(angle) - estimateNodeHeight(node) / 2,
    };
  });
  stocks.forEach((node, i) => {
    out[node.id] = {
      x: cx - NODE_WIDTH / 2 + (i - (stocks.length - 1) / 2) * (NODE_WIDTH + 30),
      y: cy - estimateNodeHeight(node) / 2,
    };
  });
  return out;
}

function radialLayout(diagram: Diagram): Positions {
  const center = diagram.nodes.find((n) => n.nodeType === "subject");
  const standpoints = diagram.nodes.filter((n) => n.nodeType === "standpoint");
  const meanings = diagram.nodes.filter((n) => n.nodeType === "meaning");
  const contexts = diagram.nodes.filter((n) => n.nodeType === "context");
  const other = diagram.nodes.filter(
    (n) => !["subject", "standpoint", "meaning", "context"].includes(n.nodeType)
  );
  const r1 = 270; // standpoints
  const r2 = 430; // meanings interleaved
  const r3 = 560; // context layer
  const cx = r3 + NODE_WIDTH;
  const cy = r3 * 0.72 + 60;
  const out: Positions = {};
  if (center) out[center.id] = { x: cx - NODE_WIDTH / 2, y: cy - estimateNodeHeight(center) / 2 };
  const placeRing = (nodes: DiagramNode[], radius: number, spread: number, offset: number) => {
    const n = Math.max(nodes.length, 1);
    nodes.forEach((node, i) => {
      // Fan across an arc rather than a full circle so the map reads top-down.
      const angle = -Math.PI / 2 + offset + spread * (n === 1 ? 0 : i / (n - 1) - 0.5);
      out[node.id] = {
        x: cx + radius * Math.cos(angle) - NODE_WIDTH / 2,
        y: cy + radius * 0.72 * Math.sin(angle) - estimateNodeHeight(node) / 2,
      };
    });
  };
  placeRing(standpoints, r1, Math.PI * 1.5, 0);
  placeRing(meanings, r2, Math.PI * 0.9, Math.PI);
  placeRing(contexts, r3, Math.PI * 0.8, 0);
  placeRing(other, r2, Math.PI * 1.2, Math.PI / 2);
  return out;
}

function columnsLayout(diagram: Diagram): Positions {
  const columns: Array<{ types: string[]; label: string }> = [
    { types: ["option"], label: "Options" },
    { types: ["goal"], label: "Goals & values" },
    { types: ["constraint"], label: "Constraints" },
    { types: ["tension"], label: "Tensions" },
    { types: [], label: "Other" }, // catch-all
  ];
  const colX = (i: number) => 24 + i * (NODE_WIDTH + 72);
  const out: Positions = {};
  const used = new Set<string>();
  columns.forEach((col, ci) => {
    const nodes =
      col.types.length > 0
        ? diagram.nodes.filter((n) => col.types.includes(n.nodeType))
        : diagram.nodes.filter((n) => !used.has(n.id));
    let y = 24;
    for (const n of nodes) {
      if (used.has(n.id)) continue;
      used.add(n.id);
      out[n.id] = { x: colX(ci), y };
      y += estimateNodeHeight(n) + 26;
    }
  });
  return out;
}

function timelineLayout(diagram: Diagram): Positions {
  // Alternate columns: challenges left, replies/concessions right,
  // thesis/steelman/revision centered — ordered as given.
  const leftTypes = new Set(["challenge"]);
  const centerTypes = new Set(["thesis", "steelman", "revision"]);
  const centerX = NODE_WIDTH + 100;
  const out: Positions = {};
  let y = 24;
  for (const n of diagram.nodes) {
    const h = estimateNodeHeight(n);
    const x = centerTypes.has(n.nodeType)
      ? centerX
      : leftTypes.has(n.nodeType)
        ? 24
        : centerX + NODE_WIDTH + 76;
    out[n.id] = { x, y };
    y += h + 30;
  }
  return out;
}

export function layoutDiagram(diagram: Diagram): Positions {
  switch (diagram.diagramType) {
    case "argument_map":
      return dagreLayout(diagram, "BT");
    case "hypothesis_tree":
      return dagreLayout(diagram, "LR");
    case "causal_graph":
      return dagreLayout(diagram, "LR");
    case "evidence_flow":
      return dagreLayout(diagram, "LR");
    case "causal_loop":
      return circleLayout(diagram);
    case "perspective_map":
      return radialLayout(diagram);
    case "decision_landscape":
      return columnsLayout(diagram);
    case "dialectic_sequence":
      return timelineLayout(diagram);
    case "constellation":
      return dagreLayout(diagram, "LR");
    default:
      return dagreLayout(diagram, "TB");
  }
}
