"use client";
/**
 * Interactive diagram canvas on React Flow. Epistemic semantics are encoded
 * in node shape + border style + glyph (color never alone); edge meaning in
 * line style + label + arrowhead. Nodes are keyboard-activatable and the
 * whole canvas has a structured-list twin (DiagramOutline).
 */
import React, { useCallback, useEffect, useMemo } from "react";
import {
  Background,
  BackgroundVariant,
  Controls,
  Handle,
  MarkerType,
  Position,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  type Edge as RFEdge,
  type Node as RFNode,
  type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { Diagram, DiagramEdge, DiagramNode } from "@/lib/schema";
import { EPISTEMIC_STYLES, epColor, epSoft } from "@/lib/epistemic";
import { EpistemicGlyph } from "@/components/ui/primitives";
import { NODE_WIDTH, layoutDiagram } from "@/lib/layout";

// ---------------------------------------------------------------------------
// Custom node
// ---------------------------------------------------------------------------

export interface LwNodeData extends Record<string, unknown> {
  node: DiagramNode;
  selected: boolean;
  dimmed: boolean;
  highlighted: boolean;
  onActivate: (id: string) => void;
}

function LwNode({ data }: NodeProps<RFNode<LwNodeData>>) {
  const { node, selected, dimmed, highlighted, onActivate } = data;
  const style = EPISTEMIC_STYLES[node.epistemicType];
  const color = epColor(node.epistemicType);
  const soft = epSoft(node.epistemicType);
  const isValue = style.shape === "diamond";
  const isFact = style.shape === "square-solid";

  return (
    <>
      {/* Handles on all four sides; the canvas picks per-edge anchors. */}
      <Handle id="tt" type="target" position={Position.Top} />
      <Handle id="st" type="source" position={Position.Top} />
      <Handle id="tb" type="target" position={Position.Bottom} />
      <Handle id="sb" type="source" position={Position.Bottom} />
      <Handle id="tl" type="target" position={Position.Left} />
      <Handle id="sl" type="source" position={Position.Left} />
      <Handle id="tr" type="target" position={Position.Right} />
      <Handle id="sr" type="source" position={Position.Right} />
      <div
        role="button"
        tabIndex={0}
        aria-label={`${style.label}: ${node.label}. Press Enter for details.`}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onActivate(node.id);
          }
        }}
        onClick={() => onActivate(node.id)}
        className="lw-node cursor-pointer rounded-md px-2.5 py-2 text-[12.5px] leading-snug transition-opacity"
        style={{
          width: NODE_WIDTH,
          background: isFact ? "var(--surface)" : soft,
          border: `${style.borderStyle === "solid" ? 1.6 : 1.8}px ${style.borderStyle} ${color}`,
          borderRadius: isValue ? 2 : 6,
          clipPath: isValue
            ? "polygon(12px 0, calc(100% - 12px) 0, 100% 50%, calc(100% - 12px) 100%, 12px 100%, 0 50%)"
            : undefined,
          paddingLeft: isValue ? 18 : undefined,
          paddingRight: isValue ? 18 : undefined,
          opacity: dimmed ? 0.3 : 1,
          boxShadow: selected
            ? "0 0 0 2px var(--accent)"
            : highlighted
              ? `0 0 0 2px ${color}`
              : "var(--shadow)",
          color: "var(--ink)",
        }}
      >
        <span className="mb-1 flex items-center gap-1.5 text-[10.5px] uppercase tracking-wide" style={{ color }}>
          <EpistemicGlyph type={node.epistemicType} size={10} />
          <span>{node.nodeType.replace(/_/g, " ")}</span>
          {node.epistemicType === "external_source" && node.traceRefs.length > 0 && (
            <span aria-hidden>↗</span>
          )}
        </span>
        <span className="block font-medium">{node.label}</span>
      </div>
    </>
  );
}

const nodeTypes = { lw: LwNode };

// ---------------------------------------------------------------------------
// Edge styling
// ---------------------------------------------------------------------------

function edgeVisual(e: DiagramEdge): {
  stroke: string;
  dash?: string;
  width: number;
  label?: string;
  animatedClass?: string;
} {
  const rel = e.relation.toLowerCase();
  let stroke = "var(--edge-neutral)";
  let width = 1.4;
  if (["supports", "satisfies", "strengthens", "explains"].includes(rel)) stroke = "var(--edge-support)";
  if (["contradicts", "conflicts", "challenges", "raises"].includes(rel)) stroke = "var(--edge-contradict)";
  if (rel === "causal_identified") width = 2.4;

  // Uncertain or merely-claimed relations are dashed; associations dotted.
  let dash: string | undefined;
  if (rel === "association") dash = "2 4";
  else if (e.certainty === "low" || rel === "causal_hypothesis") dash = "6 4";
  else if (e.certainty === "medium") dash = "10 3";

  const parts: string[] = [];
  const relLabel = e.label ?? (["supports", "causes", "interprets"].includes(rel) ? undefined : rel.replace(/_/g, " "));
  if (rel === "contradicts") parts.push("⊗ contradicts");
  else if (relLabel) parts.push(relLabel);
  if (e.polarity === "positive") parts.push("+");
  if (e.polarity === "negative") parts.push("−");
  if (e.delayed) parts.push("‖ delay");
  return { stroke, dash, width, label: parts.length ? parts.join("  ") : undefined };
}

