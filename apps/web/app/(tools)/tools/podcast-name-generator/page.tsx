import { Metadata } from "next";
import { ToolPageLayout } from "../_components/mini-tools/tool-page-layout";
import { PodcastNameGenerator } from "../_components/mini-tools/podcast-name-generator";
import { toolsData } from "@/data/tool-data";
import { ToolFeatures } from "../_components/mini-tools/tool-features";
import { ToolHowToUse } from "../_components/mini-tools/tool-how-to-use";
import { ToolFAQ } from "../_components/mini-tools/tool-faq";
import { ToolReviewsSection } from "../_components/tool-reviews/review";

export const metadata: Metadata = {
  title: "Podcast Name Generator | Find Your Perfect Podcast Title",
  description:
    "Create catchy, unique, and memorable podcast names with our AI-powered name generator. Get ideas tailored to your theme, topic, or niche in seconds.",
  keywords:
    "podcast name generator, podcast title ideas, show name creator, audio show names, podcast branding, podcast name suggestions, podcast naming tool, podcast title creator",
};

export default function PodcastNameGeneratorPage() {
  const toolData = toolsData["podcast-name-generator"];

  return (
    <ToolPageLayout
      title="Podcast Name Generator"
      description="Generate catchy, unique, and memorable names for your podcast in seconds"
    >
      <PodcastNameGenerator />
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mt-8">
        <ToolFeatures tool={toolData} />
        <ToolHowToUse tool={toolData} />
        <ToolFAQ tool={toolData} />
      </div>
      <ToolReviewsSection
        productSlug="podcast-name-generator"
        title="letterhead-creator"
      />
    </ToolPageLayout>
  );
}
