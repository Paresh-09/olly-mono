import { Metadata } from "next";
import { ToolPageLayout } from "../_components/mini-tools/tool-page-layout";
import { ContentAnalyzerTool } from "../_components/mini-tools/content-analysis";
import { toolsData } from "@/data/tool-data";
import { ToolFeatures } from "../_components/mini-tools/tool-features";
import { ToolHowToUse } from "../_components/mini-tools/tool-how-to-use";
import { ToolFAQ } from "../_components/mini-tools/tool-faq";
import { ToolReviewsSection } from "../_components/tool-reviews/review";
import { toolDetails } from "@/data/tool-details";
import { ToolContentSections } from "../_components/tool-sections/tool-content-sections";

export const metadata: Metadata = {
  title: "Social Media Engagement Optimizer | Improve Post Performance",
  description:
    "Analyze and optimize your social media posts for maximum engagement. Get platform-specific recommendations.",
  keywords:
    "social media engagement, post optimization, engagement rate, social media performance",
};

export default function EngagementOptimizerPage() {
  const toolDetail = toolDetails["engagement-optimizer"];

  return (
    <ToolPageLayout
      title="Engagement Optimizer"
      description="Optimize your posts for maximum engagement"
    >
      <ContentAnalyzerTool
        toolType="engagement-optimizer"
        placeholder="Paste your post to optimize for engagement..."
        platforms={["instagram", "tiktok", "twitter", "facebook", "linkedin"]}
      />

      <div className="mt-12">
        <ToolContentSections toolDetail={toolDetail} />
      </div>

      <ToolReviewsSection
        productSlug="engagement-optimizer"
        title="Customer Reviews"
      />
    </ToolPageLayout>
  );
}
