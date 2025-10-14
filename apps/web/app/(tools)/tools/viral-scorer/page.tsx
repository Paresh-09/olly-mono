import { Metadata } from "next";
import { ContentAnalyzerTool } from "../_components/mini-tools/content-analysis";
import { ToolPageLayout } from "../_components/mini-tools/tool-page-layout";
import { toolsData } from "@/data/tool-data";
import { ToolFeatures } from "../_components/mini-tools/tool-features";
import { ToolHowToUse } from "../_components/mini-tools/tool-how-to-use";
import { ToolFAQ } from "../_components/mini-tools/tool-faq";
import { ToolReviewsSection } from "../_components/tool-reviews/review";

export const metadata: Metadata = {
  title: "Viral Potential Scorer | Check Content Virality",
  description:
    "Score your content's viral potential and get specific recommendations for improving shareability.",
  keywords:
    "viral content, viral checker, content virality, viral potential, viral score",
};

export default function ViralScorerPage() {
  const toolData = toolsData["viral-scorer"];

  return (
    <ToolPageLayout
      title="Viral Potential Scorer"
      description="Score your content's viral potential"
    >
      <ContentAnalyzerTool
        toolType="viral-potential-scorer"
        placeholder="Paste your content to analyze its viral potential..."
        platforms={["instagram", "tiktok", "twitter", "facebook"]}
      />

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mt-8">
        <ToolFeatures tool={toolData} />
        <ToolHowToUse tool={toolData} />
        <ToolFAQ tool={toolData} />
      </div>
      <ToolReviewsSection
        productSlug="viral-score"
        title="social-media-image-resizer"
      />
    </ToolPageLayout>
  );
}
