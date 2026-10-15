"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { checkInBooking } from "@/features/booking/api/bookings";
import { ModeTab, ScanResult, ScanState } from "./types";

export function useQRScanner() {
  const scannerRef = useRef<any>(null);
  const fileScannerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<ModeTab>("manual");
  const [manualCode, setManualCode] = useState("");
  const [scanState, setScanState] = useState<ScanState>("idle");
  const [lastResult, setLastResult] = useState<ScanResult | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  // Synchronous re-entrancy guard — a ref so the check inside
  // handleScanSuccess sees the latest value immediately, unlike state
  // (which batches). `isProcessing` above mirrors it for the UI.
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

  const handleScanSuccess = useCallback(
    async (decodedText: string) => {
      if (processingRef.current) return;
      processingRef.current = true;
      setIsProcessing(true);

      await stopScanner();

      const code = decodedText.trim();
      try {
        const res = await checkInBooking(code);
        if (res.payoutTriggered || res.status === "completed") {
          setScanState("success");
          setLastResult({
            ticketCode: code,
            message: "Checked in — payout released to your account!",
          });
        } else {
          setScanState("already_checked_in");
          setLastResult({ ticketCode: code, message: "Already checked in" });
        }
      } catch (err: any) {
        const status = err?.response?.status;
        let msg = "Invalid ticket";
        switch (status) {
          case 400:
            msg =
              err?.response?.data?.message ||
              "Ticket not paid — payment required before check-in";
            break;
          case 403:
            msg =
              err?.response?.data?.message ||
              "You are not the authorized check-in manager for this booking";
            break;
          case 404:
            msg =
              err?.response?.data?.message ||
              "Ticket code not found. Please verify the code.";
            break;
          default:
            msg = err?.response?.data?.message || "Invalid ticket";
        }
        setScanState("error");
        setLastResult({ ticketCode: code, message: msg });
      } finally {
        processingRef.current = false;
        setIsProcessing(false);
        setIsProcessingFile(false);
      }
    },
    [stopScanner],
  );

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    handleScanSuccess(manualCode.trim());
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingFile(true);
    try {
      if (fileScannerRef.current) {
        try {
          await fileScannerRef.current.clear();
        } catch {
          // ignore cleanup errors
        }
        fileScannerRef.current = null;
      }
      const { Html5Qrcode } = await import("html5-qrcode");
      const html5QrCode = new Html5Qrcode("qr-file-reader-hidden");
      fileScannerRef.current = html5QrCode;
      const decodedText = await html5QrCode.scanFile(file, true);
      handleScanSuccess(decodedText);
    } catch {
      setIsProcessingFile(false);
      setScanState("error");
      setLastResult({
        ticketCode: file.name,
        message:
          "Could not detect a valid QR code in this image. Try another screenshot or enter the code manually.",
      });
    }
  };

  const startScanner = useCallback(async () => {
    if (isStarting || scannerRef.current) return;
    setIsStarting(true);
    setScanState("scanning");
    setLastResult(null);
    processingRef.current = false;

    try {
      const { Html5QrcodeScanner } = await import("html5-qrcode");
      const scanner = new Html5QrcodeScanner(
        "qr-reader",
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          rememberLastUsedCamera: true,
        },
        false,
      );
      scannerRef.current = scanner;
      scanner.render(handleScanSuccess, () => {});
    } catch {
      setScanState("error");
      setLastResult({
        ticketCode: "",
        message: "Camera access denied or webcam not available on this device.",
      });
    } finally {
      setIsStarting(false);
    }
  }, [isStarting, handleScanSuccess]);

  const reset = useCallback(async () => {
    await stopScanner();
    setScanState("idle");
    setLastResult(null);
    setManualCode("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [stopScanner]);

  const switchTab = useCallback(
    async (tab: ModeTab) => {
      await stopScanner();
      setActiveTab(tab);
      setScanState("idle");
    },
    [stopScanner],
  );

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, [stopScanner]);

  return {
    activeTab,
    manualCode,
    setManualCode,
    scanState,
    lastResult,
    isStarting,
    isProcessingFile,
    isProcessing,
    containerRef,
    fileInputRef,
    startScanner,
    stopScanner,
    reset,
    switchTab,
    handleManualSubmit,
    handleFileUpload,
  };
}
