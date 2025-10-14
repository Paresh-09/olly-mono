import { Metadata } from 'next';
import { YoutubeAuditComponent } from '../_components/audit/youtube-audit';
import { BenefitsList } from '../_components/mini-tools/benefits-list';
import { ToolReviewsSection } from '../_components/tool-reviews/review';

export const metadata: Metadata = {
  title: 'YouTube Channel Audit | Performance Analysis Tool',
  description: 'Professional-grade YouTube channel audit tool. Get detailed performance insights and optimization recommendations for your channel.',
  openGraph: {
    title: 'YouTube Channel Audit | Performance Analysis Tool',
    description: 'Professional-grade YouTube channel audit tool with AI-powered recommendations.',
    type: 'website',
  },
  keywords: 'youtube audit, channel analysis, video engagement metrics, youtube optimization, content strategy, audience insights, youtube analytics',
};

const benefits = [
  {
    title: 'Comprehensive Channel Analysis',
    description: 'Assess your content strategy, thumbnails, titles, and video performance'
  },
  {
    title: 'Audience Engagement Metrics',
    description: 'Understand viewer behaviors and engagement patterns'
  },
  {
    title: 'Content Strategy Insights',
    description: 'Learn which video types perform best with your audience'
  },
  {
    title: 'Growth Recommendations',
    description: 'Get actionable steps to increase subscribers and views'
  }
];

export default function YouTubeAuditPage() {
  return (
    <div className="container py-8 space-y-8">
      <YoutubeAuditComponent />
      <div className="max-w-4xl mx-auto">
        <BenefitsList benefits={benefits} />
      </div>
      <ToolReviewsSection
        productSlug="youtube-audit"
        title="Customer Reviews"
      />
    </div>
  );
}