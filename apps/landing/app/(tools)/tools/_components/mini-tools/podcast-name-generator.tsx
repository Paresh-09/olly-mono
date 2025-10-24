'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@repo/ui/components/ui/card'
import { Input } from '@repo/ui/components/ui/input'
import { Label } from '@repo/ui/components/ui/label'
import { Button } from '@repo/ui/components/ui/button'
import { Textarea } from '@repo/ui/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/ui/components/ui/tabs'
import { Badge } from '@repo/ui/components/ui/badge'
import { Separator } from '@repo/ui/components/ui/separator'
import { useToast } from '@repo/ui/hooks/use-toast'
import { Alert, AlertDescription } from "@repo/ui/components/ui/alert"
import AuthPopup from "../authentication"
import {
  Loader2, Heart, Save, RefreshCw, Bookmark,
  Sparkles, Star, Headphones, Radio, Mic,
  Copy, MicOff, Trash2, Music, RefreshCcw
} from 'lucide-react'

// Define types
type PodcastFormat = {
  value: string;
  label: string;
  description: string;
}

type GeneratedName = {
  name: string;
  description: string;
  targetAudience?: string;
}

type SavedName = {
  id: string;
  name: string;
  description: string;
  theme: string;
  format: string;
  date: string;
}

interface AuthCheckResponse {
  authenticated: boolean;
  user: {
    id: string;
    email: string;
    username: string;
  } | null;
}

interface UsageTracking {
  count: number;
  date: string;
}

