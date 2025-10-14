import { Metadata } from "next";
import { ToolPageLayout } from "../_components/mini-tools/tool-page-layout";
import { toolsData } from "@/data/tool-data";
import { ToolFeatures } from "../_components/mini-tools/tool-features";
import { ToolHowToUse } from "../_components/mini-tools/tool-how-to-use";
import { ToolFAQ } from "../_components/mini-tools/tool-faq";
import { AIProposalGenerator } from "../_components/mini-tools/ai-proposal-generator";
import { ToolReviewsSection } from "../_components/tool-reviews/review";

export const metadata: Metadata = {
  title: "AI Proposal Generator | Professional Business Proposals",
  description:
    "Generate professional business proposals with AI assistance. Create customized proposals with your company branding and content.",
  keywords:
    "proposal generator, business proposal, AI proposal, professional proposal, proposal template, custom proposal, business communication, corporate proposal",
};

export default function AIProposalGeneratorPage() {
  const toolData = toolsData["ai-proposal-generator"];

  return (
    <ToolPageLayout
      title="AI Proposal Generator"
      description="Create professional business proposals with AI assistance and your company branding"
    >
      <AIProposalGenerator />

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mt-8">
        <ToolFeatures tool={toolData} />
        <ToolHowToUse tool={toolData} />
        <ToolFAQ tool={toolData} />
      </div>
      <ToolReviewsSection
        productSlug="ai-proposal-generator"
        title="Customer Reviews"
      />
    </ToolPageLayout>
  );
}
