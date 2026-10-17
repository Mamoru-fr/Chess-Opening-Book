"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Chess } from "chess.js";
import "@xyflow/react/dist/base.css";
import {
  getOpening,
  getOpeningAnnotations,
  getUserFolders,
  getUserOpenings,
  saveNodeAnnotation,
  updateOpening,
} from "@/lib/actions/openingActions";
import { Node, Edge } from "@xyflow/react";
import { OpeningNodeData } from "@/types";
import { Loader } from "lucide-react";

const OpeningTree = dynamic(() => import("@/components/OpeningTree"), { ssr: false });
const ChessBoard = dynamic(() => import("@/components/ChessBoard"), { ssr: false });

const START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

type BoardAnnotations = {
  arrows: Array<{ from: string; to: string; color: string }>;
  squares: Array<{ square: string; color: string }>;
};

type Folder = { id: number; name: string };

type OpeningRecord = {
  id: number;
  name: string;
  description?: string | null;
  folderId?: number | null;
  nodesData?: Node<OpeningNodeData>[];
  edgesData?: Edge[];
};

const EMPTY_ANNOTATIONS: BoardAnnotations = { arrows: [], squares: [] };

function canonicalMove(move: string) {
  return move.trim().toLowerCase().replace(/[+#?!]/g, "");
}

export default function OpeningPage() {
  const params = useParams();
  const router = useRouter();
  const openingId = parseInt(params.id as string);

  const [opening, setOpening] = useState<OpeningRecord | null>(null);
  const [nodes, setNodes] = useState<Node<OpeningNodeData>[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>([]);
  const [collapsedNodeIds, setCollapsedNodeIds] = useState<Set<string>>(new Set());
  const [boardSize, setBoardSize] = useState(400);
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState<"editor" | "analysis" | "testing">("editor");
  const [activeColor, setActiveColor] = useState("green");
  const [boardAnnotations, setBoardAnnotations] = useState<BoardAnnotations>(EMPTY_ANNOTATIONS);
  const [nodeNotesById, setNodeNotesById] = useState<Record<string, string>>({});
  const [annotationByNode, setAnnotationByNode] = useState<Record<string, BoardAnnotations>>({});
  const [nodeNoteDraft, setNodeNoteDraft] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisBestMove, setAnalysisBestMove] = useState<string>("-");
  const [analysisTopMoves, setAnalysisTopMoves] = useState<Array<{ move: string; count: number }>>([]);

  const [folders, setFolders] = useState<Folder[]>([]);
  const [allOpenings, setAllOpenings] = useState<OpeningRecord[]>([]);
  const [testFolderId, setTestFolderId] = useState<string>("all");
  const [testOpeningId, setTestOpeningId] = useState<string>("");
  const [testNodes, setTestNodes] = useState<Node<OpeningNodeData>[]>([]);
  const [testEdges, setTestEdges] = useState<Edge[]>([]);
  const [testStartNodeId, setTestStartNodeId] = useState<string>("");
  const [testCurrentNodeId, setTestCurrentNodeId] = useState<string>("");
  const [testMoveInput, setTestMoveInput] = useState("");
  const [testWrongExpected, setTestWrongExpected] = useState<string[]>([]);
  const [testShowWrongModal, setTestShowWrongModal] = useState(false);

  const isLoadedRef = useRef(false);

  const loadOpening = useCallback(async () => {
    try {
      setLoading(true);
      const [openingData, annotationsData, foldersData, openingsData] = await Promise.all([
        getOpening(openingId),
        getOpeningAnnotations(openingId),
        getUserFolders(),
        getUserOpenings(),
      ]);

      setOpening(openingData as OpeningRecord);

      const loadedNodes = (openingData?.nodesData || []) as Node<OpeningNodeData>[];
      const loadedEdges = (openingData?.edgesData || []) as Edge[];

      if (loadedNodes.length === 0) {
        const rootNode: Node<OpeningNodeData> = {
          id: "root",
          position: { x: 120, y: 120 },
          data: { label: "Position de depart", fen: START_FEN, move: "start" },
        };
        setNodes([rootNode]);
        setEdges([]);
        setSelectedNodeIds([rootNode.id]);
      } else {
        setNodes(loadedNodes);
        setEdges(loadedEdges);
        setSelectedNodeIds([loadedNodes[0].id]);
      }

      const collapsed = new Set<string>();
      loadedNodes.forEach((n) => {
        if (n.data?.collapsed) collapsed.add(n.id);
      });
      setCollapsedNodeIds(collapsed);

      const nextAnnByNode: Record<string, BoardAnnotations> = {};
      const nextNotes: Record<string, string> = {};
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (annotationsData || []).forEach((row: any) => {
        nextAnnByNode[row.nodeId] = {
          arrows: Array.isArray(row.arrowsData) ? row.arrowsData : [],
          squares: Array.isArray(row.squaresData) ? row.squaresData : [],
        };
        if (row.notes) nextNotes[row.nodeId] = row.notes;
      });

      loadedNodes.forEach((n) => {
        if (n.data?.notes && !nextNotes[n.id]) nextNotes[n.id] = n.data.notes;
      });

      setAnnotationByNode(nextAnnByNode);
      setNodeNotesById(nextNotes);
      setFolders((foldersData || []) as Folder[]);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setAllOpenings((openingsData || []) as any[]);

      const initialTestId = String((openingData as OpeningRecord | null)?.id || "");
      setTestOpeningId(initialTestId);
      setTestNodes(((openingData as OpeningRecord | null)?.nodesData || []) as Node<OpeningNodeData>[]);
      setTestEdges(((openingData as OpeningRecord | null)?.edgesData || []) as Edge[]);
      const initialNodes = ((openingData as OpeningRecord | null)?.nodesData || []) as Node<OpeningNodeData>[];
      const startId = initialNodes[0]?.id || "";
      setTestStartNodeId(startId);
      setTestCurrentNodeId(startId);

      isLoadedRef.current = true;
    } catch (err) {
      console.error("Failed to load opening:", err);
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  }, [openingId, router]);

  useEffect(() => {
    loadOpening();
  }, [openingId, loadOpening]);

  const selectedNodeId = selectedNodeIds[0] || null;
    const selectedNode = useMemo(
      () => (selectedNodeId ? nodes.find((n) => n.id === selectedNodeId) || null : null),
      [nodes, selectedNodeId]
    );

    const childrenMap = useMemo(() => {
      const map = new Map<string, string[]>();
      edges.forEach((e) => {
        const arr = map.get(e.source) || [];
        arr.push(e.target);
        map.set(e.source, arr);
      });
      return map;
    }, [edges]);

    const hiddenNodeIds = useMemo(() => {
      const hidden = new Set<string>();
      const walk = (id: string) => {
        const children = childrenMap.get(id) || [];
        children.forEach((childId) => {
          if (!hidden.has(childId)) {
            hidden.add(childId);
            walk(childId);
          }
        });
      };
      collapsedNodeIds.forEach((nodeId) => walk(nodeId));
      return hidden;
    }, [childrenMap, collapsedNodeIds]);

    const visibleNodes = useMemo(
      () => nodes.filter((n) => !hiddenNodeIds.has(n.id)).map((n) => ({ ...n, selected: selectedNodeIds.includes(n.id) })),
      [nodes, hiddenNodeIds, selectedNodeIds]
    );
    const visibleEdges = useMemo(
      () => edges.filter((e) => !hiddenNodeIds.has(e.source) && !hiddenNodeIds.has(e.target)),
      [edges, hiddenNodeIds]
    );

    useEffect(() => {
      if (!selectedNodeId) return;
      setBoardAnnotations(annotationByNode[selectedNodeId] || EMPTY_ANNOTATIONS);
      setNodeNoteDraft(nodeNotesById[selectedNodeId] || "");
    }, [selectedNodeId, annotationByNode, nodeNotesById]);

    useEffect(() => {
      if (!isLoadedRef.current || !selectedNodeId) return;
      const timer = setTimeout(async () => {
        const node = nodes.find((n) => n.id === selectedNodeId);
        if (!node) return;

        setAnnotationByNode((prev) => ({ ...prev, [selectedNodeId]: boardAnnotations }));
        setNodeNotesById((prev) => ({ ...prev, [selectedNodeId]: nodeNoteDraft }));
        setNodes((prev) =>
          prev.map((n) =>
            n.id === selectedNodeId
              ? { ...n, data: { ...n.data, notes: nodeNoteDraft } }
              : n
          )
        );

        try {
          await saveNodeAnnotation(openingId, selectedNodeId, {
            notes: nodeNoteDraft,
            color: node.data?.color,
            arrowsData: boardAnnotations.arrows,
            squaresData: boardAnnotations.squares,
          });
        } catch (e) {
          console.error("Failed to save node annotation:", e);
        }
      }, 350);

      return () => clearTimeout(timer);
    }, [boardAnnotations, nodeNoteDraft, selectedNodeId, nodes, openingId]);

    useEffect(() => {
      if (currentTab !== "analysis") return;
      // Analyse IA (Stockfish) : debranchee en session 1, reintegration prevue en Phase C (PROJET.md)
      setAnalysisLoading(false);
      setAnalysisBestMove("-");
      
      // Analyze popular moves from database
      const moveCount = new Map<string, number>();
      if (selectedNode) {
        const fen = selectedNode.data?.fen || START_FEN;
        allOpenings.forEach((op) => {
          const opNodes = (op.nodesData || []) as Node<OpeningNodeData>[];
          const opEdges = (op.edgesData || []) as Edge[];
          const byId = new Map(opNodes.map((n) => [n.id, n]));
          opEdges.forEach((e) => {
            const sourceNode = byId.get(e.source);
            const targetNode = byId.get(e.target);
            if (!sourceNode || !targetNode) return;
            if ((sourceNode.data?.fen || START_FEN) === fen && targetNode.data?.move) {
              moveCount.set(targetNode.data.move, (moveCount.get(targetNode.data.move) || 0) + 1);
            }
          });
        });

        const sortedMoves = Array.from(moveCount.entries())
          .map(([move, count]) => ({ move, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 8);
        setAnalysisTopMoves(sortedMoves);
      }
    }, [currentTab, selectedNode, allOpenings]);

    const filteredTestOpenings = useMemo(() => {
      if (testFolderId === "all") return allOpenings;
      return allOpenings.filter((o) => String(o.folderId || "") === testFolderId);
    }, [allOpenings, testFolderId]);

    useEffect(() => {
      if (!testOpeningId) return;
      const run = async () => {
        const testOpening = await getOpening(parseInt(testOpeningId, 10));
        const nextNodes = (testOpening?.nodesData || []) as Node<OpeningNodeData>[];
        const nextEdges = (testOpening?.edgesData || []) as Edge[];
        setTestNodes(nextNodes);
        setTestEdges(nextEdges);
        const startId = nextNodes[0]?.id || "";
        setTestStartNodeId(startId);
        setTestCurrentNodeId(startId);
        setTestMoveInput("");
        setTestWrongExpected([]);
        setTestShowWrongModal(false);
      };
      run();
    }, [testOpeningId]);

    const testChildren = useMemo(() => {
      const byId = new Map(testNodes.map((n) => [n.id, n]));
      const out = testEdges
        .filter((e) => e.source === testCurrentNodeId)
        .map((e) => byId.get(e.target))
        .filter(Boolean) as Node<OpeningNodeData>[];
      return out;
    }, [testNodes, testEdges, testCurrentNodeId]);

    const handleNodeClick = useCallback((id: string) => setSelectedNodeIds([id]), []);

    const handleNodesUpdate = useCallback((nextNodes: Node<OpeningNodeData>[]) => {
      setNodes(nextNodes);
    }, []);

    const handleEdgesUpdate = useCallback((nextEdges: Edge[]) => {
      setEdges(nextEdges);
    }, []);

    const handleSaveAll = async () => {
      try {
        setIsSaving(true);
        await updateOpening(openingId, {
          nodesData: nodes,
          edgesData: edges,
        });
        setStatusMessage("Sauvegarde reussie");
      } catch (err) {
        console.error("Failed to save opening:", err);
        setStatusMessage("Echec de sauvegarde");
      } finally {
        setIsSaving(false);
        setTimeout(() => setStatusMessage(""), 2000);
      }
    };

    const handleAddNode = (parentId: string, moveInput: string) => {
      const parent = nodes.find((n) => n.id === parentId);
      if (!parent) return;

      const chess = new Chess();
      const parentFen = parent.data?.fen || START_FEN;
      try {
        chess.load(parentFen);
        const played = chess.move(moveInput);
        if (!played?.san) {
          window.alert("Coup invalide pour cette position.");
          return;
        }

        const existingChildEdge = edges.find((e) => {
          if (e.source !== parentId) return false;
          const targetNode = nodes.find((n) => n.id === e.target);
          return canonicalMove(targetNode?.data?.move || "") === canonicalMove(played.san);
        });

        if (existingChildEdge) {
          setSelectedNodeIds([existingChildEdge.target]);
          return;
        }

        const siblingCount = edges.filter((e) => e.source === parentId).length;
        const newNodeId = `node_${Date.now()}`;
        const newNode: Node<OpeningNodeData> = {
          id: newNodeId,
          data: {
            label: played.san,
            move: played.san,
            fen: chess.fen(),
          },
          position: {
            x: parent.position.x + 220,
            y: parent.position.y + siblingCount * 100,
          },
        };

        setNodes((prev) => [...prev, newNode]);
        setEdges((prev) => [...prev, { id: `${parentId}-${newNodeId}`, source: parentId, target: newNodeId }]);
        setSelectedNodeIds([newNodeId]);
      } catch {
        window.alert("Coup invalide pour cette position.");
      }
    };

    const handleApplyColor = async (nodeIds: string[], color: string) => {
      setNodes((prev) =>
        prev.map((n) => (nodeIds.includes(n.id) ? { ...n, data: { ...n.data, color } } : n))
      );

      await Promise.all(
        nodeIds.map(async (nodeId) => {
          const anno = annotationByNode[nodeId] || EMPTY_ANNOTATIONS;
          const notes = nodeNotesById[nodeId] || "";
          try {
            await saveNodeAnnotation(openingId, nodeId, {
              color,
              notes,
              arrowsData: anno.arrows,
              squaresData: anno.squares,
            });
          } catch (e) {
            console.error("Failed to save color:", e);
          }
        })
      );
    };

    const toggleCollapseForSelection = () => {
      if (!selectedNodeId) return;
      setCollapsedNodeIds((prev) => {
        const next = new Set(prev);
        if (next.has(selectedNodeId)) next.delete(selectedNodeId);
        else next.add(selectedNodeId);
        return next;
      });
      setNodes((prev) =>
        prev.map((n) =>
          n.id === selectedNodeId
            ? { ...n, data: { ...n.data, collapsed: !n.data?.collapsed } }
            : n
        )
      );
    };

    const expandAll = () => {
      setCollapsedNodeIds(new Set());
      setNodes((prev) => prev.map((n) => ({ ...n, data: { ...n.data, collapsed: false } })));
    };

    const handleBoardMovePlayed = (san: string, fen: string) => {
      if (!selectedNodeId) return;
      const existing = edges.find((e) => {
        if (e.source !== selectedNodeId) return false;
        const targetNode = nodes.find((n) => n.id === e.target);
        return canonicalMove(targetNode?.data?.move || "") === canonicalMove(san);
      });

      if (existing) {
        setSelectedNodeIds([existing.target]);
        return;
      }

      const parent = nodes.find((n) => n.id === selectedNodeId);
      if (!parent) return;

      const siblingCount = edges.filter((e) => e.source === selectedNodeId).length;
      const newNodeId = `node_${Date.now()}_${Math.floor(Math.random() * 9999)}`;
      const newNode: Node<OpeningNodeData> = {
        id: newNodeId,
        data: { label: san, move: san, fen },
        position: {
          x: parent.position.x + 220,
          y: parent.position.y + siblingCount * 100,
        },
      };

      setNodes((prev) => [...prev, newNode]);
      setEdges((prev) => [...prev, { id: `${selectedNodeId}-${newNodeId}`, source: selectedNodeId, target: newNodeId }]);
      setSelectedNodeIds([newNodeId]);
    };

    const startTest = () => {
      if (!testStartNodeId) return;
      setTestCurrentNodeId(testStartNodeId);
      setTestMoveInput("");
      setTestWrongExpected([]);
      setTestShowWrongModal(false);
    };

    const submitTestMove = () => {
      if (!testCurrentNodeId) return;
      const expectedMoves = testChildren.map((n) => n.data?.move || "").filter(Boolean);
      if (expectedMoves.length === 0) {
        setStatusMessage("Test termine: plus de suite dans cette branche.");
        return;
      }

      const normalized = canonicalMove(testMoveInput);
      const matched = testChildren.find((n) => canonicalMove(n.data?.move || "") === normalized);
      if (!matched) {
        setTestWrongExpected(expectedMoves);
        setTestShowWrongModal(true);
        return;
      }

      setTestCurrentNodeId(matched.id);
      setTestMoveInput("");
      setTestWrongExpected([]);
      setTestShowWrongModal(false);
    };

    const renderTestHintLines = () => {
      const byId = new Map(testNodes.map((n) => [n.id, n]));
      const lines: string[] = [];

      const walk = (nodeId: string, depth: number) => {
        if (depth > 3) return;
        const children = testEdges.filter((e) => e.source === nodeId).map((e) => byId.get(e.target)).filter(Boolean) as Node<OpeningNodeData>[];
        children.forEach((child) => {
          lines.push(`${"  ".repeat(depth)}- ${child.data?.move || child.data?.label || "?"}`);
          walk(child.id, depth + 1);
        });
      };

      walk(testCurrentNodeId, 0);
      return lines;
    };

    if (loading) {
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

    const selectedFen = selectedNode?.data?.fen || START_FEN;

    const boardColorChoices = ["green", "red", "blue", "yellow", "purple", "orange"];

    return (
      <div className="space-y-6">
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
              {tab === "editor" && "Editeur"}
              {tab === "analysis" && "Analyse"}
              {tab === "testing" && "Test"}
            </button>
          ))}
        </div>

        <div>
          {currentTab === "editor" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-[#262421] border border-[#2d2926] rounded-xl p-4 shadow-lg shadow-black/20" style={{ height: "700px" }}>
                <div className="mb-3 flex flex-wrap gap-2">
                  <button
                    onClick={toggleCollapseForSelection}
                    className="rounded bg-[#3d3a36] px-3 py-1 text-sm text-[#f4f1ea] hover:bg-[#4a4640]"
                  >
                    Replier/Deplier branche selectionnee
                  </button>
                  <button
                    onClick={expandAll}
                    className="rounded bg-[#3d3a36] px-3 py-1 text-sm text-[#f4f1ea] hover:bg-[#4a4640]"
                  >
                    Tout deplier
                  </button>
                  <span className="ml-auto text-xs text-[#b8b2a8]">
                    Selection multiple: Shift/Ctrl dans l&apos;arbre
                  </span>
                </div>

                <OpeningTree
                  nodes={visibleNodes}
                  edges={visibleEdges}
                  onNodeClick={handleNodeClick}
                  onAddNode={handleAddNode}
                  selectedNodeIds={selectedNodeIds}
                  onSelectedNodeIdsChange={setSelectedNodeIds}
                  onNodesUpdate={handleNodesUpdate}
                  onEdgesUpdate={handleEdgesUpdate}
                  onApplyColor={handleApplyColor}
                />
              </div>

              <div className="flex flex-col gap-4">
                <div className="bg-[#262421] border border-[#2d2926] rounded-xl p-4">
                  <label className="block text-[#f4f1ea] text-sm font-semibold mb-2">Taille du plateau</label>
                  <input
                    type="range"
                    min="300"
                    max="700"
                    value={boardSize}
                    onChange={(e) => setBoardSize(parseInt(e.target.value, 10))}
                    className="w-full"
                  />
                  <span className="text-[#b8b2a8] text-sm">{boardSize}px</span>
                </div>

                <div className="bg-[#262421] border border-[#2d2926] rounded-xl p-4">
                  <label className="block text-[#f4f1ea] text-sm font-semibold mb-2">Couleur annotation</label>
                  <div className="flex flex-wrap gap-2">
                    {boardColorChoices.map((c) => (
                      <button
                        key={c}
                        onClick={() => setActiveColor(c)}
                        className={`rounded px-2 py-1 text-xs font-semibold ${activeColor === c ? "ring-2 ring-white" : ""}`}
                        style={{ backgroundColor: c }}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-[#262421] border border-[#2d2926] rounded-xl p-4">
                  <label className="block text-[#f4f1ea] text-sm font-semibold mb-2">Notes du noeud selectionne</label>
                  <textarea
                    value={nodeNoteDraft}
                    onChange={(e) => setNodeNoteDraft(e.target.value)}
                    placeholder="Ajoute des idees, plans, pieges..."
                    className="h-24 w-full rounded border border-[#3d3a36] bg-[#1f1d1b] p-2 text-sm text-[#f4f1ea]"
                  />
                </div>

                <div className="bg-[#262421] border border-[#2d2926] rounded-xl p-4 flex justify-center">
                  <ChessBoard
                    key={selectedNodeId || "no-node"}
                    initialFen={selectedFen}
                    size={boardSize}
                    annotations={boardAnnotations}
                    setAnnotations={setBoardAnnotations}
                    activeColor={activeColor}
                    onMovePlayed={handleBoardMovePlayed}
                  />
                </div>

                <button
                  onClick={handleSaveAll}
                  disabled={isSaving}
                  className="w-full px-4 py-2 bg-[#81b64c] hover:bg-[#95c95c] text-white font-semibold rounded transition-colors disabled:opacity-70"
                >
                  {isSaving ? "Sauvegarde..." : "Sauvegarder l'ouverture"}
                </button>
                {statusMessage && <p className="text-center text-sm text-[#b8b2a8]">{statusMessage}</p>}
              </div>
            </div>
          )}

          {currentTab === "analysis" && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="bg-[#262421] border border-[#2d2926] rounded-xl p-6">
                <h3 className="mb-3 text-lg font-semibold text-[#f4f1ea]">Meilleur coup (IA)</h3>
                <p className="text-sm text-[#b8b2a8] mb-2">Position analysee: {selectedFen}</p>
                <p className="text-[#f4f1ea]">
                  Analyse IA (Stockfish) : a venir en Phase C. En attendant, les coups les plus joues dans tes bases ci-contre.
                </p>
              </div>
              <div className="bg-[#262421] border border-[#2d2926] rounded-xl p-6">
                <h3 className="mb-3 text-lg font-semibold text-[#f4f1ea]">Coups les plus joues (dans tes bases)</h3>
                {analysisTopMoves.length === 0 ? (
                  <p className="text-[#b8b2a8]">Pas encore de statistiques sur cette position.</p>
                ) : (
                  <ul className="space-y-2">
                    {analysisTopMoves.map((m) => (
                      <li key={m.move} className="flex items-center justify-between text-[#f4f1ea]">
                        <span>{m.move}</span>
                        <span className="text-[#b8b2a8]">{m.count}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          {currentTab === "testing" && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="bg-[#262421] border border-[#2d2926] rounded-xl p-4">
                  <label className="mb-2 block text-sm font-semibold text-[#f4f1ea]">Dossier</label>
                  <select
                    value={testFolderId}
                    onChange={(e) => setTestFolderId(e.target.value)}
                    className="w-full rounded border border-[#3d3a36] bg-[#1f1d1b] p-2 text-[#f4f1ea]"
                  >
                    <option value="all">Tous</option>
                    {folders.map((f) => (
                      <option key={f.id} value={String(f.id)}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="bg-[#262421] border border-[#2d2926] rounded-xl p-4">
                  <label className="mb-2 block text-sm font-semibold text-[#f4f1ea]">Ouverture</label>
                  <select
                    value={testOpeningId}
                    onChange={(e) => setTestOpeningId(e.target.value)}
                    className="w-full rounded border border-[#3d3a36] bg-[#1f1d1b] p-2 text-[#f4f1ea]"
                  >
                    {filteredTestOpenings.map((o) => (
                      <option key={o.id} value={String(o.id)}>
                        {o.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="bg-[#262421] border border-[#2d2926] rounded-xl p-4">
                  <label className="mb-2 block text-sm font-semibold text-[#f4f1ea]">Noeud de depart</label>
                  <select
                    value={testStartNodeId}
                    onChange={(e) => setTestStartNodeId(e.target.value)}
                    className="w-full rounded border border-[#3d3a36] bg-[#1f1d1b] p-2 text-[#f4f1ea]"
                  >
                    {testNodes.map((n) => (
                      <option key={n.id} value={n.id}>
                        {n.data?.move || n.data?.label || n.id}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="bg-[#262421] border border-[#2d2926] rounded-xl p-6">
                <div className="mb-4 flex flex-wrap items-center gap-2">
                  <button
                    onClick={startTest}
                    className="rounded bg-[#81b64c] px-4 py-2 font-semibold text-white hover:bg-[#95c95c]"
                  >
                    Demarrer / Recommencer
                  </button>
                  <span className="text-sm text-[#b8b2a8]">
                    Position actuelle: {testCurrentNodeId || "-"}
                  </span>
                </div>

                <div className="flex gap-2">
                  <input
                    value={testMoveInput}
                    onChange={(e) => setTestMoveInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") submitTestMove();
                    }}
                    placeholder="Entre ton coup (ex: e4, Nf3, Cd7)"
                    className="flex-1 rounded border border-[#3d3a36] bg-[#1f1d1b] p-2 text-[#f4f1ea]"
                  />
                  <button
                    onClick={submitTestMove}
                    className="rounded bg-[#3d3a36] px-4 py-2 text-[#f4f1ea] hover:bg-[#4a4640]"
                  >
                    Valider
                  </button>
                </div>

                <p className="mt-3 text-sm text-[#b8b2a8]">
                  Coups attendus ici: {testChildren.map((n) => n.data?.move).filter(Boolean).join(", ") || "Aucun"}
                </p>
              </div>

              {testShowWrongModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                  <div className="w-full max-w-2xl rounded-xl border border-[#2d2926] bg-[#262421] p-6">
                    <h3 className="mb-2 text-xl font-semibold text-[#f4f1ea]">Mauvais coup</h3>
                    <p className="mb-3 text-[#b8b2a8]">
                      Coups attendus: {testWrongExpected.join(", ") || "-"}
                    </p>
                    <div className="mb-4 max-h-48 overflow-auto rounded bg-[#1f1d1b] p-3 font-mono text-sm text-[#f4f1ea]">
                      {renderTestHintLines().length > 0 ? renderTestHintLines().join("\n") : "(Aucun sous-arbre a afficher)"}
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setTestShowWrongModal(false)}
                        className="rounded bg-[#3d3a36] px-4 py-2 text-[#f4f1ea] hover:bg-[#4a4640]"
                      >
                        Fermer et continuer
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );

}