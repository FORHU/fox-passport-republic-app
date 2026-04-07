'use client';

import React, { useState } from 'react';
import api from '@/lib/axios';
import { toast } from 'sonner';

interface CitizenTableProps {
  citizens: any[];
  isLoading: boolean;
  refetch: () => void;
}

export const AdminCitizenTable: React.FC<CitizenTableProps> = ({ citizens, isLoading, refetch }) => {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="glass-panel p-20 flex flex-col items-center justify-center rounded-[2rem] border border-white/5">
        <div className="w-10 h-10 border-4 border-accent/20 border-t-accent rounded-full animate-spin mb-4"></div>
        <p className="text-white/40 font-display text-sm tracking-widest uppercase">Fetching Citizens...</p>
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-[2rem] overflow-hidden border border-white/5 shadow-2xl">
      <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
        <h3 className="text-xl font-display font-bold text-white flex items-center gap-2">
          <span className="material-symbols-outlined text-accent">group</span>
          Citizen Directory
        </h3>
        <div className="flex gap-2">
           <button className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-bold hover:bg-white/10 transition-all">Export CSV</button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 text-text-muted text-[10px] uppercase tracking-[0.2em] bg-black/20">
              <th className="p-6 font-bold">Citizen</th>
              <th className="p-6 font-bold">Account</th>
              <th className="p-6 font-bold">Role</th>
              <th className="p-6 font-bold">Verification</th>
              <th className="p-6 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {citizens.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-12 text-center text-white/30 italic">No citizens found in database</td>
              </tr>
            ) : (
              citizens.map((citizen) => (
                <React.Fragment key={citizen.id}>
                  <tr className="border-b border-white/5 hover:bg-white/[0.03] transition-colors group">
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full overflow-hidden border border-white/10 shadow-lg group-hover:border-accent/30 transition-all flex items-center justify-center bg-white/5 text-accent">
                          {citizen.avatar ? (
                            <img alt={citizen.name} className="h-full w-full object-cover" src={citizen.avatar} />
                          ) : (
                            <span className="material-symbols-outlined">person</span>
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-white group-hover:text-accent transition-colors leading-tight">{citizen.name || "Anonymous"}</span>
                          <span className="text-[10px] text-white/30 truncate max-w-[150px] font-mono">{citizen.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="flex flex-col">
                        <span className="font-bold text-white/90">{citizen.username || "unset"}</span>
                        <span className="text-[10px] text-white/30">{citizen.email}</span>
                      </div>
                    </td>
                    <td className="p-6">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold border capitalize ${
                        citizen.role === 'admin' || citizen.role === 'super_admin'
                          ? 'bg-red-500/10 text-red-400 border-red-500/20'
                          : citizen.role === 'host'
                          ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                          : 'bg-green-500/10 text-green-400 border-green-500/20'
                      }`}>
                        {citizen.userRole?.name || citizen.role}
                      </span>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-1.5 text-xs">
                        {citizen.isEmailVerified ? (
                          <span className="flex items-center gap-1 text-green-400 font-bold">
                            <span className="material-symbols-outlined text-[16px]">verified</span>
                            Verified
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-yellow-500/50 font-medium">
                            <span className="material-symbols-outlined text-[16px]">pending</span>
                            Pending
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-6 text-right">
                      <button 
                        onClick={() => setExpandedRow(expandedRow === citizen.id ? null : citizen.id)}
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all text-[10px] font-bold uppercase tracking-widest ${
                          expandedRow === citizen.id 
                            ? 'bg-accent text-black border-accent' 
                            : 'bg-white/5 border-white/10 text-white/50 hover:text-white hover:border-white/20'
                        }`}
                      >
                        {expandedRow === citizen.id ? 'Close' : 'Details'}
                        <span className={`material-symbols-outlined text-[14px] transition-transform duration-300 ${expandedRow === citizen.id ? 'rotate-180' : ''}`}>
                          expand_more
                        </span>
                      </button>
                    </td>
                  </tr>
                  
                  {/* Expanded Detail Panel */}
                  {expandedRow === citizen.id && (
                    <tr className="bg-white/[0.01]">
                      <td colSpan={5} className="p-6 border-b border-white/5 animate-in fade-in slide-in-from-top-4 duration-300">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-6 rounded-3xl bg-black/40 border border-white/5 shadow-2xl relative overflow-hidden group">
                          <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />
                          
                          <div>
                            <p className="text-[9px] uppercase font-bold text-accent tracking-[0.2em] mb-2">User Details</p>
                            <div className="space-y-1">
                              <p className="text-xs text-white/70">Name: <span className="text-white font-bold">{citizen.name || "N/A"}</span></p>
                              <p className="text-xs text-white/70">Phone: <span className="text-white font-bold">{citizen.mobileNumber || "N/A"}</span></p>
                            </div>
                          </div>
                          <div>
                            <p className="text-[9px] uppercase font-bold text-accent tracking-[0.2em] mb-2">Account Status</p>
                            <div className="flex flex-col gap-2">
                              <span className="text-xs text-white/70 flex items-center gap-1">
                                <span className={`w-2 h-2 rounded-full ${citizen.isEmailVerified ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                                Email: {citizen.isEmailVerified ? 'Verified' : 'Unverified'}
                              </span>
                              <span className="text-xs text-white/70 flex items-center gap-1">
                                <span className={`w-2 h-2 rounded-full ${citizen.isHost ? 'bg-blue-500' : 'bg-gray-500'}`}></span>
                                Host Account: {citizen.isHost ? 'Yes' : 'No'}
                              </span>
                            </div>
                          </div>
                          <div>
                            <p className="text-[9px] uppercase font-bold text-accent tracking-[0.2em] mb-2">Metadata</p>
                            <div className="space-y-1">
                              <p className="text-xs text-white/70">Created: <span className="text-white font-bold">{citizen.createdAt ? new Date(citizen.createdAt).toLocaleDateString() : "N/A"}</span></p>
                            </div>
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
        <span className="text-[10px] text-white/50 bg-white/5 px-3 py-1 rounded-full border border-white/10">Showing {citizens.length} registered users</span>
      </div>
    </div>
  );
};
