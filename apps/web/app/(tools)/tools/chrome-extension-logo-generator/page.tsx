import { Metadata } from "next";
import { ToolPageLayout } from "../_components/mini-tools/tool-page-layout";
import { ChromeExtensionLogoGenerator } from "../_components/mini-tools/chrome-extension-logo-generator";
import { toolsData } from "@/data/tool-data";
import { ToolFeatures } from "../_components/mini-tools/tool-features";
import { ToolHowToUse } from "../_components/mini-tools/tool-how-to-use";
import { ToolFAQ } from "../_components/mini-tools/tool-faq";
import { ToolReviewsSection } from "../_components/tool-reviews/review";

export const metadata: Metadata = {
  title: "Chrome Extension Logo Generator | Create Icons for Chrome Web Store",
  description:
    "Generate all required logo sizes for Chrome extensions. Create, customize, and download logo packages with manifest.json examples.",
  keywords:
    "Chrome extension logo, Chrome Web Store icon, browser extension icon, manifest.json, Chrome extension development",
};

export default function ChromeExtensionLogoGeneratorPage() {
  const toolData = toolsData["chrome-extension-logo-generator"];

  return (
    <ToolPageLayout
      title="Chrome Extension Logo Generator"
      description="Generate all required logo sizes for Chrome extensions and the Chrome Web Store"
    >
      <ChromeExtensionLogoGenerator />

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mt-8">
        <ToolFeatures tool={toolData} />
        <ToolHowToUse tool={toolData} />
        <ToolFAQ tool={toolData} />
      </div>
      <ToolReviewsSection
        productSlug="chrome-extension-logo-generator"
        title="Customer Reviews"
      />
    </ToolPageLayout>
  );
}
