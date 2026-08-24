import { Suspense } from 'react';
import SearchClient from './_components/SearchClient';
import MobileSearchView from '@/features/search/components/MobileSearchView';

export const dynamic = "force-dynamic";

export default function SearchPage() {
  return (
    <>
      <MobileSearchView />
      <div className="hidden lg:block">
        <Suspense fallback={<div className="min-h-screen bg-[#0c0d14]" />}>
          <SearchClient />
        </Suspense>
      </div>
    </>
  );
}
