import { Metadata } from "next";
import { ToolPageLayout } from "../_components/mini-tools/tool-page-layout";
import { TextConverter } from "../_components/mini-tools/text-converter";
import { toolsData } from "@/data/tool-data";
import { ToolFeatures } from "../_components/mini-tools/tool-features";
import { ToolHowToUse } from "../_components/mini-tools/tool-how-to-use";
import { ToolFAQ } from "../_components/mini-tools/tool-faq";
import { ToolReviewsSection } from "../_components/tool-reviews/review";
import { toolDetails } from "@/data/tool-details";
import { ToolContentSections } from "../_components/tool-sections/tool-content-sections";

export const metadata: Metadata = {
  title: "Case Converter Tool | Convert Text Case Online Free",
  description:
    "Free online case converter tool. Convert text to UPPERCASE, lowercase, Title Case, and more. Perfect for formatting text for different purposes.",
  keywords:
    "case converter, text case converter, uppercase converter, lowercase converter, title case generator",
};

export default function CaseConverterPage() {
  const toolDetail = toolDetails['case-converter']

  return ( 
    <ToolPageLayout
      title="Case Converter"
      description="Convert text case instantly - uppercase, lowercase, title case, and more"
    >
      <TextConverter />

      <div className="mt-12">
        <ToolContentSections toolDetail={toolDetail} />
      </div>
      
      <ToolReviewsSection 
        productSlug="case-converter"
        title="Customer Reviews"
      />
    </ToolPageLayout>
  );
}
