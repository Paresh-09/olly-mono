// app/activation-management/page.tsx
import { getUserActivationsAndLicenses } from "@/lib/actions/activations";
import { validateRequest } from "@/lib/auth";
import { redirect } from 'next/navigation';
import ActivationManagement from "../_components/activation-management";

export default async function ActivationManagementPage() {
  const { user } = await validateRequest();
  if (!user) {
    redirect('/login');
  }

  const result = await getUserActivationsAndLicenses(user.id);
  const { activations, licenses, subLicenses } = result.success ? JSON.parse(result.success) : { activations: [], licenses: [], subLicenses: [] };

  return <ActivationManagement
    userId={user.id} 
    initialActivations={activations} 
    initialLicenses={licenses}
  />;
}