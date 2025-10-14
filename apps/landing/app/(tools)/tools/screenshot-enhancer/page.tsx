import { Metadata } from "next";
import { ToolPageLayout } from "../_components/mini-tools/tool-page-layout";
import { toolsData } from "@/data/tool-data";
import { ToolFeatures } from "../_components/mini-tools/tool-features";
import { ToolHowToUse } from "../_components/mini-tools/tool-how-to-use";
import { ToolFAQ } from "../_components/mini-tools/tool-faq";
import { ToolReviewsSection } from "../_components/tool-reviews/review";
import ScreenshotEnhancer from "../_components/mini-tools/screenshot-enhancer";



export const metadata: Metadata = {
  title:
    "Screenshot Enhancer | Create Beautiful Screenshots for X, LinkedIn & Instagram",
  description:
    "Free tool to enhance screenshots with beautiful backgrounds, text overlays, and professional formatting for Twitter/X, LinkedIn, Instagram, and Facebook. Perfect for build in public, startup founders, product launches, and content creators.",
  keywords:
    "screenshot enhancer, fancy screenshots for X, Twitter screenshot generator, LinkedIn post maker, Instagram story creator, build in public screenshots, social media optimization, screenshot beautifier, professional screenshot templates, startup founder tools, product launch screenshots, SaaS marketing materials, Facebook content creator, screenshot editor, professional image editor",
};

export default function ScreenshotEnhancerPage() {
  const toolData = toolsData["screenshot-enhancer"];

  return (
    <ToolPageLayout
      title="Screenshot Enhancer - Create Fancy Social Media Screenshots"
      description="Transform your screenshots into eye-catching professional social media posts for Twitter/X, LinkedIn, and Instagram. Perfect for founders building in public, product launches, and growth metrics."
    >
      <div className="flex flex-col gap-6 max-w-5xl mx-auto">
        <div className="mb-4">
          <h1 className="sr-only">
            Ultimate Screenshot Enhancer for Social Media - Create Beautiful
            Screenshots for X, LinkedIn & Instagram
          </h1>
          <p className="sr-only">
            Free tool to create professional screenshots, fancy Twitter/X posts,
            LinkedIn profile metrics, Instagram stories, and Facebook content.
            Perfect for build in public, startup founders, and content creators.
          </p>
        </div>
        <ScreenshotEnhancer />
        <ToolFeatures tool={toolData} />
        <ToolHowToUse tool={toolData} />
        <ToolFAQ tool={toolData} />
      </div>
      <ToolReviewsSection
        productSlug="screenshot-enhancer"
        title="letterhead-creator"
      />
    </ToolPageLayout>
  );
}
