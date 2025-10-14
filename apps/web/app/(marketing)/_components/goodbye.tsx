'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CardTitle, CardHeader, CardContent, CardFooter, Card } from "@repo/ui/components/ui/card";
import { Checkbox } from "@repo/ui/components/ui/checkbox";
import { Label } from "@repo/ui/components/ui/label";
import { Textarea } from "@repo/ui/components/ui/textarea";
import { Button } from "@repo/ui/components/ui/button";
import { AlertCircle } from 'lucide-react';

export default function GoodByeFeedback() {
  const searchParams = useSearchParams();
  const [reason, setReason] = useState('');
  const [subReason, setSubReason] = useState('');
  const [otherReason, setOtherReason] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [step, setStep] = useState(1);
  const [isExiting, setIsExiting] = useState(false);

  const handleReasonChange = (selectedReason: string) => {
    setReason(selectedReason);
    setSubReason('');
    setStep(2);
  };

  const handleSubReasonChange = (selected: string) => {
    setSubReason(selected);
    setStep(3);
  };

  const handleOtherReasonChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setOtherReason(event.target.value);
  };

  const handleSubmit = () => {
    const userId = searchParams.get('u');
    if (userId) {
      fetch('/api/uninstall', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          userId, 
          mainReason: reason,
          specificReason: subReason,
          additionalFeedback: otherReason 
        }),
      })
        .then(() => {
          setSubmitted(true);
        })
        .catch((error) => {
          console.error('Error submitting feedback:', error);
        });
    }
  };

  const renderHelpText = () => {
    if (!reason) return null;

    const helpTexts: Record<string, { message: string, link?: string }> = {
      'technical': {
        message: "Most technical issues can be resolved quickly. Would you like to troubleshoot before uninstalling?",
        link: "https://youtu.be/878N5HT68g0"
      },
      'setup': {
        message: "Many users find success after a quick setup call with our team. Would you like to schedule one?",
        link: "https://youtu.be/878N5HT68g0"
      },
      'quality': {
        message: "Have you configured your Brand Voice? This typically improves response quality by 80%.",
        link: "https://youtu.be/NoAdUkt9ngY?si=b49w6jSZTkymnJMF"
      },
      'features': {
        message: "We're constantly adding new features. Check our roadmap to see what's coming.",
        link: "https://www.olly.social/product-roadmap"
      },
      'cost': {
        message: "Did you know? You can use Olly free forever with 20 comments per day. We also offer special deals for different needs.",
      },
      'not_needed': {
        message: "If there is anything we can do better, please let us know at support@explainx.ai",
      }
    };

    const help = helpTexts[reason];
    if (!help) return null;

    return (
      <div className="mt-4 p-4 bg-blue-50 rounded-lg flex items-start space-x-3">
        <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
        <div className="space-y-2">
          <p className="text-sm text-blue-800">{help.message}</p>
          {help.link && (
            <a 
              href={help.link}
              target="_blank"
              rel="noopener noreferrer" 
              className="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              Learn more →
            </a>
          )}
        </div>
      </div>
    );
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="text-6xl mb-4">🙏</div>
            <CardTitle>Thank You for Your Feedback</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4 text-center">We appreciate you taking the time to share your thoughts. Your feedback helps us improve Olly for everyone.</p>
            <p className="text-sm text-gray-500 text-center">Need to get in touch? Email us at support@explainx.ai</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const mainReasons = [
    { id: 'technical', label: 'Technical Issues', emoji: '🔧' },
    { id: 'setup', label: 'Setup & Configuration Challenges', emoji: '⚙️' },
    { id: 'quality', label: 'AI Response Quality', emoji: '🤖' },
    { id: 'features', label: 'Missing Features', emoji: '📝' },
    { id: 'cost', label: 'Cost Concerns', emoji: '💰' },
    { id: 'not_needed', label: "Don't Need It Anymore", emoji: '👋' },
  ];

  const subReasons = {
    technical: [
      { id: 'errors', label: 'Getting error messages', emoji: '❌' },
      { id: 'slow', label: 'Extension is slow or unresponsive', emoji: '🐌' },
      { id: 'popup', label: 'Issues with the popup interface', emoji: '🪟' },
    ],
    setup: [
      { id: 'api', label: 'API key configuration issues', emoji: '🔑' },
      { id: 'complex', label: 'Setup process is too complex', emoji: '😕' },
    ],
    quality: [
      { id: 'generic', label: 'Responses are too generic', emoji: '📋' },
      { id: 'tone', label: 'Wrong tone or style', emoji: '🎭' },
    ],
    features: [
      { id: 'platform', label: "Doesn't support my platform", emoji: '🌐' },
      { id: 'automation', label: 'Need more automation', emoji: '🤖' },
    ],
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <Card className={`w-full max-w-md transition-all duration-300 ${isExiting ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
        {step === 1 && (
          <>
            <CardHeader className="text-center">
              <div className="text-6xl mb-4">😢</div>
              <CardTitle>We're Sorry to See You Go</CardTitle>
              <p className="text-sm text-gray-500 mt-2">
                Your feedback helps us improve. Could you tell us why you're uninstalling?
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-3">
                {mainReasons.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleReasonChange(item.id)}
                    className="p-4 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all flex items-center space-x-3"
                  >
                    <span className="text-2xl">{item.emoji}</span>
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </>
        )}

        {step === 2 && reason && subReasons[reason as keyof typeof subReasons] && (
          <>
            <CardHeader className="text-center">
              <div className="text-6xl mb-4">🤔</div>
              <CardTitle>Could you be more specific?</CardTitle>
              <p className="text-sm text-gray-500 mt-2">
                This will help us address the issue better
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-3">
                {subReasons[reason as keyof typeof subReasons].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSubReasonChange(item.id)}
                    className="p-4 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all flex items-center space-x-3"
                  >
                    <span className="text-2xl">{item.emoji}</span>
                    <span>{item.label}</span>
                  </button>
                ))}
                <button
                  onClick={() => setStep(3)}
                  className="p-4 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all flex items-center space-x-3"
                >
                  <span className="text-2xl">✨</span>
                  <span>Something else</span>
                </button>
              </div>
              {renderHelpText()}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="ghost" onClick={() => setStep(1)}>
                ← Back
              </Button>
            </CardFooter>
          </>
        )}

        {step === 3 && (
          <>
            <CardHeader className="text-center">
              <div className="text-6xl mb-4">💭</div>
              <CardTitle>Any additional thoughts?</CardTitle>
              <p className="text-sm text-gray-500 mt-2">
                Your feedback will help us improve Olly
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Textarea
                  value={otherReason}
                  onChange={handleOtherReasonChange}
                  placeholder="Help us understand more about your experience..."
                  className="h-32"
                />
                {renderHelpText()}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="ghost" onClick={() => setStep(2)}>
                ← Back
              </Button>
              <div className="space-x-3">
                <Button 
                  variant="outline" 
                  onClick={() => window.location.href = 'https://olly.social/contact'}
                >
                  Contact Support
                </Button>
                <Button onClick={handleSubmit}>Submit Feedback</Button>
              </div>
            </CardFooter>
          </>
        )}
      </Card>
    </div>
  );
}