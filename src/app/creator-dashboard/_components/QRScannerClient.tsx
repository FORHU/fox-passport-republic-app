"use client";

import React from "react";
import { useQRScanner } from "./scanner/useQRScanner";
import { ScannerHeader } from "./scanner/ScannerHeader";
import { ScannerModeTabs } from "./scanner/ScannerModeTabs";
import { ManualCodeEntry } from "./scanner/ManualCodeEntry";
import { PhotoSnapUploader } from "./scanner/PhotoSnapUploader";
import { LiveCameraScanner } from "./scanner/LiveCameraScanner";
import { ScanResultFeedback } from "./scanner/ScanResultFeedback";

export default function QRScannerClient() {
  const {
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
    reset,
    switchTab,
    handleManualSubmit,
    handleFileUpload,
  } = useQRScanner();

  const isFeedbackState =
    scanState === "success" ||
    scanState === "already_checked_in" ||
    scanState === "error";

  return (
    <div className="glass-panel rounded-3xl p-4 sm:p-8 max-w-lg w-full mx-auto border border-white/10 bg-[#0f111a]/95 shadow-2xl">
      {/* Hidden element for file scanning */}
      <div id="qr-file-reader-hidden" className="hidden" />

      {/* Header */}
      <ScannerHeader />

      {/* Mode Tabs */}
      {!isFeedbackState && (
        <ScannerModeTabs activeTab={activeTab} onSelectTab={switchTab} />
      )}

      {/* Tab 1: Manual Code Entry */}
      {activeTab === "manual" && scanState === "idle" && (
        <ManualCodeEntry
          manualCode={manualCode}
          setManualCode={setManualCode}
          onSubmit={handleManualSubmit}
          isProcessing={isProcessing}
        />
      )}

      {/* Tab 2: Upload QR Screenshot / Phone Snap */}
      {activeTab === "upload" && scanState === "idle" && (
        <PhotoSnapUploader
          fileInputRef={fileInputRef}
          onFileUpload={handleFileUpload}
          isProcessingFile={isProcessingFile}
        />
      )}

      {/* Tab 3: Live Camera Scanner */}
      {(activeTab === "camera" || scanState === "scanning") && (
        <LiveCameraScanner
          scanState={scanState}
          isStarting={isStarting}
          containerRef={containerRef}
          onStartScanner={startScanner}
          onCancel={reset}
        />
      )}

      {/* Result Feedback states (success / already checked in / error) */}
      <ScanResultFeedback
        scanState={scanState}
        lastResult={lastResult}
        onReset={reset}
      />
    </div>
  );
}
