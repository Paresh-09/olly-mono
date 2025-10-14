import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { OnboardingData, StepProps } from '@/types/onboarding';
import OnboardingForm from './new-onboarding';

interface QuestionnaireStepProps extends StepProps {
  onSubmit: (data: OnboardingData) => Promise<void>;
}

export default function QuestionnaireStep({ onNext, onBack, isLoading, onSubmit }: QuestionnaireStepProps) {
  const [existingData, setExistingData] = useState<OnboardingData | null>(null);
  const [isFetching, setIsFetching] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOnboardingData = async () => {
      setIsFetching(true);
      try {
        const response = await fetch('/api/user/onboarding');
        
        if (response.ok) {
          const { data, success } = await response.json();
          
          if (success && data && !data.skipped) {
            setExistingData(data);
          }
        } else {
          console.error('Failed to fetch onboarding data');
          setFetchError('Failed to load your previous information. You can continue with a new form.');
        }
      } catch (error) {
        console.error('Error fetching onboarding data:', error);
        setFetchError('An error occurred while loading your data. You can continue with a new form.');
      } finally {
        setIsFetching(false);
      }
    };

    fetchOnboardingData();
  }, []);

  return (
    <div>
      {isFetching ? (
        <div className="flex justify-center items-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-primary mr-2" />
          <span className="text-sm">Loading your information...</span>
        </div>
      ) : (
        <div className="bg-white">
          {fetchError && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 px-3 py-2 rounded mb-4 text-sm">
              {fetchError}
            </div>
          )}
          <OnboardingForm
            onSubmit={onSubmit}
            onNext={onNext}
            onSkip={onNext}
            disabled={isLoading}
            initialData={existingData}
          />
        </div>
      )}
    </div>
  );
}
