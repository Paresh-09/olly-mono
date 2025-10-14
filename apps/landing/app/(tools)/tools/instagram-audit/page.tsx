import { Metadata } from "next";
import { InstagramAuditComponent } from "../_components/audit/instagram-audit";
import { BenefitsList } from "../_components/mini-tools/benefits-list";
import { ToolReviewsSection } from "../_components/tool-reviews/review";

export const metadata: Metadata = {
  title: "Instagram Profile Audit | Performance Analysis Tool",
  description:
    "Professional-grade Instagram audit tool. Get detailed performance insights and optimization recommendations for your Instagram profile.",
  openGraph: {
    title: "Instagram Profile Audit | Performance Analysis Tool",
    description:
      "Professional-grade Instagram audit tool with AI-powered recommendations.",
    type: "website",
  },
  keywords:
    "instagram audit, profile analysis, engagement metrics, instagram optimization, content strategy, audience insights, instagram analytics",
};

const benefits = [
  {
    title: "Profile Optimization",
    description:
      "Analyze bio, highlights, hashtag usage, and profile aesthetics",
  },
  {
    title: "Content Performance Analysis",
    description: "Discover which post types drive the most engagement",
  },
  {
    title: "Audience Insights",
    description:
      "Understand your follower demographics and engagement patterns",
  },
  {
    title: "Growth Strategies",
    description:
      "Get customized recommendations to increase followers and reach",
  },
];

export default function InstagramAuditPage() {
  return (
    <div className="container py-8 space-y-8">
      <InstagramAuditComponent />
      <div className="max-w-4xl mx-auto">
        <BenefitsList benefits={benefits} />
        <ToolReviewsSection
          productSlug="instagram-audit"
          title="Customer Reviews"
        />
      </div>
    </div>
  );
}
