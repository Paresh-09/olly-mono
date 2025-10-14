import { Metadata } from "next";
import { ToolPageLayout } from "../_components/mini-tools/tool-page-layout";
import { LineBreaker } from "../_components/mini-tools/line-breaker";
import { toolsData } from "@/data/tool-data";
import { ToolFeatures } from "../_components/mini-tools/tool-features";
import { ToolHowToUse } from "../_components/mini-tools/tool-how-to-use";
import { ToolFAQ } from "../_components/mini-tools/tool-faq";
import { ToolReviewsSection } from "../_components/tool-reviews/review";

export const metadata: Metadata = {
  title:
    "Instagram Caption Line Breaker | Add Line Breaks to Social Media Posts",
  description:
    "Add clean line breaks to your Instagram captions and social media posts. Format your text with proper spacing that actually works.",
  keywords:
    "instagram line break, caption formatter, instagram spacing, social media text formatter",
};

export default function LineBreakerPage() {
  const toolData = toolsData["line-breaker"];

  return (
    <ToolPageLayout
      title="Instagram Caption Line Breaker"
      description="Add clean line breaks to your social media captions"
    >
      <LineBreaker />

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mt-8">
        <ToolFeatures tool={toolData} />
        <ToolHowToUse tool={toolData} />
        <ToolFAQ tool={toolData} />
      </div>
      <ToolReviewsSection
        productSlug="line-breaker"
        title="letterhead-creator"
      />
    </ToolPageLayout>
  );
}
