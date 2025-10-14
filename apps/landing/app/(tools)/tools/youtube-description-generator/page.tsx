import { Metadata } from "next";
import { ToolPageLayout } from "../_components/mini-tools/tool-page-layout";
import { YouTubeDescriptionGenerator } from "../_components/mini-tools/youtube-description-generator";
import { toolsData } from "@/data/tool-data";
import { ToolFeatures } from "../_components/mini-tools/tool-features";
import { ToolHowToUse } from "../_components/mini-tools/tool-how-to-use";
import { ToolFAQ } from "../_components/mini-tools/tool-faq";
import { ToolReviewsSection } from "../_components/tool-reviews/review";

export const metadata: Metadata = {
  title: "YouTube Channel Description Generator | Free SEO-Optimized Content",
  description:
    "Create professional, SEO-optimized YouTube channel descriptions that attract subscribers and improve discoverability.",
  keywords:
    "YouTube description generator, channel description, YouTube SEO, video description, YouTube optimization, content creator tools",
};

export default function YouTubeDescriptionGeneratorPage() {
  const toolData = toolsData["youtube-description-generator"];

  return (
    <ToolPageLayout
      title="YouTube Channel Description Generator"
      description="Create professional, SEO-optimized YouTube channel descriptions that attract subscribers"
    >
      <YouTubeDescriptionGenerator />

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mt-8">
        <ToolFeatures tool={toolData} />
        <ToolHowToUse tool={toolData} />
        <ToolFAQ tool={toolData} />
      </div>
      <ToolReviewsSection
        productSlug="youtube-chapters-generator"
        title="youtube-description-generator"/>
    </ToolPageLayout>
  );
}
