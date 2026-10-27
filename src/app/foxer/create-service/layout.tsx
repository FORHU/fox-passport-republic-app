import { studioAccessDenied } from "@/shared/lib/server/studioAccess";

/** The Service Studio needs its role; the page itself is a client component. */
export default async function ServiceStudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (await studioAccessDenied("service")) ?? children;
}
