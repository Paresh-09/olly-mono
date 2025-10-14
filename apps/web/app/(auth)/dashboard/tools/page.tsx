import { validateRequest } from '@/lib/auth';
import { redirect } from 'next/navigation';
import ContentGeneratorsList from '../_components/generators';

export default async function ContentGeneratorsPage() {
  const { user } = await validateRequest();
  
  if (!user) {
    redirect('/login'); // Redirect to login if user is not authenticated
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Content Generators</h1>
      <ContentGeneratorsList />
    </div>
  );
}