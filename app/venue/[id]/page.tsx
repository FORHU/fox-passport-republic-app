// app/venue/[id]/page.tsx
"use client";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function VenueDetailsPage() {
  const params = useParams(); // Hook to get ID from URL
  const router = useRouter(); // Hook to navigate back

  return (
    <div className="min-h-screen bg-white">
      {/* Simple Header */}
      <div className="border-b border-gray-100 p-4">
        <div className="max-w-7xl mx-auto flex items-center">
          <button 
            onClick={() => router.back()}
            className="flex items-center text-sm font-semibold text-gray-600 hover:text-black transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Search
          </button>
        </div>
      </div>

      {/* Main Content Stub */}
      <main className="max-w-7xl mx-auto p-4 md:p-8">
        <div className="bg-gray-50 rounded-2xl p-10 text-center border border-gray-200 border-dashed">
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
            Venue Details
          </h1>
          <p className="text-gray-500 text-lg mb-8">
            Showing information for Venue ID: <span className="font-mono text-violet-600 bg-violet-50 px-2 py-1 rounded">{params.id}</span>
          </p>
          <div className="inline-block bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-left max-w-md">
            <h3 className="font-bold text-gray-900 mb-2">Next Steps:</h3>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              <li>Fetch real venue data using this ID.</li>
              <li>Display the photo gallery.</li>
              <li>Show pricing packages and availability.</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}