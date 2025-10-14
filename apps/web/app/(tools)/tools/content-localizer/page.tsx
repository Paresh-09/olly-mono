import { Metadata } from "next";
import { ToolPageLayout } from "../_components/mini-tools/tool-page-layout";
import { ContentAnalyzerTool } from "../_components/mini-tools/content-analysis";
import { toolsData } from "@/data/tool-data";
import { ToolFeatures } from "../_components/mini-tools/tool-features";
import { ToolHowToUse } from "../_components/mini-tools/tool-how-to-use";
import { ToolFAQ } from "../_components/mini-tools/tool-faq";
import { ToolReviewsSection } from "../_components/tool-reviews/review";
import { toolDetails } from "@/data/tool-details";
import { ToolContentSections } from "../_components/tool-sections/tool-content-sections";

export const metadata: Metadata = {
  title: "Content Localizer | Adapt Content for Different Regions",
  description:
    "Automatically adapt your social media content for different regions and cultures while maintaining your message.",
  keywords:
    "content localization, regional content, cultural adaptation, global social media",
};

export default function ContentLocalizerPage() {
  const toolDetail = toolDetails["content-localizer"];

  return (
    <ToolPageLayout
      title="Content Localizer"
      description="Adapt your content for different regions and cultures"
    >
      <ContentAnalyzerTool
        toolType="content-localizer"
        placeholder="Paste your content to localize..."
        showRegionSelect={true}
      />

      <div className="mt-12">
        <ToolContentSections toolDetail={toolDetail} />
      </div>
      <ToolReviewsSection
        productSlug="content-localizer"
        title="Customer Reviews"
      />
    </ToolPageLayout>
  );
}
