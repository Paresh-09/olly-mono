"use client";

import { useState, useCallback, useMemo } from 'react'
import { Card } from '@repo/ui/components/ui/card'
import { Textarea } from '@repo/ui/components/ui/textarea'
import { Button } from '@repo/ui/components/ui/button'
import { Alert, AlertDescription } from "@repo/ui/components/ui/alert"
import { toast } from '@repo/ui/hooks/use-toast'
import { Copy, CheckSquare, FileUp, RefreshCw } from 'lucide-react'
import AuthPopup from "../authentication"
import { useAuthLimit } from '@/hooks/use-auth-check'

interface TextStats {
  words: number;
  characters: number;
  charactersNoSpaces: number;
  sentences: number;
  paragraphs: number;
  readingTime: number;
  speakingTime: number;
  longestWord: string;
  averageWordLength: number;
}

interface StatsDisplayProps {
  stats: TextStats;
  onCopy: () => void;
  copied: boolean;
}

const StatsDisplay: React.FC<StatsDisplayProps> = ({ stats, onCopy, copied }) => {
  const statItems = [
    { label: 'Words', value: stats.words.toLocaleString() },
    { label: 'Characters', value: stats.characters.toLocaleString() },
    { label: 'Characters (no spaces)', value: stats.charactersNoSpaces.toLocaleString() },
    { label: 'Sentences', value: stats.sentences.toLocaleString() },
    { label: 'Paragraphs', value: stats.paragraphs.toLocaleString() },
    { label: 'Reading Time', value: `${stats.readingTime} min` },
    { label: 'Speaking Time', value: `${stats.speakingTime} min` },
    { label: 'Longest Word', value: stats.longestWord || 'N/A' },
    { label: 'Avg. Word Length', value: `${stats.averageWordLength.toFixed(1)} chars` },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {statItems.map(({ label, value }) => (
          <div key={label} className="p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600">{label}</div>
            <div className="text-lg font-semibold">{value}</div>
          </div>
        ))}
      </div>
      <Button
        variant="outline"
        onClick={onCopy}
        className="w-full gap-2"
      >
        {copied ? (
          <>
            <CheckSquare className="h-4 w-4" />
            Copied!
          </>
        ) : (
          <>
            <Copy className="h-4 w-4" />
            Copy Statistics
          </>
        )}
      </Button>
    </div>
  );
};

export const TextAnalyzer = () => {
  const [text, setText] = useState('')
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
    toolId: 'text-analyzer',
    dailyLimit: 2
  });

  const analyzeText = useCallback((input: string): TextStats => {
    const trimmedText = input.trim();
    const words = trimmedText ? trimmedText.split(/\s+/) : [];
    const sentences = trimmedText ? trimmedText.split(/[.!?]+/).filter(Boolean) : [];
    const paragraphs = trimmedText ? trimmedText.split(/\n\s*\n/).filter(Boolean) : [];
    const charactersNoSpaces = trimmedText.replace(/\s/g, '').length;
    
    return {
      words: words.length,
      characters: input.length,
      charactersNoSpaces,
      sentences: sentences.length,
      paragraphs: paragraphs.length,
      readingTime: Math.max(1, Math.ceil(words.length / 200)), // min 1 minute
      speakingTime: Math.max(1, Math.ceil(words.length / 130)), // min 1 minute
      longestWord: words.reduce((longest, word) => 
        word.length > longest.length ? word : longest, ''),
      averageWordLength: words.length ? 
        words.reduce((sum, word) => sum + word.length, 0) / words.length : 0
    }
  }, [])

  const stats = useMemo(() => analyzeText(text), [text, analyzeText])

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!checkUsageLimit()) {
      return;
    }

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
      
      if (!isAuthenticated) {
        incrementUsage();
      }

      toast({
        title: "Success",
        description: "File content loaded successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to read file",
        variant: "destructive"
      });
    }
  };

  const copyStats = async () => {
    try {
      const statsText = Object.entries(stats)
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n');
      
      await navigator.clipboard.writeText(statsText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      
      toast({
        title: "Copied!",
        description: "Statistics copied to clipboard"
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
    toast({
      description: "Text cleared"
    });
  };

  return (
    <Card className="p-6">
      {!isAuthenticated && (
        <Alert className="mb-4">
          <AlertDescription>
            You have {remainingUses} free analysis remaining today. Sign in for unlimited access.
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
            disabled={!isAuthenticated && remainingUses <= 0}
          >
            <FileUp className="h-4 w-4" />
            Upload File
          </Button>
          <input
            id="file-upload"
            type="file"
            accept=".txt,.md,.doc,.docx"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>

        <Textarea
          placeholder="Type or paste your text here..."
          className="w-full h-48 mb-4 p-3"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <StatsDisplay 
          stats={stats}
          onCopy={copyStats}
          copied={copied}
        />

        <div className="text-sm text-gray-600">
          <h3 className="font-medium mb-2">About the metrics:</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>Reading time based on 200 words per minute</li>
            <li>Speaking time based on 130 words per minute</li>
            <li>Paragraphs separated by blank lines</li>
            <li>Characters count includes spaces and punctuation</li>
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