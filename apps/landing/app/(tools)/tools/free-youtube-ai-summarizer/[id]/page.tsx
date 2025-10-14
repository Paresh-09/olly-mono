// app/tools/youtube-transcript-extractor/[id]/page.tsx
import { Metadata } from 'next'
import TranscriptViewer from '../../_components/mini-tools/yt-transcript-copy-edit'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const params = await props.params;
  try {
    // You could potentially fetch video details here using YouTube API if needed
    return {
      title: 'YouTube AI Summarizer | Generate Video Summaries',
      description: 'Generate YouTube video summaries easily. Search through captions, download in multiple formats (TXT, SRT), and get AI-powered summaries and chapters.',
      keywords: 'youtube transcript generator, video captions, youtube subtitles, transcript downloader, video transcription tool, caption search, AI summary',
      openGraph: {
        title: 'YouTube AI Summarizer | Generate Video Summaries',
        description: 'Generate YouTube video summaries easily. Search through captions, download in multiple formats, and get AI-powered summaries.',
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: 'YouTube AI Summarizer | Generate Video Summaries',
        description: 'Generate YouTube video summaries easily. Search through captions, download in multiple formats, and get AI-powered summaries.',
      },
      alternates: {
        canonical: `https://olly.social/tools/free-youtube-ai-summarizer/${params.id}`,
      }
    }
  } catch {
    return {
      title: 'YouTube AI Summarizer',
      description: 'Generate YouTube video summaries easily. Search through captions, download in multiple formats, and get AI-powered summaries.',
    }
  }
}

export default async function TranscriptViewerPage(props: PageProps) {
  const params = await props.params;
  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <TranscriptViewer videoId={params.id} />
    </div>
  )
}