'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/shared/lib/axios';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

interface AssetsTableProps {
  assets: any[];
  isLoading: boolean;
}

function pickImage(images: any): string {
  if (!images) return '';
  if (typeof images === 'string') return images;
  if (Array.isArray(images)) {
    const first = images[0];
    if (!first) return '';
    return typeof first === 'string' ? first : first?.url || first?.imageUrl || '';
  }
  return '';
}

export const AdminAssetsTable: React.FC<AssetsTableProps> = ({ assets, isLoading }) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const approve = async (id: string) => {
    setUpdatingId(id);
    try {
      await api.patch(`/admin/assets/${id}/approve`);
      toast.success('Asset approved');
      queryClient.invalidateQueries({ queryKey: ['admin-data', 'assets'] });
      router.refresh();
    } catch {
      toast.error('Failed to approve asset');
    } finally {
      setUpdatingId(null);
    }
  };

  const reject = async (id: string) => {
    setUpdatingId(id);
    try {
      await api.patch(`/admin/assets/${id}/reject`);
      toast.success('Asset rejected');
      queryClient.invalidateQueries({ queryKey: ['admin-data', 'assets'] });
      router.refresh();
    } catch {
      toast.error('Failed to reject asset');
    } finally {
      setUpdatingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="glass-panel p-20 flex flex-col items-center justify-center rounded-[2rem] border border-white/5">
        <div className="w-10 h-10 border-4 border-accent/20 border-t-accent rounded-full animate-spin mb-4" />
        <p className="text-white/40 font-display text-sm tracking-widest uppercase">Fetching Equipment...</p>
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-[2rem] overflow-hidden border border-white/5 shadow-2xl">
      <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/2">
        <h3 className="text-xl font-display font-bold text-white flex items-center gap-2">
          <span className="material-symbols-outlined text-purple-400">inventory_2</span>
          Equipment / Assets
        </h3>
        <span className="text-xs text-white/30">{assets.length} total</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 text-text-muted text-[10px] uppercase tracking-[0.2em] bg-black/20">
              <th className="p-6 font-bold">Asset</th>
              <th className="p-6 font-bold">Owner</th>
              <th className="p-6 font-bold">Category</th>
              <th className="p-6 font-bold">Price</th>
              <th className="p-6 font-bold">Details</th>
              <th className="p-6 font-bold text-right">Status</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {assets.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-12 text-center text-white/30 italic">No equipment submitted yet</td>
              </tr>
            ) : (
              assets.map((asset, i) => (
                <React.Fragment key={asset.id ?? i}>
                  <tr className="border-b border-white/5 hover:bg-white/3 transition-colors group">
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl overflow-hidden border border-white/10 bg-white/5 shrink-0">
                          {pickImage(asset.images) ? (
                            <img
                              src={pickImage(asset.images)}
                              alt={asset.name}
                              className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center">
                              <span className="material-symbols-outlined text-white/20 text-[24px]">inventory_2</span>
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-white group-hover:text-purple-400 transition-colors">{asset.name}</p>
                          <p className="text-[10px] text-white/30 font-mono">{asset.id?.slice(0, 8)}...</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <p className="font-bold text-white/90">{asset.owner?.name || asset.user?.name || '—'}</p>
                      <p className="text-[10px] text-white/30">ID: {(asset.ownerId || asset.userId || '').slice(0, 8)}...</p>
                    </td>
                    <td className="p-6">
                      <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-white/70 capitalize">
                        {asset.category || '—'}
                      </span>
                    </td>
                    <td className="p-6 text-green-400 font-bold">
                      ₱{Number(asset.price || 0).toLocaleString()}
                      <span className="text-white/30 font-normal text-[10px] ml-1">/{asset.billingRate || 'day'}</span>
                    </td>
                    <td className="p-6">
                      <button
                        onClick={() => setExpandedRow(expandedRow === asset.id ? null : asset.id)}
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all text-[10px] font-bold uppercase tracking-widest ${
                          expandedRow === asset.id
                            ? 'bg-purple-500/20 text-purple-400 border-purple-500/30'
                            : 'bg-white/5 border-white/10 text-white/50 hover:text-white'
                        }`}
                      >
                        {expandedRow === asset.id ? 'Close' : 'Details'}
                        <span className={`material-symbols-outlined text-[14px] transition-transform duration-300 ${expandedRow === asset.id ? 'rotate-180' : ''}`}>
                          expand_more
                        </span>
                      </button>
                    </td>
                    <td className="p-6 text-right">
                      <div className="flex justify-end items-center gap-2">
                        {updatingId === asset.id && (
                          <div className="w-4 h-4 border-2 border-accent/20 border-t-accent rounded-full animate-spin" />
                        )}
                        <button
                          disabled={!!updatingId}
                          onClick={() => reject(asset.id)}
                          className="px-3 py-1.5 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 text-[10px] font-bold uppercase tracking-widest hover:bg-red-500/20 disabled:opacity-40 transition-all"
                        >
                          Reject
                        </button>
                        <button
                          disabled={!!updatingId}
                          onClick={() => approve(asset.id)}
                          className="px-3 py-1.5 rounded-lg border border-green-500/30 bg-green-500/10 text-green-400 text-[10px] font-bold uppercase tracking-widest hover:bg-green-500/20 disabled:opacity-40 transition-all"
                        >
                          Approve
                        </button>
                      </div>
                    </td>
                  </tr>

                  {expandedRow === asset.id && (
                    <tr className="bg-white/1">
                      <td colSpan={6} className="p-6 border-b border-white/5 animate-in fade-in duration-200">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-6 rounded-3xl bg-black/40 border border-white/5">
                          <div className="col-span-2">
                            <p className="text-[9px] uppercase font-bold text-purple-400 tracking-[0.2em] mb-2">Description</p>
                            <p className="text-xs text-white/70 leading-relaxed">{asset.description || 'No description provided.'}</p>
                          </div>
                          <div>
                            <p className="text-[9px] uppercase font-bold text-purple-400 tracking-[0.2em] mb-2">Condition</p>
                            <span className="inline-block px-3 py-1 rounded-full bg-white/5 text-white text-[10px] font-bold border border-white/10 capitalize">
                              {asset.condition || '—'}
                            </span>
                          </div>
                          <div>
                            <p className="text-[9px] uppercase font-bold text-purple-400 tracking-[0.2em] mb-2">Quantity</p>
                            <p className="text-white font-bold">{asset.quantity ?? '—'}</p>
                          </div>
                          {Array.isArray(asset.images) && asset.images.length > 1 && (
                            <div className="col-span-4">
                              <p className="text-[9px] uppercase font-bold text-purple-400 tracking-[0.2em] mb-3">Gallery</p>
                              <div className="flex gap-2 flex-wrap">
                                {asset.images.map((img: any, idx: number) => {
                                  const src = typeof img === 'string' ? img : img?.url || img?.imageUrl;
                                  return src ? (
                                    <a key={idx} href={src} target="_blank" rel="noopener noreferrer">
                                      <img src={src} alt="" className="h-20 w-20 object-cover rounded-xl border border-white/10 hover:border-purple-400/50 transition" />
                                    </a>
                                  ) : null;
                                })}
                              </div>
                            </div>
                          )}
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
    </div>
  );
};
