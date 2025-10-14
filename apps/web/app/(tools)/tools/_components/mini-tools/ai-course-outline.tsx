'use client'

import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@repo/ui/components/ui/card'
import { Input } from '@repo/ui/components/ui/input'
import { Textarea } from '@repo/ui/components/ui/textarea'
import { Button } from '@repo/ui/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/components/ui/select'
import { Label } from '@repo/ui/components/ui/label'
import { Slider } from '@repo/ui/components/ui/slider'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/ui/components/ui/tabs'
import { Loader2, Copy, Download, RefreshCw, BookOpen, Users, Clock, Calendar, Info, CheckCircle2 } from 'lucide-react'
import { useToast } from '@repo/ui/hooks/use-toast'
import { Badge } from '@repo/ui/components/ui/badge'
import { Separator } from '@repo/ui/components/ui/separator'

// Define types for our options
type CourseType = {
  value: string;
  label: string;
}

type AudienceOption = {
  value: string;
  label: string;
}

export function AIOutlineGenerator() {
  const { toast } = useToast()
  const [topic, setTopic] = useState<string>('')
  const [audience, setAudience] = useState<string>('')
  const [additionalInfo, setAdditionalInfo] = useState<string>('')
  const [courseType, setCourseType] = useState<string>('comprehensive')
  const [duration, setDuration] = useState<number>(4) // weeks
  const [loading, setLoading] = useState<boolean>(false)
  const [outline, setOutline] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<string>('edit')

  const courseTypes: CourseType[] = [
    { value: 'quick', label: 'Quick Introduction (1-2 weeks)' },
    { value: 'standard', label: 'Standard Course (3-6 weeks)' },
    { value: 'comprehensive', label: 'Comprehensive Program (8-12 weeks)' },
    { value: 'bootcamp', label: 'Intensive Bootcamp' },
    { value: 'self-paced', label: 'Self-paced Course' }
  ]

  const audienceOptions: AudienceOption[] = [
    { value: 'beginners', label: 'Complete Beginners' },
    { value: 'intermediate', label: 'Intermediate Learners' },
    { value: 'advanced', label: 'Advanced Practitioners' },
    { value: 'mixed', label: 'Mixed Skill Levels' },
    { value: 'professional', label: 'Professional Development' }
  ]

  const generateOutline = async (): Promise<void> => {
    if (!topic) {
      toast({
        title: "Missing information",
        description: "Please enter a course topic to generate an outline.",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    setError(null)
    
    try {
      // Call our API endpoint
      const response = await fetch('/api/tools/ai-course-outline', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic,
          audience,
          courseType,
          duration,
          additionalInfo
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate course outline');
      }
      
      setOutline(data.outline);
      setActiveTab('preview');
      
      toast({
        title: "Outline generated",
        description: "Your course outline has been created successfully.",
    
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
    navigator.clipboard.writeText(outline)
    toast({
      title: "Copied to clipboard",
      description: "Your course outline has been copied to the clipboard."
    })
  }

  const downloadOutline = (): void => {
    const element = document.createElement('a')
    const file = new Blob([outline], {type: 'text/markdown'})
    element.href = URL.createObjectURL(file)
    element.download = `${topic.replace(/\s+/g, '-').toLowerCase()}-course-outline.md`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const resetForm = (): void => {
    setTopic('')
    setAudience('')
    setAdditionalInfo('')
    setCourseType('comprehensive')
    setDuration(4)
    setOutline('')
    setError(null)
    setActiveTab('edit')
  }

  // Function to get audience label text
  const getAudienceLabel = (): string => {
    const found = audienceOptions.find(opt => opt.value === audience);
    return found ? found.label : "Not specified";
  }

  // Function to get course type label text
  const getCourseTypeLabel = (): string => {
    const found = courseTypes.find(opt => opt.value === courseType);
    return found ? found.label : "Not specified";
  }

  return (
    <div className="container mx-auto max-w-6xl">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="edit" className="text-base py-3">
            <BookOpen className="h-4 w-4 mr-2" /> Course Parameters
          </TabsTrigger>
          <TabsTrigger value="preview" className="text-base py-3" disabled={!outline && !loading}>
            <Copy className="h-4 w-4 mr-2" /> Generated Outline
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="edit" className="mt-0">
          <div className="grid gap-8 md:grid-cols-3">
            <Card className="col-span-3 md:col-span-2">
              <CardHeader>
                <CardTitle className="text-xl flex items-center">
                  <BookOpen className="mr-2 h-5 w-5 text-primary" />
                  Design Your Course
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="topic" className="text-base">Course Topic <span className="text-destructive">*</span></Label>
                    <Input 
                      id="topic"
                      placeholder="e.g., Machine Learning, Data Analysis, AI Ethics"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      className="mt-1.5"
                    />
                  </div>
                  
                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <div className="flex items-center mb-1.5">
                        <Users className="h-4 w-4 mr-1.5 text-muted-foreground" />
                        <Label htmlFor="audience" className="text-base">Target Audience</Label>
                      </div>
                      <Select value={audience} onValueChange={setAudience}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select target audience" />
                        </SelectTrigger>
                        <SelectContent>
                          {audienceOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <div className="flex items-center mb-1.5">
                        <Calendar className="h-4 w-4 mr-1.5 text-muted-foreground" />
                        <Label htmlFor="courseType" className="text-base">Course Type</Label>
                      </div>
                      <Select value={courseType} onValueChange={setCourseType}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select course type" />
                        </SelectTrigger>
                        <SelectContent>
                          {courseTypes.map(type => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1.5 text-muted-foreground" />
                        <Label htmlFor="duration" className="text-base">Duration</Label>
                      </div>
                      <Badge variant="outline">{duration} {duration === 1 ? 'week' : 'weeks'}</Badge>
                    </div>
                    <Slider
                      id="duration"
                      min={1}
                      max={12}
                      step={1}
                      value={[duration]}
                      onValueChange={(value) => setDuration(value[0])}
                      className="my-2"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>1 week</span>
                      <span>6 weeks</span>
                      <span>12 weeks</span>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center mb-1.5">
                      <Info className="h-4 w-4 mr-1.5 text-muted-foreground" />
                      <Label htmlFor="additionalInfo" className="text-base">Additional Requirements</Label>
                    </div>
                    <Textarea 
                      id="additionalInfo"
                      placeholder="Specific topics to cover, preferred teaching approach, assessment methods, etc."
                      value={additionalInfo}
                      onChange={(e) => setAdditionalInfo(e.target.value)}
                      rows={4}
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
                <Button onClick={generateOutline} disabled={loading} className="px-6">
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : "Generate Course Outline"}
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
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Course Topic</h4>
                    <p className="font-medium">{topic || "Not specified"}</p>
                  </div>
                  <Separator />
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Target Audience</h4>
                    <p>{getAudienceLabel()}</p>
                  </div>
                  <Separator />
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Course Type</h4>
                    <p>{getCourseTypeLabel()}</p>
                  </div>
                  <Separator />
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Duration</h4>
                    <p>{duration} {duration === 1 ? 'week' : 'weeks'}</p>
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
                <BookOpen className="mr-2 h-5 w-5 text-primary" />
                Generated Course Outline
              </CardTitle>
              
              {outline && (
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={copyToClipboard}>
                    <Copy className="h-4 w-4 mr-1" /> Copy
                  </Button>
                  <Button variant="outline" size="sm" onClick={downloadOutline}>
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
                    <p className="text-muted-foreground">Generating your course outline...</p>
                    <p className="text-xs text-muted-foreground">This may take up to 30 seconds</p>
                  </div>
                ) : error ? (
                  <div className="text-destructive text-center h-[500px] flex flex-col items-center justify-center p-6">
                    <p className="font-medium mb-2">Error generating outline</p>
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
                ) : outline ? (
                  <div className="p-6 prose prose-sm max-w-none">
                    <ReactMarkdown>{outline}</ReactMarkdown>
                  </div>
                ) : (
                  <div className="text-muted-foreground text-center h-[500px] flex items-center justify-center p-6">
                    <div>
                      <BookOpen className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                      <p className="text-lg font-medium mb-2">No Course Outline Generated Yet</p>
                      <p className="text-sm max-w-md mx-auto">Fill in the course parameters and click "Generate Course Outline" to create your customized curriculum.</p>
                    </div>
                  </div>
                )}
              </div>
              
              {outline && (
                <div className="mt-6 border-t pt-4">
                  <div className="flex flex-wrap items-center gap-2 justify-between">
                    <div>
                      <h4 className="font-medium">Course Summary</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {topic ? topic : "Untitled Course"} • {getCourseTypeLabel()} • {duration} {duration === 1 ? 'week' : 'weeks'}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => setActiveTab('edit')}>
                        <RefreshCw className="h-4 w-4 mr-1" /> Edit & Regenerate
                      </Button>
                      <Button size="sm" onClick={downloadOutline}>
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




