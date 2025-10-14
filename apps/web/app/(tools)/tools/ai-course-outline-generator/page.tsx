import { Metadata } from "next";
import { ToolPageLayout } from "../_components/mini-tools/tool-page-layout";
import { AIOutlineGenerator } from "../_components/mini-tools/ai-course-outline";
import { toolsData } from "@/data/tool-data";
import { ToolFeatures } from "../_components/mini-tools/tool-features";
import { ToolHowToUse } from "../_components/mini-tools/tool-how-to-use";
import { ToolFAQ } from "../_components/mini-tools/tool-faq";
import { ToolReviewsSection } from "../_components/tool-reviews/review";

export const metadata: Metadata = {
  title: "AI Course Outline Generator | Create Structured Learning Paths",
  description:
    "Create comprehensive course outlines for any subject with our AI-powered outline generator. Perfect for educators, trainers, and content creators.",
  keywords:
    "AI course generator, curriculum planner, course outline, syllabus creator, learning path generator, education planning tool",
};

export default function AIOutlineGeneratorPage() {
  const toolData = toolsData["ai-course-outline-generator"];

  return (
    <ToolPageLayout
      title="AI Course Outline Generator"
      description="Create structured, comprehensive course outlines in seconds"
    >
      <AIOutlineGenerator />

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mt-8">
        <ToolFeatures tool={toolData} />
        <ToolHowToUse tool={toolData} />
        <ToolFAQ tool={toolData} />
      </div>
      <ToolReviewsSection
        productSlug="ai-course-outline-generator"
        title="Customer Reviews"
      />
    </ToolPageLayout>
  );
}
