import { Metadata } from "next";
import { ToolPageLayout } from "../_components/mini-tools/tool-page-layout";
import { RapGenerator } from "../_components/mini-tools/rap-generator";
import { toolsData } from "@/data/tool-data";
import { ToolFeatures } from "../_components/mini-tools/tool-features";
import { ToolHowToUse } from "../_components/mini-tools/tool-how-to-use";
import { ToolFAQ } from "../_components/mini-tools/tool-faq";
import { ToolReviewsSection } from "../_components/tool-reviews/review";
import { ToolContentSections } from "../_components/tool-sections/tool-content-sections";
import { toolDetails } from "@/data/tool-details";

export const metadata: Metadata = {
  title: "AI Rap Generator | Creative Rap Lyrics & Verses",
  description:
    "Generate custom rap lyrics with adjustable style, flow, and themes. Perfect for songwriting, freestyle practice, or creative expression.",
  keywords:
    "rap generator, lyrics generator, rap lyrics, ai rapper, freestyle generator, rap writing tool",
};

export default function RapGeneratorPage() {
   const toolDetail = toolDetails['ai-rap-generator']

  return (
    <ToolPageLayout
      title="AI Rap Generator"
      description="Create custom rap lyrics with adjustable style, flow, and themes"
    >
      <RapGenerator />

      <div className="mt-12">
             <ToolContentSections toolDetail={toolDetail} />
           </div>
      <ToolReviewsSection
        productSlug="ai-rap-generator"
        title="Customer Reviews"
      />
    </ToolPageLayout>
  );
}
