"use client";

import { useState } from 'react'
import { Card } from '@repo/ui/components/ui/card'
import { Button } from '@repo/ui/components/ui/button'
import { Textarea } from '@repo/ui/components/ui/textarea'
import { Alert, AlertDescription } from "@repo/ui/components/ui/alert"
import { toast } from '@repo/ui/hooks/use-toast'
import { Copy, CheckSquare, FileUp, RefreshCw, Type, ArrowUpDown } from 'lucide-react'
import AuthPopup from "../authentication"
import { useAuthLimit } from '@/hooks/use-auth-check'

type ConversionType = 'upper' | 'lower' | 'title' | 'sentence' | 'alternating' | 'inverse';

interface ConversionOption {
  type: ConversionType;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const CONVERSION_OPTIONS: ConversionOption[] = [
  {
    type: 'upper',
    label: 'UPPERCASE',
    icon: <Type className="h-4 w-4" />,
    description: 'Convert text to all uppercase letters'
  },
  {
    type: 'lower',
    label: 'lowercase',
    icon: <Type className="h-4 w-4" />,
    description: 'Convert text to all lowercase letters'
  },
  {
    type: 'title',
    label: 'Title Case',
    icon: <Type className="h-4 w-4" />,
    description: 'Capitalize the first letter of each word'
  },
  {
    type: 'sentence',
    label: 'Sentence case',
    icon: <Type className="h-4 w-4" />,
    description: 'Capitalize the first letter of each sentence'
  },
  {
    type: 'alternating',
    label: 'aLtErNaTiNg',
    icon: <ArrowUpDown className="h-4 w-4" />,
    description: 'Alternate between upper and lowercase letters'
  },
  {
    type: 'inverse',
    label: 'InVeRsE cAsE',
    icon: <ArrowUpDown className="h-4 w-4" />,
    description: 'Invert the case of each letter'
  }
];

export const TextConverter = () => {
  const [text, setText] = useState('')
  const [copied, setCopied] = useState(false)
  const [lastConversion, setLastConversion] = useState<ConversionType | null>(null)
  
  const {
    isAuthenticated,
    showAuthPopup,
    setShowAuthPopup,
    checkUsageLimit,
    incrementUsage,
    handleSuccessfulAuth,
    remainingUses
  } = useAuthLimit({
    toolId: 'text-converter',
    dailyLimit: 2
  });

  const convertCase = async (type: ConversionType) => {
    if (!text.trim()) {
      toast({
        title: "Error",
        description: "Please enter some text to convert",
        variant: "destructive"
      });
      return;
    }

    if (!checkUsageLimit()) {
      return;
    }

    try {
      let converted = '';
      
      switch (type) {
        case 'upper':
          converted = text.toUpperCase();
          break;
        case 'lower':
          converted = text.toLowerCase();
          break;
        case 'title':
          converted = text
            .toLowerCase()
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
          break;
        case 'sentence':
          converted = text
            .toLowerCase()
            .replace(/(^\w|[.!?]\s+\w)/g, letter => letter.toUpperCase());
          break;
        case 'alternating':
          converted = text
            .split('')
            .map((char, i) => i % 2 ? char.toLowerCase() : char.toUpperCase())
            .join('');
          break;
        case 'inverse':
          converted = text
            .split('')
            .map(char => 
              char === char.toUpperCase() 
                ? char.toLowerCase() 
                : char.toUpperCase()
            )
            .join('');
          break;
      }
      
      setText(converted);
      setLastConversion(type);
      
      if (!isAuthenticated) {
        incrementUsage();
      }

      toast({
        title: "Success",
        description: `Text converted to ${type} case`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to convert text",
        variant: "destructive"
      });
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast({
        title: "Error",
        description: "File size must be under 5MB",
        variant: "destructive"
      });
      return;
    }

    try {
      const text = await file.text();
      setText(text);
      setLastConversion(null);
      
      toast({
        title: "Success",
        description: "File loaded successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to read file",
        variant: "destructive"
      });
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      
      toast({
        title: "Copied!",
        description: "Text copied to clipboard"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive"
      });
    }
  };

  const clearText = () => {
    setText('');
    setLastConversion(null);
    toast({
      description: "Text cleared"
    });
  };

  return (
    <Card className="p-6">
      {!isAuthenticated && (
        <Alert className="mb-4">
          <AlertDescription>
            You have {remainingUses} free conversion{remainingUses !== 1 ? 's' : ''} remaining today. Sign in for unlimited access.
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="gap-2"
            onClick={clearText}
          >
            <RefreshCw className="h-4 w-4" />
            Clear
          </Button>
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => document.getElementById('file-upload')?.click()}
          >
            <FileUp className="h-4 w-4" />
            Upload File
          </Button>
          {text && (
            <Button
              variant="outline"
              className="gap-2 ml-auto"
              onClick={copyToClipboard}
            >
              {copied ? (
                <CheckSquare className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              Copy
            </Button>
          )}
          <input
            id="file-upload"
            type="file"
            accept=".txt,.md,.doc,.docx"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>

        <Textarea
          className="w-full h-48"
          placeholder="Enter your text here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {CONVERSION_OPTIONS.map(option => (
            <Button
              key={option.type}
              onClick={() => convertCase(option.type)}
              disabled={!text.trim() || (!isAuthenticated && remainingUses <= 0)}
              className="gap-2"
              variant={lastConversion === option.type ? "default" : "outline"}
            >
              {option.icon}
              {option.label}
            </Button>
          ))}
        </div>

        <div className="text-sm text-gray-600">
          <h3 className="font-medium mb-2">Available Conversions:</h3>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {CONVERSION_OPTIONS.map(option => (
              <li key={option.type} className="flex items-start gap-2">
                <div className="mt-1">{option.icon}</div>
                <div>
                  <span className="font-medium">{option.label}:</span>{' '}
                  {option.description}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <AuthPopup
        isOpen={showAuthPopup}
        onClose={() => setShowAuthPopup(false)}
        onSuccess={handleSuccessfulAuth}
      />
    </Card>
  )
}