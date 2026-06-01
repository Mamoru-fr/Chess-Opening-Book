import { create } from "zustand";
import { Node, Edge } from "@xyflow/react";

export type OpeningNodeData = {
  label: string;
  move?: string;
  color?: string;
  notes?: string;
};

type Annotation = {
  arrows: Array<{ from: string; to: string; color: string }>;
  squares: Array<{ square: string; color: string }>;
};

type Folder = {
  id: string;
  name: string;
};

type StoreState = {
  nodes: Node<OpeningNodeData>[];
  edges: Edge[];
  annotations: Annotation;
  folders: Folder[];
  selectedFolder: string | null;
  addNode: (node: Node<OpeningNodeData>) => void;
  addEdge: (edge: Edge) => void;
  setNodes: (nodes: Node<OpeningNodeData>[]) => void;
  setEdges: (edges: Edge[]) => void;
  setAnnotations: (annotations: Annotation) => void;
  setFolders: (folders: Folder[]) => void;
  setSelectedFolder: (folderId: string | null) => void;
};

export const useStore = create<StoreState>((set) => ({
  nodes: [],
  edges: [],
  annotations: { arrows: [], squares: [] },
  folders: [],
  selectedFolder: null,

  addNode: (node) => set((state) => ({ nodes: [...state.nodes, node] })),
  addEdge: (edge) => set((state) => ({ edges: [...state.edges, edge] })),
  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  setAnnotations: (annotations) => set({ annotations }),
  setFolders: (folders) => set({ folders }),
  setSelectedFolder: (folderId) => set({ selectedFolder: folderId }),
}));