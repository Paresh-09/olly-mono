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
import { Loader2, Copy, Download, RefreshCw, Video, Users, Clock, Settings, FileText, CheckCircle2 } from 'lucide-react'
import { useToast } from '@repo/ui/hooks/use-toast'
import { Badge } from '@repo/ui/components/ui/badge'
import { Separator } from '@repo/ui/components/ui/separator'
import { Checkbox } from '@repo/ui/components/ui/checkbox'

// Define types for our options
type ScriptType = {
  value: string;
  label: string;
}

type ToneOption = {
  value: string;
  label: string;
}

export function AIScriptGenerator() {
  const { toast } = useToast()
  const [topic, setTopic] = useState<string>('')
  const [tone, setTone] = useState<string>('')
  const [additionalInfo, setAdditionalInfo] = useState<string>('')
  const [scriptType, setScriptType] = useState<string>('video')
  const [duration, setDuration] = useState<number>(2) // minutes
  const [includeCallToAction, setIncludeCallToAction] = useState<boolean>(true)
  const [includeHooks, setIncludeHooks] = useState<boolean>(true)
  const [loading, setLoading] = useState<boolean>(false)
  const [script, setScript] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<string>('edit')
  const [copyFormat, setCopyFormat] = useState<'markdown' | 'html'>('markdown')

  const scriptTypes: ScriptType[] = [
    { value: 'video', label: 'YouTube/Video Script' },
    { value: 'podcast', label: 'Podcast Script' },
    { value: 'commercial', label: 'Commercial Script' },
    { value: 'presentation', label: 'Presentation Script' },
    { value: 'tutorial', label: 'Tutorial Script' },
    { value: 'act', label: 'Theatrical/Drama Script' }
  ]

  const toneOptions: ToneOption[] = [
    { value: 'conversational', label: 'Conversational' },
    { value: 'professional', label: 'Professional' },
    { value: 'enthusiastic', label: 'Enthusiastic' },
    { value: 'educational', label: 'Educational' },
    { value: 'humorous', label: 'Humorous' }
  ]

  const generateScript = async (): Promise<void> => {
    if (!topic) {
      toast({
        title: "Missing information",
        description: "Please enter a script topic to generate content.",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Call our API endpoint
      const response = await fetch('/api/tools/ai-script-generator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic,
          tone,
          scriptType,
          duration,
          additionalInfo,
          includeCallToAction,
          includeHooks
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate script');
      }

      setScript(data.script);
      setActiveTab('preview');

      toast({
        title: "Script generated",
        description: "Your script has been created successfully.",
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
    if (copyFormat === 'html') {
      // Get the rendered HTML from the Markdown container
      const markdownContainer = document.querySelector('.prose');
      if (markdownContainer) {
        const renderedHTML = markdownContainer.innerHTML;
        navigator.clipboard.writeText(renderedHTML);
        toast({
          title: "Copied HTML to clipboard",
          description: "The rendered HTML has been copied to the clipboard."
        });
      }
    } else {
      navigator.clipboard.writeText(script);
      toast({
        title: "Copied Markdown to clipboard",
        description: "The script content has been copied to the clipboard."
      });
    }
  }

  const downloadScript = (): void => {
    const element = document.createElement('a')
    const file = new Blob([script], { type: 'text/markdown' })
    element.href = URL.createObjectURL(file)
    element.download = `${topic.replace(/\s+/g, '-').toLowerCase()}-script.md`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const resetForm = (): void => {
    setTopic('')
    setTone('')
    setAdditionalInfo('')
    setScriptType('video')
    setDuration(2)
    setIncludeCallToAction(true)
    setIncludeHooks(true)
    setScript('')
    setError(null)
    setActiveTab('edit')
  }

  // Function to get tone label text
  const getToneLabel = (): string => {
    const found = toneOptions.find(opt => opt.value === tone);
    return found ? found.label : "Not specified";
  }

  // Function to get script type label text
  const getScriptTypeLabel = (): string => {
    const found = scriptTypes.find(opt => opt.value === scriptType);
    return found ? found.label : "Not specified";
  }

  return (
    <div className="container mx-auto max-w-6xl">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="edit" className="text-base py-3">
            <FileText className="h-4 w-4 mr-2" /> Script Parameters
          </TabsTrigger>
          <TabsTrigger value="preview" className="text-base py-3" disabled={!script && !loading}>
            <Copy className="h-4 w-4 mr-2" /> Generated Script
          </TabsTrigger>
        </TabsList>

        <TabsContent value="edit" className="mt-0">
          <div className="grid gap-8 md:grid-cols-3">
            <Card className="col-span-3 md:col-span-2">
              <CardHeader>
                <CardTitle className="text-xl flex items-center">
                  <Video className="mr-2 h-5 w-5 text-primary" />
                  Design Your Script
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="topic" className="text-base">Script Topic <span className="text-destructive">*</span></Label>
                    <Input
                      id="topic"
                      placeholder="e.g., Introduction to AI, Product Review, Travel Guide"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      className="mt-1.5"
                    />
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <div className="flex items-center mb-1.5">
                        <Users className="h-4 w-4 mr-1.5 text-muted-foreground" />
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

                    <div>
                      <div className="flex items-center mb-1.5">
                        <Settings className="h-4 w-4 mr-1.5 text-muted-foreground" />
                        <Label htmlFor="scriptType" className="text-base">Script Type</Label>
                      </div>
                      <Select value={scriptType} onValueChange={setScriptType}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select script type" />
                        </SelectTrigger>
                        <SelectContent>
                          {scriptTypes.map(type => (
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
                      <Badge variant="outline">{duration} {duration === 1 ? 'minute' : 'minutes'}</Badge>
                    </div>
                    <Slider
                      id="duration"
                      min={1}
                      max={10}
                      step={1}
                      value={[duration]}
                      onValueChange={(value) => setDuration(value[0])}
                      className="my-2"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>1 minute</span>
                      <span>5 minutes</span>
                      <span>10 minutes</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-base">Script Elements</Label>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="includeHooks"
                        checked={includeHooks}
                        onCheckedChange={(checked) => setIncludeHooks(checked as boolean)}
                      />
                      <Label htmlFor="includeHooks" className="cursor-pointer">Include Attention-Grabbing Hooks</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="includeCallToAction"
                        checked={includeCallToAction}
                        onCheckedChange={(checked) => setIncludeCallToAction(checked as boolean)}
                      />
                      <Label htmlFor="includeCallToAction" className="cursor-pointer">Include Call to Action</Label>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="additionalInfo" className="text-base">Additional Requirements</Label>
                    <Textarea
                      id="additionalInfo"
                      placeholder="Specific topics to cover, key points, target audience, etc."
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
                <Button onClick={generateScript} disabled={loading} className="px-6">
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : "Generate Script"}
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
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Script Topic</h4>
                    <p className="font-medium">{topic || "Not specified"}</p>
                  </div>
                  <Separator />
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Tone</h4>
                    <p>{getToneLabel()}</p>
                  </div>
                  <Separator />
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Script Type</h4>
                    <p>{getScriptTypeLabel()}</p>
                  </div>
                  <Separator />
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Duration</h4>
                    <p>{duration} {duration === 1 ? 'minute' : 'minutes'}</p>
                  </div>
                  <Separator />
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Elements</h4>
                    <div className="space-y-1">
                      {includeHooks && <p className="text-sm">• Attention-Grabbing Hooks</p>}
                      {includeCallToAction && <p className="text-sm">• Call to Action</p>}
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
                <Video className="mr-2 h-5 w-5 text-primary" />
                Generated Script
              </CardTitle>

              {script && (
                <div className="flex space-x-2">
                  <div className="flex items-center rounded-md border p-1 mr-2">
                    <button
                      onClick={() => setCopyFormat('markdown')}
                      className={`px-2.5 py-1 text-xs rounded-sm ${copyFormat === 'markdown' ? 'bg-primary text-white' : 'bg-transparent'
                        }`}
                    >
                      Markdown
                    </button>
                    <button
                      onClick={() => setCopyFormat('html')}
                      className={`px-2.5 py-1 text-xs rounded-sm ${copyFormat === 'html' ? 'bg-primary text-white' : 'bg-transparent'
                        }`}
                    >
                      HTML
                    </button>
                  </div>
                  <Button variant="outline" size="sm" onClick={copyToClipboard}>
                    <Copy className="h-4 w-4 mr-1" /> Copy {copyFormat === 'html' ? 'HTML' : 'Markdown'}
                  </Button>
                  <Button variant="outline" size="sm" onClick={downloadScript}>
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
                    <p className="text-muted-foreground">Generating your script...</p>
                    <p className="text-xs text-muted-foreground">This may take up to 30 seconds</p>
                  </div>
                ) : error ? (
                  <div className="text-destructive text-center h-[500px] flex flex-col items-center justify-center p-6">
                    <p className="font-medium mb-2">Error generating script</p>
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
                ) : script ? (
                  <div className="p-6 prose prose-sm max-w-none">
                    <ReactMarkdown>{script}</ReactMarkdown>
                  </div>
                ) : (
                  <div className="text-muted-foreground text-center h-[500px] flex items-center justify-center p-6">
                    <div>
                      <Video className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                      <p className="text-lg font-medium mb-2">No Script Generated Yet</p>
                      <p className="text-sm max-w-md mx-auto">Fill in the script parameters and click "Generate Script" to create your customized content.</p>
                    </div>
                  </div>
                )}
              </div>

              {script && (
                <div className="mt-6 border-t pt-4">
                  <div className="flex flex-wrap items-center gap-2 justify-between">
                    <div>
                      <h4 className="font-medium">Script Summary</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {topic ? topic : "Untitled Script"} • {getScriptTypeLabel()} • {duration} {duration === 1 ? 'minute' : 'minutes'}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => setActiveTab('edit')}>
                        <RefreshCw className="h-4 w-4 mr-1" /> Edit & Regenerate
                      </Button>
                      <Button size="sm" onClick={downloadScript}>
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