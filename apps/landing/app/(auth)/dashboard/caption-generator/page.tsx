import { validateRequest } from '@/lib/auth';
import { redirect } from 'next/navigation';
import CaptionGeneratorClient from '../_components/caption-generator';

export default async function CaptionGeneratorPage() {
  const { user } = await validateRequest();
  
  if (!user) {
    redirect('/login'); // Redirect to login if user is not authenticated
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Caption Generator</h1>
      <CaptionGeneratorClient userId={user.id} />
    </div>
  );
}