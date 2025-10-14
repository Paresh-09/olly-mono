import { redirect } from 'next/navigation';
import { validateRequest } from '@/lib/auth';
import UserAnalytics from '../_components/user-analytics';

export const dynamic = 'force-dynamic';

export default async function AnalyticsPage() {
  const { user } = await validateRequest();

  if (!user) {
    redirect('/');
  }

  if (!user?.isAdmin) {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold mb-8">User Analytics</h1>
      <UserAnalytics />
    </div>
  );
} 