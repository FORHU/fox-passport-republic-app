import { redirect } from "next/navigation";

export default function MayorIndexPage() {
  redirect("/creator-dashboard/venues");
}
