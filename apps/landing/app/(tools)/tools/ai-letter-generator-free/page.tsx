import { Metadata } from 'next'
import { ToolPageLayout } from '../_components/mini-tools/tool-page-layout'
import { AILetterGenerator } from '../_components/mini-tools/ai-letter-generator'
import { toolsData } from '@/data/tool-data'
import { ToolFeatures } from '../_components/mini-tools/tool-features'
import { ToolHowToUse } from '../_components/mini-tools/tool-how-to-use'
import { ToolFAQ } from '../_components/mini-tools/tool-faq'
import { ToolReviewsSection } from '../_components/tool-reviews/review'

export const metadata: Metadata = {
  title: 'AI Business Letter Generator | Free Professional Letter Creator',
  description: 'Create professional business letters with AI in seconds. Generate cover letters, inquiry letters, thank you letters, and more with our free AI letter generator.',
  keywords: 'AI letter generator, business letter writer, professional letter template, cover letter creator, business correspondence, free letter generator, AI writing assistant'
}

export default function AILetterGeneratorPage() {
  const toolData = toolsData['ai-letter-generator-free']

  return (
    <ToolPageLayout
      title="AI Business Letter Generator"
      description="Create professional business letters in seconds with the power of AI"
    >
      <AILetterGenerator />

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mt-8">
        <ToolFeatures tool={toolData} />
        <ToolHowToUse tool={toolData} />
        <ToolFAQ tool={toolData} />
      </div>
        <ToolReviewsSection
            productSlug="ai-letter-generator-free"
            title="Customer Reviews"
          />    
    </ToolPageLayout>
  )
} 