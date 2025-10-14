import { Metadata } from "next";
import { ToolPageLayout } from "../_components/mini-tools/tool-page-layout";
import { AICourseReviewsGenerator } from "../_components/mini-tools/ai-course-review";
import { toolsData } from "@/data/tool-data";
import { ToolFeatures } from "../_components/mini-tools/tool-features";
import { ToolHowToUse } from "../_components/mini-tools/tool-how-to-use";
import { ToolFAQ } from "../_components/mini-tools/tool-faq";
import { ToolReviewsSection } from "../_components/tool-reviews/review";

export const metadata: Metadata = {
  title:
    "AI Course Reviews Generator | Create Detailed, Professional Course Reviews",
  description:
    "Create comprehensive course reviews with customizable tone, length, and sections using our AI-powered review generator. Perfect for online courses, bootcamps, and educational programs.",
  keywords:
    "course review generator, online course review, educational review, AI writing, course feedback, review tool, course evaluation",
};

export default function AICourseReviewsGeneratorPage() {
  const toolData = toolsData["ai-course-reviews-generator"];

  return (
    <ToolPageLayout
      title="AI Course Reviews Generator"
      description="Create detailed, professional course reviews in seconds"
    >
      <AICourseReviewsGenerator />

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mt-8">
        <ToolFeatures tool={toolData} />
        <ToolHowToUse tool={toolData} />
        <ToolFAQ tool={toolData} />
      </div>
      <ToolReviewsSection
        productSlug="ai-course-reviews-generator"
        title="Customer Reviews"
      />
    </ToolPageLayout>
  );
}
