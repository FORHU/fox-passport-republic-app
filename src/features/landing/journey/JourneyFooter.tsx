import Link from "next/link";

const COLUMNS = [
  {
    title: "Discover",
    links: [
      ["Search", "/search"],
      ["Categories", "/categories"],
      ["Map", "/venues/map"],
      ["Republic feed", "/republic"],
    ],
  },
  {
    title: "Become a Foxer",
    links: [
      ["See the roles", "/onboarding"],
      ["Venue Foxer", "/venue-foxer/apply"],
      ["Event Foxer", "/creator-dashboard/apply"],
      ["Other roles", "/foxer/apply"],
    ],
  },
  {
    title: "Fine print",
    links: [
      ["Privacy", "/privacy"],
      ["Terms", "/terms"],
      ["Data deletion", "/data-deletion"],
    ],
  },
] as const;

export default function JourneyFooter() {
  return (
    <footer className="bg-canvas px-5 pb-28 pt-14 sm:px-10 sm:pb-10">
      <div className="mx-auto grid max-w-6xl gap-10 border-t border-white/15 pt-10 sm:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <p className="font-landing-display text-3xl text-white">
            FoxPassport
          </p>
          <p className="mt-3 max-w-xs text-sm text-white/55">
            Book the venue, the gear and the people for any event, anywhere.
          </p>
        </div>
        {COLUMNS.map((c) => (
          <div key={c.title}>
            <p className="font-landing-mono mb-3 text-[11px] font-bold uppercase tracking-[0.22em] text-white/65">
              {c.title}
            </p>
            <ul className="space-y-2 text-sm font-semibold">
              {c.links.map(([label, href]) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-white/75 transition-colors hover:text-white"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <p className="font-landing-mono mx-auto mt-10 max-w-6xl text-[11px] uppercase tracking-[0.2em] text-white/55">
        © {new Date().getFullYear()} FoxPassport, Inc.
      </p>
    </footer>
  );
}
