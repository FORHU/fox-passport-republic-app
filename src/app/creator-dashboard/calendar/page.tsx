import HostCalendarClient from "../_components/HostCalendarClient";
import MobileHostCalendar from "@/features/dashboard/components/MobileHostCalendar";

export default function HostCalendarPage() {
  return (
    <>
      <div className="lg:hidden">
        <MobileHostCalendar />
      </div>
      <div className="hidden lg:block">
        <HostCalendarClient />
      </div>
    </>
  );
}
