"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ReactNode } from "react";
import { useSession as useBetterAuthSession } from "@/lib/auth/auth.client";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { data: session } = useBetterAuthSession();
  const router = useRouter();

  // Redirect if not authenticated
  if (!session?.user) {
    router.push("/auth/signin");
    return null;
  }

  const handleLogout = async () => {
    // Logout logic
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a1a1a] to-[#0f0f0f]">
      {/* Navigation */}
      <nav className="border-b border-[#3d3a36] bg-[#262421]/90 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <span className="text-2xl">♔</span>
              <span className="font-bold text-xl text-[#81b64c]">Opening Book</span>
            </Link>
            <div className="hidden md:flex gap-6">
              <Link href="/dashboard" className="text-[#f4f1ea] hover:text-[#81b64c] transition-colors font-medium">
                Dashboard
              </Link>
              <Link href="/openings" className="text-[#f4f1ea] hover:text-[#81b64c] transition-colors font-medium">
                Ouvertures
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm">
              <p className="text-[#b8b2a8]">{session.user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors text-sm font-semibold border border-red-600/30"
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
