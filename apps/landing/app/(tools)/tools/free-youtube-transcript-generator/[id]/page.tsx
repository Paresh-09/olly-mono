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
      title: 'YouTube Transcript Viewer & Editor | AI-Powered Tools',
      description: 'View and edit YouTube video transcripts. Generate chapters, summaries, key points, and practice questions using AI. Download in multiple formats.',
      keywords: 'youtube transcript, video captions, AI summary, transcript editor, chapter generator, video transcript tools',
      openGraph: {
        title: 'YouTube Transcript Viewer & Editor | AI-Powered Tools',
        description: 'View and edit YouTube video transcripts with AI-powered features.',
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: 'YouTube Transcript Generator | Generate YouTube Video Transcripts',
        description: 'Generate YouTube video transcripts easily. Search through captions and download in multiple formats.',
      },
      alternates: {
        canonical: `https://olly.social/tools/free-youtube-transcript-generator/${params.id}`,
      }
    }
  } catch {
    return {
      title: 'YouTube Transcript Generator',
      description: 'Generate YouTube video transcripts easily. Search through captions and download in multiple formats.',
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