import { Metadata } from "next";
import { ToolPageLayout } from "../_components/mini-tools/tool-page-layout";
import { ReadabilityTester } from "../_components/mini-tools/readability-tester";
import { toolsData } from "@/data/tool-data";
import { ToolFeatures } from "../_components/mini-tools/tool-features";
import { ToolHowToUse } from "../_components/mini-tools/tool-how-to-use";
import { ToolFAQ } from "../_components/mini-tools/tool-faq";
import { ToolReviewsSection } from "../_components/tool-reviews/review";

export const metadata: Metadata = {
  title: "Readability Tester | Analyze Text Complexity and Readability",
  description:
    "Check the readability of your text using multiple algorithms. Understand text complexity, grade level, and audience suitability for writing, marketing, and educational content.",
  keywords:
    "readability checker, text complexity, reading level, writing analysis, content readability, grade level test",
};

export default function ReadabilityTesterPage() {
  const toolData = toolsData["readability-tester"];

  return (
    <ToolPageLayout
      title="Readability Tester"
      description="Analyze the complexity and readability of your text"
    >
      <ReadabilityTester />

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mt-8">
        <ToolFeatures tool={toolData} />
        <ToolHowToUse tool={toolData} />
        <ToolFAQ tool={toolData} />
      </div>
      <ToolReviewsSection
        productSlug="readability-tester"
        title="letterhead-creator"
      />
    </ToolPageLayout>
  );
}
