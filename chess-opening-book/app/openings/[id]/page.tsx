"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Chess } from "chess.js";
import { getOpening, getOpeningAnnotations, updateOpening } from "@/lib/actions/openingActions";
import { Node, Edge } from "@xyflow/react";
import { OpeningNodeData } from "@/lib/store";
import { Loader } from "lucide-react";

const OpeningTree = dynamic(() => import("@/components/OpeningTree"), { ssr: false });
const ChessBoard = dynamic(() => import("@/components/ChessBoard"), { ssr: false });

export default function OpeningPage() {
  const params = useParams();
  const router = useRouter();
  const openingId = parseInt(params.id as string);

  const [opening, setOpening] = useState<any>(null);
  const [annotations, setAnnotations] = useState<any[]>([]);
  const [chess, setChess] = useState<Chess | null>(null);
  const [nodes, setNodes] = useState<Node<OpeningNodeData>[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [boardSize, setBoardSize] = useState(400);
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState<"editor" | "analysis" | "testing">("editor");
  const [boardAnnotations, setBoardAnnotations] = useState({
    arrows: [] as Array<{ from: string; to: string; color: string }>,
    squares: [] as Array<{ square: string; color: string }>,
  });

  useEffect(() => {
    loadOpening();
    setChess(new Chess());
  }, [openingId]);

  async function loadOpening() {
    try {
      setLoading(true);
      const [openingData, annotationsData] = await Promise.all([
        getOpening(openingId),
        getOpeningAnnotations(openingId),
      ]);

      setOpening(openingData);
      setAnnotations(annotationsData || []);

      if (openingData?.nodesData) setNodes(openingData.nodesData as Node<OpeningNodeData>[]);
      if (openingData?.edgesData) setEdges(openingData.edgesData as Edge[]);
    } catch (err) {
      console.error("Failed to load opening:", err);
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  }

  const handleSaveNodes = async () => {
    try {
      await updateOpening(openingId, {
        nodesData: nodes,
        edgesData: edges,
      });
    } catch (err) {
      console.error("Failed to save opening:", err);
    }
  };

  if (loading || !chess) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 text-[#81b64c] animate-spin" />
      </div>
    );
  }

  if (!opening) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-[#b8b2a8]">Ouverture non trouvée</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-[#2d2926] pb-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold text-[#f4f1ea]">{opening.name}</h1>
          <button
            onClick={() => router.push("/dashboard")}
            className="px-4 py-2 bg-[#3d3a36] hover:bg-[#4a4640] text-[#f4f1ea] rounded transition-colors"
          >
            ← Retour
          </button>
        </div>
        {opening.description && <p className="text-[#b8b2a8]">{opening.description}</p>}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[#2d2926]">
        {(["editor", "analysis", "testing"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setCurrentTab(tab)}
            className={`px-4 py-3 font-semibold transition-colors border-b-2 ${
              currentTab === tab
                ? "text-[#81b64c] border-[#81b64c]"
                : "text-[#b8b2a8] border-transparent hover:text-[#f4f1ea]"
            }`}
          >
            {tab === "editor" && "Éditeur"}
            {tab === "analysis" && "Analyse"}
            {tab === "testing" && "Test"}
          </button>
        ))}
      </div>

      {/* Content */}
      <div>
        {currentTab === "editor" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Opening Tree */}
            <div className="lg:col-span-2 bg-[#262421] border border-[#2d2926] rounded-xl p-4 shadow-lg shadow-black/20" style={{ height: "600px" }}>
              {nodes.length > 0 ? (
                <OpeningTree
                  nodes={nodes}
                  edges={edges}
                  onNodeClick={setSelectedNode}
                  onAddNode={(parentId, move) => {
                    const newNodeId = `node_${Date.now()}`;
                    const newNode: Node<OpeningNodeData> = {
                      id: newNodeId,
                      data: { label: move, move },
                      position: { x: Math.random() * 300, y: Math.random() * 300 },
                    };
                    setNodes([...nodes, newNode]);
                    setEdges([...edges, { id: `${parentId}-${newNodeId}`, source: parentId, target: newNodeId }]);
                  }}
                  selectedNode={selectedNode}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-[#b8b2a8]">
                  <p>Aucun coup ajouté. Commencez en cliquant sur le plateau.</p>
                </div>
              )}
            </div>

            {/* Board */}
            <div className="flex flex-col gap-4">
              <div className="bg-[#262421] border border-[#2d2926] rounded-xl p-4">
                <label className="block text-[#f4f1ea] text-sm font-semibold mb-2">Taille du plateau</label>
                <input
                  type="range"
                  min="300"
                  max="600"
                  value={boardSize}
                  onChange={(e) => setBoardSize(parseInt(e.target.value))}
                  className="w-full"
                />
                <span className="text-[#b8b2a8] text-sm">{boardSize}px</span>
              </div>

              <div className="bg-[#262421] border border-[#2d2926] rounded-xl p-4 flex justify-center">
                <ChessBoard
                  chess={chess}
                  size={boardSize}
                  annotations={boardAnnotations}
                  setAnnotations={setBoardAnnotations}
                  selectedNode={selectedNode}
                />
              </div>

              <button
                onClick={handleSaveNodes}
                className="w-full px-4 py-2 bg-[#81b64c] hover:bg-[#95c95c] text-white font-semibold rounded transition-colors"
              >
                💾 Sauvegarder
              </button>
            </div>
          </div>
        )}

        {currentTab === "analysis" && (
          <div className="bg-[#262421] border border-[#2d2926] rounded-xl p-6 text-[#b8b2a8]">
            <p>Onglet Analyse (à implémenter - Stockfish + meilleurs coups)</p>
          </div>
        )}

        {currentTab === "testing" && (
          <div className="bg-[#262421] border border-[#2d2926] rounded-xl p-6 text-[#b8b2a8]">
            <p>Onglet Test (à implémenter - Mode Puzzle & Mode Drill)</p>
          </div>
        )}
      </div>
    </div>
  );
}
