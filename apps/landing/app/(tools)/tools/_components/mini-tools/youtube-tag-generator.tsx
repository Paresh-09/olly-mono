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
import { Switch } from '@repo/ui/components/ui/switch'
import { useToast } from '@repo/ui/hooks/use-toast'
import { Alert, AlertDescription } from "@repo/ui/components/ui/alert"
import AuthPopup from "../authentication"
import { 
  Loader2, Copy, Save, RefreshCw, 
  Youtube, Tag, Bookmark, Search, 
  Trash2, Info, FileText, ArrowRight
} from 'lucide-react'

// Define types
type TagCategory = {
  value: string;
  label: string;
}

type SavedTagSet = {
  id: string;
  title: string;
  tags: string[];
  category: string;
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

export function YouTubeTagGenerator() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState<string>('generator')
  const [videoTitle, setVideoTitle] = useState<string>('')
  const [videoDescription, setVideoDescription] = useState<string>('')
  const [category, setCategory] = useState<string>('general')
  const [includeTrending, setIncludeTrending] = useState<boolean>(true)
  const [competitionLevel, setCompetitionLevel] = useState<string>('medium')
  const [loading, setLoading] = useState<boolean>(false)
  const [generatedTags, setGeneratedTags] = useState<string[]>([])
  const [savedTagSets, setSavedTagSets] = useState<SavedTagSet[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [showAuthPopup, setShowAuthPopup] = useState<boolean>(false)
  const [dailyUsage, setDailyUsage] = useState<UsageTracking>({ count: 0, date: '' })
  
  const DAILY_FREE_LIMIT = 3
  
  // Define available content categories
  const contentCategories: TagCategory[] = [
    { value: 'general', label: 'General' },
    { value: 'gaming', label: 'Gaming' },
    { value: 'tech', label: 'Technology & Gadgets' },
    { value: 'beauty', label: 'Beauty & Fashion' },
    { value: 'education', label: 'Education & How-To' },
    { value: 'entertainment', label: 'Entertainment' },
    { value: 'vlog', label: 'Vlog & Lifestyle' },
    { value: 'business', label: 'Business & Marketing' },
    { value: 'health', label: 'Health & Fitness' },
    { value: 'travel', label: 'Travel' },
    { value: 'food', label: 'Food & Cooking' },
    { value: 'music', label: 'Music' },
    { value: 'art', label: 'Art & Design' },
    {value:"news",label:'News' }
  ]
  
  // Define competition levels
  const competitionLevels = [
    { value: 'low', label: 'Low Competition (Niche Topics)' },
    { value: 'medium', label: 'Medium Competition (Balanced)' },
    { value: 'high', label: 'High Competition (Popular Topics)' }
  ]

  // Load saved tag sets from localStorage and check auth status on component mount
  useEffect(() => {
    const savedItems = localStorage.getItem('savedYouTubeTags')
    if (savedItems) {
      setSavedTagSets(JSON.parse(savedItems))
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
    const savedUsage = localStorage.getItem('youtubeTagGenerator_dailyUsage')
    
    if (savedUsage) {
      const usage: UsageTracking = JSON.parse(savedUsage)
      if (usage.date === today) {
        setDailyUsage(usage)
      } else {
        // Reset for new day
        const newUsage = { count: 0, date: today }
        setDailyUsage(newUsage)
        localStorage.setItem('youtubeTagGenerator_dailyUsage', JSON.stringify(newUsage))
      }
    } else {
      const newUsage = { count: 0, date: today }
      setDailyUsage(newUsage)
      localStorage.setItem('youtubeTagGenerator_dailyUsage', JSON.stringify(newUsage))
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
    localStorage.setItem('youtubeTagGenerator_dailyUsage', JSON.stringify(newUsage))
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

  // Get category label text
  const getCategoryLabel = (): string => {
    const found = contentCategories.find(opt => opt.value === category)
    return found ? found.label : "General"
  }

  // Get competition level label text
  const getCompetitionLevelLabel = (): string => {
    const found = competitionLevels.find(opt => opt.value === competitionLevel)
    return found ? found.label : "Medium Competition (Balanced)"
  }

  // Generate YouTube tags
  const generateTags = async (): Promise<void> => {
    if (!videoTitle) {
      toast({
        title: "Missing information",
        description: "Please enter at least a video title to generate tags.",
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
      const response = await fetch('/api/tools/youtube-tag-generator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          videoTitle,
          videoDescription,
          category,
          includeTrending,
          competitionLevel
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate YouTube tags');
      }
      
      setGeneratedTags(data.tags);
      
      // Increment usage for free users
      if (!isAuthenticated) {
        incrementDailyUsage();
      }
      
      toast({
        title: "Tags generated",
        description: "Your SEO-optimized YouTube tags are ready to use.",
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

  // Copy tags to clipboard
  const copyToClipboard = (): void => {
    if (generatedTags.length === 0) return;
    
    navigator.clipboard.writeText(generatedTags.join(', '))
    toast({
      title: "Copied to clipboard",
      description: "Tags have been copied and are ready to paste into YouTube."
    })
  }

  // Save tags to collection
  const saveTags = (): void => {
    if (generatedTags.length === 0) return;
    
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to save tag sets",
        variant: "destructive"
      });
      setShowAuthPopup(true);
      return;
    }
    
    const newId = Date.now().toString()
    const newSaved: SavedTagSet = {
      id: newId,
      title: videoTitle,
      tags: generatedTags,
      category: category,
      date: new Date().toLocaleDateString()
    }
    
    const updatedSaved = [...savedTagSets, newSaved]
    setSavedTagSets(updatedSaved)
    localStorage.setItem('savedYouTubeTags', JSON.stringify(updatedSaved))
    
    toast({
      title: "Tags saved",
      description: "Your tags have been saved to your collection.",
    })
  }

  // Delete a saved tag set
  const deleteTagSet = (id: string, e: React.MouseEvent): void => {
    e.stopPropagation() // Prevent triggering the parent click handler
    
    const updatedSaved = savedTagSets.filter(item => item.id !== id)
    setSavedTagSets(updatedSaved)
    localStorage.setItem('savedYouTubeTags', JSON.stringify(updatedSaved))
    
    toast({
      title: "Tags deleted",
      description: "The saved tag set has been removed."
    })
  }

  // Reset form
  const resetForm = (): void => {
    setVideoTitle('')
    setVideoDescription('')
    setCategory('general')
    setIncludeTrending(true)
    setCompetitionLevel('medium')
    setGeneratedTags([])
    setError(null)
  }

  // Load a saved tag set
  const loadTagSet = (tagSet: SavedTagSet): void => {
    setGeneratedTags(tagSet.tags)
    setVideoTitle(tagSet.title)
    setCategory(tagSet.category)
    setActiveTab('generator')
  }

  return (
    <div className="">
      {!isAuthenticated && (
        <Alert className="mb-4">
          <AlertDescription>
            You have {DAILY_FREE_LIMIT - dailyUsage.count} free generations remaining today. Sign in for unlimited access and to save your tag sets.
          </AlertDescription>
        </Alert>
      )}
    
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="bg-muted rounded-lg p-1 mb-6">
          <TabsList className="grid w-full grid-cols-2 bg-transparent">
            <TabsTrigger value="generator" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md">
              <span className="flex items-center justify-center">
                <Tag className="h-4 w-4 mr-2" /> Generate Tags
              </span>
            </TabsTrigger>
            <TabsTrigger value="saved" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md">
              <span className="flex items-center justify-center">
                <Bookmark className="h-4 w-4 mr-2" /> Saved Tags ({savedTagSets.length})
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
                  <Youtube className="mr-2 h-5 w-5 text-primary" />
                  Video Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="videoTitle" className="text-base">Video Title <span className="text-destructive">*</span></Label>
                    <Input 
                      id="videoTitle"
                      placeholder="Enter your YouTube video title"
                      value={videoTitle}
                      onChange={(e) => setVideoTitle(e.target.value)}
                      className="mt-1.5"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="videoDescription" className="text-base">Video Description (Optional)</Label>
                    <Textarea 
                      id="videoDescription"
                      placeholder="Enter a brief description of your video content"
                      value={videoDescription}
                      onChange={(e) => setVideoDescription(e.target.value)}
                      rows={4}
                      className="mt-1.5"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Adding a description helps generate more relevant tags</p>
                  </div>
                  
                  <div>
                    <Label htmlFor="category" className="text-base">Content Category</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger className="mt-1.5">
                        <SelectValue placeholder="Select content category" />
                      </SelectTrigger>
                      <SelectContent>
                        {contentCategories.map(cat => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="competitionLevel" className="text-base">Competition Level</Label>
                    <Select value={competitionLevel} onValueChange={setCompetitionLevel}>
                      <SelectTrigger className="mt-1.5">
                        <SelectValue placeholder="Select competition level" />
                      </SelectTrigger>
                      <SelectContent>
                        {competitionLevels.map(level => (
                          <SelectItem key={level.value} value={level.value}>
                            {level.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">Choose based on how competitive your topic is</p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="includeTrending" 
                      checked={includeTrending} 
                      onCheckedChange={setIncludeTrending} 
                    />
                    <Label htmlFor="includeTrending" className="text-base">
                      Include trending/popular tags
                    </Label>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t pt-6">
                <Button variant="outline" onClick={resetForm} disabled={loading}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
                <Button 
                  onClick={generateTags} 
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
                      <Search className="mr-2 h-4 w-4" />
                      Generate Tags
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
            
            <Card className="col-span-12 md:col-span-7">
              <CardHeader>
                <CardTitle className="text-xl flex items-center justify-between">
                  <div className="flex items-center">
                    <Tag className="mr-2 h-5 w-5 text-primary" />
                    Generated Tags
                  </div>
                  
                  {generatedTags.length > 0 && (
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={copyToClipboard}
                      >
                        <Copy className="h-4 w-4 mr-1" /> Copy All
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={saveTags}
                        disabled={!isAuthenticated}
                      >
                        <Save className="h-4 w-4 mr-1" /> Save
                      </Button>
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex flex-col items-center justify-center h-[400px] gap-4">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <p className="text-muted-foreground">Generating SEO-optimized tags for your video...</p>
                    <p className="text-xs text-muted-foreground">This may take a few seconds</p>
                  </div>
                ) : error ? (
                  <div className="text-destructive text-center h-[400px] flex flex-col items-center justify-center p-6">
                    <p className="font-medium mb-2">Error generating tags</p>
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
                ) : generatedTags.length > 0 ? (
                  <div className="space-y-6">
                    <div className="border rounded-lg p-4">
                      <Label className="text-sm text-muted-foreground mb-2 block">Copy & paste these tags into YouTube:</Label>
                      <div className="bg-muted p-3 rounded-md relative">
                        <p className="text-sm break-all font-mono">
                          {generatedTags.join(', ')}
                        </p>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="absolute top-2 right-2 h-8 w-8 p-0"
                          onClick={copyToClipboard}
                        >
                          <Copy className="h-4 w-4" />
                          <span className="sr-only">Copy</span>
                        </Button>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-base font-medium mb-3">Individual Tags:</h3>
                      <div className="flex flex-wrap gap-2">
                        {generatedTags.map((tag, index) => (
                          <Badge 
                            key={index}
                            variant="secondary"
                            className="px-3 py-1 text-sm"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        YouTube allows up to 500 characters for tags. This set uses approximately {generatedTags.join(', ').length} characters.
                      </AlertDescription>
                    </Alert>
                  </div>
                ) : (
                  <div className="text-muted-foreground text-center h-[400px] flex items-center justify-center p-6">
                    <div>
                      <Youtube className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                      <p className="text-lg font-medium mb-2">No Tags Generated Yet</p>
                      <p className="text-sm max-w-md mx-auto">Fill in your video details and click "Generate Tags" to create SEO-optimized tags for your YouTube video.</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Saved Tags Tab */}
        <TabsContent value="saved" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center">
                <Bookmark className="mr-2 h-5 w-5 text-primary" />
                Saved Tag Sets
              </CardTitle>
            </CardHeader>
            
            <CardContent>
              {!isAuthenticated ? (
                <div className="text-center p-8">
                  <FileText className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Authentication Required</h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    Please sign in to save and access your YouTube tag sets.
                  </p>
                  <Button 
                    className="mt-4"
                    onClick={() => setShowAuthPopup(true)}
                  >
                    Sign In
                  </Button>
                </div>
              ) : savedTagSets.length === 0 ? (
                <div className="text-center p-8">
                  <Bookmark className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Saved Tag Sets</h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    Generate and save tag sets to access them later for your YouTube videos.
                  </p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => setActiveTab('generator')}
                  >
                    Generate Tags
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {savedTagSets.map((tagSet) => (
                    <div 
                      key={tagSet.id} 
                      className="border rounded-lg p-4 hover:border-primary/50 transition-colors cursor-pointer"
                      onClick={() => loadTagSet(tagSet)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-base font-medium">{tagSet.title}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {getCategoryLabel()}
                            </Badge>
                            <p className="text-xs text-muted-foreground">
                              Saved on {tagSet.date}
                            </p>
                          </div>
                          <div className="mt-2 mb-1">
                            <p className="text-xs text-muted-foreground">
                              {tagSet.tags.length} tags • {tagSet.tags.join(', ').length} characters
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {tagSet.tags.slice(0, 5).map((tag, index) => (
                              <Badge 
                                key={index}
                                variant="secondary"
                                className="text-xs"
                              >
                                {tag}
                              </Badge>
                            ))}
                            {tagSet.tags.length > 5 && (
                              <Badge variant="outline" className="text-xs">
                                +{tagSet.tags.length - 5} more
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigator.clipboard.writeText(tagSet.tags.join(', '));
                              toast({
                                title: "Copied to clipboard",
                                description: "Tags have been copied and are ready to paste."
                              });
                            }}
                          >
                            <Copy className="h-4 w-4" />
                            <span className="sr-only">Copy</span>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={(e) => deleteTagSet(tagSet.id, e)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center justify-end mt-2 text-xs text-muted-foreground">
                        <p>Click to load these tags</p>
                        <ArrowRight className="h-3 w-3 ml-1" />
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