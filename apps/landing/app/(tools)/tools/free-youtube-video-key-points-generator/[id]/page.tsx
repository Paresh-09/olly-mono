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
      title: 'YouTube Video Key Points Generator | Generate Video Key Points',
      description: 'Generate YouTube video key points easily. Search through captions, download in multiple formats (TXT, SRT), and get AI-powered key points and chapters.',
      keywords: 'youtube transcript generator, video captions, youtube subtitles, transcript downloader, video transcription tool, caption search, AI summary',
      openGraph: {
        title: 'YouTube Video Key Points Generator | Generate Video Key Points',
        description: 'Generate YouTube video key points easily. Search through captions, download in multiple formats, and get AI-powered key points and chapters.',
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: 'YouTube Video Key Points Generator | Generate Video Key Points',
        description: 'Generate YouTube video key points easily. Search through captions, download in multiple formats, and get AI-powered key points and chapters.',
      },
      alternates: {
        canonical: `https://olly.social/tools/free-youtube-video-key-points-generator/${params.id}`,
      }
    }
  } catch {
    return {
      title: 'YouTube Video Key Points Generator',
      description: 'Generate YouTube video key points easily. Search through captions, download in multiple formats, and get AI-powered key points and chapters.',
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