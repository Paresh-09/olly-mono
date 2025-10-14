import { Metadata } from "next";
import { ToolPageLayout } from "../_components/mini-tools/tool-page-layout";
import { InstagramGenerator } from "../_components/mini-tools/instagram-generator";
import { toolsData } from "@/data/tool-data";
import { ToolFeatures } from "../_components/mini-tools/tool-features";
import { ToolHowToUse } from "../_components/mini-tools/tool-how-to-use";
import { ToolFAQ } from "../_components/mini-tools/tool-faq";
import { ToolReviewsSection } from "../_components/tool-reviews/review";

export const metadata: Metadata = {
  title: "Instagram Bio & Caption Generator | Social Media Content Creator",
  description:
    "Create engaging Instagram profile bios and captions tailored to your niche. Boost your social media presence with professional, creative content.",
  keywords:
    "Instagram bio generator, Instagram caption generator, social media content, Instagram profile, engagement boost, Instagram marketing",
};

export default function InstagramGeneratorPage() {
  const toolData = toolsData["instagram-generator"];

  return (
    <ToolPageLayout
      title="Instagram Bio & Caption Generator"
      description="Create engaging Instagram profile bios and captions tailored to your niche and style"
    >
      <InstagramGenerator />

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mt-8">
        <ToolFeatures tool={toolData} />
        <ToolHowToUse tool={toolData} />
        <ToolFAQ tool={toolData} />
      </div>
      <ToolReviewsSection
        productSlug="instagram-generator"
        title="Customer Reviews"
      />
    </ToolPageLayout>
  );
}
