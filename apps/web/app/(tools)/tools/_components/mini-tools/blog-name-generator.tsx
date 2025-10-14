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
  Loader2, Heart, Save, BookOpen, RefreshCw, 
  Sparkles, Star, Bolt, Zap, Lightbulb,
  FileEdit, Hash, Search
} from 'lucide-react'

// Define types
type NameStyle = {
  value: string;
  label: string;
  description: string;
}

type GeneratedName = {
  name: string;
  explanation: string;
  style: string;
}

type SavedName = {
  id: string;
  name: string;
  explanation: string;
  style: string;
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

export function BlogNameGenerator() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState<string>('generator')
  const [topic, setTopic] = useState<string>('')
  const [keywords, setKeywords] = useState<string>('')
  const [niche, setNiche] = useState<string>('')
  const [nameStyle, setNameStyle] = useState<string>('balanced')
  const [loading, setLoading] = useState<boolean>(false)
  const [generatedNames, setGeneratedNames] = useState<GeneratedName[]>([])
  const [savedNames, setSavedNames] = useState<SavedName[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [showAuthPopup, setShowAuthPopup] = useState<boolean>(false)
  const [dailyUsage, setDailyUsage] = useState<UsageTracking>({ count: 0, date: '' })
  
  const DAILY_FREE_LIMIT = 3
  
  // Define available name styles
  const nameStyles: NameStyle[] = [
    { 
      value: 'descriptive', 
      label: 'Descriptive', 
      description: 'Clear, straightforward names that directly communicate your blog topic'
    },
    { 
      value: 'creative', 
      label: 'Creative', 
      description: 'Unique, memorable names with creative wordplay and metaphors'
    },
    { 
      value: 'seo-focused', 
      label: 'SEO-Focused', 
      description: 'Keyword-rich names optimized for search engines'
    },
    { 
      value: 'brandable', 
      label: 'Brandable', 
      description: 'Short, catchy names that work well as a brand'
    },
    { 
      value: 'balanced', 
      label: 'Balanced', 
      description: 'Mix of creative and descriptive names with good SEO potential'
    }
  ]

  // Load saved names from localStorage and check auth status on component mount
  useEffect(() => {
    const savedItems = localStorage.getItem('savedBlogNames')
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
    const savedUsage = localStorage.getItem('blogNameGenerator_dailyUsage')
    
    if (savedUsage) {
      const usage: UsageTracking = JSON.parse(savedUsage)
      if (usage.date === today) {
        setDailyUsage(usage)
      } else {
        // Reset for new day
        const newUsage = { count: 0, date: today }
        setDailyUsage(newUsage)
        localStorage.setItem('blogNameGenerator_dailyUsage', JSON.stringify(newUsage))
      }
    } else {
      const newUsage = { count: 0, date: today }
      setDailyUsage(newUsage)
      localStorage.setItem('blogNameGenerator_dailyUsage', JSON.stringify(newUsage))
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
    localStorage.setItem('blogNameGenerator_dailyUsage', JSON.stringify(newUsage))
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

  // Get name style label text
  const getNameStyleLabel = (): string => {
    const found = nameStyles.find(opt => opt.value === nameStyle)
    return found ? found.label : "Balanced"
  }

  // Get name style description
  const getNameStyleDescription = (): string => {
    const found = nameStyles.find(opt => opt.value === nameStyle)
    return found ? found.description : ""
  }

  // Generate blog names
  const generateNames = async (): Promise<void> => {
    if (!topic && !keywords && !niche) {
      toast({
        title: "Missing information",
        description: "Please enter at least one of: topic, keywords, or niche to generate blog names.",
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
      const response = await fetch('/api/tools/blog-name-generator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic,
          keywords,
          niche,
          nameStyle
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate blog names');
      }
      
      setGeneratedNames(data.names);
      
      // Increment usage for free users
      if (!isAuthenticated) {
        incrementDailyUsage();
      }
      
      toast({
        title: "Names generated",
        description: "We've crafted some blog name ideas for you to consider.",
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

  // Save a blog name
  const saveName = (name: GeneratedName): void => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to save blog names",
        variant: "destructive"
      });
      setShowAuthPopup(true);
      return;
    }
    
    const newId = Date.now().toString()
    const newSaved: SavedName = {
      id: newId,
      name: name.name,
      explanation: name.explanation,
      style: name.style,
      topic: topic || keywords || niche || "Untitled",
      date: new Date().toLocaleDateString()
    }
    
    const updatedSaved = [...savedNames, newSaved]
    setSavedNames(updatedSaved)
    localStorage.setItem('savedBlogNames', JSON.stringify(updatedSaved))
    
    toast({
      title: "Name saved",
      description: "Blog name has been saved to your collection.",
    })
  }

  // Delete a saved name
  const deleteSavedName = (id: string, e: React.MouseEvent): void => {
    e.stopPropagation() // Prevent triggering the parent click handler
    
    const updatedSaved = savedNames.filter(item => item.id !== id)
    setSavedNames(updatedSaved)
    localStorage.setItem('savedBlogNames', JSON.stringify(updatedSaved))
    
    toast({
      title: "Name deleted",
      description: "The saved blog name has been removed."
    })
  }

  // Reset form
  const resetForm = (): void => {
    setTopic('')
    setKeywords('')
    setNiche('')
    setNameStyle('balanced')
    setGeneratedNames([])
    setError(null)
  }

  // Get style icon based on style name
  const getStyleIcon = (style: string) => {
    switch (style) {
      case 'descriptive':
        return <FileEdit className="h-4 w-4" />;
      case 'creative':
        return <Lightbulb className="h-4 w-4" />;
      case 'seo-focused':
        return <Search className="h-4 w-4" />;
      case 'brandable':
        return <Star className="h-4 w-4" />;
      case 'balanced':
        return <Zap className="h-4 w-4" />;
      default:
        return <Hash className="h-4 w-4" />;
    }
  };

  return (
    <div className="mx-auto max-w-6xl">
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
                <Sparkles className="h-4 w-4 mr-2" /> Generate Names
              </span>
            </TabsTrigger>
            <TabsTrigger value="saved" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md">
              <span className="flex items-center justify-center">
                <Heart className="h-4 w-4 mr-2" /> Favorites ({savedNames.length})
              </span>
            </TabsTrigger>
          </TabsList>
        </div>
        
        {/* Generator Tab */}
        <TabsContent value="generator" className="mt-0">
          <div className="grid gap-3 md:grid-cols-3">
            <Card className="col-span-3 md:col-span-1">
              <CardHeader>
                <CardTitle className="text-xl flex items-center">
                  <Hash className="mr-2 h-5 w-5 text-primary" />
                  Blog Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="topic" className="text-base">Blog Topic</Label>
                    <Input 
                      id="topic"
                      placeholder="e.g., Sustainable Living, Tech Reviews"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      className="mt-1.5"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="keywords" className="text-base">Keywords</Label>
                    <Input 
                      id="keywords"
                      placeholder="e.g., eco-friendly, green, sustainability"
                      value={keywords}
                      onChange={(e) => setKeywords(e.target.value)}
                      className="mt-1.5"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Separate keywords with commas</p>
                  </div>
                  
                  <div>
                    <Label htmlFor="niche" className="text-base">Niche/Industry</Label>
                    <Input 
                      id="niche"
                      placeholder="e.g., Finance, Travel, Food"
                      value={niche}
                      onChange={(e) => setNiche(e.target.value)}
                      className="mt-1.5"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="nameStyle" className="text-base">Name Style</Label>
                    <Select value={nameStyle} onValueChange={setNameStyle}>
                      <SelectTrigger className="mt-1.5">
                        <SelectValue placeholder="Select style" />
                      </SelectTrigger>
                      <SelectContent>
                        {nameStyles.map(style => (
                          <SelectItem key={style.value} value={style.value}>
                            <div className="flex items-center gap-2">
                              {getStyleIcon(style.value)}
                              <span>{style.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-2">{getNameStyleDescription()}</p>
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
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate Names
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
            
            <Card className="col-span-3 md:col-span-2">
              <CardHeader>
                <CardTitle className="text-xl flex items-center">
                  <Bolt className="mr-2 h-5 w-5 text-primary" />
                  Generated Blog Names
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex flex-col items-center justify-center h-[400px] gap-4">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <p className="text-muted-foreground">Brainstorming creative names for your blog...</p>
                    <p className="text-xs text-muted-foreground">This may take a few seconds</p>
                  </div>
                ) : error ? (
                  <div className="text-destructive text-center h-[400px] flex flex-col items-center justify-center p-6">
                    <p className="font-medium mb-2">Error generating blog names</p>
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
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-lg font-medium">{item.name}</h3>
                              <Badge variant="outline" className="ml-2 flex items-center gap-1">
                                {getStyleIcon(item.style)}
                                {item.style.charAt(0).toUpperCase() + item.style.slice(1)}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-2">{item.explanation}</p>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0"
                            onClick={() => saveName(item)}
                            disabled={!isAuthenticated}
                          >
                            <Heart className="h-4 w-4" />
                            <span className="sr-only">Save</span>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-muted-foreground text-center h-[400px] flex items-center justify-center p-6">
                    <div>
                      <Lightbulb className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                      <p className="text-lg font-medium mb-2">No Blog Names Generated Yet</p>
                      <p className="text-sm max-w-md mx-auto">Fill in your blog details and click "Generate Names" to create potential blog name ideas.</p>
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
                <Heart className="mr-2 h-5 w-5 text-primary" />
                Favorite Blog Names
              </CardTitle>
            </CardHeader>
            
            <CardContent>
              {!isAuthenticated ? (
                <div className="text-center p-8">
                  <BookOpen className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Authentication Required</h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    Please sign in to save and access your favorite blog names.
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
                  <Heart className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Saved Blog Names</h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    When you find a name you like, click the heart icon to save it for future reference.
                  </p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => setActiveTab('generator')}
                  >
                    Generate Blog Names
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {savedNames.map((item) => (
                    <div key={item.id} className="border rounded-lg p-4 hover:border-primary/50 transition-colors">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-medium">{item.name}</h3>
                            <Badge variant="outline" className="ml-2 flex items-center gap-1">
                              {getStyleIcon(item.style)}
                              {item.style.charAt(0).toUpperCase() + item.style.slice(1)}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">Saved on {item.date} • Topic: {item.topic}</p>
                          <p className="text-sm mt-2">{item.explanation}</p>
                        </div>
                        <div className="flex">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="h-8 p-0 px-2"
                            onClick={(e) => deleteSavedName(item.id, e)}
                          >
                            Remove
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