// LinkedIn Engagement Calculator Page
import { Metadata } from "next";
import { ToolPageLayout } from "../_components/mini-tools/tool-page-layout";
import { ToolReviewsSection } from "../_components/tool-reviews/review";
import { toolDetails } from "@/data/tool-details";
import { ToolContentSections } from "../_components/tool-sections/tool-content-sections";
import { EngagementCalculatorTool } from "../_components/mini-tools/engagement-calculator";

export const metadata: Metadata = {
  title: "LinkedIn Engagement Calculator | Boost Your LinkedIn Performance",
  description:
    "Calculate and optimize your LinkedIn engagement rate. Get data-driven insights to improve your professional content and network growth.",
  keywords:
    "linkedin engagement calculator, linkedin engagement rate, linkedin analytics, linkedin performance, professional networking, b2b social media",
};

export default function LinkedInEngagementCalculatorPage() {
  const toolDetail = toolDetails["linkedin-engagement-calculator"];
  return (
    <ToolPageLayout
      title="LinkedIn Engagement Calculator"
      description="Calculate your LinkedIn engagement rate and optimize your professional content for better performance"
    >
      <EngagementCalculatorTool
        toolType="linkedin-engagement-calculator"
        placeholder="Calculate your LinkedIn engagement rate using your post metrics"
        platform="linkedin"
      />
      <div className="mt-12">
        <ToolContentSections toolDetail={toolDetail} />
      </div>
      <ToolReviewsSection
        productSlug="linkedin-engagement-calculator"
        title="User Reviews"
      />
    </ToolPageLayout>
  );
}
