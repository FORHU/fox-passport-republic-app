export const dynamic = "force-dynamic";

import { getBookingById } from "@/shared/lib/server/data";
import { notFound } from "next/navigation";
import WriteReviewClient from "@/features/review/components/WriteReviewClient";
import MobileWriteReview from "@/features/review/components/MobileWriteReview";

export default async function WriteReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const booking = await getBookingById(id);

  if (!booking) {
    notFound();
  }

  const venueData = {
    name: (booking as any).venue?.name ?? (booking as any).event?.name,
    bookingDate: (booking as any).startDate
      ? new Date((booking as any).startDate).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : undefined,
  };

  return (
    <>
      <div className="lg:hidden">
        <MobileWriteReview venue={venueData} />
      </div>
      <div className="hidden lg:block">
        <WriteReviewClient booking={booking} />
      </div>
    </>
  );
}
