import { Metadata } from "next";
import { ToolPageLayout } from "../_components/mini-tools/tool-page-layout";
import { PngToIcoConverter } from "../_components/mini-tools/png-to-ico-converter";
import { toolsData } from "@/data/tool-data";
import { ToolFeatures } from "../_components/mini-tools/tool-features";
import { ToolHowToUse } from "../_components/mini-tools/tool-how-to-use";
import { ToolFAQ } from "../_components/mini-tools/tool-faq";
import { ToolReviewsSection } from "../_components/tool-reviews/review";

export const metadata: Metadata = {
  title: "PNG to ICO Converter | Free Online Icon Converter",
  description:
    "Convert PNG images to ICO format for favicons and desktop icons. Free online tool with no watermarks or registration required.",
  keywords:
    "PNG to ICO, icon converter, favicon converter, ICO generator, free converter, online converter, image converter",
};

export default function PngToIcoConverterPage() {
  const toolData = toolsData["png-to-ico-converter"];

  return (
    <ToolPageLayout
      title="PNG to ICO Converter"
      description="Convert PNG images to ICO format for favicons and desktop icons"
    >
      <PngToIcoConverter />

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mt-8">
        <ToolFeatures tool={toolData} />
        <ToolHowToUse tool={toolData} />
        <ToolFAQ tool={toolData} />
      </div>
      <ToolReviewsSection
        productSlug="png-to-ico-converter"
        title="letterhead-creator"
      />
    </ToolPageLayout>
  );
}
