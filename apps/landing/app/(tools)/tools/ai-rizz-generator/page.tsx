import { Metadata } from "next";
import { ToolPageLayout } from "../_components/mini-tools/tool-page-layout";
import { RizzGenerator } from "../_components/mini-tools/rizz-generator";
import { toolsData } from "@/data/tool-data";
import { ToolFeatures } from "../_components/mini-tools/tool-features";
import { ToolHowToUse } from "../_components/mini-tools/tool-how-to-use";
import { ToolFAQ } from "../_components/mini-tools/tool-faq";
import { ToolContentSections } from "../_components/tool-sections/tool-content-sections";
import { toolDetails } from "@/data/tool-details";
import { ToolReviewsSection } from "../_components/tool-reviews/review";

export const metadata: Metadata = {
  title: "AI Rizz Generator | Ultimate Pickup Line & Flirting Assistant",
  description:
    "Generate smooth, contextual, and personalized rizz lines. Perfect for dating apps, social media, or real-life situations.",
  keywords:
    "rizz generator, pickup lines, flirting assistant, dating help, conversation starters, smooth talk generator",
};

export default function RizzGeneratorPage() {
  const toolDetail = toolDetails["ai-rizz-generator"];

  return (
    <ToolPageLayout
      title="AI Rizz Generator"
      description="Generate smooth, contextual, and personalized rizz lines for any situation"
    >
      <RizzGenerator />

      <div className="mt-12">
        <ToolContentSections toolDetail={toolDetail} />
      </div>
      <ToolReviewsSection
        productSlug="ai-rizz-generator"
        title="Customer Reviews"
      />
    </ToolPageLayout>
  );
}
