import { Metadata } from "next";
import { ToolPageLayout } from "../_components/mini-tools/tool-page-layout";
import { AICourseImageGenerator } from "../_components/mini-tools/ai-course-image-generator";
import { toolsData } from "@/data/tool-data";
import { ToolFeatures } from "../_components/mini-tools/tool-features";
import { ToolHowToUse } from "../_components/mini-tools/tool-how-to-use";
import { ToolFAQ } from "../_components/mini-tools/tool-faq";
import { ToolReviewsSection } from "../_components/tool-reviews/review";

export const metadata: Metadata = {
  title: "AI Course Image Generator | Create Professional Course Visuals",
  description:
    "Generate stunning, custom images for your online courses with our AI-powered image creation tool. Customize style, aspect ratio, and design to perfectly represent your course.",
  keywords:
    "course image generator, AI image creation, online course visuals, educational graphics, course marketing images",
};

export default function AICourseImageGeneratorPage() {
  const toolData = toolsData["ai-course-image-generator"];

  return (
    <ToolPageLayout
      title="AI Course Image Generator"
      description="Create professional course images in seconds"
    >
      <AICourseImageGenerator />

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mt-8">
        <ToolFeatures tool={toolData} />
        <ToolHowToUse tool={toolData} />
        <ToolFAQ tool={toolData} />
      </div>
      <ToolReviewsSection
        productSlug="ai-course-image-generator"
        title="Customer Reviews"
      />
    </ToolPageLayout>
  );
}
