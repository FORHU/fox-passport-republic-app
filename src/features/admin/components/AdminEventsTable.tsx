'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/shared/lib/axios';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

interface EventsTableProps {
  events: any[];
  isLoading: boolean;
}

const MIN_REJECTION_REASON_LENGTH = 20;
const PAGE_SIZE = 5;

export const AdminEventsTable: React.FC<EventsTableProps> = ({ events, isLoading }) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Rows the admin has already acted on this session — hidden immediately
  // rather than waiting on a server refetch (which returns all statuses).
  const [removedIds, setRemovedIds] = useState<Set<string>>(new Set());
  const visibleEvents = events.filter((e) => !removedIds.has(e.id));

  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(visibleEvents.length / PAGE_SIZE));
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages, currentPage]);
  const paginatedEvents = visibleEvents.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // Inline reject-reason state — same file, no separate modal component.
  const [rejectingEvent, setRejectingEvent] = useState<{ id: string; name: string } | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const approve = async (id: string) => {
    setUpdatingId(id);
    try {
      await api.patch(`/admin/event-templates/${id}/approve`);
      toast.success('Event template approved — now visible on category pages');
      setRemovedIds((prev) => new Set(prev).add(id));
      queryClient.invalidateQueries({ queryKey: ['admin-data', 'events'] });
      router.refresh();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to approve event template';
      toast.error(`Approve failed: ${msg}`);
    } finally {
      setUpdatingId(null);
    }
  };

  const openRejectDialog = (id: string, name: string) => {
    setRejectReason('');
    setRejectingEvent({ id, name });
  };

  const closeRejectDialog = () => {
    setRejectingEvent(null);
    setRejectReason('');
  };

  const confirmReject = async () => {
    if (!rejectingEvent) return;
    const trimmed = rejectReason.trim();
    if (trimmed.length < MIN_REJECTION_REASON_LENGTH) return;

    const id = rejectingEvent.id;
    setUpdatingId(id);
    try {
      await api.patch(`/admin/event-templates/${id}/reject`, { reason: trimmed });
      toast.success('Event template rejected — hidden from category pages');
      setRemovedIds((prev) => new Set(prev).add(id));
      queryClient.invalidateQueries({ queryKey: ['admin-data', 'events'] });
      router.refresh();
      closeRejectDialog();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to reject event template';
      toast.error(`Reject failed: ${msg}`);
    } finally {
      setUpdatingId(null);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-white/50">Loading events...</div>;
  }

  return (
    <>
      {/* Inline reject-reason dialog — same file, no separate component */}
      {rejectingEvent && (
        <div
          className="fixed inset-0 z-999 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={closeRejectDialog}
        >
          <div
            className="bg-[#0f111a] border border-white/10 rounded-2xl p-8 max-w-sm w-full mx-4 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-white font-bold text-lg">Reject &quot;{rejectingEvent.name}&quot;</h3>
            <p className="text-white/50 text-sm">
              Provide a reason for rejection (minimum {MIN_REJECTION_REASON_LENGTH} characters).
            </p>
            <div>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Event details are incomplete, capacity exceeds venue limits"
                rows={4}
                disabled={updatingId === rejectingEvent.id}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-red-500/50 resize-none disabled:opacity-50"
              />
              <p className={`text-[11px] mt-1.5 ${rejectReason.trim().length >= MIN_REJECTION_REASON_LENGTH ? 'text-white/30' : 'text-red-400/80'}`}>
                {rejectReason.trim().length >= MIN_REJECTION_REASON_LENGTH
                  ? `${rejectReason.trim().length} characters`
                  : `${MIN_REJECTION_REASON_LENGTH - rejectReason.trim().length} more character${MIN_REJECTION_REASON_LENGTH - rejectReason.trim().length === 1 ? '' : 's'} required`}
              </p>
            </div>
            <div className="flex gap-3 pt-1">
              <button
                onClick={confirmReject}
                disabled={rejectReason.trim().length < MIN_REJECTION_REASON_LENGTH || updatingId === rejectingEvent.id}
                className="flex-1 py-2.5 rounded-xl bg-red-500/80 text-white font-bold text-sm hover:bg-red-500 transition disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-red-500/80"
              >
                {updatingId === rejectingEvent.id ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
              <button
                onClick={closeRejectDialog}
                disabled={updatingId === rejectingEvent.id}
                className="flex-1 py-2.5 rounded-xl bg-white/5 text-white/60 font-bold text-sm hover:bg-white/10 transition disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="glass-panel rounded-[2rem] overflow-hidden border border-white/5">
        <div className="p-6 border-b border-white/5">
          <h3 className="text-xl font-display font-bold text-white">Event Submissions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-text-muted text-xs uppercase tracking-wider">
                <th className="p-6 font-medium">Event Name</th>
                <th className="p-6 font-medium">Owner</th>
                <th className="p-6 font-medium">Address</th>
                <th className="p-6 font-medium">Details</th>
                <th className="p-6 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {paginatedEvents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-white/30">No events found in database</td>
                </tr>
              ) : (
                paginatedEvents.map((event, i) => (
                  <React.Fragment key={event.id ?? event.title ?? i}>
                    <tr className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                      <td className="p-6">
                        <div className="flex items-center gap-3">
                          <img
                            alt={event.name}
                            className="h-10 w-10 rounded-lg object-cover bg-white/5 shadow-inner"
                            src={event.template?.images?.[0]?.url || "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=100&auto=format&fit=crop"}
                          />
                          <span className="font-bold text-white group-hover:text-accent transition-colors">{event.name}</span>
                        </div>
                      </td>
                      <td className="p-6 text-gray-300">
                        <div className="flex flex-col">
                          <span className="font-medium text-white/90">{event.host?.name || "Unknown Host"}</span>
                          <span className="text-[10px] text-white/40 font-mono tracking-tighter">ID: {event.hostId}</span>
                        </div>
                      </td>
                      <td className="p-6 text-gray-400">
                        <div className="flex flex-col text-xs space-y-0.5">
                          <span className="text-white/80">{event.targetCity || 'N/A'}</span>
                          <span>{event.targetState || event.targetCountry || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="p-6">
                        <button
                          onClick={() => setExpandedRow(expandedRow === event.id ? null : event.id)}
                          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all text-xs font-bold ${
                            expandedRow === event.id
                              ? 'bg-accent text-black border-accent'
                              : 'bg-white/5 border-white/10 text-white/70 hover:text-white hover:border-white/20'
                          }`}
                        >
                          Details
                          <span className={`material-symbols-outlined text-[16px] transition-transform duration-300 ${expandedRow === event.id ? 'rotate-180' : ''}`}>
                            expand_more
                          </span>
                        </button>
                      </td>
                      <td className="p-6 text-right">
                        <div className="flex justify-end items-center gap-2">
                          {updatingId === event.id && (
                            <div className="w-4 h-4 border-2 border-accent/20 border-t-accent rounded-full animate-spin" />
                          )}
                          <button
                            disabled={!!updatingId}
                            onClick={() => openRejectDialog(event.id, event.name)}
                            className="px-3 py-1.5 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 text-[10px] font-bold uppercase tracking-widest hover:bg-red-500/20 disabled:opacity-40 transition-all"
                          >
                            Reject
                          </button>
                          <button
                            disabled={!!updatingId}
                            onClick={() => approve(event.id)}
                            className="px-3 py-1.5 rounded-lg border border-green-500/30 bg-green-500/10 text-green-400 text-[10px] font-bold uppercase tracking-widest hover:bg-green-500/20 disabled:opacity-40 transition-all"
                          >
                            Approve
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Expanded Detail Panel */}
                    {expandedRow === event.id && (
                      <tr className="bg-white/2">
                        <td colSpan={5} className="p-6 border-b border-white/5 animate-in fade-in slide-in-from-top-4 duration-300">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-4 rounded-2xl bg-black/20 border border-white/5 shadow-inner">
                            <div>
                              <p className="text-[10px] uppercase font-bold text-white/30 tracking-widest mb-1">Description</p>
                              <p className="text-xs text-white/80 line-clamp-2 leading-relaxed">{event.description || "No description provided."}</p>
                            </div>
                            <div>
                              <p className="text-[10px] uppercase font-bold text-white/30 tracking-widest mb-1">Category</p>
                              <span className="inline-block px-2.5 py-1 rounded-full bg-primary/10 text-primary-glow text-[10px] font-bold border border-primary/20 capitalize">
                                {event.category?.name || "Other"}
                              </span>
                            </div>
                            <div>
                              <p className="text-[10px] uppercase font-bold text-white/30 tracking-widest mb-1">Capacity</p>
                              <div className="flex items-center gap-1.5 text-xs text-white">
                                <span className="material-symbols-outlined text-[16px] text-accent">groups</span>
                                {event.maxAttendees || "N/A"} people
                              </div>
                            </div>
                            <div>
                              <p className="text-[10px] uppercase font-bold text-white/30 tracking-widest mb-1">Status</p>
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                                event.requestStatus === 'approved'
                                  ? 'bg-green-500/10 text-green-400 border-green-500/20'
                                  : event.requestStatus === 'rejected'
                                  ? 'bg-red-500/10 text-red-400 border-red-500/20'
                                  : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                              }`}>
                                <span className="material-symbols-outlined text-[14px]">
                                  {event.requestStatus === 'approved' ? 'check_circle' : event.requestStatus === 'rejected' ? 'cancel' : 'hourglass_top'}
                                </span>
                                {(event.requestStatus || 'pending').toUpperCase()}
                              </span>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-white/5 flex justify-center items-center gap-4 flex-wrap">
          <span className="text-xs text-white/30 italic">Showing {visibleEvents.length} results</span>
          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-2.5 py-1 rounded-lg border border-white/10 bg-white/5 text-white/60 text-[10px] font-bold hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                Prev
              </button>
              <span className="text-[10px] text-white/40 px-2 font-mono">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-2.5 py-1 rounded-lg border border-white/10 bg-white/5 text-white/60 text-[10px] font-bold hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};