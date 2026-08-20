import { requireAuth } from '@/shared/lib/server/auth';
import ProfileSettingsClient from '@/features/user/components/ProfileSettingsClient';
import MobileSettingsView from '@/features/user/components/MobileSettingsView';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const user = await requireAuth();
  return (
    <>
      <div className="lg:hidden">
        <MobileSettingsView user={user} />
      </div>
      <div className="hidden lg:block">
        <ProfileSettingsClient />
      </div>
    </>
  );
}
