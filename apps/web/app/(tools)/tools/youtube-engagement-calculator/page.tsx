// YouTube Engagement Calculator Page
import { Metadata } from "next";
import { ToolPageLayout } from "../_components/mini-tools/tool-page-layout";
import { ToolReviewsSection } from "../_components/tool-reviews/review";
import { toolDetails } from "@/data/tool-details";
import { ToolContentSections } from "../_components/tool-sections/tool-content-sections";
import { EngagementCalculatorTool } from "../_components/mini-tools/engagement-calculator";

export const metadata: Metadata = {
  title: "YouTube Engagement Calculator | Boost Your YouTube Performance",
  description:
    "Calculate and optimize your YouTube engagement rate. Get data-driven insights to improve your videos and grow your channel performance.",
  keywords:
    "youtube engagement calculator, youtube engagement rate, youtube analytics, youtube performance, video metrics, channel growth",
};

export default function YouTubeEngagementCalculatorPage() {
  const toolDetail = toolDetails["youtube-engagement-calculator"];
  return (
    <ToolPageLayout
      title="YouTube Engagement Calculator"
      description="Calculate your YouTube engagement rate and optimize your videos for better performance"
    >
      <EngagementCalculatorTool
        toolType="youtube-engagement-calculator"
        placeholder="Calculate your YouTube engagement rate using your video metrics"
        platform="youtube"
      />
      <div className="mt-12">
        <ToolContentSections toolDetail={toolDetail} />
      </div>
      <ToolReviewsSection
        productSlug="youtube-engagement-calculator"
        title="User Reviews"
      />
    </ToolPageLayout>
  );
}
