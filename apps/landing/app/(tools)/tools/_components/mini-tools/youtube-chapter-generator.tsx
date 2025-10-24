'use client'

import { useState } from 'react'
import { Card } from '@repo/ui/components/ui/card'
import { Button } from '@repo/ui/components/ui/button'
import { Textarea } from '@repo/ui/components/ui/textarea'
import { useToast } from '@repo/ui/hooks/use-toast'
import { Alert, AlertDescription } from "@repo/ui/components/ui/alert"
import { Loader2, Copy, CheckSquare } from 'lucide-react'
import AuthPopup from "../authentication"
import { useAuthLimit } from '@/hooks/use-auth-check'

interface ChapterResult {
  chapters: string;
  creditsRemaining: number;
}

export const ChapterGenerator = () => {
  const [transcript, setTranscript] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ChapterResult | null>(null)
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  const {
    isAuthenticated,
    showAuthPopup,
    setShowAuthPopup,
    checkUsageLimit,
    incrementUsage,
    handleSuccessfulAuth,
    remainingUses
  } = useAuthLimit({
    toolId: 'chapter-generator',
    dailyLimit: 1 // One free generation per day
  });

  const generateChapters = async () => {
    if (!checkUsageLimit()) {
      return;
    }

    if (!transcript.trim()) {
      toast({
        title: "Error",
        description: "Please paste a transcript to generate chapters.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('toolType', 'chapter-generator')
      formData.append('content', transcript)
      formData.append('userId', 'user-id') // Replace with actual user ID

      const response = await fetch('/api/tools/generations', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Generation failed')
      }

      const data = await response.json()
      setResult(data)

      if (!isAuthenticated) {
        incrementUsage();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate chapters. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async () => {
    try {
      if (result?.chapters) {
        await navigator.clipboard.writeText(result.chapters);
        setCopied(true);
        toast({
          title: "Copied!",
          description: "Chapters copied to clipboard"
        });
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive"
      });
    }
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
        <div>
          <label className="block text-sm font-medium mb-1">
            Paste Your Transcript
          </label>
          <Textarea
            placeholder="Paste your transcript here..."
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            className="h-48"
          />
        </div>

        <Button
          onClick={generateChapters}
          className="w-full"
          disabled={loading || (!isAuthenticated && remainingUses <= 0)}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating Chapters...
            </>
          ) : 'Generate Chapters'}
        </Button>

        {result && (
          <div className="mt-6 space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium mb-2">Generated Chapters:</h3>
              <p className="whitespace-pre-wrap text-gray-600">{result.chapters}</p>
            </div>

            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-500">
                Credits remaining: {result.creditsRemaining}
              </p>
              <Button
                variant="outline"
                onClick={copyToClipboard}
                className="gap-2"
              >
                {copied ? (
                  <>
                    <CheckSquare className="h-4 w-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy to Clipboard
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>

      <AuthPopup
        isOpen={showAuthPopup}
        onClose={() => setShowAuthPopup(false)}
        onSuccess={handleSuccessfulAuth}
      />
    </Card>
  )
}