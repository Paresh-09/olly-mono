// hooks/useOnboardingProgress.ts
import { useState, useEffect } from 'react';
import { StepType } from '@/types/onboarding';

interface OnboardingProgress {
  currentStep: StepType;
  isCompleted: boolean;
}

export function useOnboardingProgress() {
  const [progress, setProgress] = useState<OnboardingProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    try {
      const response = await fetch('/api/user/onboarding/progress');
      if (response.ok) {
        const data = await response.json();
        setProgress(data);
      } else {
        throw new Error('Failed to fetch progress');
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  const updateProgress = async (step: StepType, isCompleted?: boolean) => {
    try {
      const response = await fetch('/api/user/onboarding/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step, isCompleted })
      });
      
      if (response.ok) {
        const data = await response.json();
        setProgress(data);
      } else {
        throw new Error('Failed to update progress');
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    }
  };

  return {
    progress,
    isLoading,
    error,
    updateProgress,
    fetchProgress
  };
}