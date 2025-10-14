"use client"

import React, { useState } from 'react';
import { CheckCircle, Copy, ExternalLink } from 'lucide-react';
import { Button } from "@repo/ui/components/ui/button";
import Image from 'next/image';

interface ActivationStepsProps {
  activationKey: string;
}

const ActivationSteps: React.FC<ActivationStepsProps> = ({ activationKey }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [copied, setCopied] = useState(false);

  const copyActivationKey = () => {
    navigator.clipboard.writeText(activationKey).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const steps = [
    {
      text: "Add Olly to Chrome",
      link: "https://chromewebstore.google.com/detail/olly-social-media-sidekic/ofjpapfmglfjdhmadpegoeifocomaeje",
      action: () => setCurrentStep(1)
    },
    {
      text: "Copy Activation Key",
      action: () => {
        copyActivationKey();
        setCurrentStep(2);
      }
    },
    {
      text: "Add OpenAI API key",
      link: "https://platform.openai.com/account/api-keys",
      action: () => setCurrentStep(3)
    },
    {
      text: "Refresh or Restart Social Media Pages",
      action: () => setCurrentStep(4)
    },
    {
      text: "Customize Settings",
      action: () => setCurrentStep(5)
    }
  ];

  return (
    <div className="w-full max-w-sm mx-auto p-4 bg-white rounded-lg shadow-sm">
      <div className="flex items-center justify-center mb-4">
        <h3 className="font-medium text-lg ml-2">5 Steps and you&apos;re all set!</h3>
        {/* <Image src="/icon-2.png" alt="Olly Logo" width={20} height={20} /> */}
      </div>
      
      <div className="space-y-2">
        {steps.map((step, index) => (
          <div key={index} className={`flex items-center p-2 rounded-md ${currentStep >= index ? 'bg-blue-50' : 'bg-gray-50'}`}>
            <div className="w-6 h-6 rounded-full bg-white border border-blue-500 flex items-center justify-center mr-2 flex-shrink-0">
              {currentStep > index ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <span className="text-blue-500 text-xs font-bold">{index + 1}</span>
              )}
            </div>
            <div className="flex-grow text-sm">
              <p className={`${currentStep >= index ? 'text-blue-700' : 'text-gray-600'}`}>{step.text}</p>
            </div>
            <div className="ml-2">
              {step.link ? (
                <Button variant="ghost" size="sm" onClick={step.action} asChild className="p-1 h-auto">
                  <a href={step.link} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </Button>
              ) : (
                <Button variant="ghost" size="sm" onClick={step.action} className="p-1 h-auto">
                  {index === 1 ? (
                    <Copy className="w-4 h-4" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {currentStep === 5 && (
        <div className="mt-4 text-xs text-center text-gray-600">
          All set! Need help?{' '}
          <a href="https://youtu.be/sxM84wjUXAg" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
            Sumo-ling&apos;s Guide
          </a>
          {' | '}
          <a href="/activation-guide" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
            FAQ
          </a>
        </div>
      )}
    </div>
  );
};

export default ActivationSteps;