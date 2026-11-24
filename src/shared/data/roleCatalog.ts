/**
 * The roles a citizen can apply for from /onboarding, with what each one
 * actually does — shown in the role card and, in full, in the details modal
 * opened before the application form. Keep `responsibilities` and
 * `requirements` in step with the real flows (docs/ROLE_FLOWS.md) and the
 * application forms under features/role-application.
 *
 * Gear, Talent and Performer Foxer were folded into Provider (providerFoxer)
 * and removed (API ADR 0008).
 */
export interface RoleCatalogSubsection {
  key: string;
  title: string;
  desc: string;
  href: string;
}

export interface RoleCatalogEntry {
  type: string;
  /** URL segment of the role's public docs page, /earn/<slug>. Matches the landing ROLES key. */
  slug: string;
  roleType: string;
  href: string;
  color: string;
  icon: string;
  title: string;
  desc: string;
  /** Dedicated subsections under Provider Foxer (Equipment, Services, Performers, Event Coordinator). */
  subsections?: RoleCatalogSubsection[];
  /** What someone holding this role does day to day. */
  responsibilities: string[];
  /** What the application form will ask for. */
  requirements: string[];
}

const BUSINESS_DOCUMENTS =
  "Valid ID, police clearance (PDF), tax ID, business permit, and a verification selfie";

export const PROVIDER_SUBSECTIONS: RoleCatalogSubsection[] = [
  {
    key: "gear",
    title: "Equipment & Gear",
    desc: "Rent out sound systems, lighting, furniture, staging, and event decor.",
    href: "/foxer/apply?type=provider",
  },
  {
    key: "services",
    title: "Talent & Services",
    desc: "Provide catering, event design, photography, videography, or service staff.",
    href: "/foxer/apply?type=provider",
  },
  {
    key: "performers",
    title: "Live Entertainment",
    desc: "Perform live as a DJ, band, MC, or stage act for events.",
    href: "/foxer/apply?type=provider",
  },
  {
    key: "coordinator",
    title: "Event Coordinator",
    desc: "Execute event logistics and manage on-site operations for Venue Foxers and Event Foxers.",
    href: "/foxer/apply?type=organizer",
  },
];

export const ROLES: RoleCatalogEntry[] = [
  {
    type: "provider",
    slug: "provider",
    roleType: "providerFoxer",
    href: "/foxer/apply?type=provider",
    color: "var(--periwinkle)",
    icon: "storefront",
    title: "Provider Foxer",
    desc: "Supply equipment, talent services, live entertainment, or on-site event coordination.",
    subsections: PROVIDER_SUBSECTIONS,
    responsibilities: [
      "List equipment rentals, talent services (catering, staffing), or live entertainment.",
      "Serve as an Event Coordinator to execute event logistics and manage on-site operations.",
      "Get booked directly by citizens, bid on open supply slots, or join venue and event teams.",
      "Message clients and manage your listings, bookings, appointments, and payouts from your dashboard.",
    ],
    requirements: [
      "Your business or stage name, offerings (gear, services, live entertainment, or event coordination), and experience",
      "Your tax ID or police clearance ID number (if applicable)",
      BUSINESS_DOCUMENTS,
    ],
  },
  {
    type: "venue",
    slug: "venue",
    roleType: "venueFoxer",
    href: "/venue-foxer/apply",
    color: "var(--accent-text)",
    icon: "apartment",
    title: "Venue Foxer",
    desc: "List and manage your venues for others to host memorable events.",
    responsibilities: [
      "List your venues with photos, capacity, availability, and pricing, and take bookings.",
      "Approve the Event Foxers who want to host events at your space.",
      "Build a team: invite Event Coordinators and Check-in Helpers to help run your venues.",
    ],
    requirements: [
      "Your business or venue name, contact number, and full address",
      "Your tax ID number",
      BUSINESS_DOCUMENTS,
    ],
  },
  {
    type: "event",
    slug: "event",
    roleType: "eventFoxer",
    href: "/creator-dashboard/apply",
    color: "var(--periwinkle)",
    icon: "travel_explore",
    title: "Event Foxer",
    desc: "Create and organize events end-to-end: planning, strategy, budgeting, staff leadership, and execution.",
    responsibilities: [
      "Build event listings that bundle real venues, gear, and services into one bookable package.",
      "Publish once a venue has approved you to host there. Apply to venues, or accept a Mayor's invite.",
      "Take bookings, check guests in, review supplier bids, lead event staff, and receive payouts.",
    ],
    requirements: [
      "A short bio of your event experience, your base location, and years of experience",
      BUSINESS_DOCUMENTS,
      "A portfolio or resume (optional)",
    ],
  },
];
