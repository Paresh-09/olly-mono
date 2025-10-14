import { Metadata } from "next";
import { ToolPageLayout } from "../_components/mini-tools/tool-page-layout";
import { TwitterBioGenerator } from "../_components/mini-tools/twitter-bio-generator";
import { toolsData } from "@/data/tool-data";
import { ToolFeatures } from "../_components/mini-tools/tool-features";
import { ToolHowToUse } from "../_components/mini-tools/tool-how-to-use";
import { ToolFAQ } from "../_components/mini-tools/tool-faq";
import { ToolReviewsSection } from "../_components/tool-reviews/review";

export const metadata: Metadata = {
  title: "Twitter/X Bio Generator | Create Engaging Social Media Profiles",
  description:
    "Generate concise, attention-grabbing Twitter/X bios that showcase your personality and attract followers.",
  keywords:
    "Twitter bio generator, X bio, social media profile, Twitter optimization, character limit, bio creator",
};

export default function TwitterBioGeneratorPage() {
  const toolData = toolsData["twitter-bio-generator"];

  return (
    <ToolPageLayout
      title="Twitter/X Bio Generator"
      description="Create concise, attention-grabbing Twitter/X bios that showcase your personality"
    >
      <TwitterBioGenerator />

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mt-8">
        <ToolFeatures tool={toolData} />
        <ToolHowToUse tool={toolData} />
        <ToolFAQ tool={toolData} />
      </div>
      <ToolReviewsSection
        productSlug="twitter-bio-generator"
        title="social-media-image-resizer"
      />
    </ToolPageLayout>
  );
}
