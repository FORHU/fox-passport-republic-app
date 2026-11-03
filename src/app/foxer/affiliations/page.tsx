import { requirePermission } from "@/shared/lib/server/auth";
import VenueAffiliationDashboardClient from "./_components/VenueAffiliationDashboardClient";

// An Event Foxer's affiliations with venues: the page only loads the Event
// Foxer side, and applying needs template:manage. Mayors approve
// affiliations from their venue's edit page instead.
export default async function VenueAffiliationsPage() {
  await requirePermission("template:manage");
  return <VenueAffiliationDashboardClient />;
}
