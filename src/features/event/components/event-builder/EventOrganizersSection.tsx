"use client";

import React, { useEffect, useState, useTransition } from "react";
import { UserCheck, UserPlus, Trash2, Loader2, AlertCircle } from "lucide-react";
import {
  fetchEventOrganizers,
  addEventOrganizer,
  removeEventOrganizer,
  type EventOrganizerAssignmentItem,
} from "@/features/event/api/events";
import { toast } from "sonner";

interface EventOrganizersSectionProps {
  eventId?: string | null;
}

export function EventOrganizersSection({ eventId }: EventOrganizersSectionProps) {
  const [organizers, setOrganizers] = useState<EventOrganizerAssignmentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!eventId) {
      setOrganizers([]);
      return;
    }

    let cancelled = false;
    setLoading(true);

    fetchEventOrganizers(eventId)
      .then((data) => {
        if (!cancelled) setOrganizers(data);
      })
      .catch((err) => {
        if (!cancelled) {
          console.warn("Could not load organizers for event", eventId, err);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [eventId]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = emailInput.trim();
    if (!email) return;

    if (!eventId) {
      toast.error("An active scheduled event is required to assign check-in delegates.");
      return;
    }

    startTransition(async () => {
      try {
        const added = await addEventOrganizer(eventId, email);
        setOrganizers((prev) => [...prev, added]);
        setEmailInput("");
        toast.success(`Assigned check-in delegate: ${email}`);
      } catch (err: any) {
        toast.error(
          err?.response?.data?.message || err?.message || "Failed to assign organizer",
        );
      }
    });
  };

  const handleRemove = async (userId: string, delegateName: string) => {
    if (!eventId) return;

    startTransition(async () => {
      try {
        await removeEventOrganizer(eventId, userId);
        setOrganizers((prev) => prev.filter((o) => o.userId !== userId));
        toast.success(`Removed delegate: ${delegateName}`);
      } catch (err: any) {
        toast.error(
          err?.response?.data?.message || err?.message || "Failed to remove organizer",
        );
      }
    });
  };

  return (
    <div className="relative rounded-[2rem] overflow-hidden border border-white/10 bg-[#0f111a] p-8 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <UserCheck className="w-5 h-5 text-accent" />
            <h3 className="font-display font-bold text-white text-lg">
              Check-In Delegates
            </h3>
          </div>
          <p className="text-xs text-text-muted leading-relaxed max-w-xl">
            Authorize team members or volunteers to scan citizen QR codes and check guests in at the door. Delegates receive a check-in link without gaining host privileges.
          </p>
        </div>
      </div>

      {!eventId ? (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-white/50">
          <AlertCircle className="w-4 h-4 text-yellow-400/80 shrink-0" />
          <span>
            Check-in delegates can be assigned once this event is booked and scheduled.
          </span>
        </div>
      ) : (
        <div className="space-y-4">
          <form onSubmit={handleAdd} className="flex gap-2">
            <input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="Enter delegate's citizen email..."
              disabled={isPending}
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-accent/30 outline-none transition-colors"
            />
            <button
              type="submit"
              disabled={isPending || !emailInput.trim()}
              className="px-4 py-2.5 rounded-xl bg-accent text-black text-xs font-bold hover:bg-accent/90 disabled:opacity-50 disabled:pointer-events-none transition-colors flex items-center gap-1.5"
            >
              {isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <UserPlus className="w-4 h-4" />
              )}
              <span>Add Delegate</span>
            </button>
          </form>

          {loading ? (
            <div className="py-6 flex items-center justify-center gap-2 text-xs text-white/40">
              <Loader2 className="w-4 h-4 animate-spin text-accent" />
              <span>Loading delegates...</span>
            </div>
          ) : organizers.length === 0 ? (
            <div className="py-6 text-center text-xs text-white/40 border border-dashed border-white/5 rounded-2xl">
              No delegates assigned yet. Only you can check guests in.
            </div>
          ) : (
            <div className="divide-y divide-white/5 rounded-2xl border border-white/5 overflow-hidden">
              {organizers.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3.5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-accent text-xs font-bold">
                      {(item.user.name || item.user.email)[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">
                        {item.user.name || "Citizen"}
                      </div>
                      <div className="text-xs text-text-muted">
                        {item.user.email}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20">
                      Check-In
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        handleRemove(item.userId, item.user.name || item.user.email)
                      }
                      disabled={isPending}
                      className="p-1.5 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      title="Remove delegate"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
