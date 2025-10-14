import { validateRequest } from '@/lib/auth';
import { redirect } from 'next/navigation';
import DashboardRedeemForm from '../../_components/dashboard-redeem-form';

export default async function DashboardRedeemPage() {
  const { user } = await validateRequest();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6 text-center">Redeem Your License</h1>
      <DashboardRedeemForm user={user} />
    </div>
  );
}