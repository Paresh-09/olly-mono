// app/tools/youtube-transcript-extractor/page.tsx
import { Metadata } from 'next'
import { ToolPageLayout } from '../_components/mini-tools/tool-page-layout'
import { TranscriptLanding } from '../_components/mini-tools/yt-basic-transcript-input'
import { toolDetails } from '@/data/tool-details'
import { ToolContentSections } from '../_components/tool-sections/tool-content-sections'
import { ToolReviewsSection } from '../_components/tool-reviews/review'

export const metadata: Metadata = {
  title: 'YouTube Video Virality Checker | Check YouTube Video Virality',
  description: 'Check YouTube video virality easily. Search through captions, download in multiple formats (TXT, SRT), and get AI-powered virality check.',
  keywords: 'youtube transcript generator, video captions, youtube subtitles, transcript downloader, video transcription tool, caption search, AI summary',
  openGraph: {
    title: 'YouTube Video Virality Checker | Check YouTube Video Virality',
    description: 'Check YouTube video virality easily. Search through captions, download in multiple formats, and get AI-powered virality check.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'YouTube Video Virality Checker | Check YouTube Video Virality',
    description: 'Check YouTube video virality easily. Search through captions, download in multiple formats, and get AI-powered virality check.',
  }
}

export default function YouTubeVideoViralityCheckerPage() {
  const toolDetail = toolDetails['youtube-video-virality-checker']

  return (
    <ToolPageLayout
      title={toolDetail.name}
      description={toolDetail.shortDescription}
    >
      <TranscriptLanding />

      <div className="mt-12">
        <ToolContentSections toolDetail={toolDetail} />
      </div>

      <ToolReviewsSection
        productSlug="free-youtube-video-virality-checker"
        title="Customer Reviews"
      />
    </ToolPageLayout>
  )
}