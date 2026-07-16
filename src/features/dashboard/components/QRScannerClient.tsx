'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { checkInBooking } from '@/features/booking/api/bookings';

type ScanState = 'idle' | 'scanning' | 'success' | 'error' | 'already_checked_in';

interface ScanResult {
  ticketCode: string;
  message?: string;
}

export default function QRScannerClient() {
  const scannerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scanState, setScanState] = useState<ScanState>('idle');
  const [lastResult, setLastResult] = useState<ScanResult | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const processingRef = useRef(false);

  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try {
        const isRunning = scannerRef.current.isScanning;
        if (isRunning) await scannerRef.current.stop();
      } catch {
        // ignore stop errors
      }
      scannerRef.current = null;
    }
  }, []);

  const handleScanSuccess = useCallback(async (decodedText: string) => {
    if (processingRef.current) return;
    processingRef.current = true;

    await stopScanner();

    const code = decodedText.trim();
    try {
      const res = await checkInBooking(code);
      if (res.payoutTriggered || res.status === 'completed') {
        setScanState('success');
        setLastResult({ ticketCode: code, message: 'Checked in — payout released' });
      } else {
        setScanState('already_checked_in');
        setLastResult({ ticketCode: code, message: 'Already checked in' });
      }
    } catch (err: any) {
      const status = err?.response?.status;
      let msg = 'Invalid ticket';
      switch (status) {
        case 400:
          msg = err?.response?.data?.message || 'Ticket not paid — payment required before check-in';
          break;
        case 403:
          msg = err?.response?.data?.message || 'You are not the host for this booking';
          break;
        case 404:
          msg = err?.response?.data?.message || 'Ticket code not found';
          break;
        default:
          msg = err?.response?.data?.message || 'Invalid ticket';
      }
      setScanState('error');
      setLastResult({ ticketCode: code, message: msg });
    } finally {
      processingRef.current = false;
    }
  }, [stopScanner]);

  const startScanner = useCallback(async () => {
    if (isStarting || scannerRef.current) return;
    setIsStarting(true);
    setScanState('scanning');
    setLastResult(null);
    processingRef.current = false;

    try {
      const { Html5QrcodeScanner } = await import('html5-qrcode');
      const scanner = new Html5QrcodeScanner(
        'qr-reader',
        { fps: 10, qrbox: { width: 250, height: 250 }, rememberLastUsedCamera: true },
        false,
      );
      scannerRef.current = scanner;
      scanner.render(handleScanSuccess, () => {});
    } catch (err) {
      setScanState('error');
      setLastResult({ ticketCode: '', message: 'Camera access denied or not available.' });
    } finally {
      setIsStarting(false);
    }
  }, [isStarting, handleScanSuccess]);

  const reset = useCallback(async () => {
    await stopScanner();
    setScanState('idle');
    setLastResult(null);
  }, [stopScanner]);

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, [stopScanner]);

  return (
    <div className="glass-panel rounded-3xl p-8 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-xl bg-[#ccff00]/10 flex items-center justify-center">
          <span className="material-symbols-outlined text-[#ccff00] text-[20px]">qr_code_scanner</span>
        </div>
        <div>
          <h2 className="text-xl font-display font-bold text-white">QR Check-In</h2>
          <p className="text-text-muted text-xs">Scan citizen's entry ticket at the door</p>
        </div>
      </div>

      {scanState === 'idle' && (
        <div className="flex flex-col items-center gap-6 py-8">
          <div className="h-32 w-32 rounded-2xl border-2 border-dashed border-white/20 flex items-center justify-center">
            <span className="material-symbols-outlined text-white/20 text-6xl">qr_code_2</span>
          </div>
          <p className="text-text-muted text-sm text-center">
            Open camera to scan the QR code shown on the citizen's booking page.
          </p>
          <button
            onClick={startScanner}
            className="px-8 py-3 rounded-full bg-[#ccff00] text-black font-bold hover:opacity-90 transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">photo_camera</span>
            Open Camera
          </button>
        </div>
      )}

      {scanState === 'scanning' && (
        <div className="space-y-4">
          <div
            id="qr-reader"
            ref={containerRef}
            className="w-full rounded-2xl overflow-hidden [&_video]:rounded-xl [&_select]:bg-white/5 [&_select]:text-white [&_select]:border [&_select]:border-white/10 [&_select]:rounded-lg [&_select]:px-2 [&_select]:py-1"
          />
          <button
            onClick={reset}
            className="w-full py-2.5 rounded-full border border-white/10 text-white/60 text-sm hover:text-white hover:border-white/30 transition-all"
          >
            Cancel
          </button>
        </div>
      )}

      {scanState === 'success' && (
        <div className="flex flex-col items-center gap-4 py-8">
          <div className="h-20 w-20 rounded-full bg-green-500/10 border-2 border-green-500/30 flex items-center justify-center">
            <span className="material-symbols-outlined text-green-400 text-5xl">check_circle</span>
          </div>
          <div className="text-center">
            <p className="text-green-400 font-bold text-xl mb-1">{lastResult?.message || 'Checked In!'}</p>
            <p className="text-text-muted text-sm font-mono">{lastResult?.ticketCode}</p>
          </div>
          <button
            onClick={reset}
            className="px-8 py-3 rounded-full bg-[#ccff00] text-black font-bold hover:opacity-90 transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">qr_code_scanner</span>
            Scan Next
          </button>
        </div>
      )}

      {scanState === 'already_checked_in' && (
        <div className="flex flex-col items-center gap-4 py-8">
          <div className="h-20 w-20 rounded-full bg-yellow-500/10 border-2 border-yellow-500/30 flex items-center justify-center">
            <span className="material-symbols-outlined text-yellow-400 text-5xl">warning</span>
          </div>
          <div className="text-center">
            <p className="text-yellow-400 font-bold text-xl mb-1">{lastResult?.message || 'Already Checked In'}</p>
            <p className="text-text-muted text-sm font-mono">{lastResult?.ticketCode}</p>
          </div>
          <button
            onClick={reset}
            className="px-8 py-3 rounded-full border border-white/10 text-white font-bold hover:bg-white/5 transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">qr_code_scanner</span>
            Scan Next
          </button>
        </div>
      )}

      {scanState === 'error' && (
        <div className="flex flex-col items-center gap-4 py-8">
          <div className="h-20 w-20 rounded-full bg-red-500/10 border-2 border-red-500/30 flex items-center justify-center">
            <span className="material-symbols-outlined text-red-400 text-5xl">cancel</span>
          </div>
          <div className="text-center">
            <p className="text-red-400 font-bold text-xl mb-1">Invalid Ticket</p>
            <p className="text-text-muted text-sm">{lastResult?.message || 'This QR code is not recognized.'}</p>
          </div>
          <button
            onClick={reset}
            className="px-8 py-3 rounded-full bg-[#ccff00] text-black font-bold hover:opacity-90 transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">qr_code_scanner</span>
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}
