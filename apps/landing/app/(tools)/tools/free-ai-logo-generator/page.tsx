import { Metadata } from "next";
import { ToolPageLayout } from "../_components/mini-tools/tool-page-layout";
import { FreeAiLogoGenerator } from "../_components/mini-tools/lucide-logo-generator";
import { toolsData } from "@/data/tool-data";
import { ToolFeatures } from "../_components/mini-tools/tool-features";
import { ToolHowToUse } from "../_components/mini-tools/tool-how-to-use";
import { ToolFAQ } from "../_components/mini-tools/tool-faq";
import { ToolReviewsSection } from "../_components/tool-reviews/review";

export const metadata: Metadata = {
  title: "Free AI Logo Generator | Create Beautiful Gradient Logos",
  description:
    "Create beautiful logos using Lucide icons with gradient backgrounds. Customize shapes, colors, and download in multiple sizes.",
  keywords:
    "logo generator, AI logo, free logo maker, gradient logos, icon maker, brand logo, app icon, logo design",
};

export default function FreeAiLogoGeneratorPage() {
  const toolData = toolsData["free-ai-logo-generator"];

  return (
    <ToolPageLayout
      title="Free AI Logo Generator"
      description="Create beautiful logos using AI-generated designs with gradient backgrounds"
    >
      <FreeAiLogoGenerator />

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mt-8">
        <ToolFeatures tool={toolData} />
        <ToolHowToUse tool={toolData} />
        <ToolFAQ tool={toolData} />
      </div>
      <ToolReviewsSection
        productSlug="free-ai-logo-generator"
        title="Customer Reviews"
      />
    </ToolPageLayout>
  );
}
