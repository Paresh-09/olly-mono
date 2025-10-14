// app/tools/youtube-transcript-extractor/page.tsx
import { Metadata } from 'next'
import { ToolPageLayout } from '../_components/mini-tools/tool-page-layout'
import { TranscriptLanding } from '../_components/mini-tools/yt-basic-transcript-input'
import { toolDetails } from '@/data/tool-details'
import { ToolContentSections } from '../_components/tool-sections/tool-content-sections'
import { ToolReviewsSection } from '../_components/tool-reviews/review'

export const metadata: Metadata = {
  title: 'Free YouTube Transcript Extractor | Copy & Download Captions',
  description: 'Extract YouTube video transcripts easily. Search through captions, download in multiple formats (TXT, SRT), and get AI-powered summaries and chapters.',
  keywords: 'youtube transcript extractor, video captions, youtube subtitles, transcript downloader, video transcription tool, caption search, AI summary',
  openGraph: {
    title: 'Free YouTube Transcript Extractor | Copy & Download Captions',
    description: 'Extract YouTube video transcripts easily. Search through captions, download in multiple formats, and get AI-powered summaries.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free YouTube Transcript Extractor | Copy & Download Captions',
    description: 'Extract YouTube video transcripts easily. Search through captions, download in multiple formats, and get AI-powered summaries.',
  }
}

export default function TranscriptExtractorPage() {
  const toolDetail = toolDetails['youtube-transcript-extractor']

  return (
   <>
      <TranscriptLanding />

      <div className="mt-12">
        <ToolContentSections toolDetail={toolDetail} />
      </div>
      
      <ToolReviewsSection 
        productSlug={toolDetail.id} 
      />
      </>

  )
}