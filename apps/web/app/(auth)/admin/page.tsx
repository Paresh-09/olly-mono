import { redirect } from 'next/navigation';
import { validateRequest } from '@/lib/auth';
import AdminDashboard from './_components/admin-dashboard';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const { user } = await validateRequest();

  if (!user) {
    redirect('/');
  }

  if (!user?.isAdmin) {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminDashboard />
    </div>
  );
} 