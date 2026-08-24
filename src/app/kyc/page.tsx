import MobileKYCView from '@/features/role-application/components/MobileKYCView';

export default function KYCPage() {
  return (
    <>
      <div className="lg:hidden">
        <MobileKYCView />
      </div>
      <div className="hidden lg:flex min-h-screen items-center justify-center bg-[#050608]">
        <p className="text-white/40 text-sm">Complete document verification via the Role Application page.</p>
      </div>
    </>
  );
}
