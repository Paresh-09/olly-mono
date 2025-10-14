import React, { useState } from 'react';
import { PartyPopper, Star } from 'lucide-react';
import { Textarea } from '@repo/ui/components/ui/textarea';
import { StepProps, STEPS } from '@/types/onboarding';

export default function CompletionStep({ onNext, onBack }: StepProps) {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasRated, setHasRated] = useState(false);

  const handleSubmitRating = async () => {
    if (rating === 0) return;
    
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/user/onboarding/rating', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rating, feedback }),
      });
      
      if (response.ok) {
        setHasRated(true);
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCompleteOnboarding = async () => {
    setIsSubmitting(true);
    try {
      // Submit rating if provided
      if (!hasRated && rating > 0) {
        await handleSubmitRating();
      }

      // Update progress to mark completion
      const progressResponse = await fetch('/api/user/onboarding/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          step: STEPS.COMPLETION,
          isCompleted: true
        }),
      });

      if (!progressResponse.ok) {
        throw new Error('Failed to update progress');
      }

      // If everything is successful, proceed to dashboard
      onNext();
    } catch (error) {
      console.error('Error completing onboarding:', error);
      // Still redirect to dashboard even if there's an error
      onNext();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <PartyPopper className="h-6 w-6 text-blue-600" />
        <h2 className="text-lg font-medium">Setup Complete!</h2>
      </div>
      
      <div className="p-4 border border-gray-200 rounded-md bg-white">
        <p className="text-sm mb-4">You're ready to start creating amazing content with Olly</p>
        
        <div className="mb-4">
          <h3 className="text-sm font-medium mb-2">How was your onboarding experience?</h3>
          <div className="flex gap-1 mb-3">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                onClick={() => setRating(value)}
                className="focus:outline-none"
              >
                <Star
                  className={`w-5 h-5 ${
                    value <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
          </div>
          
          {rating > 0 && (
            <Textarea
              placeholder="Any feedback for us? (optional)"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="h-20 text-sm"
            />
          )}
        </div>
      </div>
    </div>
  );
}