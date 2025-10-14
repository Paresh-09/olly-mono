import { Metadata } from "next";
import { ToolPageLayout } from "../_components/mini-tools/tool-page-layout";
import { FancyTextGenerator } from "../_components/fancy-text/fancy-text-generator";
import { toolsData } from "@/data/tool-data";
import { ToolFeatures } from "../_components/mini-tools/tool-features";
import { ToolHowToUse } from "../_components/mini-tools/tool-how-to-use";
import { ToolFAQ } from "../_components/mini-tools/tool-faq";
import { ToolReviewsSection } from "../_components/tool-reviews/review";

export const metadata: Metadata = {
  title: "Fancy Text Generator | Create Stylish Unicode Text Effects",
  description:
    "Transform plain text into stylish unicode text styles for social media, usernames, and more. Free, easy-to-use text converter with multiple font styles.",
  keywords:
    "fancy text generator, unicode text, stylish text, text converter, social media fonts, aesthetic text, cool text fonts",
};

export default function FancyTextGeneratorPage() {
  const toolData = toolsData["fancy-text-generator"];

  return (
    <ToolPageLayout
      title="Fancy Text Generator"
      description="Transform ordinary text into stylish unicode text for social media, bio, and more"
    >
      <FancyTextGenerator />

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mt-8">
        <ToolFeatures tool={toolData} />
        <ToolHowToUse tool={toolData} />
        <ToolFAQ tool={toolData} />
      </div>
      <ToolReviewsSection
        productSlug="fancy-text-generator"
        title="Customer Reviews"
      />
    </ToolPageLayout>
  );
}
