import { Metadata } from 'next'
import { ToolPageLayout } from '../_components/mini-tools/tool-page-layout'
import { ToolReviewsSection } from '../_components/tool-reviews/review'
import { ToolContentSections } from '../_components/tool-sections/tool-content-sections'
import { toolDetails } from '@/data/tool-details'
import { FakeDmCreator } from './components/fake-dm-creator'

export const metadata: Metadata = {
  title: 'Fake DM Creator | Mock Any Chat Conversation Instantly',
  description: 'Create fake DM conversations for any platform. Mock chats for Discord, iMessage, Instagram, WhatsApp, and more. Free, easy, and realistic.',
  keywords: 'fake dm creator, mock chat, fake conversation, discord mock, imessage mock, instagram fake chat, whatsapp fake dm',
  openGraph: {
    title: 'Fake DM Creator | Mock Any Chat Conversation Instantly',
    description: 'Create fake DM conversations for any platform. Mock chats for Discord, iMessage, Instagram, WhatsApp, and more. Free, easy, and realistic.',
    type: 'website',
  }
}




export default function FakeDmCreatorPage() {
  const toolDetail = toolDetails['fake-dm-creator']
  return (
    <>
      <FakeDmCreator />
      <div className="mt-12 max-w-7xl mx-auto">
        <ToolContentSections toolDetail={toolDetail} />
        <ToolReviewsSection
          productSlug="olly-dm-creator"
          title="Customer Reviews"
        />
      </div>
    </>
  )
} 