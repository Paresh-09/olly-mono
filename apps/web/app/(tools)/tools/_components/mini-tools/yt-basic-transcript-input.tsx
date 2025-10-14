'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@repo/ui/components/ui/card'
import { Button } from '@repo/ui/components/ui/button'
import { Input } from '@repo/ui/components/ui/input'
import { useToast } from '@repo/ui/hooks/use-toast'
import { Loader2, Wand, Youtube } from 'lucide-react'
import { getVideoId } from '@/utils/yt-video-id'

export const TranscriptLanding = () => {
  const [videoUrl, setVideoUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const videoId = getVideoId(videoUrl)
    if (!videoId) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid YouTube video URL",
        variant: "destructive"
      })
      return
    }
  
    setLoading(true)
    
    try {
      // Changed from POST to GET request
      const response = await fetch(`/api/tools/youtube/transcript/extractor?videoId=${videoId}`, {
        method: 'GET' // Changed from POST to GET
      })
  
      if (!response.ok) {
        throw new Error('Failed to fetch transcript')
      }
  
      router.push(`/tools/free-youtube-transcript-extractor/${videoId}`)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch transcript. Please make sure the video has captions available.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-fit bg-red-50 p-4 pt-10 pb-20">
      <div className="w-full max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center">
              <Youtube className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Free YouTube Transcript Extractor            </h1>
          </div>
          <p className="text-gray-600">Easily copy the entire caption of a youtube video in one click, search the transcript, and jump to the exact point in the video.</p>
        </div>

        <Card className="shadow-lg bg-white border-gray-200">
          <CardContent className="p-6">
            <div className="space-y-6">
              <div>
                <p className="text-center text-gray-600 mt-2">
                  Easily copy the entire caption of a YouTube video in one click, search the transcript, and jump to the exact point in the video.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Enter YouTube Video Url
                  </label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="https://www.youtube.com/watch?v=..."
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      className="flex-1 bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                    />
                    <Button type="submit" disabled={loading} className="bg-red-600 hover:bg-red-700 text-white">
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Getting Transcript...
                        </>
                      ) : (
                        <>
                          <Wand className="mr-2 h-4 w-4" />
                          Get Transcript
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <FeatureCard
            icon="🎯"
            title="Free Extraction"
            description="Extract the entire transcript from any video for free."
          />
          <FeatureCard
            icon="⚡"
            title="Fast & Reliable"
            description="Get YouTube video captions with just 1 click! Copy or Download as .txt, .srt, .vtt or .csv"
          />
          <FeatureCard
            icon="🤖"
            title="Summarize with AI"
            description="Summarize a YouTube Video with the help of AI. Save time by reading the summary of the video transcript."
          />
        </div>
      </div>
    </div>
  )
}

const FeatureCard = ({ icon, title, description }: { icon: string; title: string; description: string }) => (
  <Card className="p-4 bg-white border-gray-200">
    <div className="text-3xl mb-2">{icon}</div>
    <h3 className="font-semibold mb-1 text-gray-900">{title}</h3>
    <p className="text-sm text-gray-600">{description}</p>
  </Card>
)

export default TranscriptLanding