export function PodcastNameGenerator() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState<string>('generator')
  const [theme, setTheme] = useState<string>('')
  const [topic, setTopic] = useState<string>('')
  const [targetAudience, setTargetAudience] = useState<string>('')
  const [format, setFormat] = useState<string>('interview')
  const [additionalInfo, setAdditionalInfo] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [generatedNames, setGeneratedNames] = useState<GeneratedName[]>([])
  const [savedNames, setSavedNames] = useState<SavedName[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [showAuthPopup, setShowAuthPopup] = useState<boolean>(false)
  const [dailyUsage, setDailyUsage] = useState<UsageTracking>({ count: 0, date: '' })

  const DAILY_FREE_LIMIT = 3

  // Define available podcast formats
  const podcastFormats: PodcastFormat[] = [
    {
      value: 'interview',
      label: 'Interview',
      description: 'Hosts interview different guests each episode'
    },
    {
      value: 'conversational',
      label: 'Conversational',
      description: 'Multiple hosts discuss topics in a casual, conversational manner'
    },
    {
      value: 'solo',
      label: 'Solo',
      description: 'Single host sharing knowledge, stories, or thoughts'
    },
    {
      value: 'documentary',
      label: 'Documentary',
      description: 'Narrative-driven storytelling with research and interviews'
    },
    {
      value: 'panel',
      label: 'Panel',
      description: 'Group discussion with multiple regular contributors'
    },
    {
      value: 'educational',
      label: 'Educational',
      description: 'Teaching-focused content aimed at learning'
    }
  ]

  // Load saved names from localStorage and check auth status on component mount
  useEffect(() => {
    const savedItems = localStorage.getItem('savedPodcastNames')
    if (savedItems) {
      setSavedNames(JSON.parse(savedItems))
    }

    checkAuthStatus()
    loadDailyUsage()
  }, [])

  // Check user authentication status
  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/user/auth')
      const data: AuthCheckResponse = await response.json()
      setIsAuthenticated(data.authenticated)
    } catch (error) {
      console.error('Error checking auth status:', error)
    }
  }

  // Load daily usage from localStorage
  const loadDailyUsage = () => {
    const today = new Date().toDateString()
    const savedUsage = localStorage.getItem('podcastNameGenerator_dailyUsage')

    if (savedUsage) {
      const usage: UsageTracking = JSON.parse(savedUsage)
      if (usage.date === today) {
        setDailyUsage(usage)
      } else {
        // Reset for new day
        const newUsage = { count: 0, date: today }
        setDailyUsage(newUsage)
        localStorage.setItem('podcastNameGenerator_dailyUsage', JSON.stringify(newUsage))
      }
    } else {
      const newUsage = { count: 0, date: today }
      setDailyUsage(newUsage)
      localStorage.setItem('podcastNameGenerator_dailyUsage', JSON.stringify(newUsage))
    }
  }

  // Increment daily usage counter
  const incrementDailyUsage = () => {
    const today = new Date().toDateString()
    const newUsage = {
      count: dailyUsage.count + 1,
      date: today
    }
    setDailyUsage(newUsage)
    localStorage.setItem('podcastNameGenerator_dailyUsage', JSON.stringify(newUsage))
  }

  // Check if user can generate (auth check or increment usage)
  const checkUsageLimit = (): boolean => {
    if (isAuthenticated) {
      // Authenticated users have unlimited access
      return true
    }

    if (dailyUsage.count >= DAILY_FREE_LIMIT) {
      setShowAuthPopup(true)
      toast({
        title: "Daily Limit Reached",
        description: `You've reached your daily limit of ${DAILY_FREE_LIMIT} free generations. Please sign in for unlimited access.`,
        variant: "destructive",
      })
      return false
    }

    return true
  }

  // Handle successful authentication
  const handleSuccessfulAuth = () => {
    setIsAuthenticated(true)
    setShowAuthPopup(false)
    // User is now authenticated, they can continue using the tool
  }

  // Get format label text
  const getFormatLabel = (): string => {
    const found = podcastFormats.find(opt => opt.value === format)
    return found ? found.label : "Interview"
  }

  // Get format description
  const getFormatDescription = (): string => {
    const found = podcastFormats.find(opt => opt.value === format)
    return found ? found.description : ""
  }

  // Generate podcast names
  const generateNames = async (): Promise<void> => {
    if (!theme && !topic) {
      toast({
        title: "Missing information",
        description: "Please enter at least a theme or topic to generate podcast names.",
        variant: "destructive"
      })
      return
    }

    // Check usage limits for free users
    if (!checkUsageLimit()) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Call API endpoint
      const response = await fetch('/api/tools/podcast-name-generator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          theme,
          topic,
          targetAudience,
          format,
          additionalInfo
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate podcast names');
      }

      setGeneratedNames(data.names);

      // Increment usage for free users
      if (!isAuthenticated) {
        incrementDailyUsage();
      }

      toast({
        title: "Names generated",
        description: "We've crafted some podcast name ideas for you to consider.",
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setError(errorMessage);
      toast({
        title: "Generation failed",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  // Copy text to clipboard
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: "Name copied to clipboard"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy text",
        variant: "destructive"
      });
    }
  };

  // Save a podcast name
  const saveName = (name: GeneratedName): void => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to save podcast names",
        variant: "destructive"
      });
      setShowAuthPopup(true);
      return;
    }

    const newId = Date.now().toString()
    const newSaved: SavedName = {
      id: newId,
      name: name.name,
      description: name.description,
      theme: theme || topic || "Untitled",
      format: format,
      date: new Date().toLocaleDateString()
    }

    const updatedSaved = [...savedNames, newSaved]
    setSavedNames(updatedSaved)
    localStorage.setItem('savedPodcastNames', JSON.stringify(updatedSaved))

    toast({
      title: "Name saved",
      description: "Podcast name has been saved to your collection.",
    })
  }

  // Delete a saved name
  const deleteSavedName = (id: string, e: React.MouseEvent): void => {
    e.stopPropagation() // Prevent triggering the parent click handler

    const updatedSaved = savedNames.filter(item => item.id !== id)
    setSavedNames(updatedSaved)
    localStorage.setItem('savedPodcastNames', JSON.stringify(updatedSaved))

    toast({
      title: "Name deleted",
      description: "The saved podcast name has been removed."
    })
  }

  // Reset form
  const resetForm = (): void => {
    setTheme('')
    setTopic('')
    setTargetAudience('')
    setFormat('interview')
    setAdditionalInfo('')
    setGeneratedNames([])
    setError(null)
  }

  // Regenerate names
  const regenerateNames = (): void => {
    generateNames();
  }

  return (
    <div className="container mx-auto max-w-6xl">
      {!isAuthenticated && (
        <Alert className="mb-4">
          <AlertDescription>
            You have {DAILY_FREE_LIMIT - dailyUsage.count} free generations remaining today. Sign in for unlimited access and to save your favorite names.
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="bg-muted rounded-lg p-1 mb-6">
          <TabsList className="grid w-full grid-cols-2 bg-transparent">
            <TabsTrigger value="generator" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md">
              <span className="flex items-center justify-center">
                <Mic className="h-4 w-4 mr-2" /> Generate Names
              </span>
            </TabsTrigger>
            <TabsTrigger value="saved" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md">
              <span className="flex items-center justify-center">
                <Bookmark className="h-4 w-4 mr-2" /> Saved Names ({savedNames.length})
              </span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Generator Tab */}
        <TabsContent value="generator" className="mt-0">
          <div className="grid gap-8 md:grid-cols-12">
            <Card className="col-span-12 md:col-span-5">
              <CardHeader>
                <CardTitle className="text-xl flex items-center">
                  <Headphones className="mr-2 h-5 w-5 text-primary" />
                  Podcast Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="theme" className="text-base">Theme/Niche</Label>
                    <Input
                      id="theme"
                      placeholder="e.g., True Crime, Personal Finance, Comedy"
                      value={theme}
                      onChange={(e) => setTheme(e.target.value)}
                      className="mt-1.5"
                    />
                  </div>

                  <div>
                    <Label htmlFor="topic" className="text-base">Specific Topic</Label>
                    <Input
                      id="topic"
                      placeholder="e.g., Startup Stories, Cryptocurrency, Home Renovation"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      className="mt-1.5"
                    />
                  </div>

                  <div>
                    <Label htmlFor="targetAudience" className="text-base">Target Audience</Label>
                    <Input
                      id="targetAudience"
                      placeholder="e.g., Entrepreneurs, Parents, College Students"
                      value={targetAudience}
                      onChange={(e) => setTargetAudience(e.target.value)}
                      className="mt-1.5"
                    />
                  </div>

                  <div>
                    <Label htmlFor="format" className="text-base">Podcast Format</Label>
                    <Select value={format} onValueChange={setFormat}>
                      <SelectTrigger className="mt-1.5">
                        <SelectValue placeholder="Select format" />
                      </SelectTrigger>
                      <SelectContent>
                        {podcastFormats.map(fmt => (
                          <SelectItem key={fmt.value} value={fmt.value}>
                            {fmt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-2">{getFormatDescription()}</p>
                  </div>

                  <div>
                    <Label htmlFor="additionalInfo" className="text-base">Additional Details (Optional)</Label>
                    <Textarea
                      id="additionalInfo"
                      placeholder="Any specific tone, style, or focus you want for your podcast"
                      value={additionalInfo}
                      onChange={(e) => setAdditionalInfo(e.target.value)}
                      rows={3}
                      className="mt-1.5"
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t pt-6">
                <Button variant="outline" onClick={resetForm} disabled={loading}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
                <Button
                  onClick={generateNames}
                  disabled={loading || (!isAuthenticated && dailyUsage.count >= DAILY_FREE_LIMIT)}
                  className="px-6"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Mic className="mr-2 h-4 w-4" />
                      Generate Names
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>

            <Card className="col-span-12 md:col-span-7">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl flex items-center">
                  <Radio className="mr-2 h-5 w-5 text-primary" />
                  Podcast Name Ideas
                </CardTitle>

                {generatedNames.length > 0 && !loading && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={regenerateNames}
                    disabled={loading || (!isAuthenticated && dailyUsage.count >= DAILY_FREE_LIMIT)}
                  >
                    <RefreshCcw className="h-4 w-4 mr-2" />
                    Regenerate
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex flex-col items-center justify-center h-[400px] gap-4">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <p className="text-muted-foreground">Creating unique podcast name ideas...</p>
                    <p className="text-xs text-muted-foreground">This may take a few seconds</p>
                  </div>
                ) : error ? (
                  <div className="text-destructive text-center h-[400px] flex flex-col items-center justify-center p-6">
                    <p className="font-medium mb-2">Error generating podcast names</p>
                    <p className="text-sm">{error}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4"
                      onClick={resetForm}
                    >
                      Try Again
                    </Button>
                  </div>
                ) : generatedNames.length > 0 ? (
                  <div className="space-y-4">
                    {generatedNames.map((item, index) => (
                      <div key={index} className="border rounded-lg p-4 hover:border-primary/50 transition-colors">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="text-lg font-medium">{item.name}</h3>
                            <p className="text-sm text-muted-foreground mt-2">{item.description}</p>
                            {item.targetAudience && (
                              <div className="mt-2">
                                <Badge variant="outline" className="text-xs">
                                  Audience: {item.targetAudience}
                                </Badge>
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => copyToClipboard(item.name)}
                            >
                              <Copy className="h-4 w-4" />
                              <span className="sr-only">Copy</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => saveName(item)}
                              disabled={!isAuthenticated}
                            >
                              <Bookmark className="h-4 w-4" />
                              <span className="sr-only">Save</span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-muted-foreground text-center h-[400px] flex items-center justify-center p-6">
                    <div>
                      <Music className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                      <p className="text-lg font-medium mb-2">No Podcast Names Generated Yet</p>
                      <p className="text-sm max-w-md mx-auto">Fill in your podcast details and click "Generate Names" to create potential podcast name ideas.</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Saved Names Tab */}
        <TabsContent value="saved" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center">
                <Bookmark className="mr-2 h-5 w-5 text-primary" />
                Saved Podcast Names
              </CardTitle>
            </CardHeader>

            <CardContent>
              {!isAuthenticated ? (
                <div className="text-center p-8">
                  <MicOff className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Authentication Required</h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    Please sign in to save and access your favorite podcast names.
                  </p>
                  <Button
                    className="mt-4"
                    onClick={() => setShowAuthPopup(true)}
                  >
                    Sign In
                  </Button>
                </div>
              ) : savedNames.length === 0 ? (
                <div className="text-center p-8">
                  <Bookmark className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Saved Podcast Names</h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    When you find a name you like, click the bookmark icon to save it for future reference.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => setActiveTab('generator')}
                  >
                    Generate Podcast Names
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {savedNames.map((item) => (
                    <div key={item.id} className="border rounded-lg p-4 hover:border-primary/50 transition-colors">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-medium">{item.name}</h3>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {item.format.charAt(0).toUpperCase() + item.format.slice(1)}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {item.theme}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">Saved on {item.date}</p>
                          <p className="text-sm mt-2">{item.description}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => copyToClipboard(item.name)}
                          >
                            <Copy className="h-4 w-4" />
                            <span className="sr-only">Copy</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={(e) => deleteSavedName(item.id, e)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AuthPopup
        isOpen={showAuthPopup}
        onClose={() => setShowAuthPopup(false)}
        onSuccess={handleSuccessfulAuth}
      />
    </div>
  )
}