import { studioAccessDenied } from "@/shared/lib/server/studioAccess";

/** Editing gear needs the Gear Studio role; the page is a client component. */
export default async function GearEditLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (await studioAccessDenied("gear")) ?? children;
}
