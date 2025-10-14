'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@repo/ui/components/ui/card'
import { Input } from '@repo/ui/components/ui/input'
import { Textarea } from '@repo/ui/components/ui/textarea'
import { Button } from '@repo/ui/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/components/ui/select'
import { Label } from '@repo/ui/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/ui/components/ui/tabs'
import { Loader2, Copy, Download, RefreshCw, Image as ImageIcon, Palette, BookOpen, Settings } from 'lucide-react'
import { useToast } from '@repo/ui/hooks/use-toast'
import { Separator } from '@repo/ui/components/ui/separator'
import { Checkbox } from '@repo/ui/components/ui/checkbox'

// Define types for our options
type StyleOption = {
  value: string;
  label: string;
}

type AspectRatioOption = {
  value: string;
  label: string;
}

type ColorPaletteOption = {
  value: string;
  label: string;
}

export function AICourseImageGenerator() {
  const { toast } = useToast()
  const [courseName, setCourseName] = useState<string>('')
  const [courseSubject, setCourseSubject] = useState<string>('')
  const [additionalDetails, setAdditionalDetails] = useState<string>('')
  const [imageStyle, setImageStyle] = useState<string>('modern-minimal')
  const [aspectRatio, setAspectRatio] = useState<string>('16:9')
  const [colorPalette, setColorPalette] = useState<string>('professional')
  const [includeTextOverlay, setIncludeTextOverlay] = useState<boolean>(true)
  const [includeIcons, setIncludeIcons] = useState<boolean>(true)
  const [loading, setLoading] = useState<boolean>(false)
  const [generatedImage, setGeneratedImage] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<string>('edit')

  const imageStyles: StyleOption[] = [
    { value: 'modern-minimal', label: 'Modern Minimal' },
    { value: 'vibrant-illustrative', label: 'Vibrant Illustrative' },
    { value: 'professional-photo', label: 'Professional Photo' },
    { value: 'abstract-geometric', label: 'Abstract Geometric' },
    { value: 'hand-drawn', label: 'Hand-Drawn Style' }
  ]

  const aspectRatioOptions: AspectRatioOption[] = [
    { value: '16:9', label: 'Landscape (16:9)' },
    { value: '1:1', label: 'Square (1:1)' },
    { value: '9:16', label: 'Portrait (9:16)' },
    { value: '4:3', label: 'Standard (4:3)' }
  ]

  const colorPaletteOptions: ColorPaletteOption[] = [
    { value: 'professional', label: 'Professional Blues' },
    { value: 'creative', label: 'Creative Pastels' },
    { value: 'tech', label: 'Tech Gradients' },
    { value: 'education', label: 'Educational Warm' },
    { value: 'minimalist', label: 'Minimalist Neutrals' }
  ]

  const generateImage = async (): Promise<void> => {
    if (!courseName) {
      toast({
        title: "Missing information",
        description: "Please enter a course name to generate an image.",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    setError(null)
    
    try {
      // Call our API endpoint
      const response = await fetch('/api/tools/ai-course-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseName,
          courseSubject,
          additionalDetails,
          imageStyle,
          aspectRatio,
          colorPalette,
          includeTextOverlay,
          includeIcons
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate course image');
      }
      
      setGeneratedImage(data.imageUrl);
      setActiveTab('preview');
      
      toast({
        title: "Image generated",
        description: "Your course image has been created successfully.",
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

  const downloadImage = (): void => {
    if (!generatedImage) return;

    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `${courseName.replace(/\s+/g, '-').toLowerCase()}-course-image.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const resetForm = (): void => {
    setCourseName('')
    setCourseSubject('')
    setAdditionalDetails('')
    setImageStyle('modern-minimal')
    setAspectRatio('16:9')
    setColorPalette('professional')
    setIncludeTextOverlay(true)
    setIncludeIcons(true)
    setGeneratedImage('')
    setError(null)
    setActiveTab('edit')
  }

  // Function to get style label text
  const getStyleLabel = (): string => {
    const found = imageStyles.find(opt => opt.value === imageStyle);
    return found ? found.label : "Not specified";
  }

  // Function to get aspect ratio label text
  const getAspectRatioLabel = (): string => {
    const found = aspectRatioOptions.find(opt => opt.value === aspectRatio);
    return found ? found.label : "Not specified";
  }

  // Function to get color palette label text
  const getColorPaletteLabel = (): string => {
    const found = colorPaletteOptions.find(opt => opt.value === colorPalette);
    return found ? found.label : "Not specified";
  }

  return (
    <div className="container mx-auto max-w-6xl">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="edit" className="text-base py-3">
            <ImageIcon className="h-4 w-4 mr-2" /> Image Parameters
          </TabsTrigger>
          <TabsTrigger value="preview" className="text-base py-3" disabled={!generatedImage && !loading}>
            <Download className="h-4 w-4 mr-2" /> Generated Image
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="edit" className="mt-0">
          <div className="grid gap-8 md:grid-cols-3">
            <Card className="col-span-3 md:col-span-2">
              <CardHeader>
                <CardTitle className="text-xl flex items-center">
                  <ImageIcon className="mr-2 h-5 w-5 text-primary" />
                  Course Image Design
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
                      <div className="flex items-center mb-1.5">
                        <Palette className="h-4 w-4 mr-1.5 text-muted-foreground" />
                        <Label htmlFor="imageStyle" className="text-base">Image Style</Label>
                      </div>
                      <Select value={imageStyle} onValueChange={setImageStyle}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select image style" />
                        </SelectTrigger>
                        <SelectContent>
                          {imageStyles.map(style => (
                            <SelectItem key={style.value} value={style.value}>
                              {style.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <div className="flex items-center mb-1.5">
                        <Settings className="h-4 w-4 mr-1.5 text-muted-foreground" />
                        <Label htmlFor="aspectRatio" className="text-base">Aspect Ratio</Label>
                      </div>
                      <Select value={aspectRatio} onValueChange={setAspectRatio}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select aspect ratio" />
                        </SelectTrigger>
                        <SelectContent>
                          {aspectRatioOptions.map(ratio => (
                            <SelectItem key={ratio.value} value={ratio.value}>
                              {ratio.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <div className="flex items-center mb-1.5">
                        <Palette className="h-4 w-4 mr-1.5 text-muted-foreground" />
                        <Label htmlFor="colorPalette" className="text-base">Color Palette</Label>
                      </div>
                      <Select value={colorPalette} onValueChange={setColorPalette}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select color palette" />
                        </SelectTrigger>
                        <SelectContent>
                          {colorPaletteOptions.map(palette => (
                            <SelectItem key={palette.value} value={palette.value}>
                              {palette.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="additionalDetails" className="text-base">Additional Image Details</Label>
                    <Textarea 
                      id="additionalDetails"
                      placeholder="Specific imagery, concepts, or elements you want to include"
                      value={additionalDetails}
                      onChange={(e) => setAdditionalDetails(e.target.value)}
                      rows={3}
                      className="mt-1.5"
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <Label className="text-base">Image Options</Label>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="includeTextOverlay" 
                        checked={includeTextOverlay} 
                        onCheckedChange={(checked) => setIncludeTextOverlay(checked as boolean)}
                      />
                      <Label htmlFor="includeTextOverlay" className="cursor-pointer">Include Course Name Overlay</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="includeIcons" 
                        checked={includeIcons} 
                        onCheckedChange={(checked) => setIncludeIcons(checked as boolean)}
                      />
                      <Label htmlFor="includeIcons" className="cursor-pointer">Include Subject-Related Icons</Label>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t pt-6">
                <Button variant="outline" onClick={resetForm} disabled={loading}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reset Form
                </Button>
                <Button onClick={generateImage} disabled={loading} className="px-6">
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : "Generate Image"}
                </Button>
              </CardFooter>
            </Card>
            
            <Card className="col-span-3 md:col-span-1 h-fit">
              <CardHeader>
                <CardTitle className="text-lg">Image Summary</CardTitle>
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
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Image Style</h4>
                    <p>{getStyleLabel()}</p>
                  </div>
                  <Separator />
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Aspect Ratio</h4>
                    <p>{getAspectRatioLabel()}</p>
                  </div>
                  <Separator />
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Color Palette</h4>
                    <p>{getColorPaletteLabel()}</p>
                    </div>
                  <Separator />
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Image Options</h4>
                    <div className="space-y-1">
                      {includeTextOverlay && <p className="text-sm">• Course Name Overlay</p>}
                      {includeIcons && <p className="text-sm">• Subject Icons</p>}
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
                <ImageIcon className="mr-2 h-5 w-5 text-primary" />
                Generated Course Image
              </CardTitle>
              
              {generatedImage && (
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={downloadImage}>
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
                    <p className="text-muted-foreground">Generating your course image...</p>
                    <p className="text-xs text-muted-foreground">This may take up to 30 seconds</p>
                  </div>
                ) : error ? (
                  <div className="text-destructive text-center h-[500px] flex flex-col items-center justify-center p-6">
                    <p className="font-medium mb-2">Error generating image</p>
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
                ) : generatedImage ? (
                  <div className="p-6 flex justify-center items-center">
                    <div className="max-w-full overflow-hidden rounded-lg shadow-md">
                      <Image 
                        src={generatedImage} 
                        alt={`Generated image for ${courseName}`}
                        width={1200}
                        height={675}
                        className="max-w-full h-auto object-contain"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="text-muted-foreground text-center h-[500px] flex items-center justify-center p-6">
                    <div><ImageIcon className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                      <p className="text-lg font-medium mb-2">No Image Generated Yet</p>
                      <p className="text-sm max-w-md mx-auto">Fill in the course image parameters and click "Generate Image" to create your custom visual.</p>
                    </div>
                  </div>
                )}
              </div>
              
              {generatedImage && (
                <div className="mt-6 border-t pt-4">
                  <div className="flex flex-wrap items-center gap-2 justify-between">
                    <div>
                      <h4 className="font-medium">Image Details</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {courseName ? courseName : "Untitled Course"} • {getStyleLabel()}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => setActiveTab('edit')}>
                        <RefreshCw className="h-4 w-4 mr-1" /> Edit & Regenerate
                      </Button>
                      <Button size="sm" onClick={downloadImage}>
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