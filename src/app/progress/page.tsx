import { ProgressDashboard } from "@/features/user/components/ProgressDashboard";
import RequireAuth from "@/features/auth/components/RequireAuth";
import LandingHeader from "@/features/landing/components/sections/LandingHeader";

export const dynamic = "force-dynamic";

export default function ProgressPage() {
  return (
    <RequireAuth>
      <div className="min-h-screen bg-black text-white">
        <LandingHeader />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
          <ProgressDashboard />
        </div>
      </div>
    </RequireAuth>
  );
}
