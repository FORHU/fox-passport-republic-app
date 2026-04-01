import React, { useState } from 'react';

interface EventsTableProps {
  events: any[];
  isLoading: boolean;
  refetch: () => void;
}

export const AdminEventsTable: React.FC<EventsTableProps> = ({ events, isLoading, refetch }) => {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  if (isLoading) {
    return <div className="p-8 text-center text-white/50">Loading events...</div>;
  }

  return (
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
            {events.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-12 text-center text-white/30">No events found in database</td>
              </tr>
            ) : (
              events.map((event) => (
                <React.Fragment key={event.id}>
                  <tr className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                    <td className="p-6">
                      <div className="flex items-center gap-3">
                        <img 
                          alt={event.title} 
                          className="h-10 w-10 rounded-lg object-cover bg-white/5 shadow-inner" 
                          src={event.images?.[0]?.imageUrl || "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=100&auto=format&fit=crop"} 
                        />
                        <span className="font-bold text-white group-hover:text-accent transition-colors">{event.title}</span>
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
                        <span className="text-white/80">{event.details?.city || "N/A"}</span>
                        <span>{event.details?.state || event.details?.country || "N/A"}</span>
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
                      <button className="h-8 w-8 rounded-full hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors">
                        <span className="material-symbols-outlined text-[20px]">more_vert</span>
                      </button>
                    </td>
                  </tr>
                  
                  {/* Expanded Detail Panel */}
                  {expandedRow === event.id && (
                    <tr className="bg-white/[0.02]">
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
                              event.status === 'active' || event.isPublished
                                ? 'bg-green-500/10 text-green-400 border-green-500/20'
                                : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                            }`}>
                              <span className="material-symbols-outlined text-[14px]">
                                {event.status === 'active' ? 'check_circle' : 'hourglass_top'}
                              </span>
                              {(event.status || "pending").toUpperCase()}
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
      <div className="p-4 border-t border-white/5 flex justify-center">
        <span className="text-xs text-white/30 italic">Showing {events.length} results</span>
      </div>
    </div>
  );
};
