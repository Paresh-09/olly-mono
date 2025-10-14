import { Metadata } from 'next'
import { ToolPageLayout } from '../_components/mini-tools/tool-page-layout'
import { ContentAnalyzerTool } from '../_components/mini-tools/content-analysis'
import { toolDetails } from '@/data/tool-details'  
import { ToolContentSections } from '../_components/tool-sections/tool-content-sections'
import { ToolReviewsSection } from '../_components/tool-reviews/review'

export const metadata: Metadata = {
  title: 'AI Content Detector | Check if Text is AI Generated',
  description: 'Free tool to detect AI-generated content. Get detailed analysis and authenticity score for your social media posts.',
  keywords: 'ai content detector, ai text detector, chatgpt detector, ai content checker',
}

export default function ContentDetectorPage() {
  const toolDetail = toolDetails['ai-content-detector']

  return (
    <ToolPageLayout
      title={toolDetail.name}
      description={toolDetail.shortDescription}
    >
      <ContentAnalyzerTool
        toolType="content-detector"
        placeholder="Paste the content you want to analyze for AI detection..."
      />
      
      <div className="mt-12">
        <ToolContentSections toolDetail={toolDetail} />
      </div>
      
      <ToolReviewsSection 
        productSlug="ai-content-detector"
        title="Customer Reviews"
      />
    </ToolPageLayout>
  )
}