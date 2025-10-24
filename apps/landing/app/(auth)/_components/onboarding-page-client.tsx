"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@repo/ui/components/ui/button";
import { Loader2 } from "lucide-react";
import OnboardingForm, { OnboardingData } from './onboarding-form';

export default function OnboardingPageClient() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleApiResponse = async (apiCall: () => Promise<Response>) => {
    setIsLoading(true);
    try {
      const response = await apiCall();
      if (response.ok) {
        // Force a hard redirect instead of client-side navigation
        window.location.href = '/dashboard';
      } else {
        const error = await response.json();
        console.error('Failed to process onboarding:', error);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error processing onboarding:', error);
      setIsLoading(false);
    }
  };

  const handleOnboardingSubmit = async (data: OnboardingData): Promise<void> => {
    await handleApiResponse(() => 
      fetch('/api/user/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...data, skipped: false }),
      })
    );
  };

  const handleSkip = async () => {
    // Disable the button immediately
    if (isLoading) return;
    
    await handleApiResponse(() => 
      fetch('/api/user/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ skipped: true }),
      })
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Let&apos;s get to know you 👋</h1>
      <OnboardingForm onSubmit={handleOnboardingSubmit} disabled={isLoading} />
      <div className="mt-4 text-center">
        <Button
          variant="ghost"
          onClick={handleSkip}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Redirecting...
            </>
          ) : (
            'Skip for now'
          )}
        </Button>
      </div>
    </div>
  );
}