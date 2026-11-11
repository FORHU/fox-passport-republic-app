import { RewardsWalletView } from "@/features/gamification/components/rewards/RewardsWalletView";
import RequireAuth from "@/shared/auth/RequireAuth";
import LandingHeader from "@/features/landing/components/sections/LandingHeader";
import { BackButton } from "@/shared/components/ui/BackButton";

export const dynamic = "force-dynamic";

export default function RewardsPage() {
  return (
    <RequireAuth>
      <div className="min-h-screen bg-black text-white">
        <LandingHeader />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
          <div className="mb-10 space-y-4">
            <BackButton variant="label" href="/user/passport" label="Back to Passport" />
            <h1 className="text-4xl md:text-6xl font-display font-bold text-white tracking-tight">
              Rewards <span className="text-accent underline decoration-accent/20">Wallet</span>
            </h1>
            <p className="text-white/50 text-base max-w-2xl font-light">
              Manage your FoxPassport Tokens, view your full Token history, and redeem single-use booking discount vouchers.
            </p>
          </div>

          <RewardsWalletView />
        </div>
      </div>
    </RequireAuth>
  );
}

