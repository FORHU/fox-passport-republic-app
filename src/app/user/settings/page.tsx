import { requireAuth } from '@/shared/lib/server/auth';
import ProfileSettingsClient from '@/features/user/components/ProfileSettingsClient';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  await requireAuth();
  return <ProfileSettingsClient />;
}
