'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@repo/ui/components/ui/card'
import { Input } from '@repo/ui/components/ui/input'
import { Label } from '@repo/ui/components/ui/label'
import { Button } from '@repo/ui/components/ui/button'
import { Textarea } from '@repo/ui/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/components/ui/select'
import { RadioGroup, RadioGroupItem } from "@repo/ui/components/ui/radio-group"
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/ui/components/ui/tabs'
import { Badge } from '@repo/ui/components/ui/badge'
import { Separator } from '@repo/ui/components/ui/separator'
import { Switch } from '@repo/ui/components/ui/switch'
import { useToast } from '@repo/ui/hooks/use-toast'
import { Alert, AlertDescription } from "@repo/ui/components/ui/alert"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@repo/ui/components/ui/accordion"
import AuthPopup from "../authentication"
import {
  Loader2, Copy, Save, RefreshCw, Bookmark,
  Sparkles, FileText, Text, Wand2,
  Trash2, Flag, PlusCircle, Star,
  FolderOpen, ArrowRight, Lightbulb
} from 'lucide-react'

// Define types
type AcronymType = {
  value: string;
  label: string;
}

type AcronymStyle = {
  value: string;
  label: string;
}

type AcronymSuggestion = {
  acronym: string;
  meaning: string;
  tagline?: string;
}

