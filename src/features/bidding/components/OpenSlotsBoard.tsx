import React, { useEffect, useState } from "react";
import { getOpenSlots } from "@/shared/api/bidding";
import { BidApplicationModal } from "./BidApplicationModal";
import { useAuthStore } from "@/shared/auth/useAuthStore";

export const OpenSlotsBoard: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  // Mock services for now, in reality you'd fetch the user's services
  const myServices = [
    { id: "srv-1", title: "Pro DJ Setup" },
    { id: "srv-2", title: "Acoustic Band" }
  ];

  useEffect(() => {
    fetchSlots();
  }, []);

  const fetchSlots = async () => {
    try {
      const res = await getOpenSlots();
      if (res.success) setEvents(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading open slots...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">Open Event Slots</h2>
      <p className="text-muted-foreground">Find events looking for Talent Foxers and apply to join their team.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.length === 0 && <p>No open slots available at the moment.</p>}
        {events.map((evt) => (
          <div key={evt.id} className="glass-card flex flex-col p-5 rounded-2xl border border-white/10">
            <div className="mb-4">
              <h3 className="text-lg font-semibold">{evt.name}</h3>
              <p className="text-sm text-white/50">{new Date(evt.startAt).toLocaleDateString()} • {evt.targetCity}</p>
            </div>
            <div className="flex-1">
              <p className="text-sm">Host: {evt.host?.name}</p>
              <p className="text-sm text-white/50 mt-2">Looking for talent to fill open spots.</p>
            </div>
            <div className="mt-4 pt-4 border-t border-white/10">
              <button 
                onClick={() => setSelectedEventId(evt.id)} 
                className="w-full px-4 py-2 rounded-full bg-white/10 hover:bg-[#ccff00] hover:text-black transition-colors font-medium text-white"
              >
                Apply for Slot
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedEventId && (
        <BidApplicationModal
          eventId={selectedEventId}
          isOpen={!!selectedEventId}
          onClose={() => setSelectedEventId(null)}
          onSuccess={fetchSlots}
          services={myServices}
        />
      )}
    </div>
  );
};
