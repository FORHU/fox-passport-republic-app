import type { Metadata } from "next";

// page.tsx is a client component, which can't export metadata, so it lives
// here. /republic/saved and /republic/investments inherit it unless they set
// their own.
export const metadata: Metadata = {
  title: "The Republic",
  description:
    "The FoxPassport community feed: posts, marketplace listings and partner updates from hosts, venues and Foxers.",
  // No canonical: a layout's would also claim the child routes are /republic.
};

export default function RepublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
