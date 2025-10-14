import { Metadata } from "next";
import { ToolPageLayout } from "../_components/mini-tools/tool-page-layout";
import { HashtagGenerator } from "../_components/mini-tools/hashtag-generator";
import { toolsData } from "@/data/tool-data";
import { ToolFeatures } from "../_components/mini-tools/tool-features";
import { ToolHowToUse } from "../_components/mini-tools/tool-how-to-use";
import { ToolFAQ } from "../_components/mini-tools/tool-faq";
import { ToolReviewsSection } from "../_components/tool-reviews/review";
import { toolDetails } from "@/data/tool-details";
import toolData from "@/data/usable-tools-data";
import { ToolContentSections } from "../_components/tool-sections/tool-content-sections";

export const metadata: Metadata = {
  title: "Hashtag Group Generator & Manager | Social Media Tool",
  description:
    "Create, save, and organize hashtag groups for Instagram, Twitter, and TikTok. Generate relevant hashtags for your niche.",
  keywords:
    "hashtag generator, instagram hashtags, tiktok hashtags, hashtag groups, social media hashtags",
};

export default function HashtagGeneratorPage() {
  const toolDetail = toolDetails["hashtag-generator"];

  return (
    <ToolPageLayout
      title="Hashtag Group Generator"
      description="Create and manage hashtag groups for your social media posts"
    >
      <HashtagGenerator />
      <div className="mt-12">
        <ToolContentSections toolDetail={toolDetail} />
      </div>
      <ToolReviewsSection
        productSlug="hashtag-generator"
        title="Customer Reviews"
      />
    </ToolPageLayout>
  );
}
