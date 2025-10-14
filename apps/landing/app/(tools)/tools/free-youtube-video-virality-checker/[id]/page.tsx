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
      title: 'YouTube Video Virality Checker | Check YouTube Video Virality',
      description: 'Check YouTube video virality easily. Search through captions and download in multiple formats.',
      keywords: 'youtube transcript, video captions, AI summary, transcript editor, chapter generator, video transcript tools',
      openGraph: {
        title: 'YouTube Video Virality Checker | Check YouTube Video Virality',
        description: 'Check YouTube video virality easily. Search through captions and download in multiple formats.',
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: 'YouTube Video Virality Checker | Check YouTube Video Virality',
        description: 'Check YouTube video virality easily. Search through captions and download in multiple formats.',
      },
      alternates: {
        canonical: `https://olly.social/tools/free-youtube-video-virality-checker/${params.id}`,
      }
    }
  } catch {
    return {
      title: 'YouTube Video Virality Checker',
      description: 'Check YouTube video virality easily. Search through captions and download in multiple formats.',
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