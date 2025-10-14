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
import { EngagementCalculatorTool } from "../_components/mini-tools/engagement-calculator";
export const metadata: Metadata = {
  title: "Instagram Engagement Calculator | Boost Your Instagram Performance",
  description:
    "Calculate and optimize your Instagram engagement rate. Get data-driven insights to improve your Instagram posts and grow your audience.",
  keywords:
    "instagram engagement calculator, instagram engagement rate, instagram analytics, instagram performance, social media metrics",
};

export default function InstagramEngagementCalculatorPage() {
  const toolDetail = toolDetails["instagram-engagement-calculator"];

  return (
    <ToolPageLayout
      title="Instagram Engagement Calculator"
      description="Calculate your Instagram engagement rate and optimize your content for better performance"
    >
      <EngagementCalculatorTool
        toolType="instagram-engagement-calculator"
        placeholder="Calculate your Instagram engagement rate using your post metrics"
        platform="instagram"
      />

      <div className="mt-12">
        <ToolContentSections toolDetail={toolDetail} />
      </div>

      <ToolReviewsSection
        productSlug="instagram-engagement-calculator"
        title="User Reviews"
      />
    </ToolPageLayout>
  );
}
