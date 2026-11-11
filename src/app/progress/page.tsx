import { redirect } from "next/navigation";

// The XP progress page is retired (rewards spec, 2026-11-11). Badges and stamps
// live in the passport.
export default function ProgressPage() {
  redirect("/passport");
}
