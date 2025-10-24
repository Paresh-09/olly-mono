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

const JOKE_STYLES = [
  'Observational',
  'Wordplay',
  'Dad Joke',
  'Pun',
  'One-liner',
  'Meme-style',
  'Trendy',
] as const

const PLATFORMS = [
  'Instagram',
  'Twitter',
  'TikTok',
  'Facebook',
  'LinkedIn',
] as const

const AUDIENCES = [
  'General',
  'Gen Z',
  'Millennials',
  'Professionals',
  'Tech-savvy',
  'Creative',
] as const

interface JokeResult {
  joke: string;
  creditsRemaining: number;
}

export const JokeGenerator = () => {
  const [style, setStyle] = useState<typeof JOKE_STYLES[number]>(JOKE_STYLES[0])
  const [platform, setPlatform] = useState<typeof PLATFORMS[number]>(PLATFORMS[0])
  const [audience, setAudience] = useState<typeof AUDIENCES[number]>(AUDIENCES[0])
  const [requirements, setRequirements] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<JokeResult | null>(null)
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
    toolId: 'joke-generator',
    dailyLimit: 1 // One free generation per day
  });

  const generateJoke = async () => {
    if (!checkUsageLimit()) {
      return;
    }

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('toolType', 'joke-generator')
      formData.append('content', JSON.stringify({})) // Add this line
      formData.append('style', style)
      formData.append('platform', platform)
      formData.append('audience', audience)
      formData.append('requirements', requirements)
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
        description: "Failed to generate joke. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }
  const copyToClipboard = async () => {
    try {
      if (result?.joke) {
        await navigator.clipboard.writeText(result.joke);
        setCopied(true);
        toast({
          title: "Copied!",
          description: "Joke copied to clipboard"
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Style</label>
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value as typeof JOKE_STYLES[number])}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {JOKE_STYLES.map(styleOption => (
                <option key={styleOption} value={styleOption}>{styleOption}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Platform</label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value as typeof PLATFORMS[number])}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {PLATFORMS.map(platformOption => (
                <option key={platformOption} value={platformOption}>{platformOption}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Target Audience</label>
            <select
              value={audience}
              onChange={(e) => setAudience(e.target.value as typeof AUDIENCES[number])}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {AUDIENCES.map(audienceOption => (
                <option key={audienceOption} value={audienceOption}>{audienceOption}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Additional Requirements (Optional)
          </label>
          <Textarea
            placeholder="E.g., Must be about technology, Should reference current trends..."
            value={requirements}
            onChange={(e) => setRequirements(e.target.value)}
            className="h-24"
          />
        </div>

        <Button
          onClick={generateJoke}
          className="w-full"
          disabled={loading || (!isAuthenticated && remainingUses <= 0)}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : 'Generate Joke'}
        </Button>

        {result && (
          <div className="mt-6 space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium mb-2">Generated Joke:</h3>
              <p className="whitespace-pre-wrap text-gray-600">{result.joke}</p>
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