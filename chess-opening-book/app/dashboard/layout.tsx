"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";
import { useSession as useBetterAuthSession } from "@/lib/auth/auth.client";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { data: session, isPending } = useBetterAuthSession();
  const router = useRouter();

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/auth/signin");
    }
  }, [session, isPending, router]);

  if (isPending) {
    return (
      <div className="min-h-screen bg-linear-to-b from-[#1a1a1a] to-[#0f0f0f] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#81b64c] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  const handleLogout = async () => {
    // Logout logic
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-[#1a1a1a] to-[#0f0f0f]">
      {/* Navigation */}
      <nav className="border-b border-[#2d2926] bg-[#262421]/90 backdrop-blur-md sticky top-0 z-50">
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
