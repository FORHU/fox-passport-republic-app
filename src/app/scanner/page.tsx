import MobileScannerView from '@/features/dashboard/components/MobileScannerView';

export default function ScannerPage() {
  return (
    <>
      <div className="lg:hidden">
        <MobileScannerView />
      </div>
      <div className="hidden lg:flex min-h-screen items-center justify-center bg-[#050608]">
        <p className="text-white/40 text-sm">QR check-in scanning is available on mobile only.</p>
      </div>
    </>
  );
}
