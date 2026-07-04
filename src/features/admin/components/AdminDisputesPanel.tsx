'use client';

import React, { useEffect, useState } from 'react';
import api from '@/shared/lib/axios';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import type { DisputeRecord, RefundRecord } from '@/features/booking/api/bookings';

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt(iso: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });
}

function fmtFull(iso: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-PH', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function money(n: number) {
  return `₱${Number(n ?? 0).toLocaleString()}`;
}

function bookingName(b: DisputeRecord['booking']) {
  return b?.service?.name ?? b?.asset?.name ?? b?.event?.name ?? '—';
}

const DISPUTE_STATUS_STYLE: Record<string, string> = {
  pending:       'bg-yellow-400/10 text-yellow-400 border-yellow-400/20',
  approved:      'bg-blue-400/10 text-blue-400 border-blue-400/20',
  rejected:      'bg-red-400/10 text-red-400/70 border-red-400/20',
  refunded:      'bg-green-400/10 text-green-400 border-green-400/20',
  refund_failed: 'bg-orange-400/10 text-orange-400 border-orange-400/20',
};

const REFUND_STATUS_STYLE: Record<string, string> = {
  pending:   'bg-yellow-400/10 text-yellow-400 border-yellow-400/20',
  succeeded: 'bg-green-400/10 text-green-400 border-green-400/20',
  completed: 'bg-green-400/10 text-green-400 border-green-400/20',
  failed:    'bg-red-400/10 text-red-400 border-red-400/20',
};

