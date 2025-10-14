import { Metadata } from "next";
import { ToolPageLayout } from "../_components/mini-tools/tool-page-layout";
import { AICoursePromotionGenerator } from "../_components/mini-tools/ai-promotion-generator";
import { toolsData } from "@/data/tool-data";
import { ToolFeatures } from "../_components/mini-tools/tool-features";
import { ToolHowToUse } from "../_components/mini-tools/tool-how-to-use";
import { ToolFAQ } from "../_components/mini-tools/tool-faq";
import { ToolReviewsSection } from "../_components/tool-reviews/review";

export const metadata: Metadata = {
  title:
    "AI Course Promotion Generator | Create Compelling Marketing Content for Online Courses",
  description:
    "Generate professional marketing copy for online courses with our AI-powered promotion tool. Create social media posts, email campaigns, and landing page content tailored to your course.",
  keywords:
    "course promotion, marketing generator, online course marketing, AI content creation, course advertising, marketing copy",
};

export default function AICoursePromotionGeneratorPage() {
  const toolData = toolsData["ai-course-promotion-generator"];

  return (
    <ToolPageLayout
      title="AI Course Promotion Generator"
      description="Create compelling marketing content for your online courses in seconds"
    >
      <AICoursePromotionGenerator />

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mt-8">
        <ToolFeatures tool={toolData} />
        <ToolHowToUse tool={toolData} />
        <ToolFAQ tool={toolData} />
      </div>
      <ToolReviewsSection
        productSlug="ai-course-promotion-generator"
        title="Customer Reviews"
      />
    </ToolPageLayout>
  );
}
