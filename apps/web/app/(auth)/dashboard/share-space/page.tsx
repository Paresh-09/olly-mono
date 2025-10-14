import { Suspense } from 'react';
import ShareSpaceContent from './ShareSpaceContent';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Share Space - Olly',
  description: 'Share and discover social media posts from the community.',
};

export default function ShareSpacePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Share Space</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Share your social media posts and engage with the community. Earn credits by participating!
        </p>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <ShareSpaceContent />
      </Suspense>
    </div>
  );
} 