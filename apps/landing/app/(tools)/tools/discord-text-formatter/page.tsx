import { Metadata } from 'next'
import { ToolPageLayout } from '../_components/mini-tools/tool-page-layout'
import { DiscordFormatter } from '../_components/mini-tools/discord-formatter'
import { BenefitsList } from '../_components/mini-tools/benefits-list'
import { ToolReviewsSection } from '../_components/tool-reviews/review'
import { ToolContentSections } from '../_components/tool-sections/tool-content-sections'
import { toolDetails } from '@/data/tool-details'

export const metadata: Metadata = {
  title: 'Discord Text Formatter | Style Your Messages with Bold, Italic, Small Text & More',
  description: 'Free Discord text formatting tool. Create bold, italic, underline, strikethrough, spoilers, code blocks, and small text for Discord messages.',
  keywords: 'discord text formatter, discord formatting, discord text styles, discord markdown, discord bold text, discord italic, discord small text',
  openGraph: {
    title: 'Discord Text Formatter | All-in-One Discord Styling Tool',
    description: 'Style your Discord messages with bold, italic, small text, and more. Free online Discord text formatter.',
    type: 'website',
  }
}



const FormattingGuide = () => {
  return (
    <div className="mt-12 prose max-w-none">
      <h2 className="text-2xl font-bold mb-4">Discord Text Formatting Guide</h2>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-xl font-semibold mb-3">Basic Formatting</h3>
          <ul className="space-y-2">
            <li><strong>Bold:</strong> Surround text with **asterisks**</li>
            <li><em>Italic:</em> Surround text with *single asterisks*</li>
            <li><u>Underline:</u> Surround text with __underscores__</li>
            <li><del>Strikethrough:</del> Surround text with ~~tildes~~</li>
          </ul>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-3">Advanced Formatting</h3>
          <ul className="space-y-2">
            <li><strong>Spoilers:</strong> Surround text with ||pipes||</li>
            <li><strong>Code Blocks:</strong> Surround with ```three backticks```</li>
            <li><strong>Quotes:</strong> Start line with &gt; </li>
            <li><strong>Small Text:</strong> Use `sup text`</li>
          </ul>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-3">Formatting Tips</h3>
        <ul className="list-disc pl-5 space-y-2">
          <li>You can combine multiple formatting styles</li>
          <li>Code blocks support syntax highlighting by specifying the language</li>
          <li>Use quotes for responses or citations</li>
          <li>Spoilers are great for hiding sensitive information</li>
        </ul>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-3">Common Combinations</h3>
        <ul className="list-disc pl-5 space-y-2">
          <li>***Bold and Italic***</li>
          <li>**__Bold and Underline__**</li>
          <li>||**Spoiler Bold**||</li>
          <li>`sup *small italic*`</li>
        </ul>
      </div>
    </div>
  )
}

export default function DiscordFormatterPage() {
  const toolDetail = toolDetails['discord-text-formatter']
  return (
   <>
      <DiscordFormatter />
      <div className="mt-12 max-w-7xl mx-auto">
        <ToolContentSections toolDetail={toolDetail} />
        <FormattingGuide />
      <ToolReviewsSection
        productSlug="discord-text-formatter"
        title="Customer Reviews"
      />
      </div>
      

</>
  )
}