"use client";

import { useCallback, useState } from "react";
import {
  ReactFlow,
  addEdge,
  Controls,
  Background,
  Node,
  Edge,
  NodeTypes,
  Connection,
  applyNodeChanges,
  applyEdgeChanges,
} from "@xyflow/react";
import { OpeningNodeData } from "../types";

type OpeningTreeNode = Node<OpeningNodeData>;

type OpeningTreeEdge = Edge;

const nodeTypes: NodeTypes = {
  default: ({ data }) => (
    <div
      className="node flex items-start gap-2"
      style={{
        backgroundColor: data.color || "#3a3a3a",
        minWidth: 140,
        padding: 8,
      }}
    >
      <div className="flex-1">
        <div className="font-semibold text-sm">{data.label}</div>
        {data.notes && <div className="text-xs mt-1 text-[0.8rem]">{data.notes}</div>}
        {data.move && <div className="text-xs mt-1 text-[#b8b2a8]">{data.move}</div>}
      </div>
      {data.move ? (
        <div className="ml-2 rounded-md bg-[#2d2a26] px-2 py-1 text-xs text-[#f4f1ea]">{data.move}</div>
      ) : null}
    </div>
  ),
};

export default function OpeningTree({
  nodes,
  edges,
  onNodeClick,
  onAddNode,
  selectedNodeIds,
  onSelectedNodeIdsChange,
  onNodesUpdate,
  onEdgesUpdate,
  onApplyColor,
}: {
  nodes: OpeningTreeNode[];
  edges: OpeningTreeEdge[];
  onNodeClick: (nodeId: string) => void;
  onAddNode: (parentId: string, move: string) => void;
  selectedNodeIds: string[];
  onSelectedNodeIdsChange: (nodeIds: string[]) => void;
  onNodesUpdate: (nodes: OpeningTreeNode[]) => void;
  onEdgesUpdate: (edges: OpeningTreeEdge[]) => void;
  onApplyColor: (nodeIds: string[], color: string) => void;
}) {
  const [modal, setModal] = useState<ModalState>(null);

  const onConnect = useCallback(
    (params: Connection) => {
      const exists = edges.some((e) => e.source === params.source && e.target === params.target);
      if (exists) return;
      const newEdge = { ...params, id: `${params.source}-${params.target}` } as Edge;
      const nextEdges = addEdge(newEdge, edges);
      if (nextEdges.length !== edges.length) {
        onEdgesUpdate(nextEdges);
      }
    },
    [edges, onEdgesUpdate]
  );

  const onNodesChange = useCallback(
    (changes: Parameters<typeof applyNodeChanges>[0]) => {
      try {
        const next = applyNodeChanges(changes, nodes) as OpeningTreeNode[];
        const normalized = next.map((n) => ({
          ...n,
          data: {
            ...(n.data || { label: "" }),
            label: n.data?.label ?? n.data?.move ?? "",
          },
        } as OpeningTreeNode));
        onNodesUpdate(normalized);
      } catch (e) {
        console.warn("onNodesChange error", e);
      }
    },
    [nodes, onNodesUpdate]
  );

  const onEdgesChange = useCallback(
    (changes: Parameters<typeof applyEdgeChanges>[0]) => {
      try {
        const next = applyEdgeChanges(changes, edges) as OpeningTreeEdge[];
        onEdgesUpdate(next);
      } catch (e) {
        console.warn("onEdgesChange error", e);
      }
    },
    [edges, onEdgesUpdate]
  );

  const onNodeDoubleClick = (node: OpeningTreeNode) => {
    setModal({ type: "move", nodeId: node.id, value: "" });
  };

  const onNodeContextMenu = (node: OpeningTreeNode, e: React.MouseEvent) => {
    e.preventDefault();
    setModal({ type: "color", nodeId: node.id, value: "" });
  };

  const onNodeClickHandler = (_e: React.MouseEvent, node: OpeningTreeNode) => {
    onNodeClick(node.id);
  };

  return (
    <div className="opening-tree h-150 w-full relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onConnect={onConnect}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onSelectionChange={({ nodes: selectedNodes }) => {
          onSelectedNodeIdsChange((selectedNodes || []).map((n) => n.id));
        }}
        onNodeDoubleClick={(_e, node) => onNodeDoubleClick(node)}
        onNodeContextMenu={(e, node) => onNodeContextMenu(node, e)}
        onNodeClick={(e, node) => onNodeClickHandler(e, node)}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.5 }}
      >
        <Controls />
        <Background />
      </ReactFlow>
      {/* Inline modal for move / color input */}
      {modal && modal.type === "move" && (
        <div className="absolute left-1/2 top-1/2 z-50 w-[320px] -translate-x-1/2 -translate-y-1/2 rounded-lg bg-[#262421] p-4 shadow-lg">
          <div className="mb-2 text-sm font-medium text-[#f4f1ea]">Entrez le coup (ex: e4, Nf3):</div>
          <input
            autoFocus
            value={modal.value}
            onChange={(e) => setModal((m) => m ? { ...m, value: e.target.value } : m)}
            className="w-full rounded-md border px-3 py-2 bg-[#1f1d1b] text-[#f4f1ea]"
          />
          <div className="mt-3 flex justify-end gap-2">
            <button onClick={() => setModal(null)} className="rounded px-3 py-1 text-sm">Annuler</button>
            <button
              onClick={() => {
                if (modal && modal.value.trim()) {
                  onAddNode(modal.nodeId, modal.value.trim());
                }
                setModal(null);
              }}
              className="rounded bg-[#81b64c] px-3 py-1 text-sm font-semibold text-[#111]"
            >
              Ajouter
            </button>
          </div>
        </div>
      )}

      {modal && modal.type === "color" && (
        <div className="absolute left-1/2 top-1/2 z-50 w-[320px] -translate-x-1/2 -translate-y-1/2 rounded-lg bg-[#262421] p-4 shadow-lg">
          <div className="mb-2 text-sm font-medium text-[#f4f1ea]">Choisir une couleur pour le noeud:</div>
          <input
            autoFocus
            placeholder="#ff0000 or green"
            value={modal.value}
            onChange={(e) => setModal((m) => m ? { ...m, value: e.target.value } : m)}
            className="w-full rounded-md border px-3 py-2 bg-[#1f1d1b] text-[#f4f1ea]"
          />
          <div className="mt-3 flex justify-end gap-2">
            <button onClick={() => setModal(null)} className="rounded px-3 py-1 text-sm">Annuler</button>
            <button
              onClick={() => {
                if (modal && modal.value.trim()) {
                  const color = modal.value.trim();
                  const targets = selectedNodeIds.length > 0 ? selectedNodeIds : [modal.nodeId];
                  onApplyColor(targets, color);
                }
                setModal(null);
              }}
              className="rounded bg-[#81b64c] px-3 py-1 text-sm font-semibold text-[#111]"
            >
              Appliquer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

type ModalState = { type: "move" | "color"; nodeId: string; value: string } | null;