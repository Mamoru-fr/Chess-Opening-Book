"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { useSession } from "@/lib/auth/auth.client";
import { useRouter } from "next/navigation";

export default function RootLayout({ children }: { children: ReactNode }) {
  const session = useSession();
  const router = useRouter();

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1a1a1a] to-[#0f0f0f] text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Chess Opening Book</h1>
          <p className="text-gray-400 mb-8">Connectez-vous pour continuer</p>
          <Link href="/auth/signin" className="bg-[#81b64c] hover:bg-[#95c95c] text-white px-6 py-2 rounded-lg font-semibold">
            Se connecter
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a1a1a] to-[#0f0f0f]">
      {/* Navigation */}
      <nav className="border-b border-[#3d3a36] bg-[#262421]/90 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="flex items-center gap-2">
              <span className="text-2xl">♔</span>
              <span className="font-bold text-xl text-[#81b64c]">Opening Book</span>
            </Link>
            <div className="flex gap-4">
              <Link href="/dashboard" className="text-[#f4f1ea] hover:text-[#81b64c] transition-colors">
                Dashboard
              </Link>
              <Link href="/openings" className="text-[#f4f1ea] hover:text-[#81b64c] transition-colors">
                Ouvertures
              </Link>
              <Link href="/folders" className="text-[#f4f1ea] hover:text-[#81b64c] transition-colors">
                Dossiers
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[#b8b2a8]">{session.user?.email}</span>
            <button
              onClick={() => {
                // Logout logic here
                router.push("/");
              }}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
