import { Metadata } from "next";
import { TikTokAuditComponent } from "../_components/audit/tiktok-audit";
import { BenefitsList } from "../_components/mini-tools/benefits-list";
import { ToolReviewsSection } from "../_components/tool-reviews/review";

export const metadata: Metadata = {
  title: "TikTok Profile Audit | Performance Analysis Tool",
  description:
    "Professional-grade TikTok audit tool. Get detailed performance insights and optimization recommendations for your TikTok profile.",
  openGraph: {
    title: "TikTok Profile Audit | Performance Analysis Tool",
    description:
      "Professional-grade TikTok audit tool with AI-powered recommendations.",
    type: "website",
  },
  keywords:
    "tiktok audit, profile analysis, engagement metrics, tiktok optimization, content strategy, audience insights, tiktok analytics, viral content",
};

const benefits = [
  {
    title: "Viral Potential Analysis",
    description: "Learn what makes your top-performing content successful",
  },
  {
    title: "Algorithm Optimization",
    description:
      "Understand how to work with TikTok's algorithm for maximum reach",
  },
  {
    title: "Content Strategy Review",
    description: "Analyze which sounds, effects, and trends perform best",
  },
  {
    title: "Growth Techniques",
    description:
      "Get customized recommendations to increase followers and views",
  },
];

export default function TikTokAuditPage() {
  return (
    <div className="container py-8 space-y-8">
      <TikTokAuditComponent />
      <div className="max-w-4xl mx-auto">
        <BenefitsList benefits={benefits} />
        <ToolReviewsSection
          productSlug="tiktok-audit"
          title="social-media-image-resizer"
        />
      </div>
    </div>
  );
}
