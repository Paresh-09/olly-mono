import { Metadata } from "next";
import { ToolPageLayout } from "../_components/mini-tools/tool-page-layout";
import { AIScriptGenerator } from "../_components/mini-tools/ai-script-generator";
import { toolsData } from "@/data/tool-data";
import { ToolFeatures } from "../_components/mini-tools/tool-features";
import { ToolHowToUse } from "../_components/mini-tools/tool-how-to-use";
import { ToolFAQ } from "../_components/mini-tools/tool-faq";
import { ToolReviewsSection } from "../_components/tool-reviews/review";

export const metadata: Metadata = {
  title:
    "AI Script Generator | Create Professional Scripts for Videos, Podcasts, and More",
  description:
    "Create professional scripts for videos, podcasts, presentations, and commercials with our AI-powered script generator. Customize tone, duration, and style to match your specific needs.",
  keywords:
    "script generator, video script, podcast script, presentation script, AI writing, content creation, script writing tool",
};

export default function AIScriptGeneratorPage() {
  const toolData = toolsData["ai-script-generator"];

  return (
    <ToolPageLayout
      title="AI Script Generator"
      description="Create professional scripts for videos, podcasts, and presentations in seconds"
    >
      <AIScriptGenerator />

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mt-8">
        <ToolFeatures tool={toolData} />
        <ToolHowToUse tool={toolData} />
        <ToolFAQ tool={toolData} />
      </div>
      <ToolReviewsSection
        productSlug="ai-script-generator"
        title="Customer Reviews"
      />
    </ToolPageLayout>
  );
}
