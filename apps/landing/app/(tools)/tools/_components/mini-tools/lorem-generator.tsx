"use client"

import { useState } from 'react'
import { Card } from '@repo/ui/components/ui/card'
import { Button } from '@repo/ui/components/ui/button'
import { Input } from '@repo/ui/components/ui/input'
import { Select } from '@repo/ui/components/ui/select'
import { Textarea } from '@repo/ui/components/ui/textarea'
import { Alert, AlertDescription } from "@repo/ui/components/ui/alert"
import { toast } from '@repo/ui/hooks/use-toast'
import { Copy, CheckSquare, RefreshCw } from 'lucide-react'
import AuthPopup from "../authentication"
import { useAuthLimit } from '@/hooks/use-auth-check'

// Expanded word list for more variety
const WORD_BANK = [
  'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur',
  'adipiscing', 'elit', 'sed', 'do', 'eiusmod', 'tempor',
  'incididunt', 'ut', 'labore', 'et', 'dolore', 'magna', 'aliqua',
  'enim', 'minim', 'veniam', 'quis', 'nostrud', 'exercitation',
  'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo',
  'consequat', 'duis', 'aute', 'irure', 'reprehenderit', 'voluptate',
  'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur'
];

const GENERATION_TYPES = {
  paragraphs: {
    label: 'Paragraphs',
    min: 1,
    max: 10,
    default: 3
  },
  words: {
    label: 'Words',
    min: 1,
    max: 1000,
    default: 50
  }
} as const;

type GenerationType = keyof typeof GENERATION_TYPES;
type GenerationCount = typeof GENERATION_TYPES[GenerationType]['default'];

export const LoremGenerator = () => {
  const [type, setType] = useState<GenerationType>('paragraphs');
  const [count, setCount] = useState<number>(GENERATION_TYPES[type].default);
  const [result, setResult] = useState('')
  const [copied, setCopied] = useState(false)

  const {
    isAuthenticated,
    showAuthPopup,
    setShowAuthPopup,
    checkUsageLimit,
    incrementUsage,
    handleSuccessfulAuth,
    remainingUses
  } = useAuthLimit({
    toolId: 'lorem-generator',
    dailyLimit: 2
  });

  const getRandomWords = (count: number): string[] => {
    return Array(count)
      .fill(0)
      .map(() => WORD_BANK[Math.floor(Math.random() * WORD_BANK.length)]);
  };

  const generateSentence = (): string => {
    const wordCount = Math.floor(Math.random() * 8) + 6;
    const words = getRandomWords(wordCount);
    words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);
    return words.join(' ') + '.';
  };

  const generateParagraph = (): string => {
    const sentenceCount = Math.floor(Math.random() * 3) + 3;
    return Array(sentenceCount)
      .fill(0)
      .map(() => generateSentence())
      .join(' ');
  };

  const generateText = async () => {
    if (!checkUsageLimit()) {
      return;
    }

    try {
      let generated = '';

      if (type === 'words') {
        generated = getRandomWords(count).join(' ');
      } else {
        generated = Array(count)
          .fill(0)
          .map(() => generateParagraph())
          .join('\n\n');
      }

      setResult(generated);

      if (!isAuthenticated) {
        incrementUsage();
      }

      toast({
        title: "Generated successfully!",
        description: `Generated ${count} ${type} of Lorem Ipsum text.`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate text",
        variant: "destructive"
      });
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(result);
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

  const handleCountChange = (value: string) => {
    const numValue = parseInt(value);
    const limits = GENERATION_TYPES[type];

    if (isNaN(numValue) || numValue < limits.min) {
      setCount(limits.min);
    } else if (numValue > limits.max) {
      setCount(limits.max);
    } else {
      setCount(numValue);
    }
  };

  const handleTypeChange = (newType: GenerationType) => {
    setType(newType);
    setCount(GENERATION_TYPES[newType].default);
  };

  return (
    <Card className="p-6">
      {!isAuthenticated && (
        <Alert className="mb-4">
          <AlertDescription>
            You have {remainingUses} free generation{remainingUses !== 1 ? 's' : ''} remaining today. Sign in for unlimited access.
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Count</label>
            <Input
              type="number"
              min={GENERATION_TYPES[type].min}
              max={GENERATION_TYPES[type].max}
              value={count}
              onChange={(e) => handleCountChange(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Type</label>
            <Select
              value={type}
              onValueChange={handleTypeChange}
            >
              {(Object.entries(GENERATION_TYPES) as [GenerationType, typeof GENERATION_TYPES[GenerationType]][]).map(([key, { label }]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </Select>
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">&nbsp;</label>
            <Button
              onClick={generateText}
              className="w-full gap-2"
              disabled={!isAuthenticated && remainingUses <= 0}
            >
              <RefreshCw className="h-4 w-4" />
              Generate
            </Button>
          </div>
        </div>

        <div className="relative">
          <Textarea
            className="w-full h-48 pr-12"
            value={result}
            readOnly
            placeholder="Generated text will appear here..."
          />
          {result && (
            <Button
              variant="outline"
              size="sm"
              onClick={copyToClipboard}
              className="absolute top-2 right-2"
            >
              {copied ? (
                <CheckSquare className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>

        <div className="text-sm text-gray-600">
          <h3 className="font-medium mb-2">Limits:</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>Paragraphs: {GENERATION_TYPES.paragraphs.min}-{GENERATION_TYPES.paragraphs.max} paragraphs</li>
            <li>Words: {GENERATION_TYPES.words.min}-{GENERATION_TYPES.words.max} words</li>
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