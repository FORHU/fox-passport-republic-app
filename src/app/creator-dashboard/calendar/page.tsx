import { DashboardHeader } from "@/features/dashboard/components/DashboardHeader";
import { CalendarView } from "@/shared/components/calendar/CalendarView";

// The same calendar as /calendar, inside the dashboard chrome — it shows the
// creator's own bookings too, not just the jobs from their listings.
export default function HostCalendarPage() {
  return (
    <div className="bg-canvas text-white min-h-screen font-body antialiased">
      <DashboardHeader />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-32 pb-28 sm:pb-20">
        <h1 className="text-3xl font-display font-bold text-white mb-6">
          Calendar
        </h1>
        <CalendarView />
      </main>
    </div>
  );
}
