import { Metadata } from "next";
import { ToolPageLayout } from "../_components/mini-tools/tool-page-layout";
import { toolsData } from "@/data/tool-data";
import { ToolFeatures } from "../_components/mini-tools/tool-features";
import { ToolHowToUse } from "../_components/mini-tools/tool-how-to-use";
import { ToolFAQ } from "../_components/mini-tools/tool-faq";
import { RoastGenerator } from "../_components/mini-tools/roast-generator";
import { ToolReviewsSection } from "../_components/tool-reviews/review";
import { toolDetails } from "@/data/tool-details";
import { ToolContentSections } from "../_components/tool-sections/tool-content-sections";

export const metadata: Metadata = {
  title: "Free AI Roast Generator | Friendly Comedic Comebacks",
  description:
    "Generate playful, clean roasts and comebacks with customizable styles. Perfect for comedy nights, friendly banter, and social events.",
  keywords:
    "roast generator, comedy generator, friendly roasts, ai roasts, comedic comebacks, clean roasts",
};

export default function RoastGeneratorPage() {
  const toolDetail = toolDetails["ai-roast-generator-free"];

  return (
    <ToolPageLayout
      title="Free AI Roast Generator"
      description="Create playful roasts and comebacks for any occasion"
    >
      <RoastGenerator />

      <div className="mt-12">
        <ToolContentSections toolDetail={toolDetail} />
      </div>
      <ToolReviewsSection
        productSlug="ai-roast-generator-free"
        title="Customer Reviews"
      />
    </ToolPageLayout>
  );
}
