"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  DashboardHeader,
  EventsSection,
} from "@/features/dashboard/components";
import RequireAuth from "@/shared/auth/RequireAuth";
import { FILTER_STATUS_OPTIONS } from "@/features/dashboard/data/dashboardData";
import { DashboardListToolbar } from "./DashboardListToolbar";
import api from "@/shared/lib/axios";
import { toast } from "sonner";

function normalizeValue(value: unknown): string {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/_/g, " ");
}

interface HostEventsClientProps {
  initialEvents: any[];
}

export default function HostEventsClient({
  initialEvents,
}: HostEventsClientProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [status, setStatus] = useState<"all" | string>("all");
  const [events, setEvents] = useState(initialEvents);

  useEffect(() => {
    setEvents(initialEvents);
  }, [initialEvents]);

  const filteredEvents = useMemo(() => {
    const q = normalizeValue(searchQuery);

    return events.filter((ev) => {
      const statusOk =
        status === "all"
          ? true
          : normalizeValue(ev.status) === normalizeValue(status);

      const searchOk = !q
        ? true
        : normalizeValue(ev.title).includes(q) ||
          normalizeValue(ev.loc).includes(q) ||
          normalizeValue(ev.type).includes(q);

      return statusOk && searchOk;
    });
  }, [events, searchQuery, status]);

  const handleEdit = (id: number | string) => {
    router.push(`/creator-dashboard/events/${id}/edit`);
  };

  const handleDelete = async (id: number | string) => {
    setEvents((prev) => prev.filter((ev) => ev.id !== id));
    try {
      await api.delete(`/event-templates/${id}`);
      toast.success("Draft deleted");
    } catch (err: any) {
      console.error(
        "[handleDelete] failed",
        err?.response?.status,
        err?.response?.data,
      );
      toast.error(err?.response?.data?.message ?? "Failed to delete draft");
      setEvents((prev) => {
        if (prev.some((ev) => ev.id === id)) return prev;
        return [...prev, initialEvents.find((ev: any) => ev.id === id)].filter(
          Boolean,
        );
      });
    }
  };

  return (
    <RequireAuth>
      <div
        className="bg-canvas text-white min-h-screen font-body antialiased"
        style={{
          background:
            "radial-gradient(circle at 15% 50%, rgba(92,98,214,0.15) 0%, transparent 40%), radial-gradient(circle at 85% 30%, rgba(92,98,214,0.1) 0%, transparent 40%), radial-gradient(circle at 50% 0%, rgba(196,232,90,0.05) 0%, transparent 50%), var(--canvas)",
          backgroundAttachment: "fixed",
        }}
      >
        <DashboardHeader />

        <main className="pt-32 pb-28 sm:pb-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-5">
              <div className="text-2xl font-display font-bold flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-accent">
                  hub
                </span>
                My Events
              </div>
              <p className="text-sm text-white/50">
                Only shows records created by your account.
              </p>
            </div>

            <DashboardListToolbar
              search={{
                value: searchQuery,
                onChange: setSearchQuery,
                placeholder: "Search events...",
              }}
              status={{
                value: status,
                onChange: setStatus,
                options: [
                  { value: "all", label: "All Status" },
                  ...FILTER_STATUS_OPTIONS.event.map((s) => ({
                    value: s,
                    label: s,
                  })),
                ],
              }}
            />

            <EventsSection
              events={filteredEvents}
              onDelete={handleDelete}
              showViewAllLink={false}
              onEdit={handleEdit}
            />
          </div>
        </main>
      </div>
    </RequireAuth>
  );
}
