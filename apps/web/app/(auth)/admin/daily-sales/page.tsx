import { redirect } from 'next/navigation';
import { validateRequest } from '@/lib/auth';
import DailySalesDashboard from './_components/daily-sales-dashboard';

export const dynamic = 'force-dynamic';

export default async function DailySalesPage() {
  const { user } = await validateRequest();

  if (!user?.isAdmin) {
    console.log('User is not a super admin');
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DailySalesDashboard />
    </div>
  );
} 