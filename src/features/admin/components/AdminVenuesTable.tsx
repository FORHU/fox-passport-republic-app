'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/shared/lib/axios';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

interface VenueTableProps {
  venues: any[];
  isLoading: boolean;
}

// All statuses (for display/color lookup)
const ALL_STATUSES = [
  { value: 'draft',     label: 'Draft',        color: 'bg-gray-500/10 text-gray-400 border-gray-500/20' },
  { value: 'pending',   label: 'Pending',      color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
  { value: 'available', label: 'Available',    color: 'bg-green-500/10 text-green-400 border-green-500/20' },
  { value: 'rejected',  label: 'Rejected',     color: 'bg-red-500/10 text-red-400 border-red-500/20' },
  { value: 'archived',  label: 'Archived',     color: 'bg-gray-500/10 text-gray-400 border-gray-500/20' },
];

const MIN_REJECTION_REASON_LENGTH = 20;
const PAGE_SIZE = 5;

function statusColor(status: string) {
  return ALL_STATUSES.find((s) => s.value === status)?.color ?? 'bg-white/5 text-white border-white/10';
}

function statusIcon(status: string) {
  if (status === 'available') return 'check_circle';
  if (status === 'rejected')  return 'cancel';
  if (status === 'pending')   return 'pending';
  if (status === 'archived')  return 'inventory_2';
  return 'draft';
}

function extractImageUrl(img: any): string | null {
  if (!img) return null;
  if (typeof img === 'string') return img;
  return img?.url ?? img?.imageUrl ?? null;
}

function TagList({ label, icon, items }: { label: string; icon: string; items: string[] }) {
  if (!items?.length) return null;
  return (
    <div>
      <p className="text-[9px] uppercase font-bold text-[#ccff00] tracking-[0.2em] mb-2 flex items-center gap-1">
        <span className="material-symbols-outlined text-[13px]">{icon}</span>
        {label}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item, i) => (
          <span key={i} className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] text-white/70 font-medium">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

export const AdminVenuesTable: React.FC<VenueTableProps> = ({ venues, isLoading }) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);

  // Rows the admin has already acted on this session — hidden immediately
  // rather than waiting on a server refetch (which returns all statuses).
  const [removedIds, setRemovedIds] = useState<Set<string>>(new Set());
  const visibleVenues = venues.filter((v) => !removedIds.has(v.id));

  const PAGE_SIZE = 5;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(visibleVenues.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedVenues = visibleVenues.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  // Inline reject-reason state — which venue is being rejected, and the
  // reason text typed so far. No separate modal component/file; the small
  // confirmation dialog is rendered directly at the bottom of this file.
  const [rejectingVenue, setRejectingVenue] = useState<{ id: string; name: string } | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const approve = async (id: string) => {
    setUpdatingId(id);
    try {
      await api.patch(`/admin/venues/${id}/approve`);
      toast.success('Venue approved and made available');
      setRemovedIds((prev) => new Set(prev).add(id));
      queryClient.invalidateQueries({ queryKey: ['admin-data', 'venues'] });
      router.refresh();
    } catch { toast.error('Failed to approve venue'); }
    finally { setUpdatingId(null); }
  };

  const openRejectDialog = (id: string, name: string) => {
    setRejectReason('');
    setRejectingVenue({ id, name });
  };

  const closeRejectDialog = () => {
    setRejectingVenue(null);
    setRejectReason('');
  };

  const confirmReject = async () => {
    if (!rejectingVenue) return;
    const trimmed = rejectReason.trim();
    if (trimmed.length < MIN_REJECTION_REASON_LENGTH) return;

    const id = rejectingVenue.id;
    setUpdatingId(id);
    try {
      await api.patch(`/admin/venues/${id}/reject`, { reason: trimmed });
      toast.success('Venue rejected');
      setRemovedIds((prev) => new Set(prev).add(id));
      queryClient.invalidateQueries({ queryKey: ['admin-data', 'venues'] });
      router.refresh();
      closeRejectDialog();
    } catch { toast.error('Failed to reject venue'); }
    finally { setUpdatingId(null); }
  };

  if (isLoading) {
    return (
      <div className="glass-panel p-20 flex flex-col items-center justify-center rounded-[2rem] border border-white/5">
        <div className="w-10 h-10 border-4 border-accent/20 border-t-accent rounded-full animate-spin mb-4" />
        <p className="text-white/40 font-display text-sm tracking-widest uppercase">Fetching Venues…</p>
      </div>
    );
  }

  return (
    <>
      {/* Image lightbox */}
      {lightboxImg && (
        <div
          className="fixed inset-0 z-300 bg-black/90 flex items-center justify-center"
          onClick={() => setLightboxImg(null)}
        >
          <img src={lightboxImg} className="max-w-4xl max-h-[85vh] rounded-2xl object-contain shadow-2xl" alt="" />
          <button
            className="absolute top-6 right-6 text-white/60 hover:text-white"
            onClick={() => setLightboxImg(null)}
          >
            <span className="material-symbols-outlined text-[32px]">close</span>
          </button>
        </div>
      )}

      {/* Inline reject-reason dialog — same file, no separate component */}
      {rejectingVenue && (
        <div
          className="fixed inset-0 z-999 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={closeRejectDialog}
        >
          <div
            className="bg-[#0f111a] border border-white/10 rounded-2xl p-8 max-w-sm w-full mx-4 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-white font-bold text-lg">Reject &quot;{rejectingVenue.name}&quot;</h3>
            <p className="text-white/50 text-sm">
              Provide a reason for rejection (minimum {MIN_REJECTION_REASON_LENGTH} characters).
            </p>
            <div>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Photos do not match the listing description, missing safety information"
                rows={4}
                disabled={updatingId === rejectingVenue.id}
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
                disabled={rejectReason.trim().length < MIN_REJECTION_REASON_LENGTH || updatingId === rejectingVenue.id}
                className="flex-1 py-2.5 rounded-xl bg-red-500/80 text-white font-bold text-sm hover:bg-red-500 transition disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-red-500/80"
              >
                {updatingId === rejectingVenue.id ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
              <button
                onClick={closeRejectDialog}
                disabled={updatingId === rejectingVenue.id}
                className="flex-1 py-2.5 rounded-xl bg-white/5 text-white/60 font-bold text-sm hover:bg-white/10 transition disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="glass-panel rounded-[2rem] overflow-hidden border border-white/5 shadow-2xl">
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/2">
          <h3 className="text-xl font-display font-bold text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-accent">apartment</span>
            Venues Management
          </h3>
          <div className="flex gap-2">
            <button className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-bold hover:bg-white/10 transition-all">Filter</button>
            <button className="px-4 py-2 rounded-full bg-accent text-black text-xs font-bold hover:bg-accent-light transition-all">Add Venue</button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-text-muted text-[10px] uppercase tracking-[0.2em] bg-black/20">
                <th className="p-6 font-bold">Venue</th>
                <th className="p-6 font-bold">Owner</th>
                <th className="p-6 font-bold">Location</th>
                <th className="p-6 font-bold">Review</th>
                <th className="p-6 font-bold text-right">Update Status</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {paginatedVenues.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-white/30 italic">No venues found in database</td>
                </tr>
              ) : (
                paginatedVenues.map((venue, i) => {
                  const images: string[] = (venue.venueImages ?? venue.images ?? [])
                    .map(extractImageUrl)
                    .filter(Boolean) as string[];
                  const coverImg = images[0] ?? 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=100&auto=format&fit=crop';
                  const isExpanded = expandedRow === venue.id;

                  const spaceTypes  = venue.spaceType  ?? venue.spaceTypes  ?? [];
                  const amenities   = venue.amenities   ?? [];
                  const techAv      = venue.techAv      ?? [];
                  const staffing    = venue.staffing    ?? [];
                  const policies    = venue.policies    ?? [];

                  return (
                    <React.Fragment key={venue.id ?? venue.name ?? i}>
                      <tr
                        className="border-b border-white/5 hover:bg-white/3 transition-colors group cursor-pointer"
                        onClick={() => setExpandedRow(isExpanded ? null : venue.id)}
                      >
                        <td className="p-6">
                          <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-xl overflow-hidden border border-white/10 shadow-lg group-hover:border-accent/30 transition-all shrink-0">
                              <img
                                alt={venue.name}
                                className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700"
                                src={coverImg}
                                onError={(e) => { (e.target as HTMLImageElement).src = '/herobackground.jpg'; }}
                              />
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="font-bold text-white group-hover:text-accent transition-colors leading-tight">{venue.name}</span>
                              <span className="text-[10px] text-white/30 truncate max-w-[150px]">{venue.id}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-6">
                          <div className="flex flex-col">
                            <span className="font-bold text-white/90">{venue.host?.name ?? 'Unknown Host'}</span>
                            <span className="text-[10px] text-white/30 font-mono tracking-tighter">ID: {venue.hostId?.slice(0, 8)}…</span>
                          </div>
                        </td>
                        <td className="p-6">
                          <div className="flex flex-col text-xs space-y-0.5">
                            <span className="text-white/80 font-bold">{venue.city ?? 'N/A'}</span>
                            <span className="text-white/40 text-[10px]">{venue.state ?? venue.province ?? venue.country ?? 'PH'}</span>
                          </div>
                        </td>
                        <td className="p-6">
                          <button
                            onClick={(e) => { e.stopPropagation(); setExpandedRow(isExpanded ? null : venue.id); }}
                            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all text-[10px] font-bold uppercase tracking-widest ${
                              isExpanded
                                ? 'bg-accent text-black border-accent'
                                : 'bg-white/5 border-white/10 text-white/50 hover:text-white hover:border-white/20'
                            }`}
                          >
                            {isExpanded ? 'Close' : 'Review'}
                            <span className={`material-symbols-outlined text-[14px] transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                              expand_more
                            </span>
                          </button>
                        </td>
                        <td className="p-6 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex justify-end items-center gap-2">
                            {updatingId === venue.id && (
                              <div className="w-4 h-4 border-2 border-accent/20 border-t-accent rounded-full animate-spin" />
                            )}
                            <button
                              disabled={!!updatingId}
                              onClick={() => openRejectDialog(venue.id, venue.name)}
                              className="px-3 py-1.5 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 text-[10px] font-bold uppercase tracking-widest hover:bg-red-500/20 disabled:opacity-40 transition-all"
                            >
                              Reject
                            </button>
                            <button
                              disabled={!!updatingId}
                              onClick={() => approve(venue.id)}
                              className="px-3 py-1.5 rounded-lg border border-green-500/30 bg-green-500/10 text-green-400 text-[10px] font-bold uppercase tracking-widest hover:bg-green-500/20 disabled:opacity-40 transition-all"
                            >
                              Approve
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* ── Full Review Panel ── */}
                      {isExpanded && (
                        <tr className="bg-white/1">
                          <td colSpan={5} className="px-6 pb-6 border-b border-white/5">
                            <div className="rounded-3xl bg-black/40 border border-white/5 shadow-2xl overflow-hidden">

                              {/* Gallery */}
                              <div className="p-6 border-b border-white/5">
                                <p className="text-[10px] uppercase font-bold text-[#ccff00] tracking-[0.2em] mb-3">
                                  Gallery ({images.length} photo{images.length !== 1 ? 's' : ''})
                                </p>
                                {images.length > 0 ? (
                                  <div className="flex gap-3 overflow-x-auto pb-1">
                                    {images.map((url, idx) => (
                                      <button
                                        key={idx}
                                        onClick={() => setLightboxImg(url)}
                                        className="relative shrink-0 w-36 h-24 rounded-xl overflow-hidden border border-white/10 hover:border-[#ccff00]/60 transition-all group/img"
                                      >
                                        <img
                                          src={url}
                                          alt=""
                                          className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-500"
                                          onError={(e) => { (e.target as HTMLImageElement).src = '/herobackground.jpg'; }}
                                        />
                                        {idx === 0 && (
                                          <div className="absolute top-1 left-1 bg-[#ccff00] text-black text-[8px] font-bold px-1.5 py-0.5 rounded">
                                            Cover
                                          </div>
                                        )}
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity">
                                          <span className="material-symbols-outlined text-white text-[20px]">zoom_in</span>
                                        </div>
                                      </button>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-xs text-white/30 italic">No images uploaded</p>
                                )}
                              </div>

                              {/* Core details */}
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-6 border-b border-white/5">
                                <div>
                                  <p className="text-[9px] uppercase font-bold text-[#ccff00] tracking-[0.2em] mb-2">Description</p>
                                  <p className="text-xs text-white/70 leading-relaxed">{venue.description || 'No description provided.'}</p>
                                </div>
                                <div>
                                  <p className="text-[9px] uppercase font-bold text-[#ccff00] tracking-[0.2em] mb-2">Venue Type</p>
                                  <span className="px-3 py-1 rounded-full bg-white/5 text-white text-[10px] font-bold border border-white/10 capitalize">
                                    {venue.type ?? venue.category ?? 'Other'}
                                  </span>
                                </div>
                                <div>
                                  <p className="text-[9px] uppercase font-bold text-[#ccff00] tracking-[0.2em] mb-2">Specifications</p>
                                  <div className="space-y-1.5 text-xs">
                                    <div className="flex items-center gap-2 text-white/80">
                                      <span className="material-symbols-outlined text-[15px] text-white/40">groups</span>
                                      <span className="font-bold">{venue.capacity ?? '—'}</span>
                                      <span className="text-white/40">guests</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-white/80">
                                      <span className="material-symbols-outlined text-[15px] text-white/40">payments</span>
                                      <span className="text-green-400 font-bold">₱{Number(venue.price ?? 0).toLocaleString()}</span>
                                      <span className="text-white/40">/ night</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-white/80">
                                      <span className="material-symbols-outlined text-[15px] text-white/40">location_on</span>
                                      <span className="text-white/60 text-[10px]">{[venue.address, venue.city, venue.country].filter(Boolean).join(', ') || '—'}</span>
                                    </div>
                                  </div>
                                </div>
                                <div>
                                  <p className="text-[9px] uppercase font-bold text-[#ccff00] tracking-[0.2em] mb-2">Current Status</p>
                                  <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold border ${statusColor(venue.status)}`}>
                                    <span className="material-symbols-outlined text-[14px]">{statusIcon(venue.status)}</span>
                                    {(venue.status ?? 'pending').toUpperCase()}
                                  </span>
                                </div>
                              </div>

                              {/* Features */}
                              {(spaceTypes.length > 0 || amenities.length > 0 || techAv.length > 0 || staffing.length > 0 || policies.length > 0) && (
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 p-6 border-b border-white/5">
                                  <TagList label="Space Types" icon="weekend"          items={spaceTypes} />
                                  <TagList label="Amenities"   icon="wifi"             items={amenities} />
                                  <TagList label="Tech & AV"   icon="speaker"          items={techAv} />
                                  <TagList label="Staffing"    icon="badge"            items={staffing} />
                                  <TagList label="Policies"    icon="gavel"            items={policies} />
                                </div>
                              )}

                              {/* Approve / Reject actions */}
                              {(venue.status === 'pending' || venue.status === 'draft') && (
                                <div className="p-5 flex items-center gap-3 bg-white/1">
                                  <span className="text-xs text-white/40 mr-2">Quick actions:</span>
                                  <button
                                    disabled={updatingId === venue.id}
                                    onClick={() => approve(venue.id)}
                                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-bold hover:bg-green-500/20 transition-all disabled:opacity-40"
                                  >
                                    <span className="material-symbols-outlined text-[16px]">check_circle</span>
                                    Approve & Make Available
                                  </button>
                                  <button
                                    disabled={updatingId === venue.id}
                                    onClick={() => openRejectDialog(venue.id, venue.name)}
                                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold hover:bg-red-500/20 transition-all disabled:opacity-40"
                                  >
                                    <span className="material-symbols-outlined text-[16px]">cancel</span>
                                    Reject
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="p-6 border-t border-white/5 flex justify-between items-center bg-black/20 gap-4 flex-wrap">
          <span className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-bold italic">FoxPassport Administration</span>

          <div className="flex items-center gap-4">
            <span className="text-[10px] text-white/50 bg-white/5 px-3 py-1 rounded-full border border-white/10">
              {visibleVenues.length} listing{visibleVenues.length !== 1 ? 's' : ''} total
            </span>

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
                  className="px-2.5  py-1 rounded-lg border border-white/10 bg-white/5 text-white/60 text-[10px] font-bold hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};