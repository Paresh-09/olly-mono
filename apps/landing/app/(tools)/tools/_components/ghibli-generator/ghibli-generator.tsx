'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@repo/ui/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@repo/ui/components/ui/card'
import { Textarea } from '@repo/ui/components/ui/textarea'
import { useToast } from '@repo/ui/hooks/use-toast'
import { Upload, Loader2, Download, Copy, Image as ImageIcon, Clock, CreditCard, AlertCircle, Youtube, FileStack } from 'lucide-react'
import Image from 'next/image'
import AuthPopup from '../authentication'
import Link from 'next/link'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/ui/select"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@repo/ui/components/ui/tabs"
import { formatDistanceToNow } from 'date-fns'
import { Alert, AlertDescription } from "@repo/ui/components/ui/alert"

type Generation = {
  id: string
  prompt: string
  revisedPrompt: string
  imageUrl: string
  size: string
  createdAt: string
}

export const GhibliImageGenerator = () => {
  const isTemporarilyDisabled = false; // Set to false to enable the generator
  const [isGenerating, setIsGenerating] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [revisedPrompt, setRevisedPrompt] = useState<string>('')
  const [prompt, setPrompt] = useState<string>('')
  const [file, setFile] = useState<File | null>(null)
  const [size, setSize] = useState<string>("1024x1024")
  const [model, setModel] = useState<string>("gpt-image-1") // Default to new GPT-Image-1 model
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false)
  const [showAuthDialog, setShowAuthDialog] = useState(false)
  const [previousGenerations, setPreviousGenerations] = useState<Generation[]>([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const [activeTab, setActiveTab] = useState("create")
  const [creditsRemaining, setCreditsRemaining] = useState<number>(0)

  // Check if user is logged in and fetch history
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/check');
        const data = await response.json();
        const isAuthenticated = data.authenticated;
        setIsLoggedIn(isAuthenticated);

        if (isAuthenticated) {
          fetchUserCredits();
          fetchGenerationHistory();
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        setIsLoggedIn(false);
      }
    };

    checkAuth();
  }, []);

  const fetchUserCredits = async () => {
    try {
      const response = await fetch('/api/user/credits');
      if (response.ok) {
        const data = await response.json();
        setCreditsRemaining(data.credits);
      }
    } catch (error) {
      console.error('Error fetching user credits:', error);
    }
  };

  const fetchGenerationHistory = async () => {
    if (!isLoggedIn) return;

    setIsLoadingHistory(true);
    try {
      const response = await fetch('/api/tools/picasso');
      if (response.ok) {
        const data = await response.json();
        // Filter only ghibli style generations
        const ghibliGenerations = data.generations.filter((gen: any) => gen.style === 'ghibli');
        setPreviousGenerations(ghibliGenerations);
      }
    } catch (error) {
      console.error('Error fetching generation history:', error);
      toast({
        title: 'Error',
        description: 'Failed to load your previous generations',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const selectedFile = files[0]

      // Validate file type
      if (!selectedFile.type.startsWith('image/')) {
        toast({
          title: 'Invalid file type',
          description: 'Please upload an image file',
          variant: 'destructive',
        })
        return
      }

      // Validate file size (max 20MB)
      if (selectedFile.size > 20 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Please upload an image smaller than 20MB',
          variant: 'destructive',
        })
        return
      }

      setFile(selectedFile)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(selectedFile)
    }
  }

  const handleBrowseClick = () => {
    fileInputRef.current?.click()
  }

  const handleGenerate = async () => {
    if (!isLoggedIn) {
      setShowAuthDialog(true)
      return
    }

    if (creditsRemaining < 5) {
      toast({
        title: 'Insufficient credits',
        description: 'You need at least 5 credits to generate an image',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true)

    try {
      const formData = new FormData()
      if (file) {
        formData.append('image0', file) // Changed to image0 as per Picasso API
      }
      if (prompt) {
        formData.append('prompt', prompt)
      }
      formData.append('size', size)
      formData.append('quality', 'auto')
      formData.append('style', 'ghibli') // Explicitly hardcode ghibli style

      // Use the Picasso API endpoint
      const response = await fetch('/api/tools/picasso', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        if (response.status === 402) {
          throw new Error('Insufficient credits. You need 5 credits to generate an image.');
        }
        throw new Error('Failed to generate image');
      }

      const data = await response.json()

      // Extract the first result from Picasso API response
      if (data.results && data.results.length > 0) {
        const result = data.results[0];
        setGeneratedImage(result.generatedImageUrl)
        setRevisedPrompt(result.prompt || '')
        setCreditsRemaining(data.creditsRemaining)

        // Add the new generation to the list
        setPreviousGenerations(prev => [{
          id: result.id,
          prompt: prompt,
          revisedPrompt: result.prompt,
          imageUrl: result.generatedImageUrl,
          size: size,
          createdAt: new Date().toISOString()
        }, ...prev]);

        toast({
          title: 'Image generated',
          description: 'Your Ghibli-style image has been created',
        })
      } else {
        throw new Error('No image generated in the response');
      }
    } catch (error) {
      console.error('Error generating image:', error)
      toast({
        title: 'Generation failed',
        description: error instanceof Error ? error.message : 'Failed to generate the image. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleReset = () => {
    setImagePreview(null)
    setFile(null)
    setGeneratedImage(null)
    setRevisedPrompt('')
    setPrompt('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleAuthSuccess = () => {
    setIsLoggedIn(true);
    fetchUserCredits();
    fetchGenerationHistory();
  };

  const handleDownload = async (imageUrl: string) => {
    if (!imageUrl) return;

    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ghibli-image-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading image:', error);
      toast({
        title: 'Download failed',
        description: 'Failed to download the image. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleCopyPrompt = (textToCopy: string) => {
    if (!textToCopy) return;

    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        toast({
          title: 'Prompt copied',
          description: 'The prompt has been copied to your clipboard',
        });
      })
      .catch(() => {
        toast({
          title: 'Copy failed',
          description: 'Failed to copy the prompt. Please try again.',
          variant: 'destructive',
        });
      });
  };

  const reusePreviousPrompt = (previousPrompt: string) => {
    setPrompt(previousPrompt);
    setActiveTab("create");
  };

  return (
    <>
      <Card className="w-full  mx-auto">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Ghibli Image Generator</CardTitle>
              <CardDescription>
                Generate a Studio Ghibli style image from your prompt or upload a reference image
              </CardDescription>
            </div>
            {isLoggedIn && !isTemporarilyDisabled && (
              <div className="flex items-center bg-muted px-3 py-1 rounded-full text-sm">
                <CreditCard className="h-4 w-4 mr-2 text-primary" />
                <span>{creditsRemaining} credit{creditsRemaining !== 1 ? 's' : ''}</span>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent>
          {isTemporarilyDisabled ? (
            <div className="py-8 text-center space-y-6">
              <AlertCircle className="h-12 w-12 mx-auto text-amber-500" />

              <div className="space-y-3">
                <h3 className="text-xl font-semibold">Temporarily Unavailable</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  We've hit our rate limit with the image generation API. The Ghibli Image Generator
                  is temporarily unavailable.
                </p>
              </div>

              <div className="bg-muted p-4 rounded-lg max-w-md mx-auto">
                <h4 className="font-medium mb-2">Want to try Ghibli image generation?</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Sign up or log in first to access our tools. Then, while you wait for our service to be back online, you can use this tutorial:
                </p>
                {isLoggedIn ? (
                  <Button
                    variant="default"
                    className="w-full"
                    onClick={() => window.open("https://youtu.be/Aqe4m5c9M7M", "_blank")}
                  >
                    <Youtube className="h-4 w-4 mr-2" />
                    Watch Video Tutorial
                  </Button>
                ) : (
                  <Button
                    variant="default"
                    className="w-full"
                    onClick={() => setShowAuthDialog(true)}
                  >
                    Sign Up / Log In
                  </Button>
                )}
                {isLoggedIn && (
                  <p className="text-xs text-muted-foreground mt-3">
                    Note: This tutorial shows how to use ChatGPT to generate Ghibli-style images and works with the free version of ChatGPT.
                  </p>
                )}
              </div>

              <p className="text-sm text-muted-foreground">
                Our team is working to restore the Ghibli Image Generator. Thanks for your patience!
              </p>
            </div>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="create">Create</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>

              <TabsContent value="create" className="space-y-6">
                {creditsRemaining < 5 && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    <AlertDescription>
                      You need at least 5 credits to generate an image. Visit your dashboard to get more credits.
                    </AlertDescription>
                  </Alert>
                )}

                <Alert className="mb-4">
                  <FileStack className="h-4 w-4 mr-2" />
                  <AlertDescription>
                    Need to generate multiple Ghibli-style images at once? Visit our{" "}
                    <Link href="/dashboard/tools/picasso" className="font-medium underline">
                      Picasso Bulk Image Generator
                    </Link>{" "}
                    tool.
                  </AlertDescription>
                </Alert>

                {/* Optional Reference Image Upload Area */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reference Image (Optional)
                  </label>
                  <div
                    className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center h-48 cursor-pointer transition-colors ${imagePreview ? 'border-gray-300' : 'border-gray-300 hover:border-gray-400'
                      }`}
                    onClick={handleBrowseClick}
                  >
                    {imagePreview ? (
                      <div className="relative w-full h-full">
                        <Image
                          src={imagePreview}
                          alt="Reference image"
                          fill
                          className="object-contain"
                        />
                      </div>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500 mb-1">
                          Upload a reference image (optional)
                        </p>
                        <p className="text-xs text-gray-400">
                          PNG, JPG, WEBP or GIF (max. 20MB)
                        </p>
                      </>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      accept="image/png,image/jpeg,image/webp,image/gif"
                      onChange={handleImageUpload}
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Upload a reference image to inspire the Ghibli style generation
                  </p>
                </div>

                {/* Prompt Input */}
                <div>
                  <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-1">
                    Prompt
                  </label>
                  <Textarea
                    id="prompt"
                    placeholder="Create a magical forest with a small cottage, a winding path, and spirits hiding among the trees in Studio Ghibli style..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="resize-none h-24"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Describe what you want to see in your Ghibli-style image
                  </p>
                </div>

                {/* Image Size Selection */}
                <div>
                  <label htmlFor="size" className="block text-sm font-medium text-gray-700 mb-1">
                    Image Size
                  </label>
                  <Select value={size} onValueChange={setSize}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1024x1024">Square (1024x1024)</SelectItem>
                      <SelectItem value="1024x1536">Portrait (1024x1536)</SelectItem>
                      <SelectItem value="1536x1024">Landscape (1536x1024)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Generated Image */}
                {generatedImage && (
                  <div className="space-y-4">
                    <div className="relative aspect-square w-full border rounded-md overflow-hidden">
                      <Image
                        src={generatedImage}
                        alt="Generated Ghibli image"
                        fill
                        className="object-contain"
                      />
                    </div>

                    {revisedPrompt && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex justify-between items-start">
                          <h3 className="text-sm font-medium text-gray-700 mb-2">Prompt Used</h3>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopyPrompt(revisedPrompt)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-sm text-gray-600">{revisedPrompt}</p>
                      </div>
                    )}

                    <div className="flex justify-center">
                      <Button
                        variant="outline"
                        onClick={() => handleDownload(generatedImage)}
                        className="flex items-center"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download Image
                      </Button>
                    </div>
                  </div>
                )}

                <div className="flex justify-between pt-4">
                  <Button
                    variant="outline"
                    onClick={handleReset}
                    disabled={isGenerating}
                  >
                    Reset
                  </Button>
                  <Button
                    onClick={handleGenerate}
                    disabled={isGenerating || creditsRemaining < 5}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <ImageIcon className="mr-2 h-4 w-4" />
                        Generate Image (5 credits)
                      </>
                    )}
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="history">
                {isLoadingHistory ? (
                  <div className="flex justify-center items-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : previousGenerations.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <h3 className="text-lg font-medium">No generations yet</h3>
                    <p className="mt-2">Your Ghibli-style images will appear here</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {previousGenerations.map((gen) => (
                      <div key={gen.id} className="border rounded-lg overflow-hidden">
                        <div className="relative aspect-square w-full">
                          <Image
                            src={gen.imageUrl}
                            alt="Generated image"
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center text-xs text-muted-foreground">
                              <Clock className="h-3 w-3 mr-1" />
                              {formatDistanceToNow(new Date(gen.createdAt), { addSuffix: true })}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {gen.size}
                            </div>
                          </div>
                          <div className="flex space-x-2 mt-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="flex-1 h-8"
                              onClick={() => handleCopyPrompt(gen.revisedPrompt)}
                            >
                              <Copy className="h-3 w-3 mr-1" />
                              <span className="text-xs">Copy Prompt</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="flex-1 h-8"
                              onClick={() => handleDownload(gen.imageUrl)}
                            >
                              <Download className="h-3 w-3 mr-1" />
                              <span className="text-xs">Download</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="flex-1 h-8"
                              onClick={() => reusePreviousPrompt(gen.prompt)}
                            >
                              <ImageIcon className="h-3 w-3 mr-1" />
                              <span className="text-xs">Reuse</span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>

      {showAuthDialog && (
        <AuthPopup
          isOpen={showAuthDialog}
          onClose={() => setShowAuthDialog(false)}
          onSuccess={handleAuthSuccess}
        />
      )}
    </>
  )
}