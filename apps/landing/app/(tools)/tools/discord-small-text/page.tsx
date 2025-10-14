// app/tools/discord-small-text/page.tsx
import { Metadata } from 'next'
import { ToolPageLayout } from '../_components/mini-tools/tool-page-layout'
import { BenefitsList } from '../_components/mini-tools/benefits-list'
import { DiscordTextGenerator } from '../_components/mini-tools/discord-text-generator'
import { ToolReviewsSection } from '../_components/tool-reviews/review'
import { toolDetails } from '@/data/tool-details'
import { ToolContentSections } from '../_components/tool-sections/tool-content-sections'

export const metadata: Metadata = {
  title: 'Discord Small Text Generator | Create Tiny Text for Discord',
  description: 'Free online tool to generate small text for Discord. Create stylish superscript text, tiny letters, and mini text for your Discord messages.',
  keywords: 'discord small text, discord tiny text generator, discord text formatter, discord superscript, discord formatting tool',
  openGraph: {
    title: 'Discord Small Text Generator | Create Tiny Text for Discord',
    description: 'Create stylish small text for your Discord messages instantly. Free online Discord text formatter.',
    type: 'website',
  }
}

const UsageGuide = () => {
  return (
    <div className="mt-12 prose max-w-none">
      <h2 className="text-2xl font-bold mb-4">How to Use Small Text in Discord</h2>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-xl font-semibold mb-3">Single Words</h3>
          <ol className="list-decimal pl-5 space-y-2">
            <li>Type your text in the input field</li>
            <li>Select &quot;Single Word&quot; mode</li>
            <li>Copy either the preview or Discord format</li>
            <li>Paste into Discord</li>
          </ol>
          <p className="mt-2 text-sm text-gray-600">
            Use this for short texts or single words to create superscript characters
          </p>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-3">Full Sentences</h3>
          <ol className="list-decimal pl-5 space-y-2">
            <li>Type your sentence in the input field</li>
            <li>Select &quot;Full Sentence&quot; mode</li>
            <li>Copy the Discord format</li>
            <li>Paste into Discord</li>
          </ol>
          <p className="mt-2 text-sm text-gray-600">
            Perfect for longer texts or entire sentences
          </p>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-3">Tips for Best Results</h3>
        <ul className="list-disc pl-5 space-y-2">
          <li>Keep messages readable by using small text sparingly</li>
          <li>Test the format in a private channel first</li>
          <li>Remember that some special characters may not convert properly</li>
          <li>For mobile users, the &quot;Copy Discord Format&quot; option is recommended</li>
        </ul>
      </div>
    </div>
  )
}


export default function DiscordSmallTextPage() {
  const toolDetail = toolDetails['discord-small-text']
  return (
    <>
      <DiscordTextGenerator />
     <div className='max-w-7xl mx-auto'>
     <UsageGuide />
      <div className="mt-12">
        <ToolContentSections toolDetail={toolDetail} />
      </div>
    
      <ToolReviewsSection
        productSlug="discord-small-text"
        title="Customer Reviews"
      />
     </div>
    </>
  )
}
