import { studioAccessDenied } from "@/shared/lib/server/studioAccess";

/** The Event Studio needs its role; the page itself is a client component. */
export default async function EventStudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (await studioAccessDenied("event")) ?? children;
}
