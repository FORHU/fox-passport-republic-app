import { requireAuth } from "@/shared/lib/server/auth";
import ProfileSettingsClient, {
  type SettingsSection,
} from "@/features/user/components/ProfileSettingsClient";
import BlockedUsersSection from "./BlockedUsersSection";

export const dynamic = "force-dynamic";

const SECTIONS: SettingsSection[] = [
  "profile",
  "privacy",
  "security",
  "connections",
  "danger",
];

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ section?: string }>;
}) {
  await requireAuth();
  const { section } = await searchParams;
  // `?section=` opens the editor at that section; otherwise it opens at Profile.
  const initialSection = SECTIONS.find((s) => s === section);

  // The same editor at every width: Edit, Verification, Wishlists and Log Out
  // are already in the header's user menu, so a phone needs no menu of its own.
  return (
    <ProfileSettingsClient
      initialSection={initialSection}
      blockedUsersSlot={<BlockedUsersSection />}
    />
  );
}
