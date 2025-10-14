import { Metadata } from "next";
import { ToolPageLayout } from "../_components/mini-tools/tool-page-layout";
import { toolsData } from "@/data/tool-data";
import { ToolFeatures } from "../_components/mini-tools/tool-features";
import { ToolHowToUse } from "../_components/mini-tools/tool-how-to-use";
import { ToolFAQ } from "../_components/mini-tools/tool-faq";
import { InsultGenerator } from "../_components/mini-tools/insult-generator";
import { ToolReviewsSection } from "../_components/tool-reviews/review";

export const metadata: Metadata = {
  title: "AI Insult Generator | Creative Comebacks & Roasts",
  description:
    "Generate witty, clean insults and comebacks with adjustable style and tone. Perfect for friendly roasts, comedy writing, or creative banter.",
  keywords:
    "insult generator, roast generator, comeback generator, ai insults, clean roasts, friendly banter",
};

export default function InsultGeneratorPage() {
  const toolData = toolsData["ai-insult-generator"];

  return (
    <ToolPageLayout
      title="AI Insult Generator"
      description="Create witty comebacks and roasts with adjustable style and tone"
    >
      <InsultGenerator />

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mt-8">
        <ToolFeatures tool={toolData} />
        <ToolHowToUse tool={toolData} />
        <ToolFAQ tool={toolData} />
      </div>
      <ToolReviewsSection
        productSlug="ai-insult-generator"
        title="Customer Reviews"
      />
    </ToolPageLayout>
  );
}
