
import React from 'react';
import { StepProps } from '@/types/onboarding';
import { Chrome, ExternalLink, CheckCircle } from 'lucide-react';
import { Button } from '@repo/ui/components/ui/button';

const EXTENSION_URL = 'https://chrome.google.com/webstore/detail/olly-social-media-sidekic/ofjpapfmglfjdhmadpegoeifocomaeje';

export default function ChromeExtensionStep({ onNext, onBack }: StepProps) {
  const handleInstall = () => {
    window.open(EXTENSION_URL, '_blank');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <Chrome className="w-4 h-4 text-blue-600" />
        <h2 className="text-base font-medium">Install Chrome Extension</h2>
      </div>
      
      <div className="border border-gray-200 rounded-md bg-white p-4 flex flex-col items-center justify-center">
        <p className="text-sm text-center mb-4">
          Install the Olly Chrome extension to access AI tools from any website.
        </p>
        
        <div className="flex items-center gap-3">
          <Button 
            variant="default" 
            size="sm" 
            className="text-xs h-8"
            onClick={handleInstall}
          >
            <Chrome className="w-3.5 h-3.5 mr-1.5" />
            Install Extension
            <ExternalLink className="w-3 h-3 ml-1.5" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="text-xs h-8"
            onClick={onNext}
          >
            <CheckCircle className="w-3.5 h-3.5 mr-1.5 text-green-500" />
            Already Installed
          </Button>
        </div>
      </div>
    </div>
  );
}
