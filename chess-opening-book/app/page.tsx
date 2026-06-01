import Link from "next/link";
import { authClient } from "@/lib/auth/auth.client";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a1a1a] via-[#0f0f0f] to-[#000000] text-white flex flex-col items-center justify-center px-4">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#81b64c] opacity-5 blur-3xl rounded-full"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#81b64c] opacity-5 blur-3xl rounded-full"></div>
      </div>

      {/* Content */}
      <div className="text-center space-y-6 max-w-2xl">
        <div className="text-6xl mb-4">♔</div>
        <h1 className="text-5xl md:text-6xl font-bold">Chess Opening Book</h1>
        <p className="text-xl text-[#b8b2a8]">
          Construisez votre répertoire d'ouvertures avec un outil professionnel inspiré de Chess.com
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-8 text-left">
          <div className="bg-[#262421] border border-[#3d3a36] rounded-lg p-4">
            <div className="text-2xl mb-2">📚</div>
            <h3 className="font-semibold text-[#81b64c] mb-2">Organiser</h3>
            <p className="text-sm text-[#b8b2a8]">Dossiers et arbre d'ouvertures avec notation algébrique</p>
          </div>
          <div className="bg-[#262421] border border-[#3d3a36] rounded-lg p-4">
            <div className="text-2xl mb-2">🎯</div>
            <h3 className="font-semibold text-[#81b64c] mb-2">Analyser</h3>
            <p className="text-sm text-[#b8b2a8]">Annotez avec Stockfish et les meilleurs coups</p>
          </div>
          <div className="bg-[#262421] border border-[#3d3a36] rounded-lg p-4">
            <div className="text-2xl mb-2">✏️</div>
            <h3 className="font-semibold text-[#81b64c] mb-2">Pratiquer</h3>
            <p className="text-sm text-[#b8b2a8]">Testez-vous avec des modes Puzzle et Drill</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <Link href="/dashboard">
            <button className="w-full md:w-auto px-8 py-3 bg-[#81b64c] hover:bg-[#95c95c] text-white font-semibold rounded-lg transition-all hover:scale-105">
              Commencer
            </button>
          </Link>
          <button
            onClick={() => authClient.signIn()}
            className="w-full md:w-auto px-8 py-3 bg-[#262421] hover:bg-[#3d3a36] text-white font-semibold rounded-lg border border-[#3d3a36] transition-all"
          >
            Se connecter
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-6 text-center text-[#b8b2a8] text-sm">
        <p>Inspiré de Chess.com • Alimenté par Stockfish</p>
      </div>
    </div>
  );
}
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#a6a193]">Chess Opening Book</p>
            <h1 className="text-3xl font-semibold tracking-tight text-[#f4f1ea] md:text-4xl">Carnet d'Ouvertures d'Échecs</h1>
            <p className="max-w-2xl text-sm text-[#b8b2a8] md:text-base">
              Organisez vos lignes, annotiez les cases et gardez votre répertoire d'ouvertures dans une interface inspirée de Chess.com.
            </p>
          </header>

          <div className="flex flex-col gap-6 xl:flex-row">
            <aside className="w-full rounded-[28px] border border-[#3d3a36] bg-[#262421]/95 p-4 shadow-[0_18px_55px_rgba(0,0,0,0.28)] xl:w-72">
              <h2 className="mb-4 text-lg font-semibold text-[#f4f1ea]">Dossiers</h2>
              <button
                onClick={() => {
                  const newFolder = { id: Date.now().toString(), name: "Nouveau Dossier" };
                  setFolders([...folders, newFolder]);
                }}
                className="mb-4 w-full rounded-xl border border-[#6a9d3f] bg-[#81b64c] px-4 py-2.5 font-semibold text-[#111] transition hover:bg-[#95c95c]"
              >
                + Nouveau Dossier
              </button>
              <ul className="space-y-2">
                {folders.map((folder) => (
                  <li
                    key={folder.id}
                    onClick={() => setSelectedFolder(folder.id)}
                    className={`cursor-pointer rounded-xl border px-3 py-2 transition ${
                      selectedFolder === folder.id
                        ? "border-[#81b64c] bg-[#81b64c] text-[#111]"
                        : "border-[#4a463f] bg-[#312d29] text-[#f4f1ea] hover:border-[#81b64c]"
                    }`}
                  >
                    {folder.name}
                  </li>
                ))}
              </ul>
              <button
                onClick={handleNewOpening}
                className="mt-4 w-full rounded-xl border border-[#6a9d3f] bg-[#81b64c] px-4 py-2.5 font-semibold text-[#111] transition hover:bg-[#95c95c]"
              >
                + Nouvelle Ouverture
              </button>
            </aside>

            <main className="flex-1 space-y-6">
              <section className="rounded-[28px] border border-[#3d3a36] bg-[#262421]/95 p-4 shadow-[0_18px_55px_rgba(0,0,0,0.28)] md:p-5">
                <div className="mb-4 flex flex-wrap items-center gap-4">
                  <label className="text-sm font-medium text-[#f4f1ea]">
                    Taille du plateau: {boardSize}px
                    <input
                      type="range"
                      min="300"
                      max="600"
                      value={boardSize}
                      onChange={(e) => setBoardSize(Number(e.target.value))}
                      className="mt-2 w-full accent-[#81b64c]"
                    />
                  </label>
                  <button
                    onClick={() => setShowBoard(!showBoard)}
                    className="rounded-xl border border-[#4a463f] bg-[#312d29] px-4 py-2 text-sm font-semibold text-[#f4f1ea] transition hover:border-[#81b64c] hover:bg-[#37332f]"
                  >
                    {showBoard ? "Masquer" : "Afficher"} le plateau
                  </button>
                </div>

                {showBoard && (
                  <ChessBoard
                    chess={chess}
                    size={boardSize}
                    annotations={annotations}
                    setAnnotations={setAnnotations}
                    selectedNode={selectedNode}
                  />
                )}
              </section>

              <section className="opening-tree p-4">
                <OpeningTree
                  nodes={nodes}
                  edges={edges}
                  onNodeClick={handleNodeClick}
                  onAddNode={handleAddNode}
                  selectedNode={selectedNode}
                />
              </section>
            </main>
          </div>
        </div>
      </div>
    </DndProvider>
  );
}