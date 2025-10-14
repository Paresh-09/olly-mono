// components/ActivationGuidePage.tsx
import React, { useState } from 'react';
import { CheckCircle, Copy, ExternalLink, Info } from 'lucide-react';
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { Alert, AlertDescription } from "@repo/ui/components/ui/alert";

interface ActivationGuidePageProps {
  licenseKey: string;
}

const ActivationGuidePage: React.FC<ActivationGuidePageProps> = ({ licenseKey }) => {
  const [copied, setCopied] = useState(false);

  const copyLicenseKey = () => {
    navigator.clipboard.writeText(licenseKey).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const apiOptions = [
    { name: "OpenAI", description: "Recommended", link: "https://platform.openai.com/api-keys" },
    { name: "Olly v1 API", description: "Recommended", link: "https://olly-ai.lemonsqueezy.com/buy/4d8fdf02-4b6e-4709-83f6-11ebf9d59e4a" },
    { name: "Claude API", link: "https://console.anthropic.com/settings/keys" },
    { name: "Straico", link: "https://platform.straico.com/user-settings" },
    { name: "Gemini - Google", link: "https://aistudio.google.com/app/apikey" }
  ];

  return (
    <div className="max-w-2xl mx-auto p-4 bg-white rounded-lg">
      <h3 className="font-semibold mb-4">Activation Steps:</h3>
      <ol className="list-decimal pl-5 space-y-4 text-sm">
        <li>
          <a href="https://chromewebstore.google.com/detail/olly-social-media-sidekic/ofjpapfmglfjdhmadpegoeifocomaeje" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center">
            Install Olly Chrome Extension
            <ExternalLink className="h-3 w-3 ml-1" />
          </a>
        </li>
        <li>
          <p className="mb-2">Activate Olly with your key:</p>
          <div className="flex items-center space-x-2 mb-2">
            <Input value={licenseKey} readOnly className="bg-gray-100 text-sm" />
            <Button onClick={copyLicenseKey} size="sm" variant="outline">
              {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </li>
        <li>
          <p className="mb-2">Choose and Set Up API:</p>
          <Alert className="mb-2">
            <Info className="h-4 w-4" />
            <AlertDescription className="text-xs">
              API keys are required for Olly to access language models. These keys are associated with usage costs from the providers.
            </AlertDescription>
          </Alert>
          <ul className="space-y-1 mb-2">
            {apiOptions.map((option, idx) => (
              <li key={idx}>
                <a href={option.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center">
                  {option.name} {option.description && <span className="text-gray-500 text-xs ml-1">({option.description})</span>}
                  <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </li>
            ))}
          </ul>
          <p className="text-xs text-gray-600">
            Free option: <a href="https://youtu.be/878N5HT68g0" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center">
              Set up Ollama locally
              <ExternalLink className="h-3 w-3 ml-1" />
            </a>
          </p>
        </li>
        <li>Refresh Social Media websites.</li>
      </ol>
    </div>
  );
};

export default ActivationGuidePage;