import { Suspense } from "react";
import SearchClient from "./_components/SearchClient";

export const dynamic = "force-dynamic";

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-surface" />}>
      <SearchClient />
    </Suspense>
  );
}
