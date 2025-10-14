import { Metadata } from "next";
import { ToolPageLayout } from "../_components/mini-tools/tool-page-layout";
import { toolsData } from "@/data/tool-data";
import { ToolFeatures } from "../_components/mini-tools/tool-features";
import { ToolHowToUse } from "../_components/mini-tools/tool-how-to-use";
import { ToolFAQ } from "../_components/mini-tools/tool-faq";
import { PunGenerator } from "../_components/mini-tools/pun-generator";
import { ToolReviewsSection } from "../_components/tool-reviews/review";
import { toolDetails } from "@/data/tool-details";
import { ToolContentSections } from "../_components/tool-sections/tool-content-sections";

export const metadata: Metadata = {
  title: "Free AI Pun Generator | Creative Word Play & Jokes",
  description:
    "Generate clever puns and wordplay with customizable topics and styles. Perfect for social media, presentations, or creative writing.",
  keywords:
    "pun generator, wordplay generator, dad jokes, ai puns, free pun maker, word play tool",
};

export default function PunGeneratorPage() {
  const toolDetail = toolDetails["ai-pun-generator-free"];

  return (
    <ToolPageLayout
      title="Free AI Pun Generator"
      description="Create clever puns and wordplay for any topic"
    >
      <PunGenerator />

      <div className="mt-12">
        <ToolContentSections toolDetail={toolDetail} />
      </div>

      <ToolReviewsSection
        productSlug="ai-pun-generator-free"
        title="Customer Reviews"
      />
    </ToolPageLayout>
  );
}
