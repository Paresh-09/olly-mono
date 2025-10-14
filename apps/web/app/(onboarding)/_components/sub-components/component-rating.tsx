import { useState } from 'react';
import { Star } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@repo/ui/components/ui/card';
import { Button } from '@repo/ui/components/ui/button';
import { Textarea } from '@repo/ui/components/ui/textarea';

const OnboardingRating = () => {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async () => {
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
        setIsSubmitted(true);
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6 text-center">
          <h3 className="text-xl font-semibold mb-2">Thank you for your feedback!</h3>
          <p className="text-muted-foreground">Your response helps us improve our onboarding experience.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Rate Your Experience</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-center space-x-2">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              onClick={() => setRating(value)}
              className="focus:outline-none"
            >
              <Star
                className={`w-8 h-8 ${
                  value <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                }`}
              />
            </button>
          ))}
        </div>
        
        <Textarea
          placeholder="Share your thoughts about the onboarding experience (optional)"
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          className="h-24"
        />
        
        <Button 
          onClick={handleSubmit}
          disabled={rating === 0 || isSubmitting}
          className="w-full"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default OnboardingRating;