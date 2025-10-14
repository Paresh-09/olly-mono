"use client";

import { useState } from 'react'
import { Card } from '@repo/ui/components/ui/card'
import { Textarea } from '@repo/ui/components/ui/textarea'
import { Button } from '@repo/ui/components/ui/button'
import { Alert, AlertDescription } from "@repo/ui/components/ui/alert"
import { toast } from '@repo/ui/hooks/use-toast'
import { Copy, CheckSquare } from 'lucide-react'
import AuthPopup from "../authentication"
import { useAuthLimit } from '@/hooks/use-auth-check';

interface PreviewProps {
  text: string;
}

const Preview: React.FC<PreviewProps> = ({ text }) => {
  if (!text.trim()) return null;
  
  const lines = text
    .split('\n')
    .filter(line => line.trim() !== '')
    .join('\n\n');

  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <h3 className="font-medium mb-2">Preview:</h3>
      <div className="whitespace-pre-wrap text-gray-600">
        {lines}
      </div>
    </div>
  );
};

export const LineBreaker = () => {
  const [input, setInput] = useState('')
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
    toolId: 'line-breaker',
    dailyLimit: 2 // Two free formats per day
  });

  const addLineBreaks = async () => {
    if (!input.trim()) {
      toast({
        title: "Error",
        description: "Please enter some text to format",
        variant: "destructive"
      });
      return;
    }

    if (!checkUsageLimit()) {
      return;
    }

    try {
      const formatted = input
        .split('\n')
        .filter(line => line.trim() !== '')
        .join('\n\n');
      
      await navigator.clipboard.writeText(formatted);
      
      if (!isAuthenticated) {
        incrementUsage();
      }

      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      
      toast({
        title: "Formatted text copied!",
        description: "Your caption is ready to paste with proper line breaks"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy formatted text",
        variant: "destructive"
      });
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setInput(text);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to paste from clipboard",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="p-6">
      {!isAuthenticated && (
        <Alert className="mb-4">
          <AlertDescription>
            You have {remainingUses} free format{remainingUses !== 1 ? 's' : ''} remaining today. Sign in for unlimited access.
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        <div className="relative">
          <Textarea
            className="w-full h-48"
            placeholder="Type or paste your caption here..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={handlePaste}
            className="absolute top-2 right-2"
          >
            Paste
          </Button>
        </div>
        
        {input.trim() && <Preview text={input} />}
        
        <Button 
          onClick={addLineBreaks} 
          className="w-full gap-2"
          disabled={!input.trim() || (!isAuthenticated && remainingUses <= 0)}
        >
          {copied ? (
            <>
              <CheckSquare className="h-4 w-4" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              Format & Copy
            </>
          )}
        </Button>

        <div className="text-sm text-gray-600">
          <h3 className="font-medium mb-2">How to use:</h3>
          <ol className="list-decimal pl-5 space-y-1">
            <li>Paste your caption or click the &quot;Paste&quot; button</li>
            <li>Review the preview to ensure proper formatting</li>
            <li>Click &quot;Format & Copy&quot;</li>
            <li>Paste directly into Instagram/social media</li>
          </ol>

          <h3 className="font-medium mt-4 mb-2">Features:</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>Removes empty lines</li>
            <li>Adds proper spacing between paragraphs</li>
            <li>Preserves intentional line breaks</li>
            <li>Shows live preview of formatting</li>
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