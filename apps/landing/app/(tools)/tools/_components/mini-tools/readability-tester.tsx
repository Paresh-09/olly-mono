'use client'

import { useState } from 'react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@repo/ui/components/ui/card'
import { Input } from '@repo/ui/components/ui/input'
import { Textarea } from '@repo/ui/components/ui/textarea'
import { Button } from '@repo/ui/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/components/ui/select'
import { Label } from '@repo/ui/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/ui/components/ui/tabs'
import {
  Loader2,
  Copy,
  Download,
  RefreshCw,
  FileText,
  Layers,
  BarChart,
  Target,
  Info
} from 'lucide-react'
import { useToast } from '@repo/ui/hooks/use-toast'
import { Separator } from '@repo/ui/components/ui/separator'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@repo/ui/components/ui/tooltip'
import { Badge } from '@repo/ui/components/ui/badge'
import ReactMarkdown from 'react-markdown'



// Define types for our options
type ReadabilityAlgorithm = {
  value: string;
  label: string;
  description: string;
}

type ContentType = {
  value: string;
  label: string;
}

export function ReadabilityTester() {
  const { toast } = useToast()
  const [text, setText] = useState<string>('')
  const [algorithm, setAlgorithm] = useState<string>('flesch-kincaid')
  const [contentType, setContentType] = useState<string>('general')
  const [loading, setLoading] = useState<boolean>(false)
  const [readabilityResults, setReadabilityResults] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<string>('edit')

  const readabilityAlgorithms: ReadabilityAlgorithm[] = [
    {
      value: 'flesch-kincaid',
      label: 'Flesch-Kincaid',
      description: 'Measures text difficulty based on sentence length and word complexity'
    },
    {
      value: 'coleman-liau',
      label: 'Coleman-Liau Index',
      description: 'Estimates readability using character and sentence count'
    },
    {
      value: 'automated-readability',
      label: 'Automated Readability Index',
      description: 'Calculates readability using character and word count'
    },
    {
      value: 'smog',
      label: 'SMOG Readability',
      description: 'Focuses on polysyllabic word count'
    },
    {
      value: 'dale-chall',
      label: 'Dale-Chall Readability',
      description: 'Measures text complexity using familiar word lists'
    }
  ]

  const contentTypes: ContentType[] = [
    { value: 'general', label: 'General Text' },
    { value: 'academic', label: 'Academic Paper' },
    { value: 'technical', label: 'Technical Document' },
    { value: 'marketing', label: 'Marketing Copy' },
    { value: 'educational', label: 'Educational Content' }
  ]

  const analyzeReadability = async (): Promise<void> => {
    if (!text.trim()) {
      toast({
        title: "Missing content",
        description: "Please enter text to analyze readability.",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Call our API endpoint
      const response = await fetch('/api/tools/readability-tester', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          algorithm,
          contentType
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze readability');
      }

      setReadabilityResults(data.results);
      setActiveTab('results');

      toast({
        title: "Analysis Complete",
        description: "Readability analysis has been generated successfully.",
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setError(errorMessage);
      toast({
        title: "Analysis failed",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const copyResults = (): void => {
    if (!readabilityResults) return;

    const resultText = Object.entries(readabilityResults)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');

    navigator.clipboard.writeText(resultText);
    toast({
      title: "Copied to clipboard",
      description: "Readability results have been copied."
    });
  }

  const downloadResults = (): void => {
    if (!readabilityResults) return;

    const resultText = Object.entries(readabilityResults)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');

    const blob = new Blob([resultText], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'readability-results.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const resetForm = (): void => {
    setText('')
    setAlgorithm('flesch-kincaid')
    setContentType('general')
    setReadabilityResults(null)
    setError(null)
    setActiveTab('edit')
  }

  // Function to get algorithm label text
  const getAlgorithmLabel = (): string => {
    const found = readabilityAlgorithms.find(opt => opt.value === algorithm);
    return found ? found.label : "Not specified";
  }

  // Function to get content type label text
  const getContentTypeLabel = (): string => {
    const found = contentTypes.find(opt => opt.value === contentType);
    return found ? found.label : "Not specified";
  }

  return (
    <TooltipProvider>
      <div className="container mx-auto max-w-6xl">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6 bg-gray-100">
            <TabsTrigger
              value="edit"
              className="text-base py-3 data-[state=active]:bg-primary data-[state=active]:text-white"
            >
              <FileText className="h-4 w-4 mr-2" /> Text Input
            </TabsTrigger>
            <TabsTrigger
              value="results"
              className="text-base py-3 data-[state=active]:bg-primary data-[state=active]:text-white"
              disabled={!readabilityResults && !loading}
            >
              <BarChart className="h-4 w-4 mr-2" /> Readability Results
            </TabsTrigger>
          </TabsList>

          <TabsContent value="edit" className="mt-0">
            <div className="grid gap-8 md:grid-cols-3">
              <Card className="col-span-3 md:col-span-2 shadow-lg border-primary/10">
                <CardHeader className="bg-gray-50/50 border-b">
                  <CardTitle className="text-xl flex items-center text-primary">
                    <FileText className="mr-2 h-5 w-5" />
                    Readability Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 p-6">
                  <div>
                    <Label htmlFor="text" className="text-base flex items-center">
                      Text to Analyze
                      <span className="text-destructive ml-1">*</span>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="ml-2 h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          Paste the text you want to analyze for readability
                        </TooltipContent>
                      </Tooltip>
                    </Label>
                    <Textarea
                      id="text"
                      placeholder="Paste your text here to check its readability..."
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      rows={8}
                      className="mt-1.5 border-primary/20 focus:ring-primary/50"
                    />
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-muted-foreground mt-2">
                        {text.split(/\s+/).length} words | {text.length} characters
                      </p>
                      {text.length > 0 && (
                        <Badge variant="secondary" className="mt-2">
                          {text.split(/\s+/).length > 500 ? 'Long Text' : 'Short Text'}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <div className="flex items-center mb-1.5">
                        <Layers className="h-4 w-4 mr-1.5 text-muted-foreground" />
                        <Label htmlFor="algorithm" className="text-base">
                          Readability Algorithm
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="ml-2 h-4 w-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              {readabilityAlgorithms.find(a => a.value === algorithm)?.description}
                            </TooltipContent>
                          </Tooltip>
                        </Label>
                      </div>
                      <Select value={algorithm} onValueChange={setAlgorithm}>
                        <SelectTrigger className="border-primary/20 focus:ring-primary/50">
                          <SelectValue placeholder="Select algorithm" />
                        </SelectTrigger>
                        <SelectContent>
                          {readabilityAlgorithms.map(algo => (
                            <SelectItem key={algo.value} value={algo.value}>
                              {algo.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <div className="flex items-center mb-1.5">
                        <Target className="h-4 w-4 mr-1.5 text-muted-foreground" />
                        <Label htmlFor="contentType" className="text-base">Content Type</Label>
                      </div>
                      <Select value={contentType} onValueChange={setContentType}>
                        <SelectTrigger className="border-primary/20 focus:ring-primary/50">
                          <SelectValue placeholder="Select content type" />
                        </SelectTrigger>
                        <SelectContent>
                          {contentTypes.map(type => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between border-t pt-6 bg-gray-50/50">
                  <Button
                    variant="outline"
                    onClick={resetForm}
                    disabled={loading}
                    className="hover:bg-gray-100"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Reset
                  </Button>
                  <Button
                    onClick={analyzeReadability}
                    disabled={loading}
                    className="px-6 bg-primary hover:bg-primary/90"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : "Analyze Readability"}
                  </Button>
                </CardFooter>
              </Card>

              <Card className="col-span-3 md:col-span-1 h-fit shadow-lg border-primary/10">
                <CardHeader className="bg-gray-50/50 border-b">
                  <CardTitle className="text-lg">Analysis Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 p-6">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">
                      Readability Algorithm
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="ml-2 h-4 w-4 inline-block text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          {readabilityAlgorithms.find(a => a.value === algorithm)?.description}
                        </TooltipContent>
                      </Tooltip>
                    </h4>
                    <p className="font-medium">{getAlgorithmLabel()}</p>
                  </div>
                  <Separator />
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Content Type</h4>
                    <p>{getContentTypeLabel()}</p>
                  </div>
                  <Separator />
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Text Statistics</h4>
                    <div className="flex justify-between">
                      <p>Words:</p>
                      <Badge variant="secondary">{text.split(/\s+/).length}</Badge>
                    </div>
                    <div className="flex justify-between mt-1">
                      <p>Characters:</p>
                      <Badge variant="secondary">{text.length}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="results" className="mt-0">
            <Card className="shadow-lg border-primary/10">
              <CardHeader className="flex flex-row items-center justify-between bg-gray-50/50 border-b">
                <CardTitle className="text-xl flex items-center text-primary">
                  <BarChart className="mr-2 h-5 w-5" />
                  Readability Results
                </CardTitle>{readabilityResults && (
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={copyResults}>
                      <Copy className="h-4 w-4 mr-1" /> Copy
                    </Button>
                    <Button variant="outline" size="sm" onClick={downloadResults}>
                      <Download className="h-4 w-4 mr-1" /> Download
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setActiveTab('edit')}>
                      Edit Text
                    </Button>
                  </div>
                )}
              </CardHeader>

              <CardContent>
                <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
                  {loading ? (
                    <div className="flex flex-col items-center justify-center h-[500px] gap-4">
                      <Loader2 className="h-10 w-10 animate-spin text-primary" />
                      <p className="text-muted-foreground">Analyzing readability...</p>
                      <p className="text-xs text-muted-foreground">This may take a few seconds</p>
                    </div>
                  ) : error ? (
                    <div className="text-destructive text-center h-[500px] flex flex-col items-center justify-center p-6">
                      <p className="font-medium mb-2">Error during analysis</p>
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
                  ) : readabilityResults ? (
                    <div className="p-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        {Object.entries(readabilityResults)
                          .filter(([key]) => !['AI Readability Insights'].includes(key))
                          .map(([key, value]) => (
                            <div key={key} className="bg-gray-50 p-4 rounded-lg border border-primary/10 shadow-sm">
                              <h4 className="text-sm font-medium text-muted-foreground mb-2">
                                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                              </h4>
                              <p className="text-lg font-bold text-primary">{value as string}</p>
                            </div>
                          ))
                        }
                      </div>

                      {readabilityResults['AI Readability Insights'] && (
                        <div className="mt-6 bg-gray-50 p-4 rounded-lg border">
                          <h3 className="text-lg font-semibold mb-3 text-primary">
                            AI Readability Insights
                          </h3>
                          <div className="prose prose-sm max-w-none">
                            <ReactMarkdown
                              components={{
                                h1: ({ node, ...props }) => <h2 className="text-xl font-bold mt-4 mb-2" {...props} />,
                                h2: ({ node, ...props }) => <h3 className="text-lg font-semibold mt-3 mb-2" {...props} />,
                                a: ({ node, ...props }) => (
                                  <a
                                    {...props}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline"
                                  />
                                ),
                                ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-3" {...props} />,
                                ol: ({ node, ...props }) => <ol className="list-decimal pl-5 mb-3" {...props} />,
                                code: ({ node, ...props }) => (
                                  <code
                                    className="bg-gray-100 rounded px-1 py-0.5 text-sm"
                                    {...props}
                                  />
                                )
                              }}
                            >
                              {readabilityResults['AI Readability Insights']}
                            </ReactMarkdown>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-muted-foreground text-center h-[500px] flex items-center justify-center p-6">
                      <div>
                        <FileText className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                        <p className="text-lg font-medium mb-2">No Analysis Performed</p>
                        <p className="text-sm max-w-md mx-auto">Enter your text and click "Analyze Readability" to get started.</p>
                      </div>
                    </div>
                  )}
                </div>

                {readabilityResults && (
                  <div className="mt-6 border-t pt-4">
                    <div className="flex flex-wrap items-center gap-2 justify-between">
                      <div>
                        <h4 className="font-medium">Analysis Summary</h4>
                        <p className="text-sm text-muted-foreground mt-1 flex items-center">
                          <span className="mr-2">{algorithm}</span>
                          <Separator orientation="vertical" className="h-4 mr-2" />
                          <span>{contentType}</span>
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => setActiveTab('edit')}>
                          <RefreshCw className="h-4 w-4 mr-1" /> Reanalyze
                        </Button>
                        <Button size="sm" onClick={downloadResults} className="bg-primary hover:bg-primary/90">
                          <Download className="h-4 w-4 mr-1" /> Export
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
    </TooltipProvider>
  )
}