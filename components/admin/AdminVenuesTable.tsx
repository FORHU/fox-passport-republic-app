import React, { useState } from 'react';
import api from '@/lib/axios';
import { toast } from 'sonner';

interface VenueTableProps {
  venues: any[];
  isLoading: boolean;
  refetch: () => void;
}

const VENUE_STATUSES = [
  { value: 'draft', label: 'Draft', color: 'bg-gray-500/10 text-gray-400 border-gray-500/20' },
  { value: 'pending_review', label: 'Review', color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
  { value: 'published', label: 'Active', color: 'bg-green-500/10 text-green-400 border-green-500/20' },
  { value: 'suspended', label: 'Suspended', color: 'bg-red-500/10 text-red-400 border-red-500/20' },
  { value: 'archived', label: 'Archived', color: 'bg-gray-500/10 text-gray-400 border-gray-500/20' },
];

export const AdminVenuesTable: React.FC<VenueTableProps> = ({ venues, isLoading, refetch }) => {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    try {
      const response = await api.put(`/v1/venues/${id}`, { status: newStatus });
      if (response.status === 200) {
        toast.success(`Venue status updated to ${newStatus}`);
        refetch();
      }
    } catch (error) {
      console.error("Failed to update status:", error);
      toast.error("Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="glass-panel p-20 flex flex-col items-center justify-center rounded-[2rem] border border-white/5">
        <div className="w-10 h-10 border-4 border-accent/20 border-t-accent rounded-full animate-spin mb-4"></div>
        <p className="text-white/40 font-display text-sm tracking-widest uppercase">Fetching Venues...</p>
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-[2rem] overflow-hidden border border-white/5 shadow-2xl">
      <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
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
              <th className="p-6 font-bold">Details</th>
              <th className="p-6 font-bold text-right">Update Status</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {venues.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-12 text-center text-white/30 italic">No venues found in database</td>
              </tr>
            ) : (
              venues.map((venue) => (
                <React.Fragment key={venue.id}>
                  <tr className="border-b border-white/5 hover:bg-white/[0.03] transition-colors group">
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl overflow-hidden border border-white/10 shadow-lg group-hover:border-accent/30 transition-all">
                          <img 
                            alt={venue.name} 
                            className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700" 
                            src={venue.images?.[0]?.imageUrl || venue.image || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=100&auto=format&fit=crop"} 
                          />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-white group-hover:text-accent transition-colors leading-tight">{venue.name}</span>
                          <span className="text-[10px] text-white/30 truncate max-w-[150px]">{venue.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="flex flex-col">
                        <span className="font-bold text-white/90">{venue.host?.name || "Unknown Host"}</span>
                        <span className="text-[10px] text-white/30 font-mono tracking-tighter">ID: {venue.hostId?.slice(0, 8)}...</span>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="flex flex-col text-xs space-y-0.5">
                        <span className="text-white/80 font-bold">{venue.city || "N/A"}</span>
                        <span className="text-white/40 text-[10px]">{venue.state || venue.province || venue.country || "PH"}</span>
                      </div>
                    </td>
                    <td className="p-6">
                      <button 
                        onClick={() => setExpandedRow(expandedRow === venue.id ? null : venue.id)}
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all text-[10px] font-bold uppercase tracking-widest ${
                          expandedRow === venue.id 
                            ? 'bg-accent text-black border-accent' 
                            : 'bg-white/5 border-white/10 text-white/50 hover:text-white hover:border-white/20'
                        }`}
                      >
                        {expandedRow === venue.id ? 'Close' : 'Details'}
                        <span className={`material-symbols-outlined text-[14px] transition-transform duration-300 ${expandedRow === venue.id ? 'rotate-180' : ''}`}>
                          expand_more
                        </span>
                      </button>
                    </td>
                    <td className="p-6 text-right">
                      <div className="flex justify-end items-center gap-2">
                        {updatingId === venue.id && (
                          <div className="w-4 h-4 border-2 border-accent/20 border-t-accent rounded-full animate-spin"></div>
                        )}
                        <select
                          disabled={updatingId === venue.id}
                          value={venue.status}
                          onChange={(e) => handleStatusUpdate(venue.id, e.target.value)}
                          className={`bg-[#0f111a] border border-white/10 text-[10px] font-bold rounded-lg px-2 py-1.5 focus:outline-none focus:border-accent transition-all cursor-pointer hover:border-white/20 uppercase tracking-tighter ${
                            VENUE_STATUSES.find(s => s.value === venue.status)?.color?.replace('bg-', 'text-').split(' ')[1] || 'text-white'
                          }`}
                        >
                          {VENUE_STATUSES.map((status) => (
                            <option key={status.value} value={status.value} className="bg-[#0f111a] text-white">
                              {status.label.toUpperCase()}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>
                  </tr>
                  
                  {/* Expanded Detail Panel */}
                  {expandedRow === venue.id && (
                    <tr className="bg-white/[0.01]">
                      <td colSpan={5} className="p-6 border-b border-white/5 animate-in fade-in slide-in-from-top-4 duration-300">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-6 rounded-3xl bg-black/40 border border-white/5 shadow-2xl relative overflow-hidden group">
                          {/* Subtle glow background */}
                          <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />
                          
                          <div>
                            <p className="text-[9px] uppercase font-bold text-accent tracking-[0.2em] mb-2">Description</p>
                            <p className="text-xs text-white/70 leading-relaxed font-light">{venue.description || "No description provided."}</p>
                          </div>
                          <div>
                            <p className="text-[9px] uppercase font-bold text-accent tracking-[0.2em] mb-2">Venue Type</p>
                            <span className="inline-block px-3 py-1 rounded-full bg-white/5 text-white text-[10px] font-bold border border-white/10 capitalize">
                              {venue.type || "Other"}
                            </span>
                          </div>
                          <div>
                            <p className="text-[9px] uppercase font-bold text-accent tracking-[0.2em] mb-2">Specifications</p>
                            <div className="flex flex-col gap-2">
                              <div className="flex items-center gap-2 text-xs text-white/80">
                                <span className="material-symbols-outlined text-[16px] text-white/40">groups</span>
                                <span className="font-bold">{venue.capacity || "N/A"}</span> <span className="text-white/40">Guests</span>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-white/80">
                                <span className="material-symbols-outlined text-[16px] text-white/40">payments</span>
                                <span className="text-green-400 font-bold">₱{venue.price?.toLocaleString() || "0"}</span> <span className="text-white/40">/ Hour</span>
                              </div>
                            </div>
                          </div>
                          <div>
                            <p className="text-[9px] uppercase font-bold text-accent tracking-[0.2em] mb-2">Current Status</p>
                            <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold border shadow-lg ${
                              VENUE_STATUSES.find(s => s.value === venue.status)?.color || 'bg-white/5 text-white border-white/10'
                            }`}>
                              <span className="material-symbols-outlined text-[14px]">
                                {venue.status === 'published' ? 'check_circle' : 
                                 venue.status === 'suspended' ? 'block' :
                                 venue.status === 'pending_review' ? 'history' : 'draft'}
                              </span>
                              {(venue.status || "pending").toUpperCase()}
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
      <div className="p-6 border-t border-white/5 flex justify-between items-center bg-black/20">
        <span className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-bold italic">FoxPassport Administration</span>
        <span className="text-[10px] text-white/50 bg-white/5 px-3 py-1 rounded-full border border-white/10">Showing {venues.length} active listings</span>
      </div>
    </div>
  );
};
