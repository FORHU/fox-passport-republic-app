import React, { useEffect, useState } from "react";
import { getEventBids, acceptBid } from "@/shared/api/bidding";
import { toast } from "sonner";

interface HostReviewBidsViewProps {
  eventId: string;
}

export const HostReviewBidsView: React.FC<HostReviewBidsViewProps> = ({ eventId }) => {
  const [bids, setBids] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchBids();
  }, [eventId]);

  const fetchBids = async () => {
    try {
      const res = await getEventBids(eventId);
      if (res.success) setBids(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (bidId: string) => {
    try {
      setProcessingId(bidId);
      await acceptBid(bidId);
      toast.success("Talent Foxer accepted and added to event roster!");
      fetchBids();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to accept bid");
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) return <div>Loading applications...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold">Talent Applications</h3>
        <p className="text-white/60">Review and accept Talent Foxers who have applied to your event.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {bids.length === 0 && <p className="text-white/50">No applications yet.</p>}
        {bids.map((bid) => (
          <div key={bid.id} className="glass-card p-5 rounded-2xl border border-white/10 flex flex-col">
            <div className="flex justify-between items-start mb-2">
              <h4 className="text-lg font-semibold">
                {bid.provider?.name}
              </h4>
              <span className={`px-2 py-1 text-xs rounded-full font-medium ${bid.status === "accepted" ? "bg-[#ccff00] text-black" : "bg-white/10 text-white"}`}>
                {bid.status}
              </span>
            </div>
            <p className="text-sm text-white/60">{bid.proposedService?.title}</p>
            <div className="flex-1 mt-3">
              <p className="font-semibold text-lg text-[#ccff00]">PHP {Number(bid.proposedPrice).toLocaleString()}</p>
              {bid.message && (
                <p className="text-sm mt-2 italic text-white/70">"{bid.message}"</p>
              )}
            </div>
            {bid.status === "pending" && (
              <div className="mt-4 pt-4 border-t border-white/10">
                <button 
                  onClick={() => handleAccept(bid.id)} 
                  disabled={processingId === bid.id}
                  className="w-full px-4 py-2 rounded-full bg-white text-black hover:bg-gray-200 transition-colors font-medium disabled:opacity-50"
                >
                  {processingId === bid.id ? "Accepting..." : "Accept & Add to Team"}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
