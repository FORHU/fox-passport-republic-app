import { Suspense } from 'react';
import SearchClient from './_components/SearchClient';
import { getSearchResults } from '@/shared/lib/server/data';

export const dynamic = 'force-dynamic';

interface Props {
  searchParams: Promise<{
    type?: string;
    city?: string;
    category?: string;
    startDate?: string;
    endDate?: string;
    q?: string;
  }>;
}

export default async function SearchPage({ searchParams }: Props) {
  const params = await searchParams;
  const initialResults = await getSearchResults(params);
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0c0d14]" />}>
      <SearchClient initialResults={initialResults} />
    </Suspense>
  );
}
