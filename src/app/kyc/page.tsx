import Link from "next/link";
import MobileKYCView from "@/features/role-application/components/MobileKYCView";

export default function KYCPage() {
  return (
    <>
      <div className="lg:hidden">
        <MobileKYCView />
      </div>
      <div className="hidden lg:flex min-h-screen items-center justify-center bg-[#050608]">
        <div className="text-center">
          <p className="text-white/40 text-sm mb-4">
            Document verification is completed from your role application.
          </p>
          <Link
            href="/"
            className="inline-block h-10 px-6 rounded-full bg-accent text-black text-sm font-bold hover:bg-[#b3e600] transition-colors leading-10"
          >
            Return home
          </Link>
        </div>
      </div>
    </>
  );
}
