import { requireAuth } from '@/lib/server/auth';
import ProfileSettingsClient from '@/components/users/ProfileSettingsClient';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  await requireAuth();
  return <ProfileSettingsClient />;
}
