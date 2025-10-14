// TikTok Engagement Calculator Page
import { Metadata } from "next";
import { ToolPageLayout } from "../_components/mini-tools/tool-page-layout";
import { ToolReviewsSection } from "../_components/tool-reviews/review";
import { toolDetails } from "@/data/tool-details";
import { ToolContentSections } from "../_components/tool-sections/tool-content-sections";
import { EngagementCalculatorTool } from "../_components/mini-tools/engagement-calculator";

export const metadata: Metadata = {
  title: "TikTok Engagement Calculator | Boost Your TikTok Performance",
  description:
    "Calculate and optimize your TikTok engagement rate. Get data-driven insights to improve your videos and viral content performance.",
  keywords:
    "tiktok engagement calculator, tiktok engagement rate, tiktok analytics, tiktok performance, viral content metrics, for you page",
};

export default function TikTokEngagementCalculatorPage() {
  const toolDetail = toolDetails["tiktok-engagement-calculator"];
  return (
    <ToolPageLayout
      title="TikTok Engagement Calculator"
      description="Calculate your TikTok engagement rate and optimize your content for viral performance"
    >
      <EngagementCalculatorTool
        toolType="tiktok-engagement-calculator"
        placeholder="Calculate your TikTok engagement rate using your video metrics"
        platform="tiktok"
      />
      <div className="mt-12">
        <ToolContentSections toolDetail={toolDetail} />
      </div>
      <ToolReviewsSection
        productSlug="tiktok-engagement-calculator"
        title="User Reviews"
      />
    </ToolPageLayout>
  );
}
