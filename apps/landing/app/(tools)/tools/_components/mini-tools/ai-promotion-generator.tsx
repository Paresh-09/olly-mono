'use client'

import { useState } from 'react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@repo/ui/components/ui/card'
import { Input } from '@repo/ui/components/ui/input'
import { Textarea } from '@repo/ui/components/ui/textarea'
import { Button } from '@repo/ui/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/components/ui/select'
import { Label } from '@repo/ui/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/ui/components/ui/tabs'
import { Loader2, Copy, Download, RefreshCw, Megaphone, Target, Users, BookOpen, Clock, Settings } from 'lucide-react'
import { useToast } from '@repo/ui/hooks/use-toast'
import { Separator } from '@repo/ui/components/ui/separator'
import { Checkbox } from '@repo/ui/components/ui/checkbox'

// Define types for our options
type PromotionType = {
  value: string;
  label: string;
}

type ToneOption = {
  value: string;
  label: string;
}

type PromotionLength = {
  value: string;
  label: string;
}

export function AICoursePromotionGenerator() {
  const { toast } = useToast()
  const [courseName, setCourseName] = useState<string>('')
  const [courseSubject, setCourseSubject] = useState<string>('')
  const [targetAudience, setTargetAudience] = useState<string>('')
  const [uniqueSellingPoints, setUniqueSellingPoints] = useState<string>('')
  const [promotionType, setPromotionType] = useState<string>('social-media')
  const [tone, setTone] = useState<string>('enthusiastic')
  const [promotionLength, setPromotionLength] = useState<string>('medium')
  const [includeCallToAction, setIncludeCallToAction] = useState<boolean>(true)
  const [includeEmojis, setIncludeEmojis] = useState<boolean>(false)
  const [includePricing, setIncludePricing] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)
  const [promotion, setPromotion] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<string>('edit')

  const promotionTypes: PromotionType[] = [
    { value: 'social-media', label: 'Social Media Post' },
    { value: 'email', label: 'Email Campaign' },
    { value: 'landing-page', label: 'Landing Page Copy' },
    { value: 'ad-copy', label: 'Advertising Copy' },
    { value: 'blog-post', label: 'Blog Post Intro' }
  ]

  const toneOptions: ToneOption[] = [
    { value: 'enthusiastic', label: 'Enthusiastic' },
    { value: 'professional', label: 'Professional' },
    { value: 'conversational', label: 'Conversational' },
    { value: 'inspiring', label: 'Inspiring' },
    { value: 'urgent', label: 'Urgent/FOMO' }
  ]

  const promotionLengths: PromotionLength[] = [
    { value: 'short', label: 'Short (100-200 words)' },
    { value: 'medium', label: 'Medium (300-500 words)' },
    { value: 'long', label: 'Long (600-800 words)' }
  ]

  const generatePromotion = async (): Promise<void> => {
    if (!courseName) {
      toast({
        title: "Missing information",
        description: "Please enter a course name to generate promotional content.",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    setError(null)
    
    try {
      // Call our API endpoint
      const response = await fetch('/api/tools/ai-course-promotion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseName,
          courseSubject,
          targetAudience,
          uniqueSellingPoints,
          promotionType,
          tone,
          promotionLength,
          includeCallToAction,
          includeEmojis,
          includePricing
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate promotional content');
      }
      
      setPromotion(data.promotion);
      setActiveTab('preview');
      
      toast({
        title: "Promotion generated",
        description: "Your course promotional content has been created successfully.",
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

  const copyToClipboard = (): void => {
    navigator.clipboard.writeText(promotion);
    toast({
      title: "Copied to clipboard",
      description: "The promotional content has been copied to the clipboard."
    });
  }

  const downloadPromotion = (): void => {
    const element = document.createElement('a')
    const file = new Blob([promotion], {type: 'text/plain'})
    element.href = URL.createObjectURL(file)
    element.download = `${courseName.replace(/\s+/g, '-').toLowerCase()}-promotion.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const resetForm = (): void => {
    setCourseName('')
    setCourseSubject('')
    setTargetAudience('')
    setUniqueSellingPoints('')
    setPromotionType('social-media')
    setTone('enthusiastic')
    setPromotionLength('medium')
    setIncludeCallToAction(true)
    setIncludeEmojis(false)
    setIncludePricing(false)
    setPromotion('')
    setError(null)
    setActiveTab('edit')
  }

  // Function to get promotion type label text
  const getPromotionTypeLabel = (): string => {
    const found = promotionTypes.find(opt => opt.value === promotionType);
    return found ? found.label : "Not specified";
  }

  // Function to get tone label text
  const getToneLabel = (): string => {
    const found = toneOptions.find(opt => opt.value === tone);
    return found ? found.label : "Not specified";
  }
  
  // Function to get length label text
  const getLengthLabel = (): string => {
    const found = promotionLengths.find(opt => opt.value === promotionLength);
    return found ? found.label : "Not specified";
  }

  return (
    <div className="container mx-auto max-w-6xl">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="edit" className="text-base py-3">
            <Megaphone className="h-4 w-4 mr-2" /> Promotion Parameters
          </TabsTrigger>
          <TabsTrigger value="preview" className="text-base py-3" disabled={!promotion && !loading}>
            <Copy className="h-4 w-4 mr-2" /> Generated Promotion
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="edit" className="mt-0">
          <div className="grid gap-8 md:grid-cols-3">
            <Card className="col-span-3 md:col-span-2">
              <CardHeader>
                <CardTitle className="text-xl flex items-center">
                  <Megaphone className="mr-2 h-5 w-5 text-primary" />
                  Course Promotion Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="courseName" className="text-base">Course Name <span className="text-destructive">*</span></Label>
                    <Input 
                      id="courseName"
                      placeholder="e.g., Complete Web Development Bootcamp"
                      value={courseName}
                      onChange={(e) => setCourseName(e.target.value)}
                      className="mt-1.5"
                    />
                  </div>
                  
                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <Label htmlFor="courseSubject" className="text-base">Course Subject</Label>
                      <Input 
                        id="courseSubject"
                        placeholder="e.g., Web Development, Machine Learning"
                        value={courseSubject}
                        onChange={(e) => setCourseSubject(e.target.value)}
                        className="mt-1.5"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="targetAudience" className="text-base">Target Audience</Label>
                      <Input 
                        id="targetAudience"
                        placeholder="e.g., Aspiring Web Developers, Tech Professionals"
                        value={targetAudience}
                        onChange={(e) => setTargetAudience(e.target.value)}
                        className="mt-1.5"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="uniqueSellingPoints" className="text-base">Unique Selling Points</Label>
                    <Textarea 
                      id="uniqueSellingPoints"
                      placeholder="Key benefits, what makes this course special, unique features..."
                      value={uniqueSellingPoints}
                      onChange={(e) => setUniqueSellingPoints(e.target.value)}
                      rows={3}
                      className="mt-1.5"
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <div className="flex items-center mb-1.5">
                        <Target className="h-4 w-4 mr-1.5 text-muted-foreground" />
                        <Label htmlFor="promotionType" className="text-base">Promotion Type</Label>
                      </div>
                      <Select value={promotionType} onValueChange={setPromotionType}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select promotion type" />
                        </SelectTrigger>
                        <SelectContent>
                          {promotionTypes.map(type => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <div className="flex items-center mb-1.5">
                        <Settings className="h-4 w-4 mr-1.5 text-muted-foreground" />
                        <Label htmlFor="tone" className="text-base">Tone</Label>
                      </div>
                      <Select value={tone} onValueChange={setTone}>
                        <SelectTrigger>
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
                  </div>
                  
                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <div className="flex items-center mb-1.5">
                        <Clock className="h-4 w-4 mr-1.5 text-muted-foreground" />
                        <Label htmlFor="promotionLength" className="text-base">Content Length</Label>
                      </div>
                      <Select value={promotionLength} onValueChange={setPromotionLength}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select content length" />
                        </SelectTrigger>
                        <SelectContent>
                          {promotionLengths.map(length => (
                            <SelectItem key={length.value} value={length.value}>
                              {length.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <Label className="text-base">Promotion Options</Label>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="includeCallToAction" 
                        checked={includeCallToAction} 
                        onCheckedChange={(checked) => setIncludeCallToAction(checked as boolean)}
                      />
                      <Label htmlFor="includeCallToAction" className="cursor-pointer">Include Call to Action</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="includeEmojis" 
                        checked={includeEmojis} 
                        onCheckedChange={(checked) => setIncludeEmojis(checked as boolean)}
                      />
                      <Label htmlFor="includeEmojis" className="cursor-pointer">Include Emojis</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="includePricing" 
                        checked={includePricing} 
                        onCheckedChange={(checked) => setIncludePricing(checked as boolean)}
                      />
                      <Label htmlFor="includePricing" className="cursor-pointer">Include Pricing Information</Label>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t pt-6">
                <Button variant="outline" onClick={resetForm} disabled={loading}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reset Form
                </Button>
                <Button onClick={generatePromotion} disabled={loading} className="px-6">
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : "Generate Promotion"}
                </Button>
              </CardFooter>
            </Card>
            
            <Card className="col-span-3 md:col-span-1 h-fit">
              <CardHeader>
                <CardTitle className="text-lg">Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Course Name</h4>
                    <p className="font-medium">{courseName || "Not specified"}</p>
                  </div>
                  <Separator />
                  {courseSubject && (
                    <>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">Course Subject</h4>
                        <p>{courseSubject}</p>
                      </div>
                      <Separator />
                    </>
                  )}
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Promotion Type</h4>
                    <p>{getPromotionTypeLabel()}</p>
                  </div>
                  <Separator />
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Tone</h4>
                    <p>{getToneLabel()}</p>
                  </div>
                  <Separator />
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Content Length</h4>
                    <p>{getLengthLabel()}</p>
                  </div>
                  <Separator />
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Promotion Options</h4>
                    <div className="space-y-1">
                      {includeCallToAction && <p className="text-sm">• Call to Action</p>}
                      {includeEmojis && <p className="text-sm">• Emojis Included</p>}
                      {includePricing && <p className="text-sm">• Pricing Information</p>}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="preview" className="mt-0">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl flex items-center">
                <Megaphone className="mr-2 h-5 w-5 text-primary" />
                Course Promotion
              </CardTitle>
              
              {promotion && (
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={copyToClipboard}>
                    <Copy className="h-4 w-4 mr-1" /> Copy
                  </Button>
                  <Button variant="outline" size="sm" onClick={downloadPromotion}>
                    <Download className="h-4 w-4 mr-1" /> Download
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab('edit')}>
                    Edit Parameters
                  </Button>
                </div>
              )}
            </CardHeader>
            
            <CardContent>
              <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
                {loading ? (
                  <div className="flex flex-col items-center justify-center h-[500px] gap-4">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <p className="text-muted-foreground">Generating your promotional content...</p>
                    <p className="text-xs text-muted-foreground">This may take up to 30 seconds</p>
                  </div>
                ) : error ? (
                  <div className="text-destructive text-center h-[500px] flex flex-col items-center justify-center p-6">
                    <p className="font-medium mb-2">Error generating promotion</p>
                    <p className="text-sm">{error}</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-4"
                      onClick={() => setActiveTab('edit')}
                    >
                      Return to Editor
                    </Button>
                  </div>
                ) : promotion ? (
                  <div className="p-6 prose prose-sm max-w-none">
                    <pre className="bg-gray-50 p-4 rounded-lg overflow-auto text-sm leading-relaxed whitespace-pre-wrap break-words max-h-[500px] text-black">
                      {promotion}
                    </pre>
                  </div>
                ) : (
                  <div className="text-muted-foreground text-center h-[500px] flex items-center justify-center p-6">
                    <div>
                      <Megaphone className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                      <p className="text-lg font-medium mb-2">No Promotion Generated Yet</p>
                      <p className="text-sm max-w-md mx-auto">Fill in the course promotion parameters and click "Generate Promotion" to create your marketing content.</p>
                    </div>
                  </div>
                )}
              </div>
              
              {promotion && (
                <div className="mt-6 border-t pt-4">
                  <div className="flex flex-wrap items-center gap-2 justify-between">
                    <div>
                      <h4 className="font-medium">Promotion Summary</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {courseName ? courseName : "Untitled Course"} • {getPromotionTypeLabel()}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => setActiveTab('edit')}>
                        <RefreshCw className="h-4 w-4 mr-1" /> Edit & Regenerate
                      </Button>
                      <Button size="sm" onClick={downloadPromotion}>
                        <Download className="h-4 w-4 mr-1" /> Download
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}