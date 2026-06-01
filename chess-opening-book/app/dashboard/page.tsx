"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getUserFolders, getUserOpenings, createFolder, createOpening } from "@/lib/actions/openingActions";
import { Loader } from "lucide-react";

export default function Dashboard() {
  const [folders, setFolders] = useState<any[]>([]);
  const [openings, setOpenings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [showNewOpening, setShowNewOpening] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [newOpeningName, setNewOpeningName] = useState("");
  const [selectedFolder, setSelectedFolder] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [foldersData, openingsData] = await Promise.all([
        getUserFolders(),
        getUserOpenings(),
      ]);
      setFolders(foldersData || []);
      setOpenings(openingsData || []);
    } catch (err) {
      console.error("Failed to load data:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    try {
      await createFolder(newFolderName);
      setNewFolderName("");
      setShowNewFolder(false);
      loadData();
    } catch (err) {
      console.error("Failed to create folder:", err);
    }
  };

  const handleCreateOpening = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOpeningName.trim()) return;

    try {
      await createOpening(newOpeningName, selectedFolder);
      setNewOpeningName("");
      setShowNewOpening(false);
      setSelectedFolder(null);
      loadData();
    } catch (err) {
      console.error("Failed to create opening:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 text-[#81b64c] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-[#2d2926] pb-6">
        <h1 className="text-4xl font-bold text-[#f4f1ea] mb-2">Carnet d'Ouvertures</h1>
        <p className="text-[#b8b2a8]">Gérez vos ouvertures d'échecs</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Folders Section */}
        <div className="lg:col-span-1">
          <div className="bg-[#262421] border border-[#2d2926] rounded-xl p-6 shadow-lg shadow-black/20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-[#f4f1ea]">Dossiers</h2>
              <button
                onClick={() => setShowNewFolder(!showNewFolder)}
                className="text-[#81b64c] hover:text-[#95c95c] text-2xl transition-colors"
              >
                +
              </button>
            </div>

            {showNewFolder && (
              <form onSubmit={handleCreateFolder} className="mb-4 space-y-2">
                <input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="Nom du dossier..."
                  className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#2d2926] rounded-lg text-[#f4f1ea] placeholder-[#b8b2a8] focus:ring-1 focus:ring-[#81b64c] focus:outline-none transition-colors"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 px-3 py-2 bg-[#81b64c] hover:bg-[#95c95c] text-white rounded font-semibold transition-colors"
                  >
                    Créer
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowNewFolder(false)}
                    className="flex-1 px-3 py-2 bg-[#3d3a36] hover:bg-[#4a4640] text-[#f4f1ea] rounded transition-colors"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-2">
              <div
                onClick={() => setSelectedFolder(null)}
                className={`p-3 rounded cursor-pointer transition-colors ${
                  selectedFolder === null
                    ? "bg-[#81b64c] text-white"
                    : "bg-[#1a1a1a] text-[#f4f1ea] hover:bg-[#3d3a36]"
                }`}
              >
                Tous les dossiers
              </div>
              {folders.map((folder) => (
                <div
                  key={folder.id}
                  onClick={() => setSelectedFolder(folder.id)}
                  className={`p-3 rounded cursor-pointer transition-colors ${
                    selectedFolder === folder.id
                      ? "bg-[#81b64c] text-white"
                      : "bg-[#1a1a1a] text-[#f4f1ea] hover:bg-[#3d3a36]"
                  }`}
                >
                  📁 {folder.name}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Openings Section */}
        <div className="lg:col-span-2">
          <div className="bg-[#262421] border border-[#2d2926] rounded-xl p-6 shadow-lg shadow-black/20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-[#f4f1ea]">
                {selectedFolder ? `Dossier ${folders.find((f) => f.id === selectedFolder)?.name}` : "Toutes les ouvertures"}
              </h2>
              <button
                onClick={() => setShowNewOpening(!showNewOpening)}
                className="px-4 py-2 bg-[#81b64c] hover:bg-[#95c95c] text-white rounded font-semibold transition-colors"
              >
                + Nouvelle Ouverture
              </button>
            </div>

            {showNewOpening && (
              <form onSubmit={handleCreateOpening} className="mb-6 space-y-3 p-4 bg-[#1a1a1a] rounded-lg border border-[#2d2926]">
                <input
                  type="text"
                  value={newOpeningName}
                  onChange={(e) => setNewOpeningName(e.target.value)}
                  placeholder="Nom de l'ouverture..."
                  className="w-full px-3 py-2 bg-[#262421] border border-[#2d2926] rounded-lg text-[#f4f1ea] placeholder-[#b8b2a8] focus:ring-1 focus:ring-[#81b64c] focus:outline-none transition-colors"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 px-3 py-2 bg-[#81b64c] hover:bg-[#95c95c] text-white rounded font-semibold transition-colors"
                  >
                    Créer
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowNewOpening(false)}
                    className="flex-1 px-3 py-2 bg-[#3d3a36] hover:bg-[#4a4640] text-[#f4f1ea] rounded transition-colors"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {openings.length === 0 ? (
                <p className="text-[#b8b2a8] col-span-full text-center py-8">Aucune ouverture créée</p>
              ) : (
                openings.map((opening) => (
                  <Link
                    key={opening.id}
                    href={`/openings/${opening.id}`}
                    className="p-4 bg-[#1a1a1a] border border-[#2d2926] rounded-xl hover:border-[#81b64c] hover:bg-[#2a2420] transition-all duration-200 cursor-pointer group shadow-sm shadow-black/10 hover:shadow-md hover:shadow-black/20"
                  >
                    <h3 className="font-semibold text-[#f4f1ea] group-hover:text-[#81b64c] transition-colors mb-2">
                      {opening.name}
                    </h3>
                    <p className="text-[#b8b2a8] text-sm mb-2">{opening.description}</p>
                    <div className="flex items-center justify-between text-xs text-[#b8b2a8]">
                      <span>Créée: {new Date(opening.createdAt).toLocaleDateString("fr-FR")}</span>
                      <span className="text-[#81b64c]">→</span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
