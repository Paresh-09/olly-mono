// Facebook Engagement Calculator Page
import { Metadata } from "next";
import { ToolPageLayout } from "../_components/mini-tools/tool-page-layout";
import { ToolReviewsSection } from "../_components/tool-reviews/review";
import { toolDetails } from "@/data/tool-details";
import { ToolContentSections } from "../_components/tool-sections/tool-content-sections";
import { EngagementCalculatorTool } from "../_components/mini-tools/engagement-calculator";

export const metadata: Metadata = {
  title: "Facebook Engagement Calculator | Boost Your Facebook Performance",
  description:
    "Calculate and optimize your Facebook engagement rate. Get data-driven insights to improve your Facebook posts and grow your page performance.",
  keywords:
    "facebook engagement calculator, facebook engagement rate, facebook analytics, facebook performance, social media metrics",
};

export default function FacebookEngagementCalculatorPage() {
  const toolDetail = toolDetails["facebook-engagement-calculator"];
  return (
    <ToolPageLayout
      title="Facebook Engagement Calculator"
      description="Calculate your Facebook engagement rate and optimize your content for better performance"
    >
      <EngagementCalculatorTool
        toolType="facebook-engagement-calculator"
        placeholder="Calculate your Facebook engagement rate using your post metrics"
        platform="facebook"
      />
      <div className="mt-12">
        <ToolContentSections toolDetail={toolDetail} />
      </div>
      <ToolReviewsSection
        productSlug="facebook-engagement-calculator"
        title="User Reviews"
      />
    </ToolPageLayout>
  );
}
