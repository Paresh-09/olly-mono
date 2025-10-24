"use client";

import { useState } from 'react'
import { Card, CardContent } from '@repo/ui/components/ui/card'
import { Button } from '@repo/ui/components/ui/button'
import { Textarea } from '@repo/ui/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/ui/components/ui/tabs'
import { toast } from '@repo/ui/hooks/use-toast'
import { Alert, AlertDescription } from "@repo/ui/components/ui/alert"
import AuthPopup from "../authentication"
import { useAuthLimit } from '@/hooks/use-auth-check';
import { MessageSquare } from 'lucide-react'

// Move maps and configs outside component for better performance
const SUPERSCRIPT_MAP: { [key: string]: string } = {
  'a': 'ᵃ', 'b': 'ᵇ', 'c': 'ᶜ', 'd': 'ᵈ', 'e': 'ᵉ', 'f': 'ᶠ', 'g': 'ᵍ',
  'h': 'ʰ', 'i': 'ⁱ', 'j': 'ʲ', 'k': 'ᵏ', 'l': 'ˡ', 'm': 'ᵐ', 'n': 'ⁿ',
  'o': 'ᵒ', 'p': 'ᵖ', 'q': 'ᵠ', 'r': 'ʳ', 's': 'ˢ', 't': 'ᵗ', 'u': 'ᵘ',
  'v': 'ᵛ', 'w': 'ʷ', 'x': 'ˣ', 'y': 'ʸ', 'z': 'ᶻ',
  '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
  '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹'
};

const TAB_OPTIONS = {
  word: {
    label: "Single Word",
    description: "Convert single words to small text using superscript characters"
  },
  sentence: {
    label: "Full Sentence",
    description: "Convert entire sentences to small text using Discord's sup format"
  }
} as const;

export const DiscordTextGenerator = () => {
  const [input, setInput] = useState('')
  const [activeTab, setActiveTab] = useState<keyof typeof TAB_OPTIONS>('word')

  const {
    isAuthenticated,
    showAuthPopup,
    setShowAuthPopup,
    checkUsageLimit,
    incrementUsage,
    handleSuccessfulAuth,
    remainingUses
  } = useAuthLimit({
    toolId: 'discord-text-generator',
    dailyLimit: 2
  });

  const convertToSmall = (text: string): string => {
    if (activeTab === 'word') {
      return text.toLowerCase().split('').map(char =>
        SUPERSCRIPT_MAP[char] || char
      ).join('')
    } else {
      return '`sup ' + text + '`'
    }
  }

  const getPreview = (): string => {
    if (!input) return ''
    return convertToSmall(input)
  }

  const getDiscordFormat = (): string => {
    if (!input) return ''
    return activeTab === 'word' ?
      `^${input}^` :
      '`sup ' + input + '`'
  }

  const copyToClipboard = async (text: string, type: 'preview' | 'format') => {
    if (!checkUsageLimit()) {
      return;
    }

    try {
      await navigator.clipboard.writeText(text)

      if (!isAuthenticated) {
        incrementUsage();
      }

      toast({
        title: "Copied to clipboard",
        description: `${type === 'preview' ? 'Preview' : 'Discord format'} has been copied. You can now paste this in Discord.`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive"
      });
    }
  }

  return (
    <div className="min-h-fit bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 p-4 pt-10 pb-20">
      <div className="w-full max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-[#5865F2] rounded-xl flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">Discord Small Text Generator</h1>
          </div>
          <p className="text-gray-600">Convert your text to Discord's small/superscript style</p>
        </div>

        <Card className="shadow-lg bg-white border-gray-200">
          <CardContent className="p-6">
            {!isAuthenticated && (
              <Alert className="mb-6 bg-blue-50 border-blue-200">
                <AlertDescription className="text-blue-800">
                  You have {remainingUses} free conversions remaining today. Sign in for unlimited access.
                </AlertDescription>
              </Alert>
            )}

            <Tabs defaultValue="word" onValueChange={(value) => setActiveTab(value as keyof typeof TAB_OPTIONS)} className="mb-6">
              <div className="mb-4">
                <TabsList className="bg-gray-100 border-gray-200">
                  {Object.entries(TAB_OPTIONS).map(([value, { label }]) => (
                    <TabsTrigger key={value} value={value} className="text-gray-700 data-[state=active]:bg-[#5865F2] data-[state=active]:text-white">
                      {label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>
              {Object.entries(TAB_OPTIONS).map(([value, { description }]) => (
                <TabsContent key={value} value={value}>
                  <p className="text-sm text-gray-600 mb-4">
                    {description}
                  </p>
                </TabsContent>
              ))}
            </Tabs>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter your text:
                </label>
                <Textarea
                  placeholder="Type or paste your text here..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preview:
                </label>
                <div className="p-4 bg-gray-50 rounded-md min-h-[60px] break-words border border-gray-200">
                  {getPreview() || 'Preview will appear here'}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Discord Format:
                </label>
                <div className="p-4 bg-gray-50 rounded-md min-h-[60px] font-mono text-sm break-words text-gray-800 border border-gray-200">
                  {getDiscordFormat() || 'Discord format will appear here'}
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  onClick={() => copyToClipboard(getPreview(), 'preview')}
                  className="flex-1 bg-[#5865F2] hover:bg-[#4752C4] text-white"
                  disabled={!input.trim() || (!isAuthenticated && remainingUses <= 0)}
                >
                  Copy Preview
                </Button>
                <Button
                  onClick={() => copyToClipboard(getDiscordFormat(), 'format')}
                  className="flex-1 bg-[#5865F2] hover:bg-[#4752C4] text-white"
                  disabled={!input.trim() || (!isAuthenticated && remainingUses <= 0)}
                >
                  Copy Discord Format
                </Button>
              </div>
            </div>

            <AuthPopup
              isOpen={showAuthPopup}
              onClose={() => setShowAuthPopup(false)}
              onSuccess={handleSuccessfulAuth}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}