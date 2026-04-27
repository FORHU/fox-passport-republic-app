import { ProgressDashboard } from '@/components/users/ProgressDashboard';

export const dynamic = 'force-dynamic';

export default function ProgressPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
        <ProgressDashboard user={null} />
      </div>
    </div>
  );
}
