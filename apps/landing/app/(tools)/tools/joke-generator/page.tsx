import { Metadata } from "next";
import { ToolPageLayout } from "../_components/mini-tools/tool-page-layout";
import { JokeGenerator } from "../_components/mini-tools/joke-generator";
import { toolsData } from "@/data/tool-data";
import { ToolFeatures } from "../_components/mini-tools/tool-features";
import { ToolHowToUse } from "../_components/mini-tools/tool-how-to-use";
import { ToolFAQ } from "../_components/mini-tools/tool-faq";
import { ToolReviewsSection } from "../_components/tool-reviews/review";

export const metadata: Metadata = {
  title: "Social Media Joke Generator | Create Engaging Funny Content",
  description:
    "Generate platform-specific jokes and funny content for your social media posts. Customizable by style and audience.",
  keywords:
    "joke generator, social media jokes, funny content generator, social media humor",
};

export default function JokeGeneratorPage() {
  const toolData = toolsData["joke-generator"];

  return (
    <ToolPageLayout
      title="Social Media Joke Generator"
      description="Create engaging, platform-optimized jokes and funny content"
    >
      <JokeGenerator />

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mt-8">
        <ToolFeatures tool={toolData} />
        <ToolHowToUse tool={toolData} />
        <ToolFAQ tool={toolData} />
      </div>
      <ToolReviewsSection
        productSlug="joke-generator"
        title="Customer Reviews"
      />
    </ToolPageLayout>
  );
}
