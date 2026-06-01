"use client";

import { useCallback, useState } from "react";
import { ReactFlow,
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
import { OpeningNodeData, useStore } from "../lib/store";

type OpeningTreeNode = Node<OpeningNodeData>;

type OpeningTreeEdge = Edge;

const initialNodes: OpeningTreeNode[] = [];
const initialEdges: OpeningTreeEdge[] = [];

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

let id = 0;
const getId = () => `node_${id++}`;

export default function OpeningTree({
  nodes: externalNodes,
  edges: externalEdges,
  onNodeClick,
  onAddNode,
  selectedNode,
}: {
  nodes: OpeningTreeNode[];
  edges: OpeningTreeEdge[];
  onNodeClick: (nodeId: string) => void;
  onAddNode: (parentId: string, move: string) => void;
  selectedNode: string | null;
}) {
  const { setNodes: setGlobalNodes, setEdges: setGlobalEdges } = useStore();
  const [modal, setModal] = useState<ModalState>(null);

  const onConnect = useCallback(
    (params: Connection) => {
      // guard: avoid adding duplicate edges which can trigger update loops
      const exists = externalEdges.some((e) => e.source === params.source && e.target === params.target);
      if (exists) return;
      const newEdge = { ...params, id: `${params.source}-${params.target}` } as Edge;
      const nextEdges = addEdge(newEdge, externalEdges);
      if (nextEdges.length !== externalEdges.length) {
        setGlobalEdges(nextEdges);
      }
    },
    [externalEdges, setGlobalEdges]
  );

  const onNodesChange = useCallback(
    (changes: Parameters<typeof applyNodeChanges>[0]) => {
      try {
        const next = applyNodeChanges(changes, externalNodes) as OpeningTreeNode[];
        // ensure data has a label to satisfy types and avoid empty objects
        const normalized = next.map((n) => ({
          ...n,
          data: { ...(n.data as any), label: (n.data as any).label ?? (n.data as any).move ?? "" },
        } as OpeningTreeNode));

        const changed = normalized.length !== externalNodes.length || normalized.some((nn, i) => JSON.stringify(nn) !== JSON.stringify(externalNodes[i]));
        if (changed) setGlobalNodes(normalized);
      } catch (e) {
        // swallow and avoid breaking flow
        // eslint-disable-next-line no-console
        console.warn('onNodesChange error', e);
      }
    },
    [externalNodes, setGlobalNodes]
  );

  const onEdgesChange = useCallback(
    (changes: Parameters<typeof applyEdgeChanges>[0]) => {
      try {
        const next = applyEdgeChanges(changes, externalEdges) as OpeningTreeEdge[];
        const changed = next.length !== externalEdges.length || next.some((ne, i) => JSON.stringify(ne) !== JSON.stringify(externalEdges[i]));
        if (changed) setGlobalEdges(next);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn('onEdgesChange error', e);
      }
    },
    [externalEdges, setGlobalEdges]
  );

  const onNodeDoubleClick = (node: OpeningTreeNode) => {
    setModal({ type: 'move', nodeId: node.id, value: '' });
  };

  const onNodeContextMenu = (node: OpeningTreeNode, e: React.MouseEvent) => {
    e.preventDefault();
    setModal({ type: 'color', nodeId: node.id, value: '' });
  };

  const onNodeClickHandler = (node: OpeningTreeNode) => {
    onNodeClick(node.id);
  };

  return (
    <div className="opening-tree h-[600px] w-full relative">
      <ReactFlow
        nodes={externalNodes}
        edges={externalEdges}
        onConnect={onConnect}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeDoubleClick={(_e, node) => onNodeDoubleClick(node as OpeningTreeNode)}
        onNodeContextMenu={(_e, node) => onNodeContextMenu(node as OpeningTreeNode, _e as any)}
        onNodeClick={(_e, node) => onNodeClickHandler(node as OpeningTreeNode)}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.5 }}
      >
        <Controls />
        <Background />
      </ReactFlow>
      {/* Inline modal for move / color input */}
      {modal && modal.type === 'move' && (
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

      {modal && modal.type === 'color' && (
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
                  const updatedNodes = externalNodes.map((n) => {
                    if (n.id === modal.nodeId) {
                      const newData = { ...n.data, color };
                      if (n.data && (n.data as any).color === color) return n;
                      return { ...n, data: newData };
                    }
                    return n;
                  });
                  const changed = updatedNodes.some((u, i) => u !== externalNodes[i]);
                  if (changed) setGlobalNodes(updatedNodes);
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

type ModalState = { type: 'move' | 'color'; nodeId: string; value: string } | null;