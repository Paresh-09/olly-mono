import { Metadata } from 'next'
import { ToolPageLayout } from '../_components/mini-tools/tool-page-layout'
import { YouTubeTagGenerator } from '../_components/mini-tools/youtube-tag-generator'
import { toolsData } from '@/data/tool-data'
import { ToolFeatures } from '../_components/mini-tools/tool-features'
import { ToolHowToUse } from '../_components/mini-tools/tool-how-to-use'
import { ToolFAQ } from '../_components/mini-tools/tool-faq'
import { ToolReviewsSection } from '../_components/tool-reviews/review'

export const metadata: Metadata = {
  title: 'YouTube Tag Generator | SEO-Optimized YouTube Tags',
  description: 'Create SEO-optimized YouTube tags to boost your video visibility, reach more viewers, and increase engagement with our AI-powered tag generator.',
  keywords: 'YouTube tag generator, YouTube SEO, video tags, YouTube optimization, video keywords, YouTube visibility, video search optimization, YouTube ranking'
}

export default function YouTubeTagGeneratorPage() {
  const toolData = toolsData["youtube-tag-generator"]
  
  return (
    <ToolPageLayout
      title="YouTube Tag Generator"
      description="Generate SEO-optimized tags to help your videos get more views"
    >
      <YouTubeTagGenerator />
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mt-8">
        <ToolFeatures tool={toolData} />
        <ToolHowToUse tool={toolData} />
        <ToolFAQ tool={toolData} />
      </div>
      <ToolReviewsSection
          productSlug="youtube-tag-generator"
          title="Customer Reviews"
        />
    </ToolPageLayout>
  )
}