function StatusBadge({ status, map }: { status: string; map: Record<string, string> }) {
  const s = status?.toLowerCase() ?? 'pending';
  return (
    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${map[s] ?? map.pending}`}>
      {s.replace('_', ' ')}
    </span>
  );
}

function Empty({ label }: { label: string }) {
  return (
    <div className="py-16 flex flex-col items-center gap-3 text-white/20">
      <span className="material-symbols-outlined text-[48px]">inbox</span>
      <p className="text-sm">{label}</p>
    </div>
  );
}

// ── Resolve Dispute Modal ─────────────────────────────────────────────────────

function ResolveDisputeModal({
  dispute,
  onClose,
  onResolve,
  processing,
}: {
  dispute: DisputeRecord;
  onClose: () => void;
  onResolve: (id: string, action: 'approve' | 'reject', notes: string) => void;
  processing: boolean;
}) {
  const [action, setAction] = useState<'approve' | 'reject'>('approve');
  const [notes, setNotes] = useState('');

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-[#0f111a] border border-white/10 rounded-2xl p-8 max-w-md w-full mx-4 space-y-5" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            action === 'approve' ? 'bg-blue-500/20' : 'bg-red-500/20'
          }`}>
            <span className={`material-symbols-outlined text-[20px] ${
              action === 'approve' ? 'text-blue-400' : 'text-red-400'
            }`}>
              {action === 'approve' ? 'verified' : 'gavel'}
            </span>
          </div>
          <div>
            <h2 className="text-white font-bold text-lg leading-tight">
              {action === 'approve' ? 'Approve Dispute' : 'Reject Dispute'}
            </h2>
            <p className="text-white/40 text-xs">
              {dispute.citizen?.name ?? dispute.citizen?.id?.slice(0, 8)} &middot; {bookingName(dispute.booking)}
            </p>
          </div>
        </div>

        <div className="bg-white/5 rounded-xl p-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-white/40">Dispute Reason</span>
            <span className="text-white font-medium">{dispute.reason}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/40">Total Paid</span>
            <span className="text-white font-bold">{money(dispute.booking.totalAmount)}</span>
          </div>
          {action === 'approve' && (
            <div className="flex justify-between">
              <span className="text-white/40">Refund Amount</span>
              <span className="text-green-400 font-bold">{money(dispute.booking.totalAmount)}</span>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setAction('approve')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
              action === 'approve'
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                : 'bg-white/5 text-white/40 hover:bg-white/10'
            }`}
          >
            <span className="material-symbols-outlined text-[14px] align-middle mr-1">check_circle</span>
            Approve & Refund
          </button>
          <button
            onClick={() => setAction('reject')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
              action === 'reject'
                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                : 'bg-white/5 text-white/40 hover:bg-white/10'
            }`}
          >
            <span className="material-symbols-outlined text-[14px] align-middle mr-1">cancel</span>
            Reject
          </button>
        </div>

        <div>
          <label className="text-[10px] text-white/30 uppercase tracking-wider block mb-1.5">
            {action === 'approve' ? 'Admin Notes (optional)' : 'Rejection Reason (optional)'}
          </label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder={action === 'approve' ? 'e.g. Verified no-show, processing full refund' : 'e.g. Provider confirmed delivery'}
            rows={3}
            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-accent/50 resize-none"
          />
        </div>

        <div className="flex gap-3 pt-1">
          <button
            onClick={() => onResolve(dispute.id, action, notes)}
            disabled={processing}
            className={`flex-1 py-3 rounded-xl font-bold text-sm transition disabled:opacity-50 ${
              action === 'approve'
                ? 'bg-blue-500/80 text-white hover:bg-blue-500'
                : 'bg-red-500/80 text-white hover:bg-red-500'
            }`}
          >
            {processing ? 'Processing...' : action === 'approve' ? 'Confirm — Initiate Refund' : 'Confirm — Reject Dispute'}
          </button>
          <button
            onClick={onClose}
            disabled={processing}
            className="flex-1 py-3 rounded-xl bg-white/5 text-white/60 font-bold text-sm hover:bg-white/10 transition disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Manual Refund Modal ───────────────────────────────────────────────────────

function ManualRefundModal({
  onClose,
  onIssue,
  processing,
  defaultBookingId,
  defaultAmount,
}: {
  onClose: () => void;
  onIssue: (bookingId: string, amount: number, reason: string) => void;
  processing: boolean;
  defaultBookingId?: string;
  defaultAmount?: number;
}) {
  const [bookingId, setBookingId] = useState(defaultBookingId ?? '');
  const [amount, setAmount] = useState(defaultAmount ? String(defaultAmount) : '');
  const [reason, setReason] = useState('');

  const valid = bookingId.trim() && Number(amount) > 0 && reason.trim();

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-[#0f111a] border border-white/10 rounded-2xl p-8 max-w-md w-full mx-4 space-y-5" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-purple-400 text-[20px]">payments</span>
          </div>
          <div>
            <h2 className="text-white font-bold text-lg leading-tight">Manual Refund</h2>
            <p className="text-white/40 text-xs">Issue a refund outside the payment gateway</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-[10px] text-white/30 uppercase tracking-wider block mb-1.5">Booking ID</label>
            <input
              value={bookingId}
              onChange={e => setBookingId(e.target.value)}
              placeholder="e.g. booking_abc123"
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-accent/50"
            />
          </div>
          <div>
            <label className="text-[10px] text-white/30 uppercase tracking-wider block mb-1.5">Amount (₱)</label>
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="e.g. 7500"
              min={1}
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-accent/50"
            />
          </div>
          <div>
            <label className="text-[10px] text-white/30 uppercase tracking-wider block mb-1.5">Reason</label>
            <textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="e.g. Refund due to provider no-show"
              rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-accent/50 resize-none"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-1">
          <button
            onClick={() => onIssue(bookingId, Number(amount), reason)}
            disabled={!valid || processing}
            className="flex-1 py-3 rounded-xl bg-purple-500/80 text-white font-bold text-sm hover:bg-purple-500 transition disabled:opacity-50"
          >
            {processing ? 'Processing...' : 'Issue Manual Refund'}
          </button>
          <button
            onClick={onClose}
            disabled={processing}
            className="flex-1 py-3 rounded-xl bg-white/5 text-white/60 font-bold text-sm hover:bg-white/10 transition disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Dispute Detail Drawer ─────────────────────────────────────────────────────

function DisputeDetailDrawer({
  dispute,
  onClose,
  onResolve,
  processing,
}: {
  dispute: DisputeRecord;
  onClose: () => void;
  onResolve: (dispute: DisputeRecord) => void;
  processing: boolean;
}) {
  return (
    <div className="fixed inset-0 z-[999] flex items-end sm:items-center justify-center sm:justify-end bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full sm:w-[520px] sm:h-full bg-[#0d0f18] border-t sm:border-t-0 sm:border-l border-white/10 flex flex-col max-h-[90vh] sm:max-h-full overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-start justify-between gap-4 shrink-0">
          <div>
            <p className="text-[10px] text-white/30 uppercase tracking-widest mb-1">Dispute</p>
            <h2 className="text-xl font-bold text-white">{dispute.citizen?.name ?? 'Unknown Citizen'}</h2>
            <p className="text-sm text-white/40">{dispute.citizen?.email}</p>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={dispute.status} map={DISPUTE_STATUS_STYLE} />
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition">
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 rounded-xl p-4">
              <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Booking Type</p>
              <p className="text-white font-bold capitalize">{dispute.bookingType}</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4">
              <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Total Amount</p>
              <p className="text-white font-bold">{money(dispute.booking.totalAmount)}</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4">
              <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Submitted</p>
              <p className="text-white font-bold">{fmtFull(dispute.createdAt)}</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4">
              <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Booking Status</p>
              <p className="text-white font-bold capitalize">{dispute.booking.status}</p>
            </div>
          </div>

          {/* Reason */}
          <div className="bg-white/5 rounded-xl p-4 space-y-2">
            <p className="text-[10px] text-white/30 uppercase tracking-wider">Reason</p>
            <p className="text-white/80 text-sm leading-relaxed">{dispute.reason}</p>
            {dispute.description && (
              <>
                <p className="text-[10px] text-white/30 uppercase tracking-wider pt-2">Description</p>
                <p className="text-white/60 text-sm leading-relaxed">{dispute.description}</p>
              </>
            )}
          </div>

          {/* Related Refunds */}
          {dispute.refunds && dispute.refunds.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs text-white/40 uppercase tracking-widest font-bold">Refund Attempts</p>
              {dispute.refunds.map(r => (
                <div key={r.id} className="bg-white/5 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-bold">{money(r.amount)}</span>
                    <StatusBadge status={r.status} map={REFUND_STATUS_STYLE} />
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/40">{r.method?.toUpperCase()}</span>
                    <span className="text-white/40">{fmtFull(r.createdAt)}</span>
                  </div>
                  {r.failureReason && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-2 mt-1">
                      <p className="text-red-400 text-xs">{r.failureReason}</p>
                    </div>
                  )}
                  {r.adminNotes && (
                    <p className="text-white/30 text-xs">{r.adminNotes}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {dispute.adminNotes && (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
              <p className="text-[10px] text-blue-400/60 uppercase tracking-wider mb-1">Admin Notes</p>
              <p className="text-blue-300 text-sm">{dispute.adminNotes}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        {dispute.status === 'pending' && (
          <div className="p-6 border-t border-white/5 flex gap-3 shrink-0">
            <button
              onClick={() => onResolve(dispute)}
              disabled={processing}
              className="flex-1 py-3 rounded-xl bg-blue-500/20 text-blue-400 font-bold text-sm hover:bg-blue-500/30 transition disabled:opacity-50"
            >
              Review & Resolve
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Retry Confirmation Modal ──────────────────────────────────────────────────

function RetryRefundModal({
  refund,
  onClose,
  onRetry,
  processing,
}: {
  refund: RefundRecord;
  onClose: () => void;
  onRetry: (id: string) => void;
  processing: boolean;
}) {
  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-[#0f111a] border border-white/10 rounded-2xl p-8 max-w-sm w-full mx-4 space-y-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-orange-400 text-[20px]">refresh</span>
          </div>
          <div>
            <h2 className="text-white font-bold text-lg leading-tight">Retry Refund</h2>
            <p className="text-white/40 text-xs">Attempt to process this refund again</p>
          </div>
        </div>

        <div className="bg-white/5 rounded-xl p-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-white/40">Amount</span>
            <span className="text-white font-bold">{money(refund.amount)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/40">Method</span>
            <span className="text-white font-medium">{refund.method?.toUpperCase()}</span>
          </div>
          {refund.failureReason && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-2 mt-1">
              <p className="text-red-400 text-xs">Previous failure: {refund.failureReason}</p>
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-1">
          <button
            onClick={() => onRetry(refund.id)}
            disabled={processing}
            className="flex-1 py-3 rounded-xl bg-orange-500/80 text-white font-bold text-sm hover:bg-orange-500 transition disabled:opacity-50"
          >
            {processing ? 'Retrying...' : 'Retry Refund'}
          </button>
          <button
            onClick={onClose}
            disabled={processing}
            className="flex-1 py-3 rounded-xl bg-white/5 text-white/60 font-bold text-sm hover:bg-white/10 transition disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

type PanelTab = 'disputes' | 'failures' | 'history';

export const AdminDisputesPanel: React.FC = () => {
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<PanelTab>('disputes');

  // Data
  const [disputes, setDisputes] = useState<DisputeRecord[]>([]);
  const [failedRefunds, setFailedRefunds] = useState<RefundRecord[]>([]);
  const [refundHistory, setRefundHistory] = useState<RefundRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // UI state
  const [selectedDispute, setSelectedDispute] = useState<DisputeRecord | null>(null);
  const [resolveModal, setResolveModal] = useState<DisputeRecord | null>(null);
  const [manualRefundTarget, setManualRefundTarget] = useState<RefundRecord | null>(null);
  const [retryRefund, setRetryRefund] = useState<RefundRecord | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const [disputeFilter, setDisputeFilter] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'refunded'>('all');
  const [historyFilter, setHistoryFilter] = useState<string>('all');

  const fetchAll = async () => {
    setIsLoading(true);
    try {
      const [disputesResp, refundsResp] = await Promise.all([
        api.get('/admin/disputes'),
        api.get('/admin/refunds'),
      ]);
      setDisputes(disputesResp.data?.data ?? []);
      const allRefunds: RefundRecord[] = refundsResp.data?.data ?? [];
      setFailedRefunds(allRefunds.filter(r => r.status === 'failed'));
      setRefundHistory(allRefunds);
    } catch {
      toast.error('Failed to load disputes data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const refetch = () => {
    fetchAll();
    queryClient.invalidateQueries({ queryKey: ['admin-data', 'bookings'] });
    queryClient.invalidateQueries({ queryKey: ['admin-data', 'stats'] });
  };

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleResolveDispute = async (id: string, action: 'approve' | 'reject', notes: string) => {
    setProcessingId(id);
    try {
      await api.patch(`/admin/disputes/${id}/resolve`, { action, adminNotes: notes });
      toast.success(action === 'approve' ? 'Dispute approved — refund initiated' : 'Dispute rejected');
      setResolveModal(null);
      refetch();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to resolve dispute');
    } finally {
      setProcessingId(null);
    }
  };

  const handleRetryRefund = async (id: string) => {
    setProcessingId(id);
    try {
      await api.post(`/admin/refunds/${id}/retry`);
      toast.success('Refund retry initiated');
      setRetryRefund(null);
      refetch();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to retry refund');
    } finally {
      setProcessingId(null);
    }
  };

  const handleManualRefund = async (bookingId: string, amount: number, reason: string) => {
    setProcessingId('manual');
    try {
      await api.post('/admin/refunds/manual', { bookingId, amount, reason });
      toast.success('Manual refund issued');
      setManualRefundTarget(null);
      refetch();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to issue manual refund');
    } finally {
      setProcessingId(null);
    }
  };

  // ── Filtered data ─────────────────────────────────────────────────────────

  const filteredDisputes = disputeFilter === 'all'
    ? disputes
    : disputes.filter(d => d.status === disputeFilter);

  const filteredHistory = historyFilter === 'all'
    ? refundHistory
    : refundHistory.filter(r => r.status === historyFilter);

  const pendingCount = disputes.filter(d => d.status === 'pending').length;
  const failedCount = failedRefunds.length;

  // ── Render ────────────────────────────────────────────────────────────────

  const SUB_TABS: { key: PanelTab; label: string; icon: string; count?: number; color: string }[] = [
    { key: 'disputes', label: 'Disputes Queue', icon: 'gavel', count: pendingCount, color: 'text-yellow-400' },
    { key: 'failures', label: 'Refund Failures', icon: 'error_outline', count: failedCount, color: 'text-red-400' },
    { key: 'history',  label: 'Refund History',  icon: 'receipt_long', color: 'text-blue-400' },
  ];

  return (
    <>
      <section className="bg-surface-highlight/20 border border-white/5 rounded-[2rem] overflow-hidden">
        {/* Header */}
        <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-orange-400 text-2xl">gavel</span>
            <div>
              <h2 className="text-xl font-display font-bold text-white">Disputes & Refunds</h2>
              <p className="text-xs text-white/30 mt-0.5">
                {pendingCount} pending dispute{pendingCount !== 1 ? 's' : ''}
                {failedCount > 0 ? ` · ${failedCount} failed refund${failedCount !== 1 ? 's' : ''}` : ''}
              </p>
            </div>
          </div>

        </div>

        {/* Sub-tabs */}
        <div className="px-8 py-3 border-b border-white/5 flex items-center gap-2 overflow-x-auto">
          {SUB_TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === tab.key
                  ? 'bg-white/10 text-white shadow-inner'
                  : 'text-white/40 hover:text-white/70 hover:bg-white/5'
              }`}
            >
              <span className={`material-symbols-outlined text-[15px] ${activeTab === tab.key ? tab.color : ''}`}>{tab.icon}</span>
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold ${
                  activeTab === tab.key ? 'bg-white/15 text-white' : 'bg-white/5 text-white/30'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Disputes Queue Tab ─────────────────────────────────────────────── */}
        {activeTab === 'disputes' && (
          <div>
            {/* Filter bar */}
            <div className="px-8 py-3 border-b border-white/5 flex gap-2">
              {(['all', 'pending', 'approved', 'rejected', 'refunded'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setDisputeFilter(f)}
                  className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors ${
                    disputeFilter === f
                      ? 'bg-accent text-black'
                      : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-16 text-white/30 gap-3">
                <div className="w-5 h-5 border-2 border-white/20 border-t-accent rounded-full animate-spin" />
                Loading disputes...
              </div>
            ) : filteredDisputes.length === 0 ? (
              <Empty label="No disputes found" />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/5 text-left">
                      {['Citizen', 'Booking', 'Reason', 'Amount', 'Date', 'Status', 'Actions'].map(h => (
                        <th key={h} className="py-3 px-4 text-[10px] uppercase tracking-widest text-white/30 font-bold whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDisputes.map(d => (
                      <tr
                        key={d.id}
                        className="border-b border-white/5 hover:bg-white/2 transition-colors cursor-pointer"
                        onClick={() => setSelectedDispute(d)}
                      >
                        <td className="py-3 px-4">
                          <p className="font-bold text-white text-xs">{d.citizen?.name ?? d.citizen?.id?.slice(0, 8)}</p>
                          <p className="text-[10px] text-white/30">{d.citizen?.email ?? ''}</p>
                        </td>
                        <td className="py-3 px-4 text-xs text-white/60">
                          <p className="font-medium text-white/80">{bookingName(d.booking)}</p>
                          <span className="text-[10px] text-white/30 capitalize">{d.bookingType}</span>
                        </td>
                        <td className="py-3 px-4 text-xs text-white/60 max-w-[160px] truncate">{d.reason}</td>
                        <td className="py-3 px-4 text-xs font-bold text-white whitespace-nowrap">{money(d.booking.totalAmount)}</td>
                        <td className="py-3 px-4 text-[11px] text-white/40 whitespace-nowrap">{fmt(d.createdAt)}</td>
                        <td className="py-3 px-4"><StatusBadge status={d.status} map={DISPUTE_STATUS_STYLE} /></td>
                        <td className="py-3 px-4" onClick={e => e.stopPropagation()}>
                          {d.status === 'pending' && (
                            <button
                              onClick={() => setResolveModal(d)}
                              className="px-3 py-1.5 rounded-lg bg-blue-500/20 text-blue-400 text-[10px] font-bold hover:bg-blue-500/30 transition"
                            >
                              Resolve
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── Refund Failures Tab ────────────────────────────────────────────── */}
        {activeTab === 'failures' && (
          <div>
            {isLoading ? (
              <div className="flex items-center justify-center py-16 text-white/30 gap-3">
                <div className="w-5 h-5 border-2 border-white/20 border-t-accent rounded-full animate-spin" />
                Loading...
              </div>
            ) : failedRefunds.length === 0 ? (
              <Empty label="No failed refunds — all clear!" />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/5 text-left">
                      {['Refund ID', 'Booking', 'Amount', 'Method', 'Failure Reason', 'Date', 'Actions'].map(h => (
                        <th key={h} className="py-3 px-4 text-[10px] uppercase tracking-widest text-white/30 font-bold whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {failedRefunds.map(r => (
                      <tr key={r.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                        <td className="py-3 px-4">
                          <p className="font-mono text-xs text-white/80">{r.id?.slice(0, 12)}</p>
                          <p className="text-[10px] text-white/30">{r.bookingId?.slice(0, 16)}</p>
                        </td>
                        <td className="py-3 px-4 text-xs text-white/60">{r.bookingId?.slice(0, 16)}</td>
                        <td className="py-3 px-4 text-xs font-bold text-white whitespace-nowrap">{money(r.amount)}</td>
                        <td className="py-3 px-4 text-[10px] text-white/40 uppercase">{r.method}</td>
                        <td className="py-3 px-4 text-xs text-red-400/80 max-w-[200px] truncate">{r.failureReason ?? 'Unknown error'}</td>
                        <td className="py-3 px-4 text-[11px] text-white/40 whitespace-nowrap">{fmt(r.createdAt)}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setRetryRefund(r)}
                              className="px-3 py-1.5 rounded-lg bg-orange-500/20 text-orange-400 text-[10px] font-bold hover:bg-orange-500/30 transition"
                            >
                              Retry
                            </button>
                            <button
                              onClick={() => setManualRefundTarget(r)}
                              className="px-3 py-1.5 rounded-lg bg-purple-500/20 text-purple-400 text-[10px] font-bold hover:bg-purple-500/30 transition"
                            >
                              Manual Refund
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── Refund History Tab ─────────────────────────────────────────────── */}
        {activeTab === 'history' && (
          <div>
            {/* Filter */}
            <div className="px-8 py-3 border-b border-white/5 flex gap-2">
              {(['all', 'pending', 'succeeded', 'completed', 'failed'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setHistoryFilter(f)}
                  className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors ${
                    historyFilter === f
                      ? 'bg-accent text-black'
                      : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-16 text-white/30 gap-3">
                <div className="w-5 h-5 border-2 border-white/20 border-t-accent rounded-full animate-spin" />
                Loading...
              </div>
            ) : filteredHistory.length === 0 ? (
              <Empty label="No refund history" />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/5 text-left">
                      {['Refund ID', 'Booking ID', 'Amount', 'Method', 'Status', 'Notes', 'Date'].map(h => (
                        <th key={h} className="py-3 px-4 text-[10px] uppercase tracking-widest text-white/30 font-bold whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredHistory.map(r => (
                      <tr key={r.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                        <td className="py-3 px-4">
                          <p className="font-mono text-xs text-white/80">{r.id?.slice(0, 12)}</p>
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] text-white/50">{r.bookingId?.slice(0, 16)}</td>
                        <td className="py-3 px-4 text-xs font-bold text-white whitespace-nowrap">{money(r.amount)}</td>
                        <td className="py-3 px-4 text-[10px] text-white/40 uppercase">{r.method}</td>
                        <td className="py-3 px-4"><StatusBadge status={r.status} map={REFUND_STATUS_STYLE} /></td>
                        <td className="py-3 px-4 text-xs text-white/40 max-w-[180px] truncate">
                          {r.failureReason || r.adminNotes || '—'}
                        </td>
                        <td className="py-3 px-4 text-[11px] text-white/40 whitespace-nowrap">{fmt(r.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </section>

      {/* ── Modals ──────────────────────────────────────────────────────────── */}

      {resolveModal && (
        <ResolveDisputeModal
          dispute={resolveModal}
          onClose={() => setResolveModal(null)}
          onResolve={handleResolveDispute}
          processing={processingId === resolveModal.id}
        />
      )}

      {selectedDispute && (
        <DisputeDetailDrawer
          dispute={selectedDispute}
          onClose={() => setSelectedDispute(null)}
          onResolve={(d) => { setSelectedDispute(null); setResolveModal(d); }}
          processing={false}
        />
      )}

      {manualRefundTarget && (
        <ManualRefundModal
          onClose={() => setManualRefundTarget(null)}
          onIssue={handleManualRefund}
          processing={processingId === 'manual'}
          defaultBookingId={manualRefundTarget.bookingId}
          defaultAmount={manualRefundTarget.amount}
        />
      )}

      {retryRefund && (
        <RetryRefundModal
          refund={retryRefund}
          onClose={() => setRetryRefund(null)}
          onRetry={handleRetryRefund}
          processing={processingId === retryRefund.id}
        />
      )}
    </>
  );
};
