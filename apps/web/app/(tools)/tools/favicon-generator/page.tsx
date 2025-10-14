import { Metadata } from "next";
import { ToolPageLayout } from "../_components/mini-tools/tool-page-layout";
import { FaviconGenerator } from "../_components/mini-tools/favicon-generator";
import { toolsData } from "@/data/tool-data";
import { ToolFeatures } from "../_components/mini-tools/tool-features";
import { ToolHowToUse } from "../_components/mini-tools/tool-how-to-use";
import { ToolFAQ } from "../_components/mini-tools/tool-faq";
import { ToolReviewsSection } from "../_components/tool-reviews/review";

export const metadata: Metadata = {
  title: "Favicon Generator | Create Icons for All Devices",
  description:
    "Generate favicons in all sizes needed for modern websites and apps. Create, customize, and download favicon packages with HTML code snippets.",
  keywords:
    "favicon generator, website icon, app icon, PWA icon, favicon sizes, favicon package, HTML favicon code",
};

export default function FaviconGeneratorPage() {
  const toolData = toolsData["favicon-generator"];

  return (
    <ToolPageLayout
      title="Favicon Generator"
      description="Generate favicons in all sizes needed for modern websites and apps"
    >
      <FaviconGenerator />

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mt-8">
        <ToolFeatures tool={toolData} />
        <ToolHowToUse tool={toolData} />
        <ToolFAQ tool={toolData} />
      </div>
      <ToolReviewsSection
        productSlug="favicon-generator"
        title="Customer Reviews"
      />
    </ToolPageLayout>
  );
}
