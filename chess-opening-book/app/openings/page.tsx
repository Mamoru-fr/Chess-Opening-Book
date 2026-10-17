"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getUserOpenings } from "@/lib/actions/openingActions";
import { Loader } from "lucide-react";

export default function OpeningsPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [openings, setOpenings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOpenings();
  }, []);

  async function loadOpenings() {
    try {
      setLoading(true);
      const data = await getUserOpenings();
      setOpenings(data || []);
    } catch (err) {
      console.error("Failed to load openings:", err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 text-[#81b64c] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="border-b border-[#2d2926] pb-6">
        <h1 className="text-4xl font-bold text-[#f4f1ea] mb-2">Toutes les Ouvertures</h1>
        <p className="text-[#b8b2a8]">{openings.length} ouvertures créées</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {openings.length === 0 ? (
          <p className="text-[#b8b2a8] col-span-full text-center py-12">
            Aucune ouverture trouvée. <Link href="/dashboard" className="text-[#81b64c] hover:underline">Créer une nouvelle</Link>
          </p>
        ) : (
          openings.map((opening) => (
            <Link
              key={opening.id}
              href={`/openings/${opening.id}`}
              className="p-4 bg-[#262421] border border-[#2d2926] rounded-xl hover:border-[#81b64c] hover:bg-[#2a2420] transition-all duration-200 cursor-pointer group shadow-sm shadow-black/10 hover:shadow-md hover:shadow-black/20"
            >
              <h3 className="font-semibold text-[#f4f1ea] group-hover:text-[#81b64c] transition-colors mb-2">
                {opening.name}
              </h3>
              <p className="text-[#b8b2a8] text-sm mb-3">{opening.description || "Pas de description"}</p>
              <div className="flex items-center justify-between text-xs text-[#b8b2a8]">
                <span>Coups: {opening.nodesData?.length || 0}</span>
                <span className="text-[#81b64c]">→</span>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