// ---------------------------------------------------------------------------
// Canvas
// ---------------------------------------------------------------------------

export interface DiagramCanvasProps {
  diagram: Diagram;
  selectedId?: string;
  onSelect: (id: string | null) => void;
  /** Node ids to highlight (e.g. one systems loop); others dim. */
  highlightIds?: Set<string>;
  /** Extra class for loop animation etc. */
  flowClassName?: string;
  /** Hide specific node ids entirely (provenance filter). */
  hiddenIds?: Set<string>;
}

function orientationFor(diagramType: string): "h" | "v-up" | "v-down" | "auto" {
  switch (diagramType) {
    case "argument_map":
      return "v-up";
    case "hypothesis_tree":
    case "causal_graph":
    case "evidence_flow":
    case "decision_landscape":
      return "h";
    case "dialectic_sequence":
      return "auto";
    default:
      return "auto";
  }
}

function InnerCanvas({
  diagram,
  selectedId,
  onSelect,
  highlightIds,
  flowClassName = "",
  hiddenIds,
}: DiagramCanvasProps) {
  const positions = useMemo(() => layoutDiagram(diagram), [diagram]);
  const { fitView } = useReactFlow();

  const activate = useCallback((id: string) => onSelect(id), [onSelect]);

  const nodes: RFNode<LwNodeData>[] = useMemo(
    () =>
      diagram.nodes
        .filter((n) => !hiddenIds?.has(n.id))
        .map((n) => ({
          id: n.id,
          type: "lw",
          position: positions[n.id] ?? { x: 0, y: 0 },
          data: {
            node: n,
            selected: selectedId === n.id,
            dimmed: Boolean(highlightIds && highlightIds.size > 0 && !highlightIds.has(n.id)),
            highlighted: Boolean(highlightIds?.has(n.id)),
            onActivate: activate,
          },
          focusable: true,
        })),
    [diagram.nodes, positions, selectedId, highlightIds, hiddenIds, activate]
  );

  const orientation = orientationFor(diagram.diagramType);

  const edges: RFEdge[] = useMemo(
    () =>
      diagram.edges
        .filter((e) => !hiddenIds?.has(e.from) && !hiddenIds?.has(e.to))
        .map((e) => {
          const v = edgeVisual(e);
          const inHighlight =
            !highlightIds || highlightIds.size === 0 || (highlightIds.has(e.from) && highlightIds.has(e.to));
          let sourceHandle = "sr";
          let targetHandle = "tl";
          if (orientation === "v-up") {
            sourceHandle = "st";
            targetHandle = "tb";
          } else if (orientation === "v-down") {
            sourceHandle = "sb";
            targetHandle = "tt";
          } else if (orientation === "auto") {
            const a = positions[e.from];
            const b = positions[e.to];
            if (a && b) {
              const dx = b.x - a.x;
              const dy = b.y - a.y;
              if (Math.abs(dy) > Math.abs(dx)) {
                sourceHandle = dy > 0 ? "sb" : "st";
                targetHandle = dy > 0 ? "tt" : "tb";
              } else {
                sourceHandle = dx > 0 ? "sr" : "sl";
                targetHandle = dx > 0 ? "tl" : "tr";
              }
            }
          }
          return {
            id: e.id,
            source: e.from,
            target: e.to,
            sourceHandle,
            targetHandle,
            label: v.label,
            labelStyle: { fontSize: 11, fill: "var(--ink-muted)" },
            labelBgStyle: { fill: "var(--surface)", fillOpacity: 0.9 },
            style: {
              stroke: v.stroke,
              strokeWidth: v.width,
              strokeDasharray: v.dash,
              opacity: inHighlight ? 1 : 0.15,
            },
            markerEnd: { type: MarkerType.ArrowClosed, color: v.stroke, width: 16, height: 16 },
          } satisfies RFEdge;
        }),
    [diagram.edges, highlightIds, hiddenIds, orientation, positions]
  );

  useEffect(() => {
    // Re-fit when the diagram itself changes (not on selection churn).
    const t = setTimeout(() => fitView({ padding: 0.15, duration: 0 }), 30);
    return () => clearTimeout(t);
  }, [diagram, fitView]);

  return (
    <ReactFlow
      className={`lw-flow ${flowClassName}`}
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      fitView
      fitViewOptions={{ padding: 0.15 }}
      minZoom={0.15}
      maxZoom={2}
      nodesConnectable={false}
      nodesDraggable
      elementsSelectable
      panOnScroll
      zoomOnPinch
      onPaneClick={() => onSelect(null)}
      proOptions={{ hideAttribution: true }}
      aria-label={`${diagram.diagramType.replace(/_/g, " ")} diagram with ${diagram.nodes.length} nodes. A structured list equivalent is available below the diagram.`}
    >
      <Background variant={BackgroundVariant.Dots} gap={22} size={1.2} color="var(--line)" />
      <Controls showInteractive={false} position="bottom-right" />
    </ReactFlow>
  );
}

export default function DiagramCanvas(props: DiagramCanvasProps) {
  return (
    <ReactFlowProvider>
      <InnerCanvas {...props} />
    </ReactFlowProvider>
  );
}
