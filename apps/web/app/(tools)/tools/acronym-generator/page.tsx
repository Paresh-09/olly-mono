import { Metadata } from "next";
import { ToolPageLayout } from "../_components/mini-tools/tool-page-layout";
import { AcronymGenerator } from "../_components/mini-tools/acronym-generator";
import { toolsData } from "@/data/tool-data";
import { ToolFeatures } from "../_components/mini-tools/tool-features";
import { ToolHowToUse } from "../_components/mini-tools/tool-how-to-use";
import { ToolFAQ } from "../_components/mini-tools/tool-faq";
import { ToolReviewsSection } from "../_components/tool-reviews/review";

export const metadata: Metadata = {
  title: "Acronym Generator | Create Memorable, Creative Acronyms",
  description:
    "Generate memorable and creative acronyms for your business, project, or organization with our AI-powered acronym generator. Get multiple suggestions with full word expansions.",
  keywords:
    "acronym generator, acronym maker, business name creator, project naming tool, organization name generator, creative acronyms, memorable acronyms, acronym creator",
};

export default function AcronymGeneratorPage() {
  const toolData = toolsData["acronym-generator"];

  return (
    <ToolPageLayout
      title="Acronym Generator"
      description="Create memorable, creative acronyms from any phrase with full word expansions"
    >
      <AcronymGenerator />
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mt-8">
        <ToolFeatures tool={toolData} />
        <ToolHowToUse tool={toolData} />
        <ToolFAQ tool={toolData} />
      </div>
      <ToolReviewsSection
        productSlug="acronym-generator"
        title="Customer Reviews"
      />
    </ToolPageLayout>
  );
}
