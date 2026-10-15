import PageLoader from "@/shared/components/ui/PageLoader";

// Next shows this automatically whenever a route segment is fetching data
// or (in dev) still compiling — a single root-level fallback covers every
// route since none of them define their own `loading.tsx`.
export default function Loading() {
  return <PageLoader />;
}
