'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@repo/ui/components/ui/card'
import { Input } from '@repo/ui/components/ui/input'
import { Label } from '@repo/ui/components/ui/label'
import { Button } from '@repo/ui/components/ui/button'
import { Textarea } from '@repo/ui/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/components/ui/select'
import { Slider } from '@repo/ui/components/ui/slider'
import { Switch } from '@repo/ui/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/ui/components/ui/tabs'
import { Badge } from '@repo/ui/components/ui/badge'
import { Separator } from '@repo/ui/components/ui/separator'
import { useToast } from '@repo/ui/hooks/use-toast'
import { Alert, AlertDescription } from "@repo/ui/components/ui/alert"
import AuthPopup from "../authentication"
import {
  Loader2, Copy, Download, Save, RefreshCw,
  Sparkles, Settings, FileText, MessageSquareText,
  List, ArrowUpRight, CloudLightning, BookOpen
} from 'lucide-react'

// Define types for our options
type ToneOption = {
  value: string;
  label: string;
}

type LengthOption = {
  value: string;
  label: string;
  wordCount: number;
}

type SavedIntroduction = {
  id: string;
  title: string;
  content: string;
  topic: string;
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

export function IntroductionWriter() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState<string>('write')
  const [topic, setTopic] = useState<string>('')
  const [keywords, setKeywords] = useState<string>('')
  const [tone, setTone] = useState<string>('professional')
  const [length, setLength] = useState<string>('medium')
  const [seoFocus, setSeoFocus] = useState<boolean>(false)
  const [customInstructions, setCustomInstructions] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [introduction, setIntroduction] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [savedIntroductions, setSavedIntroductions] = useState<SavedIntroduction[]>([])
  const [selectedSavedIntro, setSelectedSavedIntro] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [showAuthPopup, setShowAuthPopup] = useState<boolean>(false)
  const [dailyUsage, setDailyUsage] = useState<UsageTracking>({ count: 0, date: '' })

  const DAILY_FREE_LIMIT = 3

  // Define available tone options
  const toneOptions: ToneOption[] = [
    { value: 'professional', label: 'Professional' },
    { value: 'conversational', label: 'Conversational' },
    { value: 'persuasive', label: 'Persuasive' },
    { value: 'informative', label: 'Informative' },
    { value: 'enthusiastic', label: 'Enthusiastic' },
    { value: 'academic', label: 'Academic' }
  ]

  // Define available length options
  const lengthOptions: LengthOption[] = [
    { value: 'short', label: 'Short', wordCount: 75 },
    { value: 'medium', label: 'Medium', wordCount: 150 },
    { value: 'long', label: 'Long', wordCount: 250 }
  ]

  // Load saved introductions from localStorage and check auth status on component mount
  useEffect(() => {
    const savedItems = localStorage.getItem('savedIntroductions')
    if (savedItems) {
      setSavedIntroductions(JSON.parse(savedItems))
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
    const savedUsage = localStorage.getItem('introWriter_dailyUsage')

    if (savedUsage) {
      const usage: UsageTracking = JSON.parse(savedUsage)
      if (usage.date === today) {
        setDailyUsage(usage)
      } else {
        // Reset for new day
        const newUsage = { count: 0, date: today }
        setDailyUsage(newUsage)
        localStorage.setItem('introWriter_dailyUsage', JSON.stringify(newUsage))
      }
    } else {
      const newUsage = { count: 0, date: today }
      setDailyUsage(newUsage)
      localStorage.setItem('introWriter_dailyUsage', JSON.stringify(newUsage))
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
    localStorage.setItem('introWriter_dailyUsage', JSON.stringify(newUsage))
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

  // Get current word count target based on selected length
  const getWordCountTarget = (): number => {
    const found = lengthOptions.find(opt => opt.value === length)
    return found ? found.wordCount : 150
  }

  // Get tone label text
  const getToneLabel = (): string => {
    const found = toneOptions.find(opt => opt.value === tone)
    return found ? found.label : "Professional"
  }

  // Get length label text
  const getLengthLabel = (): string => {
    const found = lengthOptions.find(opt => opt.value === length)
    return found ? found.label : "Medium"
  }

  // Generate introduction
  const generateIntroduction = async (): Promise<void> => {
    if (!topic) {
      toast({
        title: "Missing information",
        description: "Please enter a topic to generate an introduction.",
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
      const response = await fetch('/api/tools/introduction-writer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic,
          keywords,
          tone,
          length,
          seoFocus,
          customInstructions
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate introduction');
      }

      setIntroduction(data.introduction);
      setActiveTab('preview');

      // Increment usage for free users
      if (!isAuthenticated) {
        incrementDailyUsage();
      }

      toast({
        title: "Introduction generated",
        description: "Your introduction has been created successfully.",
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

  // Copy to clipboard
  const copyToClipboard = (): void => {
    navigator.clipboard.writeText(introduction)
    toast({
      title: "Copied to clipboard",
      description: "Your introduction has been copied to the clipboard."
    })
  }

  // Download as text file
  const downloadIntroduction = (): void => {
    const element = document.createElement('a')
    const file = new Blob([introduction], { type: 'text/plain' })
    element.href = URL.createObjectURL(file)
    element.download = `${topic.replace(/\s+/g, '-').toLowerCase()}-introduction.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  // Save introduction to local storage
  const saveIntroduction = (): void => {
    if (!introduction || !topic) return;

    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to save introductions",
        variant: "destructive"
      });
      setShowAuthPopup(true);
      return;
    }

    const newId = Date.now().toString()
    const newSaved: SavedIntroduction = {
      id: newId,
      title: topic,
      content: introduction,
      topic: topic,
      date: new Date().toLocaleDateString()
    }

    const updatedSaved = [...savedIntroductions, newSaved]
    setSavedIntroductions(updatedSaved)
    localStorage.setItem('savedIntroductions', JSON.stringify(updatedSaved))

    toast({
      title: "Introduction saved",
      description: "Your introduction has been saved for future reference."
    })
  }

  // Load a saved introduction
  const loadSavedIntroduction = (id: string): void => {
    const savedIntro = savedIntroductions.find(item => item.id === id)
    if (savedIntro) {
      setIntroduction(savedIntro.content)
      setTopic(savedIntro.topic)
      setActiveTab('preview')
      setSelectedSavedIntro(id)
    }
  }

  // Delete a saved introduction
  const deleteSavedIntroduction = (id: string, e: React.MouseEvent): void => {
    e.stopPropagation() // Prevent triggering the parent click handler

    const updatedSaved = savedIntroductions.filter(item => item.id !== id)
    setSavedIntroductions(updatedSaved)
    localStorage.setItem('savedIntroductions', JSON.stringify(updatedSaved))

    // If the deleted introduction was selected, clear the selection
    if (selectedSavedIntro === id) {
      setSelectedSavedIntro(null)
    }

    toast({
      title: "Introduction deleted",
      description: "The saved introduction has been removed."
    })
  }

  // Reset form
  const resetForm = (): void => {
    setTopic('')
    setKeywords('')
    setTone('professional')
    setLength('medium')
    setSeoFocus(false)
    setCustomInstructions('')
    setIntroduction('')
    setError(null)
    setActiveTab('write')
    setSelectedSavedIntro(null)
  }

  return (
    <div className="container mx-auto max-w-6xl">
      {!isAuthenticated && (
        <Alert className="mb-4">
          <AlertDescription>
            You have {DAILY_FREE_LIMIT - dailyUsage.count} free generations remaining today. Sign in for unlimited access and to save your introductions.
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="bg-muted rounded-lg p-1 mb-6">
          <TabsList className="grid w-full grid-cols-3 bg-transparent">
            <TabsTrigger value="write" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md">
              <span className="flex items-center justify-center">
                <MessageSquareText className="h-4 w-4 mr-2" /> Settings
              </span>
            </TabsTrigger>
            <TabsTrigger value="preview" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md" disabled={!introduction && !loading}>
              <span className="flex items-center justify-center">
                <Sparkles className="h-4 w-4 mr-2" /> Generated Introduction
              </span>
            </TabsTrigger>
            <TabsTrigger value="saved" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md">
              <span className="flex items-center justify-center">
                <Save className="h-4 w-4 mr-2" /> Saved ({savedIntroductions.length})
              </span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Write Introduction Tab */}
        <TabsContent value="write" className="mt-0">
          <div className="grid gap-8 md:grid-cols-3">
            <Card className="col-span-3 md:col-span-2">
              <CardHeader>
                <CardTitle className="text-xl flex items-center">
                  <MessageSquareText className="mr-2 h-5 w-5 text-primary" />
                  Write Your Introduction
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="topic" className="text-base">Topic/Title <span className="text-destructive">*</span></Label>
                    <Input
                      id="topic"
                      placeholder="e.g., Benefits of Remote Work, Introduction to Machine Learning"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      className="mt-1.5"
                    />
                  </div>

                  <div>
                    <Label htmlFor="keywords" className="text-base">Keywords (separated by commas)</Label>
                    <Input
                      id="keywords"
                      placeholder="e.g., productivity, work-life balance, flexibility"
                      value={keywords}
                      onChange={(e) => setKeywords(e.target.value)}
                      className="mt-1.5"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Include keywords you want to target in your introduction</p>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <Label htmlFor="tone" className="text-base">Tone</Label>
                      <Select value={tone} onValueChange={setTone}>
                        <SelectTrigger className="mt-1.5">
                          <SelectValue placeholder="Select tone" />
                        </SelectTrigger>
                        <SelectContent>
                          {toneOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="length" className="text-base">Length</Label>
                      <Select value={length} onValueChange={setLength}>
                        <SelectTrigger className="mt-1.5">
                          <SelectValue placeholder="Select length" />
                        </SelectTrigger>
                        <SelectContent>
                          {lengthOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label} (~{option.wordCount} words)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="seo-focus"
                      checked={seoFocus}
                      onCheckedChange={setSeoFocus}
                    />
                    <Label htmlFor="seo-focus" className="text-base">
                      Optimize for SEO
                    </Label>
                    <Badge variant="outline" className="ml-2">Recommended</Badge>
                  </div>

                  <div>
                    <Label htmlFor="customInstructions" className="text-base">Additional Instructions (Optional)</Label>
                    <Textarea
                      id="customInstructions"
                      placeholder="Any specific points you want to include, style preferences, or target audience details"
                      value={customInstructions}
                      onChange={(e) => setCustomInstructions(e.target.value)}
                      rows={3}
                      className="mt-1.5"
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t pt-6">
                <Button variant="outline" onClick={resetForm} disabled={loading}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reset Form
                </Button>
                <Button
                  onClick={generateIntroduction}
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
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate Introduction
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>

            <Card className="col-span-3 md:col-span-1 h-fit">
              <CardHeader>
                <CardTitle className="text-lg">Settings Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Topic</h4>
                    <p className="font-medium">{topic || "Not specified"}</p>
                  </div>
                  <Separator />
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Keywords</h4>
                    <p>{keywords || "None specified"}</p>
                  </div>
                  <Separator />
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Tone</h4>
                    <p>{getToneLabel()}</p>
                  </div>
                  <Separator />
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Length</h4>
                    <p>{getLengthLabel()} (~{getWordCountTarget()} words)</p>
                  </div>
                  <Separator />
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">SEO Focus</h4>
                    <p>{seoFocus ? "Enabled" : "Disabled"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Preview Tab */}
        <TabsContent value="preview" className="mt-0">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl flex items-center">
                <FileText className="mr-2 h-5 w-5 text-primary" />
                Generated Introduction
              </CardTitle>

              {introduction && (
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={copyToClipboard}>
                    <Copy className="h-4 w-4 mr-1" /> Copy
                  </Button>
                  <Button variant="outline" size="sm" onClick={downloadIntroduction}>
                    <Download className="h-4 w-4 mr-1" /> Download
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={saveIntroduction}
                    disabled={!isAuthenticated}
                  >
                    <Save className="h-4 w-4 mr-1" /> Save
                  </Button>
                </div>
              )}
            </CardHeader>

            <CardContent>
              <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
                {loading ? (
                  <div className="flex flex-col items-center justify-center h-[300px] gap-4">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <p className="text-muted-foreground">Generating your introduction...</p>
                    <p className="text-xs text-muted-foreground">This may take a few seconds</p>
                  </div>
                ) : error ? (
                  <div className="text-destructive text-center h-[300px] flex flex-col items-center justify-center p-6">
                    <p className="font-medium mb-2">Error generating introduction</p>
                    <p className="text-sm">{error}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4"
                      onClick={() => setActiveTab('write')}
                    >
                      Return to Editor
                    </Button>
                  </div>
                ) : introduction ? (
                  <div className="p-6 prose prose-sm max-w-none">
                    <p>{introduction}</p>
                  </div>
                ) : (
                  <div className="text-muted-foreground text-center h-[300px] flex items-center justify-center p-6">
                    <div>
                      <MessageSquareText className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                      <p className="text-lg font-medium mb-2">No Introduction Generated Yet</p>
                      <p className="text-sm max-w-md mx-auto">Fill in the topic and other parameters, then click "Generate Introduction" to create your content.</p>
                    </div>
                  </div>
                )}
              </div>

              {introduction && (
                <div className="mt-6 border-t pt-4">
                  <div className="flex flex-wrap items-center gap-2 justify-between">
                    <div>
                      <h4 className="font-medium">Introduction Summary</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {topic ? topic : "Untitled Introduction"} • {getToneLabel()} • {getLengthLabel()}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => setActiveTab('write')}>
                        <RefreshCw className="h-4 w-4 mr-1" /> Edit & Regenerate
                      </Button>
                      <Button
                        size="sm"
                        onClick={saveIntroduction}
                        disabled={!isAuthenticated}
                      >
                        <Save className="h-4 w-4 mr-1" /> Save Introduction
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Saved Introductions Tab */}
        <TabsContent value="saved" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center">
                <Save className="mr-2 h-5 w-5 text-primary" />
                Saved Introductions
              </CardTitle>
            </CardHeader>

            <CardContent>
              {!isAuthenticated ? (
                <div className="text-center p-8">
                  <BookOpen className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Authentication Required</h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    Please sign in to save and access your introductions.
                  </p>
                  <Button
                    className="mt-4"
                    onClick={() => setShowAuthPopup(true)}
                  >
                    Sign In
                  </Button>
                </div>
              ) : savedIntroductions.length === 0 ? (
                <div className="text-center p-8">
                  <BookOpen className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Saved Introductions</h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    After generating an introduction, click the "Save" button to store it for future reference.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => setActiveTab('write')}
                  >
                    Write an Introduction
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {savedIntroductions.map((item) => (
                    <div
                      key={item.id}
                      className={`border rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors ${selectedSavedIntro === item.id ? 'border-primary' : ''}`}
                      onClick={() => loadSavedIntroduction(item.id)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{item.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">Saved on {item.date}</p>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => deleteSavedIntroduction(item.id, e)}
                          >
                            Delete
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => loadSavedIntroduction(item.id)}
                          >
                            Load
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm mt-2 line-clamp-2">{item.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}