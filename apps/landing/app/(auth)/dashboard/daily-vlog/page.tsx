import { Suspense } from 'react';
import DailyVlogContent from './_components/DailyVlogContent';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Daily Vlog - Olly',
  description: 'Record your daily thoughts and reflections with text or voice.',
};

export default function DailyVlogPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Daily Vlog</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Record your daily thoughts and reflections using text or voice. Your entries will be enhanced into well-structured journal entries.
        </p>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <DailyVlogContent />
      </Suspense>
    </div>
  );
} 