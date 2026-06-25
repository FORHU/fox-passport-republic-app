'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

type RoleStatus = 'pending' | 'approved' | 'rejected';

interface FileRecord {
  id: string;
  url: string;
  name: string;
  type: string;
}

interface ApplicationData {
  bio?: string;
  experience?: string;
  location?: string;
  validId1?: FileRecord | null;
  nbiFile?: FileRecord | null;
  tinIdFile?: FileRecord | null;
  birPermitFile?: FileRecord | null;
  selfieFile?: FileRecord | null;
  portfolioFile?: FileRecord | null;
  // investor fields
  investmentAmount?: string;
  businessName?: string;
  businessType?: string;
}

interface RoleApplication {
  id: string;
  roleType: string;
  status: RoleStatus;
  createdAt: string;
  rejectionReason?: string;
  user: { id: string; name: string; email: string };
  hostApplication?: ApplicationData;
  mayorApplication?: ApplicationData;
  foxerAssetApplication?: ApplicationData;
  foxerServiceApplication?: ApplicationData;
  investorApplication?: ApplicationData;
}

const ROLE_LABELS: Record<string, string> = {
  host: 'Host',
  mayor: 'Mayor',
  foxerAsset: 'Foxer (Asset)',
  foxerService: 'Foxer (Service)',
  investor: 'Investor',
};

const STATUS_STYLES: Record<RoleStatus, string> = {
  pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  approved: 'bg-green-500/10 text-green-400 border-green-500/20',
  rejected: 'bg-red-500/10 text-red-400 border-red-500/20',
};

const STATUS_ICONS: Record<RoleStatus, string> = {
  pending: 'hourglass_top',
  approved: 'check_circle',
  rejected: 'cancel',
};

function getAppData(app: RoleApplication): ApplicationData | null {
  return app.hostApplication ?? app.mayorApplication ?? app.foxerAssetApplication ?? app.foxerServiceApplication ?? app.investorApplication ?? null;
}

function DocPreview({ label, file }: { label: string; file?: FileRecord | null }) {
  if (!file) return (
    <div className="space-y-1">
      <p className="text-[10px] text-white/30 uppercase tracking-wider">{label}</p>
      <div className="h-24 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center">
        <span className="text-white/20 text-xs">Not provided</span>
      </div>
    </div>
  );

  const isPdf = file.type === 'application/pdf' || file.name?.endsWith('.pdf');

  return (
    <div className="space-y-1">
      <p className="text-[10px] text-white/30 uppercase tracking-wider">{label}</p>
      {isPdf ? (
        <a
          href={file.url}
          target="_blank"
          rel="noopener noreferrer"
          className="h-24 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center justify-center gap-2 hover:border-[#ccff00]/40 hover:bg-white/10 transition group"
        >
          <span className="material-symbols-outlined text-[32px] text-red-400 group-hover:scale-110 transition-transform">picture_as_pdf</span>
          <span className="text-[10px] text-white/40 group-hover:text-white/70 truncate max-w-[120px]">{file.name}</span>
        </a>
      ) : (
        <a href={file.url} target="_blank" rel="noopener noreferrer" className="block relative group">
          <img
            src={file.url}
            alt={label}
            className="h-24 w-full object-cover rounded-xl border border-white/10 group-hover:border-[#ccff00]/40 transition"
          />
          <div className="absolute inset-0 rounded-xl bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-[24px]">open_in_new</span>
          </div>
        </a>
      )}
    </div>
  );
}

