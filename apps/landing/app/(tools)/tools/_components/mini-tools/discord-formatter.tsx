"use client"

import { useState } from 'react'
import { Card, CardContent } from '@repo/ui/components/ui/card'
import { Button } from '@repo/ui/components/ui/button'
import { Textarea } from '@repo/ui/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/ui/components/ui/tabs'
import { toast } from '@repo/ui/hooks/use-toast'
import DiscordPreview from './discord-preview'
import { Alert, AlertDescription } from '@repo/ui/components/ui/alert'
import AuthPopup from '../authentication'
import { useAuthLimit } from '@/hooks/use-auth-check'
import { MessageSquare } from 'lucide-react'

interface FormatOption {
  id: string
  name: string
  prefix: string
  suffix: string
  description: string
  example: string
}

const formatOptions: FormatOption[] = [
  {
    id: 'bold',
    name: 'Bold',
    prefix: '**',
    suffix: '**',
    description: 'Make your text stand out with bold formatting',
    example: '**bold text**'
  },
  {
    id: 'italic',
    name: 'Italic',
    prefix: '*',
    suffix: '*',
    description: 'Add emphasis with italic text',
    example: '*italic text*'
  },
  {
    id: 'underline',
    name: 'Underline',
    prefix: '__',
    suffix: '__',
    description: 'Underline important information',
    example: '__underlined text__'
  },
  {
    id: 'strikethrough',
    name: 'Strikethrough',
    prefix: '~~',
    suffix: '~~',
    description: 'Cross out text with strikethrough',
    example: '~~strikethrough text~~'
  },
  {
    id: 'spoiler',
    name: 'Spoiler',
    prefix: '||',
    suffix: '||',
    description: 'Hide text behind a spoiler tag',
    example: '||spoiler text||'
  },
  {
    id: 'code',
    name: 'Code Block',
    prefix: '```\n',
    suffix: '\n```',
    description: 'Format text as code with syntax highlighting',
    example: '```code block```'
  },
  {
    id: 'quote',
    name: 'Quote',
    prefix: '> ',
    suffix: '',
    description: 'Quote text or create citations',
    example: '> quoted text'
  },
  {
    id: 'small',
    name: 'Small Text',
    prefix: '`sup ',
    suffix: '`',
    description: 'Make text appear smaller',
    example: '`sup small text`'
  }
]

export const DiscordFormatter = () => {
  const [input, setInput] = useState('')
  const [selectedFormat, setSelectedFormat] = useState<string>('bold')

  const {
    isAuthenticated,
    showAuthPopup,
    setShowAuthPopup,
    checkUsageLimit,
    incrementUsage,
    handleSuccessfulAuth,
    remainingUses
  } = useAuthLimit({
    toolId: 'discord-formatter',
    dailyLimit: 2 // Set the daily limit for free users
  });

  const applyFormatting = (text: string, format: FormatOption): string => {
    if (format.id === 'small') {
      return format.prefix + text + format.suffix
    }
    return format.prefix + text + format.suffix
  }

  const getCurrentFormat = (): FormatOption => {
    return formatOptions.find(f => f.id === selectedFormat) || formatOptions[0]
  }

  const copyToClipboard = async (text: string) => {
    if (!checkUsageLimit()) {
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied to clipboard",
        description: "You can now paste this in Discord"
      });

      if (!isAuthenticated) {
        incrementUsage();
      }
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
      <div className="w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-[#5865F2] rounded-xl flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">Discord Text Formatter</h1>
          </div>
          <p className="text-gray-600">Style your Discord messages with all available formatting options</p>
        </div>

        <div className="grid xl:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {/* Left Panel - Controls */}
          <Card className="shadow-lg bg-white border-gray-200">
            <CardContent className="p-6">
              {!isAuthenticated && (
                <Alert className="mb-6 bg-blue-50 border-blue-200">
                  <AlertDescription className="text-blue-800">
                    You have {remainingUses} free formats remaining today. Sign in for unlimited access.
                  </AlertDescription>
                </Alert>
              )}

              <Tabs defaultValue="bold" onValueChange={setSelectedFormat} className="mb-6">
                <div className="mb-4 overflow-x-auto">
                  <TabsList className="inline-flex w-max min-w-full bg-gray-100 border-gray-200">
                    {formatOptions.map(format => (
                      <TabsTrigger
                        key={format.id}
                        value={format.id}
                        className="whitespace-nowrap text-gray-700 data-[state=active]:bg-[#5865F2] data-[state=active]:text-white"
                      >
                        {format.name}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>

                {formatOptions.map(format => (
                  <TabsContent key={format.id} value={format.id}>
                    <p className="text-sm text-gray-600 mb-4">
                      {format.description}
                    </p>
                  </TabsContent>
                ))}
              </Tabs>

              {/* Text Input */}
              <div className="mb-6">
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

              {/* Copy Button */}
              <Button
                onClick={() => copyToClipboard(applyFormatting(input, getCurrentFormat()))}
                className="w-full bg-[#5865F2] hover:bg-[#4752C4] text-white"
              >
                Copy to Clipboard
              </Button>
            </CardContent>
          </Card>

          {/* Right Panel - Preview */}
          <div className="w-full xl:w-full relative mt-4 xl:mt-0">
            <Card className="shadow-lg bg-white border-gray-200">
              <CardContent className="p-6">
                <div className="space-y-6">
                  {/* Discord Preview */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Discord Preview:
                    </label>
                    <div className="p-4 bg-gray-50 rounded-md min-h-[80px] break-words border border-gray-200">
                      <DiscordPreview text={applyFormatting(input, getCurrentFormat())} />
                    </div>
                  </div>

                  {/* Discord Format */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Discord Format:
                    </label>
                    <div className="p-4 bg-gray-50 rounded-md min-h-[80px] font-mono text-sm break-words text-gray-800 border border-gray-200">
                      {applyFormatting(input, getCurrentFormat())}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <AuthPopup
        isOpen={showAuthPopup}
        onClose={() => setShowAuthPopup(false)}
        onSuccess={handleSuccessfulAuth}
      />
    </div>
  )
}