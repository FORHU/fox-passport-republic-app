/**
 * The roles a citizen can apply for from /onboarding, with what each one
 * actually does — shown in the role card and, in full, in the details modal
 * opened before the application form. Keep `responsibilities` and
 * `requirements` in step with the real flows (docs/ROLE_FLOWS.md) and the
 * application forms under features/role-application.
 */
export interface RoleCatalogEntry {
  type: string;
  roleType: string;
  href: string;
  color: string;
  icon: string;
  title: string;
  desc: string;
  /** What someone holding this role does day to day. */
  responsibilities: string[];
  /** What the application form will ask for. */
  requirements: string[];
}

const BUSINESS_DOCUMENTS =
  "Valid ID, police clearance (PDF), tax ID, business permit, and a verification selfie";

export const ROLES: RoleCatalogEntry[] = [
  {
    type: "service",
    roleType: "serviceFoxer",
    href: "/foxer/apply?type=service",
    color: "#00d2ff",
    icon: "design_services",
    title: "Talent Foxer",
    desc: "Offer catering, design, staffing, and professional services.",
    responsibilities: [
      "List services like catering, event design, and staffing, with your own packages and pricing.",
      "Get booked directly by citizens, or bid on open service slots in published events.",
      "Message clients and manage your bookings and payouts from your dashboard.",
    ],
    requirements: [
      "Your service types, years of experience, and portfolio links",
      "Your police clearance ID number",
      BUSINESS_DOCUMENTS,
    ],
  },
  {
    type: "performer",
    roleType: "performerFoxer",
    href: "/foxer/apply?type=performer",
    color: "#f59e0b",
    icon: "theater_comedy",
    title: "Performer Foxer",
    desc: "Offer photography, DJ, live music, hosting, and more.",
    responsibilities: [
      "List performances like photography, videography, DJ sets, live music, and hosting.",
      "Get booked directly by citizens, or bid on open performer slots in published events.",
      "Message clients and manage your bookings and payouts from your dashboard.",
    ],
    requirements: [
      "Your performer types, years of experience, and portfolio or demo reel links",
      "Your police clearance ID number",
      BUSINESS_DOCUMENTS,
    ],
  },
  {
    type: "asset",
    roleType: "gearFoxer",
    href: "/foxer/apply?type=asset",
    color: "#a78bfa",
    icon: "inventory_2",
    title: "Gear Foxer",
    desc: "Rent out sound systems, lighting, furniture, and event equipment.",
    responsibilities: [
      "List sound systems, lighting, furniture, and other event equipment for rent.",
      "Get booked directly by citizens, or bid on open equipment slots in published events.",
      "Track rentals and payouts from your dashboard. New listings are reviewed before they go live.",
    ],
    requirements: [
      "Your business name and the equipment types you rent out",
      "Your tax ID number",
      BUSINESS_DOCUMENTS,
    ],
  },
  {
    type: "venue",
    roleType: "venueFoxer",
    href: "/venue-foxer/apply",
    color: "var(--accent-text)",
    icon: "apartment",
    title: "Venue Foxer",
    desc: "List and manage your venues for others to host memorable events.",
    responsibilities: [
      "List your venues with photos, capacity, availability, and pricing, and take bookings.",
      "Approve the Event Foxers who want to host events at your space.",
      "Build a team: invite Organizers and Check-in Helpers to help run your venues.",
    ],
    requirements: [
      "Your business or venue name, contact number, and full address",
      "Your tax ID number",
      BUSINESS_DOCUMENTS,
    ],
  },
  {
    type: "event",
    roleType: "eventFoxer",
    href: "/creator-dashboard/apply",
    color: "#ff00aa",
    icon: "travel_explore",
    title: "Event Foxer",
    desc: "Create and organize events, coordinating every detail end-to-end.",
    responsibilities: [
      "Build event listings that bundle real venues, gear, and services into one bookable package.",
      "Publish once a venue has approved you to host there. Apply to venues, or accept a Mayor's invite.",
      "Take bookings, check guests in, review supplier bids, and receive payouts.",
    ],
    requirements: [
      "A short bio of your event experience, your base location, and years of experience",
      BUSINESS_DOCUMENTS,
      "A portfolio or resume (optional)",
    ],
  },
  {
    type: "organizer",
    roleType: "organizer",
    href: "/foxer/apply?type=organizer",
    color: "#e879f9",
    icon: "assignment_ind",
    title: "Organizer",
    desc: "Help Mayors and Event Owners run their venues and events, once they invite you.",
    responsibilities: [
      "Help run the venues and events you're appointed to: check guests in, handle bookings, and message attendees and suppliers.",
      "Get appointed when a Mayor or Event Owner invites you, or request to join venues and events that are open to Organizers.",
      "The role alone grants no access. Each appointment sets what you can do there, and prices always stay with the owner.",
    ],
    requirements: [
      "A little about you, your years of experience, and your location",
      "Government ID, police or background clearance, and a verification selfie (no business documents)",
    ],
  },
  {
    type: "investor",
    roleType: "investor",
    href: "/foxer/apply-investor",
    color: "#10b981",
    icon: "diamond",
    title: "Partner Foxer",
    desc: "Deploy equipment inventory or capital, and earn a revenue share.",
    responsibilities: [
      "Register the equipment inventory or capital you want to put to work.",
      "Propose partnerships to events and venues, and earn a revenue share on the ones they accept.",
      "Track your partnerships and payouts from your dashboard.",
    ],
    requirements: [
      "Your investment range and interests (equipment inventory, capital, or both)",
      "A company name, if you're applying as one (optional)",
      "Proof of funds (optional)",
    ],
  },
];
