import { requireAuth } from "@/shared/lib/server/auth";
import ProfileSettingsClient, {
  type SettingsSection,
} from "@/features/user/components/ProfileSettingsClient";
import MobileSettingsView from "@/features/user/components/MobileSettingsView";
import BlockedUsersSection from "./BlockedUsersSection";

export const dynamic = "force-dynamic";

const SECTIONS: SettingsSection[] = ["profile", "privacy", "security", "danger"];

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ section?: string }>;
}) {
  const user = await requireAuth();
  const { section } = await searchParams;
  const initialSection = SECTIONS.find((s) => s === section);

  // `?section=` opens the editor at every width — it is how the phone menu
  // below reaches it, since that menu replaces the editor under `lg`.
  if (initialSection) {
    return (
      <ProfileSettingsClient
        initialSection={initialSection}
        blockedUsersSlot={<BlockedUsersSection />}
      />
    );
  }

  return (
    <>
      <div className="lg:hidden">
        <MobileSettingsView user={user} />
      </div>
      <div className="hidden lg:block">
        <ProfileSettingsClient blockedUsersSlot={<BlockedUsersSection />} />
      </div>
    </>
  );
}
