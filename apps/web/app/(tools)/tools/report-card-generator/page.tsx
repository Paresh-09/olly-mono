import { Metadata } from "next";
import { ToolPageLayout } from "../_components/mini-tools/tool-page-layout";
import { toolsData } from "@/data/tool-data";
import { ToolFeatures } from "../_components/mini-tools/tool-features";
import { ToolHowToUse } from "../_components/mini-tools/tool-how-to-use";
import { ToolFAQ } from "../_components/mini-tools/tool-faq";
import { ReportCardGeneratorTool } from "../_components/mini-tools/report-card-generator";
import { ToolReviewsSection } from "../_components/tool-reviews/review";

export const metadata: Metadata = {
  title: "AI Report Card Generator | Generate Detailed Academic Reports",
  description:
    "Free tool to generate comprehensive academic report cards with detailed analysis, grades, and recommendations.",
  keywords:
    "report card generator, academic report, student assessment, grade analysis",
};

export default function ReportCardGeneratorPage() {
  const toolData = toolsData["report-card-generator"];

  return (
    <ToolPageLayout
      title="AI Report Card Generator"
      description="Generate detailed academic report cards with personalized feedback"
    >
      <ReportCardGeneratorTool
        toolType="report-card-generator"
        placeholder="Enter student performance data..."
      />

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mt-8">
        <ToolFeatures tool={toolData} />
        <ToolHowToUse tool={toolData} />
        <ToolFAQ tool={toolData} />
      </div>
      <ToolReviewsSection
        productSlug="report-card-generator"
        title="letterhead-creator"
      />
    </ToolPageLayout>
  );
}
