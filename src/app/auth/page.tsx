import MobileAuthPage from '@/features/auth/components/MobileAuthPage';

export default function AuthPage() {
  return (
    <>
      <div className="lg:hidden">
        <MobileAuthPage />
      </div>
      <div className="hidden lg:flex min-h-screen items-center justify-center bg-[#050608]">
        <p className="text-white/40 text-sm">Sign in via the button in the top nav.</p>
      </div>
    </>
  );
}
