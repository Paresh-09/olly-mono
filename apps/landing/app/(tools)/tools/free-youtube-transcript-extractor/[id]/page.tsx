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
        title: 'YouTube Transcript Viewer & Editor | AI-Powered Tools',
        description: 'View and edit YouTube video transcripts with AI-powered features.',
      },
      alternates: {
        canonical: `https://olly.social/tools/free-youtube-transcript-extractor/${params.id}`,
      }
    }
  } catch {
    return {
      title: 'YouTube Transcript Viewer',
      description: 'View and edit YouTube video transcripts with AI tools.',
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