type SavedAcronym = {
  id: string;
  phrase: string;
  acronym: string;
  meaning: string;
  tagline?: string;
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

export function AcronymGenerator() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState<string>('generator')
  const [phrase, setPhrase] = useState<string>('')
  const [acronymType, setAcronymType] = useState<string>('creative')
  const [acronymStyle, setAcronymStyle] = useState<string>('normal')
  const [includeTagline, setIncludeTagline] = useState<boolean>(false)
  const [preferredLetters, setPreferredLetters] = useState<string>('')
  const [targetAudience, setTargetAudience] = useState<string>('')
  const [additionalContext, setAdditionalContext] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [generatedAcronyms, setGeneratedAcronyms] = useState<AcronymSuggestion[]>([])
  const [savedAcronyms, setSavedAcronyms] = useState<SavedAcronym[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [showAuthPopup, setShowAuthPopup] = useState<boolean>(false)
  const [dailyUsage, setDailyUsage] = useState<UsageTracking>({ count: 0, date: '' })

  const DAILY_FREE_LIMIT = 3

  // Define available acronym types
  const acronymTypes: AcronymType[] = [
    { value: 'creative', label: 'Creative & Memorable' },
    { value: 'professional', label: 'Professional & Formal' },
    { value: 'simple', label: 'Simple & Clear' },
    { value: 'technical', label: 'Technical & Industry-specific' },
    { value: 'fun', label: 'Fun & Playful' }
  ]

  // Define available style options
  const acronymStyles: AcronymStyle[] = [
    { value: 'normal', label: 'Normal (Mixed Case)' },
    { value: 'uppercase', label: 'All Uppercase' },
    { value: 'lowercase', label: 'All Lowercase' },
    { value: 'titlecase', label: 'Title Case' }
  ]

  // Load saved acronyms from localStorage and check auth status on component mount
  useEffect(() => {
    const savedItems = localStorage.getItem('savedAcronyms')
    if (savedItems) {
      setSavedAcronyms(JSON.parse(savedItems))
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
    const savedUsage = localStorage.getItem('acronymGenerator_dailyUsage')

    if (savedUsage) {
      const usage: UsageTracking = JSON.parse(savedUsage)
      if (usage.date === today) {
        setDailyUsage(usage)
      } else {
        // Reset for new day
        const newUsage = { count: 0, date: today }
        setDailyUsage(newUsage)
        localStorage.setItem('acronymGenerator_dailyUsage', JSON.stringify(newUsage))
      }
    } else {
      const newUsage = { count: 0, date: today }
      setDailyUsage(newUsage)
      localStorage.setItem('acronymGenerator_dailyUsage', JSON.stringify(newUsage))
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
    localStorage.setItem('acronymGenerator_dailyUsage', JSON.stringify(newUsage))
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

  // Get acronym type label
  const getAcronymTypeLabel = (): string => {
    const found = acronymTypes.find(opt => opt.value === acronymType)
    return found ? found.label : "Creative & Memorable"
  }

  // Get style label
  const getAcronymStyleLabel = (): string => {
    const found = acronymStyles.find(opt => opt.value === acronymStyle)
    return found ? found.label : "Normal (Mixed Case)"
  }

  // Format acronym based on selected style
  const formatAcronym = (acronym: string): string => {
    switch (acronymStyle) {
      case 'uppercase':
        return acronym.toUpperCase();
      case 'lowercase':
        return acronym.toLowerCase();
      case 'titlecase':
        return acronym
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ');
      default:
        return acronym; // normal
    }
  }

  // Generate acronyms
  const generateAcronyms = async (): Promise<void> => {
    if (!phrase) {
      toast({
        title: "Missing information",
        description: "Please enter a phrase to generate acronyms.",
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
      const response = await fetch('/api/tools/acronym-generator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phrase,
          acronymType,
          acronymStyle,
          includeTagline,
          preferredLetters,
          targetAudience,
          additionalContext
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate acronyms');
      }

      // Format acronyms based on selected style
      const formattedAcronyms = data.acronyms.map((item: AcronymSuggestion) => ({
        ...item,
        acronym: formatAcronym(item.acronym)
      }));

      setGeneratedAcronyms(formattedAcronyms);

      // Increment usage for free users
      if (!isAuthenticated) {
        incrementDailyUsage();
      }

      toast({
        title: "Acronyms generated",
        description: `Successfully generated ${data.acronyms.length} acronym suggestions.`,
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

  // Copy acronym to clipboard
  const copyAcronym = (acronym: string, meaning?: string, tagline?: string): void => {
    let textToCopy = acronym;

    if (meaning) {
      textToCopy += `: ${meaning}`;
    }

    if (tagline) {
      textToCopy += `\n${tagline}`;
    }

    navigator.clipboard.writeText(textToCopy)
    toast({
      title: "Copied to clipboard",
      description: "Acronym has been copied to clipboard."
    })
  }

  // Save acronym to collection
  const saveAcronym = (acronym: AcronymSuggestion): void => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to save acronyms",
        variant: "destructive"
      });
      setShowAuthPopup(true);
      return;
    }

    const newId = Date.now().toString()
    const newSaved: SavedAcronym = {
      id: newId,
      phrase: phrase,
      acronym: acronym.acronym,
      meaning: acronym.meaning,
      tagline: acronym.tagline,
      date: new Date().toLocaleDateString()
    }

    const updatedSaved = [...savedAcronyms, newSaved]
    setSavedAcronyms(updatedSaved)
    localStorage.setItem('savedAcronyms', JSON.stringify(updatedSaved))

    toast({
      title: "Acronym saved",
      description: "Your acronym has been saved to your collection.",
    })
  }

  // Delete a saved acronym
  const deleteAcronym = (id: string, e: React.MouseEvent): void => {
    e.stopPropagation() // Prevent triggering the parent click handler

    const updatedSaved = savedAcronyms.filter(item => item.id !== id)
    setSavedAcronyms(updatedSaved)
    localStorage.setItem('savedAcronyms', JSON.stringify(updatedSaved))

    toast({
      title: "Acronym deleted",
      description: "The saved acronym has been removed."
    })
  }

  // Reset form
  const resetForm = (): void => {
    setPhrase('')
    setAcronymType('creative')
    setAcronymStyle('normal')
    setIncludeTagline(false)
    setPreferredLetters('')
    setTargetAudience('')
    setAdditionalContext('')
    setGeneratedAcronyms([])
    setError(null)
  }

  // Load a saved acronym
  const loadSavedAcronym = (acronym: SavedAcronym): void => {
    setPhrase(acronym.phrase)
    copyAcronym(acronym.acronym, acronym.meaning, acronym.tagline)

    toast({
      title: "Acronym loaded & copied",
      description: "The selected acronym has been loaded and copied to clipboard."
    })
  }

  return (
    <div className="container mx-auto max-w-6xl">
      {!isAuthenticated && (
        <Alert className="mb-4">
          <AlertDescription>
            You have {DAILY_FREE_LIMIT - dailyUsage.count} free generations remaining today. Sign in for unlimited access and to save your acronyms.
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="bg-muted rounded-lg p-1 mb-6">
          <TabsList className="grid w-full grid-cols-2 bg-transparent">
            <TabsTrigger value="generator" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md">
              <span className="flex items-center justify-center">
                <Text className="h-4 w-4 mr-2" /> Generate Acronyms
              </span>
            </TabsTrigger>
            <TabsTrigger value="saved" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md">
              <span className="flex items-center justify-center">
                <Bookmark className="h-4 w-4 mr-2" /> Saved Acronyms ({savedAcronyms.length})
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
                  <Text className="mr-2 h-5 w-5 text-primary" />
                  Acronym Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="phrase" className="text-base">Phrase or Title <span className="text-destructive">*</span></Label>
                    <Input
                      id="phrase"
                      placeholder="e.g., Growth Marketing Accelerator"
                      value={phrase}
                      onChange={(e) => setPhrase(e.target.value)}
                      className="mt-1.5"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Enter the full phrase you want to create an acronym for</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="acronymType" className="text-base">Acronym Type</Label>
                      <Select value={acronymType} onValueChange={setAcronymType}>
                        <SelectTrigger className="mt-1.5">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          {acronymTypes.map(type => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="acronymStyle" className="text-base">Text Style</Label>
                      <Select value={acronymStyle} onValueChange={setAcronymStyle}>
                        <SelectTrigger className="mt-1.5">
                          <SelectValue placeholder="Select style" />
                        </SelectTrigger>
                        <SelectContent>
                          {acronymStyles.map(style => (
                            <SelectItem key={style.value} value={style.value}>
                              {style.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="includeTagline"
                      checked={includeTagline}
                      onCheckedChange={setIncludeTagline}
                    />
                    <Label htmlFor="includeTagline" className="text-base">
                      Include catchy tagline
                    </Label>
                  </div>

                  <div>
                    <Label htmlFor="preferredLetters" className="text-base">
                      Preferred Letters (Optional)
                    </Label>
                    <Input
                      id="preferredLetters"
                      placeholder="e.g., A,C,E"
                      value={preferredLetters}
                      onChange={(e) => setPreferredLetters(e.target.value)}
                      className="mt-1.5"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Comma-separated letters to prioritize (if possible)</p>
                  </div>

                  <div>
                    <Label htmlFor="targetAudience" className="text-base">
                      Target Audience (Optional)
                    </Label>
                    <Input
                      id="targetAudience"
                      placeholder="e.g., Marketing Professionals, Tech Startups"
                      value={targetAudience}
                      onChange={(e) => setTargetAudience(e.target.value)}
                      className="mt-1.5"
                    />
                  </div>

                  <div>
                    <Label htmlFor="additionalContext" className="text-base">
                      Additional Context (Optional)
                    </Label>
                    <Textarea
                      id="additionalContext"
                      placeholder="Any other information that might help generate better acronyms"
                      value={additionalContext}
                      onChange={(e) => setAdditionalContext(e.target.value)}
                      rows={2}
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
                  onClick={generateAcronyms}
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
                      <Wand2 className="mr-2 h-4 w-4" />
                      Generate Acronyms
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>

            <Card className="col-span-12 md:col-span-7">
              <CardHeader>
                <CardTitle className="text-xl flex items-center">
                  <Sparkles className="mr-2 h-5 w-5 text-primary" />
                  Generated Acronyms
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex flex-col items-center justify-center h-[400px] gap-4">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <p className="text-muted-foreground">Creating creative acronyms...</p>
                    <p className="text-xs text-muted-foreground">This may take a few seconds</p>
                  </div>
                ) : error ? (
                  <div className="text-destructive text-center h-[400px] flex flex-col items-center justify-center p-6">
                    <p className="font-medium mb-2">Error generating acronyms</p>
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
                ) : generatedAcronyms.length > 0 ? (
                  <div className="space-y-4">
                    {generatedAcronyms.map((acronym, index) => (
                      <div
                        key={index}
                        className="border rounded-lg p-4 hover:border-primary/50 transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="text-xl font-bold tracking-wider">
                                {acronym.acronym}
                              </h3>
                              <Badge variant="outline" className="ml-2">
                                {getAcronymTypeLabel()}
                              </Badge>
                            </div>
                            <p className="text-base mt-2">
                              <span className="font-medium">Meaning:</span> {acronym.meaning}
                            </p>
                            {acronym.tagline && (
                              <div className="mt-2 text-sm italic text-muted-foreground">
                                "{acronym.tagline}"
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => copyAcronym(acronym.acronym, acronym.meaning, acronym.tagline)}
                            >
                              <Copy className="h-4 w-4" />
                              <span className="sr-only">Copy</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => saveAcronym(acronym)}
                              disabled={!isAuthenticated}
                            >
                              <Save className="h-4 w-4" />
                              <span className="sr-only">Save</span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}

                    <div className="flex justify-center mt-6">
                      <Button
                        variant="outline"
                        onClick={generateAcronyms}
                        disabled={loading || (!isAuthenticated && dailyUsage.count >= DAILY_FREE_LIMIT)}
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Generate More Options
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-muted-foreground text-center h-[400px] flex items-center justify-center p-6">
                    <div>
                      <Lightbulb className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                      <p className="text-lg font-medium mb-2">No Acronyms Generated Yet</p>
                      <p className="text-sm max-w-md mx-auto">Enter your phrase and click "Generate Acronyms" to create creative and memorable acronym suggestions.</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Saved Acronyms Tab */}
        <TabsContent value="saved" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center">
                <Bookmark className="mr-2 h-5 w-5 text-primary" />
                Saved Acronyms
              </CardTitle>
            </CardHeader>

            <CardContent>
              {!isAuthenticated ? (
                <div className="text-center p-8">
                  <FolderOpen className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Authentication Required</h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    Please sign in to save and access your acronyms.
                  </p>
                  <Button
                    className="mt-4"
                    onClick={() => setShowAuthPopup(true)}
                  >
                    Sign In
                  </Button>
                </div>
              ) : savedAcronyms.length === 0 ? (
                <div className="text-center p-8">
                  <Bookmark className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Saved Acronyms</h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    Save your favorite acronyms to access them later for your projects.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => setActiveTab('generator')}
                  >
                    Generate Acronyms
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {savedAcronyms.map((acronym) => (
                    <div
                      key={acronym.id}
                      className="border rounded-lg p-4 hover:border-primary/50 transition-colors cursor-pointer"
                      onClick={() => loadSavedAcronym(acronym)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-xl font-bold tracking-wider">{acronym.acronym}</h3>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            For: {acronym.phrase}
                          </p>
                          <p className="text-base mt-2">
                            {acronym.meaning}
                          </p>
                          {acronym.tagline && (
                            <div className="mt-2 text-sm italic text-muted-foreground">
                              "{acronym.tagline}"
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              copyAcronym(acronym.acronym, acronym.meaning, acronym.tagline);
                            }}
                          >
                            <Copy className="h-4 w-4" />
                            <span className="sr-only">Copy</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={(e) => deleteAcronym(acronym.id, e)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center justify-end mt-2 text-xs text-muted-foreground">
                        <p>Saved on {acronym.date}</p>
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