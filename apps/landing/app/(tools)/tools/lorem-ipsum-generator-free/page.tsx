import { Metadata } from "next";
import { ToolPageLayout } from "../_components/mini-tools/tool-page-layout";
import { LoremGenerator } from "../_components/mini-tools/lorem-generator";
import { toolsData } from "@/data/tool-data";
import { ToolFeatures } from "../_components/mini-tools/tool-features";
import { ToolHowToUse } from "../_components/mini-tools/tool-how-to-use";
import { ToolFAQ } from "../_components/mini-tools/tool-faq";
import { ToolReviewsSection } from "../_components/tool-reviews/review";

export const metadata: Metadata = {
  title: "Lorem Ipsum Generator | Create Placeholder Text",
  description:
    "Generate custom Lorem Ipsum text for your designs and layouts. Choose paragraphs, words, or characters.",
  keywords:
    "lorem ipsum generator, placeholder text, dummy text generator, latin text generator",
};

export default function LoremIpsumPage() {
  const toolData = toolsData["lorem-ipsum-generator-free"];

  return (
    <ToolPageLayout
      title="Lorem Ipsum Generator"
      description="Generate custom placeholder text for your designs"
    >
      <LoremGenerator />

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mt-8">
        <ToolFeatures tool={toolData} />
        <ToolHowToUse tool={toolData} />
        <ToolFAQ tool={toolData} />
      </div>
      <ToolReviewsSection
        productSlug="lorem-ipsum-generator-free"
        title="letterhead-creator"
      />
    </ToolPageLayout>
  );
}