function ApplicationDetailDrawer({
  app,
  onClose,
  onApprove,
  onReject,
  processing,
}: {
  app: RoleApplication;
  onClose: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  processing: boolean;
}) {
  const data = getAppData(app);

  return (
    <div className="fixed inset-0 z-999 flex items-end sm:items-center justify-center sm:justify-end bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full sm:w-[520px] sm:h-full bg-[#0d0f18] border-t sm:border-t-0 sm:border-l border-white/10 flex flex-col max-h-[90vh] sm:max-h-full overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-start justify-between gap-4 shrink-0">
          <div>
            <p className="text-[10px] text-white/30 uppercase tracking-widest mb-1">Role Application</p>
            <h2 className="text-xl font-bold text-white">{app.user?.name}</h2>
            <p className="text-sm text-white/40">{app.user?.email}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${STATUS_STYLES[app.status]}`}>
              <span className="material-symbols-outlined text-[13px]">{STATUS_ICONS[app.status]}</span>
              {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
            </span>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition">
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* Role & Date */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 rounded-xl p-4">
              <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Applied Role</p>
              <p className="text-white font-bold">{ROLE_LABELS[app.roleType] ?? app.roleType}</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4">
              <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Submitted</p>
              <p className="text-white font-bold">
                {new Date(app.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          </div>

          {/* Application-specific fields */}
          {data && (
            <>
              {(data.bio || data.experience || data.location) && (
                <div className="space-y-3">
                  <p className="text-xs text-white/40 uppercase tracking-widest font-bold">Application Details</p>
                  <div className="bg-white/5 rounded-xl p-4 space-y-3">
                    {data.location && (
                      <div className="flex justify-between items-center">
                        <span className="text-white/40 text-sm">Location</span>
                        <span className="text-white text-sm font-medium">{data.location}</span>
                      </div>
                    )}
                    {data.experience && (
                      <div className="flex justify-between items-center">
                        <span className="text-white/40 text-sm">Experience</span>
                        <span className="text-white text-sm font-medium">{data.experience} years</span>
                      </div>
                    )}
                    {data.bio && (
                      <div>
                        <span className="text-white/40 text-sm block mb-1">Bio</span>
                        <p className="text-white/80 text-sm leading-relaxed bg-black/20 rounded-lg p-3">{data.bio}</p>
                      </div>
                    )}
                    {data.investmentAmount && (
                      <div className="flex justify-between items-center">
                        <span className="text-white/40 text-sm">Investment Amount</span>
                        <span className="text-white text-sm font-medium">{data.investmentAmount}</span>
                      </div>
                    )}
                    {data.businessName && (
                      <div className="flex justify-between items-center">
                        <span className="text-white/40 text-sm">Business Name</span>
                        <span className="text-white text-sm font-medium">{data.businessName}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Identity Documents */}
              <div className="space-y-3">
                <p className="text-xs text-white/40 uppercase tracking-widest font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined text-[14px] text-yellow-400">warning</span>
                  Verify these documents carefully
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <DocPreview label="Primary Valid ID" file={data.validId1} />
                  <DocPreview label="NBI Clearance" file={data.nbiFile} />
                  <DocPreview label="TIN ID / Certificate" file={data.tinIdFile} />
                  <DocPreview label="BIR 2303 / Permit" file={data.birPermitFile} />
                </div>
              </div>

              {/* Selfie & Portfolio */}
              <div className="grid grid-cols-2 gap-3">
                <DocPreview label="Verification Selfie" file={data.selfieFile} />
                {data.portfolioFile !== undefined && (
                  <DocPreview label="Portfolio / Resume" file={data.portfolioFile} />
                )}
              </div>
            </>
          )}

          {app.status === 'rejected' && app.rejectionReason && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
              <p className="text-xs text-red-400/60 uppercase tracking-wider mb-1">Rejection Reason</p>
              <p className="text-red-300 text-sm">"{app.rejectionReason}"</p>
            </div>
          )}
        </div>

        {/* Footer actions */}
        {app.status === 'pending' && (
          <div className="p-6 border-t border-white/5 flex gap-3 shrink-0">
            <button
              onClick={() => onApprove(app.id)}
              disabled={processing}
              className="flex-1 py-3 rounded-xl bg-green-500/20 text-green-400 font-bold text-sm hover:bg-green-500/30 transition disabled:opacity-50"
            >
              Approve
            </button>
            <button
              onClick={() => onReject(app.id)}
              disabled={processing}
              className="flex-1 py-3 rounded-xl bg-red-500/20 text-red-400 font-bold text-sm hover:bg-red-500/30 transition disabled:opacity-50"
            >
              Reject
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export const AdminSubmissionsTable: React.FC = () => {
  const queryClient = useQueryClient();
  const [applications, setApplications] = useState<RoleApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | RoleStatus>('all');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedApp, setSelectedApp] = useState<RoleApplication | null>(null);
  const [rejectModal, setRejectModal] = useState<{ id: string } | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const fetchApplications = async () => {
    try {
      const { data } = await api.get('/role-requests/list');
      setApplications(data.data || []);
    } catch {
      toast.error('Failed to load role applications');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchApplications(); }, []);

  const handleApprove = async (id: string) => {
    setProcessingId(id);
    try {
      await api.patch(`/role-requests/review/${id}`, { status: 'approved' });
      toast.success('Application approved — user role updated');
      
      // Invalidate queries to reflect new roles immediately
      queryClient.invalidateQueries({ queryKey: ['admin-data', 'citizens'] });
      queryClient.invalidateQueries({ queryKey: ['me'] });

      setApplications(prev => prev.map(a => a.id === id ? { ...a, status: 'approved' as RoleStatus } : a));
      setSelectedApp(prev => prev?.id === id ? { ...prev, status: 'approved' as RoleStatus } : prev);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to approve');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async () => {
    if (!rejectModal) return;
    const id = rejectModal.id;
    setProcessingId(id);
    try {
      await api.patch(`/role-requests/review/${id}`, { status: 'rejected', rejectionReason });
      toast.success('Application rejected');
      setApplications(prev => prev.map(a => a.id === id ? { ...a, status: 'rejected' as RoleStatus, rejectionReason } : a));
      setSelectedApp(prev => prev?.id === id ? { ...prev, status: 'rejected' as RoleStatus, rejectionReason } : prev);
      setRejectModal(null);
      setRejectionReason('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to reject');
    } finally {
      setProcessingId(null);
    }
  };

  const filtered = filter === 'all' ? applications : applications.filter(a => a.status === filter);

  return (
    <>
      <div className="glass-panel rounded-[2rem] overflow-hidden border border-white/5">
        <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-xl font-display font-bold text-white">Role Applications</h3>
            <p className="text-xs text-white/40 mt-0.5">
              {applications.filter(a => a.status === 'pending').length} pending review
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {(['all', 'pending', 'approved', 'rejected'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-full text-xs font-bold capitalize transition-colors ${
                  filter === f ? 'bg-[#ccff00] text-black' : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-16 text-white/30 gap-3">
              <div className="w-5 h-5 border-2 border-white/20 border-t-[#ccff00] rounded-full animate-spin" />
              Loading applications...
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-white/30 gap-2">
              <span className="material-symbols-outlined text-[40px]">inbox</span>
              <p className="text-sm">No {filter === 'all' ? '' : filter} applications</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-white/40 text-xs uppercase tracking-wider">
                  <th className="p-6 font-medium">Applicant</th>
                  <th className="p-6 font-medium">Role</th>
                  <th className="p-6 font-medium">Submitted</th>
                  <th className="p-6 font-medium">Status</th>
                  <th className="p-6 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {filtered.map(app => (
                  <tr
                    key={app.id}
                    onClick={() => setSelectedApp(app)}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer group"
                  >
                    <td className="p-6">
                      <div className="font-bold text-white group-hover:text-[#ccff00] transition-colors">{app.user?.name ?? '—'}</div>
                      <div className="text-xs text-white/40">{app.user?.email}</div>
                    </td>
                    <td className="p-6">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-white/70">
                        {ROLE_LABELS[app.roleType] ?? app.roleType}
                      </span>
                    </td>
                    <td className="p-6 text-white/50 text-xs">
                      {new Date(app.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="p-6">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${STATUS_STYLES[app.status]}`}>
                        <span className="material-symbols-outlined text-[13px]">{STATUS_ICONS[app.status]}</span>
                        {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                      </span>
                    </td>
                    <td className="p-6 text-right" onClick={e => e.stopPropagation()}>
                      {app.status === 'pending' ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleApprove(app.id)}
                            disabled={processingId === app.id}
                            className="px-3 py-1.5 rounded-lg bg-green-500/20 text-green-400 text-xs font-bold hover:bg-green-500/30 transition disabled:opacity-50"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => setRejectModal({ id: app.id })}
                            disabled={processingId === app.id}
                            className="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 text-xs font-bold hover:bg-red-500/30 transition disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-white/20 italic">
                          {app.status === 'rejected' && app.rejectionReason ? `"${app.rejectionReason}"` : '—'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Detail Drawer */}
      {selectedApp && (
        <ApplicationDetailDrawer
          app={selectedApp}
          onClose={() => setSelectedApp(null)}
          onApprove={(id) => handleApprove(id)}
          onReject={(id) => { setSelectedApp(null); setRejectModal({ id }); }}
          processing={processingId === selectedApp.id}
        />
      )}

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 z-999 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-[#0f111a] border border-white/10 rounded-2xl p-8 max-w-sm w-full mx-4 space-y-4">
            <h3 className="text-white font-bold text-lg">Reject Application</h3>
            <p className="text-white/50 text-sm">Provide a reason for rejection (optional).</p>
            <textarea
              value={rejectionReason}
              onChange={e => setRejectionReason(e.target.value)}
              placeholder="e.g. Incomplete documents submitted"
              rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-red-500/50 resize-none"
            />
            <div className="flex gap-3 pt-1">
              <button
                onClick={handleReject}
                disabled={!!processingId}
                className="flex-1 py-2.5 rounded-xl bg-red-500/80 text-white font-bold text-sm hover:bg-red-500 transition disabled:opacity-50"
              >
                {processingId ? 'Rejecting...' : 'Confirm Reject'}
              </button>
              <button
                onClick={() => { setRejectModal(null); setRejectionReason(''); }}
                className="flex-1 py-2.5 rounded-xl bg-white/5 text-white/60 font-bold text-sm hover:bg-white/10 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
