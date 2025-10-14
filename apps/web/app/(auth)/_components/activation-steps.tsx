'use client'

import React, { useState } from 'react';
import { CheckCircle, Copy, ExternalLink, ChevronRight } from 'lucide-react';
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { Alert, AlertDescription } from "@repo/ui/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/ui/card";

interface ActivationStepsProps {
  activationKey: string;
}

interface StepProps {
  title: string;
  content: React.ReactNode;
}

interface APIOption {
  name: string;
  link: string;
}

const ActivationSteps: React.FC<ActivationStepsProps> = ({ activationKey }) => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);

  const copyActivationKey = (): void => {
    navigator.clipboard.writeText(activationKey).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const apiOptions: APIOption[] = [
    { name: "OpenAI", link: "https://platform.openai.com/api-keys" },
    { name: "Olly v1 API", link: "https://olly-ai.lemonsqueezy.com/buy/4d8fdf02-4b6e-4709-83f6-11ebf9d59e4a" },
    { name: "Claude API", link: "https://console.anthropic.com/settings/keys" },
    { name: "Straico", link: "https://platform.straico.com/user-settings" },
    { name: "Gemini - Google", link: "https://aistudio.google.com/app/apikey" },
    { name: "Ollama (Local Setup)", link: "https://youtu.be/878N5HT68g0" }
  ];

  const steps: StepProps[] = [
    {
      title: "Install Olly Chrome Extension",
      content: (
        <Button asChild variant="default" className="w-full">
          <a href="https://chromewebstore.google.com/detail/olly-social-media-sidekic/ofjpapfmglfjdhmadpegoeifocomaeje" target="_blank" rel="noopener noreferrer">
            Install Olly Extension
            <ExternalLink className="w-4 h-4 ml-2" />
          </a>
        </Button>
      )
    },
    {
      title: "Activate Olly",
      content: (
        <div className="flex items-center space-x-2">
          <Input value={activationKey} readOnly className="flex-grow" />
          <Button onClick={copyActivationKey} variant="outline">
            {copied ? <CheckCircle className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
            {copied ? 'Copied!' : 'Copy Key'}
          </Button>
        </div>
      )
    },
    {
      title: "Choose and Set Up API",
      content: (
        <div className="space-y-4">
          <Alert>
            <AlertDescription>
              API keys are required for Olly. These may have associated costs. Choose an option that fits your needs and budget.
            </AlertDescription>
          </Alert>
          <div className="grid grid-cols-2 gap-2">
            {apiOptions.map((option, idx) => (
              <Button key={idx} variant="outline" asChild className="justify-start">
                <a href={option.link} target="_blank" rel="noopener noreferrer">
                  {option.name}
                  <ExternalLink className="w-4 h-4 ml-2" />
                </a>
              </Button>
            ))}
          </div>
        </div>
      )
    },
    {
      title: "Refresh Chrome",
      content: (
        <Button onClick={() => setCurrentStep(4)} variant="default" className="w-full">
          I&apos;ve Refreshed Chrome
        </Button>
      )
    }
  ];

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-3xl font-bold mb-6 text-center">Set Up Olly in 4 Easy Steps</h2>
      
      <div className="space-y-4">
        {steps.map((step, index) => (
          <Card key={index} className={`transition-all duration-300 ${currentStep >= index ? 'border-blue-500' : 'opacity-60'}`}>
            <CardHeader>
              <CardTitle className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${currentStep > index ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
                  {currentStep > index ? <CheckCircle className="w-5 h-5" /> : index + 1}
                </div>
                {step.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {currentStep >= index && (
                <div className="mt-2">
                  {step.content}
                </div>
              )}
              {index === currentStep && index < 3 && (
                <Button onClick={() => setCurrentStep(index + 1)} className="mt-4 w-full">
                  Next Step
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {currentStep === 4 && (
        <Alert className="mt-6">
          <AlertDescription>
            Setup complete! Need help? <a href="/activation-guide" className="underline">Check our FAQ</a> or 
            <a href="https://youtu.be/fABczcnx9AY?si=UZYhgTJsyT0AnAZe" target="_blank" rel="noopener noreferrer" className="underline ml-1">Watch the setup video</a>.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default ActivationSteps;