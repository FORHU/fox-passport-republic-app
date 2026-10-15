import { BrandLogo } from "@/shared/components/layout/BrandLogo";

export default function LandingFooter() {
  return (
    <footer className="bg-black pt-10 pb-20 sm:pt-20 sm:pb-10 border-t border-white/10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-12 gap-5 md:gap-12 mb-8 sm:mb-16">
          {/* Brand */}
          <div className="col-span-2 md:col-span-5">
            <BrandLogo className="mb-4 sm:mb-8 w-fit" />
            <p className="text-gray-400 leading-relaxed mb-4 sm:mb-8 max-w-sm text-sm sm:text-base">
              The ultimate platform for the next generation of explorers. We
              make discovering and booking experiences in the Philippines
              seamless and exciting.
            </p>
          </div>

          {/* Links: Discover */}
          <div className="md:col-span-2">
            <h3 className="font-bold text-white mb-3 sm:mb-6 font-display text-xs sm:text-sm uppercase tracking-widest">
              Discover
            </h3>
            <ul className="space-y-2 sm:space-y-4">
              {[
                { label: "Search", href: "/search" },
                { label: "Categories", href: "/categories" },
                { label: "Republic Foxer", href: "/republic" },
              ].map((item) => (
                <li key={item.label}>
                  <a
                    className="text-xs text-gray-400 hover:text-accent font-medium transition-colors"
                    href={item.href}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Links: Account */}
          <div className="md:col-span-3">
            <h3 className="font-bold text-white mb-3 sm:mb-6 font-display text-xs sm:text-sm uppercase tracking-widest">
              Account
            </h3>
            <ul className="space-y-2 sm:space-y-4">
              {[
                { label: "Sign in", href: "/auth" },
                { label: "Become a Foxer", href: "/onboarding" },
              ].map((item) => (
                <li key={item.label}>
                  <a
                    className="text-xs text-gray-400 hover:text-accent font-medium transition-colors"
                    href={item.href}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/5 pt-4 sm:pt-8 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-[10px] text-gray-500 font-medium text-center sm:text-left">
            © {new Date().getFullYear()} FoxPassport Inc. All rights reserved.
          </p>
          <div className="flex gap-4 sm:gap-6">
            <a
              className="text-[10px] text-gray-500 hover:text-white font-medium transition-colors"
              href="/privacy"
            >
              Privacy
            </a>
            <a
              className="text-[10px] text-gray-500 hover:text-white font-medium transition-colors"
              href="/data-deletion"
            >
              Data Deletion
            </a>
            <a
              className="text-[10px] text-gray-500 hover:text-white font-medium transition-colors"
              href="/terms"
            >
              Terms
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
