import { validateRequest } from '@/lib/auth';
import { redirect } from 'next/navigation';
import PostGeneratorClient from '../_components/post-generator';

export default async function PostGeneratorPage() {
  const { user } = await validateRequest();
  
  if (!user) {
    redirect('/login'); // Redirect to login if user is not authenticated
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Post Generator</h1>
      <PostGeneratorClient userId={user.id} />
    </div>
  );
}