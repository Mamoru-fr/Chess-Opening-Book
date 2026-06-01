import { Suspense } from "react";
import ConnectionsPageClient from "./ConnectionsPageClient";

export default function ConnectionsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-900" />}>
      <ConnectionsPageClient />
    </Suspense>
  );
}