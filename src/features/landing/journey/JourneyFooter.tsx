import Link from "next/link";

const COLUMNS = [
  {
    title: "Discover",
    links: [
      ["Find events", "/packages"],
      ["Find Foxers", "/search"],
      ["Categories", "/categories"],
      ["Map", "/venues/map"],
      ["Republic feed", "/republic"],
    ],
  },
  {
    title: "Become a Foxer",
    links: [
      // Public pages only: the apply routes need sign-in, so a signed-out
      // visitor was bounced. The role docs ask them to sign in at Apply.
      ["See the roles", "#earn"],
      ["Event Foxer", "/earn/event"],
      ["Venue Foxer", "/earn/venue"],
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
    // The drawing set's last title block: the cells share hairlines, not gaps.
    <footer className="bg-canvas px-5 pb-10 sm:px-10">
      <div className="mx-auto grid max-w-6xl gap-px overflow-hidden rounded-2xl border border-white/15 bg-white/15 sm:grid-cols-2 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div className="bg-canvas p-6">
          <p className="font-landing-display text-3xl text-white">
            FoxPassport
          </p>
          <p className="mt-3 max-w-xs text-sm text-white/70">
            Book the venue, the gear and the people for any event, anywhere.
          </p>
        </div>
        {COLUMNS.map((c) => (
          <div key={c.title} className="bg-canvas p-6">
            <p className="font-landing-mono mb-3 text-xs font-bold uppercase tracking-[0.12em] text-white/70">
              {c.title}
            </p>
            <ul className="space-y-2 text-sm font-semibold">
              {c.links.map(([label, href]) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-white/75 underline-offset-4 transition-colors hover:text-white hover:underline"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <p className="font-landing-mono mx-auto mt-6 max-w-6xl text-xs uppercase tracking-[0.12em] text-white/70">
        © {new Date().getFullYear()} FoxPassport, Inc.
      </p>
    </footer>
  );
}
