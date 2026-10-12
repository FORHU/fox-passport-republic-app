import type { RoleAccess } from "@/shared/auth/useRoleAccess";
import type { TourStep } from "@/shared/components/ui/ProductTour";

export const CREATOR_TOUR_KEY = "creator-dashboard";

/**
 * The creator dashboard is one page every role shares, each seeing only its
 * own sections — so the tour is built from the roles the person holds. A step
 * for a section they don't have simply isn't added (and one that isn't on
 * screen is skipped by the tour itself).
 */
export function creatorTourSteps(
  access: RoleAccess,
  isOrganizer: boolean,
): TourStep[] {
  const steps: TourStep[] = [
    {
      title: "Welcome to your creator dashboard",
      body: "This is where you run what you offer on FoxPassport. Here's a quick look at what's on it for your role.",
    },
    {
      target: "host-create",
      title: "Create something new",
      body: "Start here to add a listing. The menu only offers what your role can create.",
    },
    {
      target: "host-guide",
      title: "Getting started checklist",
      body: "The first things your role needs to do. Each step ticks itself off as you finish it.",
    },
  ];

  if (access.hasListings) {
    steps.push(
      {
        target: "host-kpis",
        title: "Your numbers",
        body: "Bookings, earnings and views for your listings at a glance.",
      },
      {
        target: "host-requests",
        title: "Requests waiting on you",
        body: "Bookings and matches that need an answer. Reply quickly, since people often book whoever responds first.",
      },
    );
  }

  if (access.canManageVenues)
    steps.push({
      target: "host-venues",
      title: "Your venues",
      body: "Each venue you list, with its status. Edit details, photos, pricing and the days it's available.",
    });
  if (access.canManageEvents)
    steps.push({
      target: "host-events",
      title: "Your events",
      body: "Event packages you've built. Bundle a venue, gear and services, then publish when you're ready.",
    });
  if (access.canManageInventory)
    steps.push({
      target: "host-inventory",
      title: "Your gear",
      body: "Equipment you rent out, with stock and daily rates. Mark items unavailable when they're out.",
    });
  if (access.canManageServices)
    steps.push({
      target: "host-services",
      title: "Your services",
      body: "Catering, design, staffing and other services you offer, with your packages and pricing.",
    });
  if (access.canManagePerformers)
    steps.push({
      target: "host-performers",
      title: "Your performances",
      body: "Your stage and creative gigs. Keep your availability current so the right events find you.",
    });
  if (isOrganizer)
    steps.push(
      {
        target: "host-attention",
        title: "Needs your attention",
        body: "Invitations and requests waiting on you, such as a team asking you to join or a booking you need to look over.",
      },
      {
        target: "host-organizing",
        title: "Teams you organize for",
        body: "Venues and events you have joined as an Organizer, and the people you work with on each.",
      },
      {
        target: "host-open",
        title: "Open to Organizers",
        body: "Venues and events looking for an Organizer. Ask to join one to start working with a team.",
      },
    );
  if (
    access.canProposePartnerships ||
    access.canManageEvents ||
    access.canManageVenues
  )
    steps.push({
      target: "host-partnerships",
      title: "Partnership proposals",
      body: access.canProposePartnerships
        ? "Deals you've proposed to events and venues, and where each one stands."
        : "Investors can propose a partnership on what you run. Accept or decline them here.",
    });

  steps.push({
    target: "host-calendar",
    title: "Your calendar",
    body: "Your bookings by date, colored by role, so you can see clashes before they happen.",
  });
  if (access.canReceivePayouts)
    steps.push({
      target: "host-payouts",
      title: "Get paid",
      body: "Connect your payout account so the money from your bookings can reach your bank.",
    });

  steps.push({
    title: "That's it",
    body: "You can replay this tour any time with the Take the tour button on this page.",
  });
  return steps;
}
