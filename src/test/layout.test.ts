import { describe, expect, it } from "vitest";
import { LENS_IDS } from "@/lib/schema";
import { layoutDiagram } from "@/lib/layout";
import { officeAnalyses } from "@/lib/llm/mock/sample-office";

describe("diagram layout", () => {
  it("positions every node with finite coordinates for all eight diagram types", () => {
    for (const lens of LENS_IDS) {
      const diagram = officeAnalyses[lens].diagram;
      const positions = layoutDiagram(diagram);
      for (const node of diagram.nodes) {
        const p = positions[node.id];
        expect(p, `${lens}/${node.id}`).toBeDefined();
        expect(Number.isFinite(p.x), `${lens}/${node.id} x`).toBe(true);
        expect(Number.isFinite(p.y), `${lens}/${node.id} y`).toBe(true);
      }
    }
  });

  it("keeps distinct nodes from stacking exactly on top of each other", () => {
    for (const lens of LENS_IDS) {
      const diagram = officeAnalyses[lens].diagram;
      const positions = layoutDiagram(diagram);
      const seen = new Set<string>();
      for (const node of diagram.nodes) {
        const key = `${Math.round(positions[node.id].x)}:${Math.round(positions[node.id].y)}`;
        expect(seen.has(key), `${lens}: two nodes at ${key}`).toBe(false);
        seen.add(key);
      }
    }
  });

  it("handles a stress diagram of 80 nodes and 160 edges", () => {
    const nodes = Array.from({ length: 80 }, (_, i) => ({
      id: `n${i}`,
      label: `Node ${i} with a reasonably long label for sizing`,
      nodeType: "variable",
      epistemicType: "model_inference" as const,
      confidence: "low" as const,
      traceRefs: [],
    }));
    const edges = Array.from({ length: 160 }, (_, i) => ({
      id: `e${i}`,
      from: `n${i % 80}`,
      to: `n${(i * 7 + 3) % 80}`,
      relation: "causes",
      traceRefs: [],
    }));
    const positions = layoutDiagram({ diagramType: "causal_graph", nodes, edges });
    expect(Object.keys(positions).length).toBe(80);
    for (const p of Object.values(positions)) {
      expect(Number.isFinite(p.x) && Number.isFinite(p.y)).toBe(true);
    }
  });
});
