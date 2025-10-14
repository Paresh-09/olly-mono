// app/grammar-checker/page.tsx
import { Metadata } from "next";
import { ToolPageLayout } from "../_components/mini-tools/tool-page-layout";
import { GrammarChecker } from "../_components/mini-tools/grammar-spell-checker";
import { toolsData } from "@/data/tool-data";
import { ToolFeatures } from "../_components/mini-tools/tool-features";
import { ToolHowToUse } from "../_components/mini-tools/tool-how-to-use";
import { ToolFAQ } from "../_components/mini-tools/tool-faq";
import { ToolReviewsSection } from "../_components/tool-reviews/review";

export const metadata: Metadata = {
  title: "Grammar Checker | AI-Powered Writing Improvement Tool",
  description:
    "Enhance your writing with our advanced AI grammar and spell checker. Catch errors, improve clarity, and communicate more effectively.",
  keywords:
    "grammar checker, spell checker, writing improvement, AI writing tool, grammar correction, language editing",
};

export default function GrammarCheckerPage() {
  const toolData = toolsData["grammar-spell-checker"];

  return (
    <ToolPageLayout
      title="Grammar Checker"
      description="Improve your writing with intelligent grammar and spell checking"
    >
      <GrammarChecker />

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mt-8">
        <ToolFeatures tool={toolData} />
        <ToolHowToUse tool={toolData} />
        <ToolFAQ tool={toolData} />
      </div>
      <ToolReviewsSection
        productSlug="grammar-spell-checker"
        title="Customer Reviews"
      />
    </ToolPageLayout>
  );
}
