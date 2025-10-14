import { Metadata } from "next";
import { ToolPageLayout } from "../_components/mini-tools/tool-page-layout";
import { RobotsTxtGenerator } from "../_components/mini-tools/robot-txt-generator";
import { toolsData } from "@/data/tool-data";
import { ToolFeatures } from "../_components/mini-tools/tool-features";
import { ToolHowToUse } from "../_components/mini-tools/tool-how-to-use";
import { ToolFAQ } from "../_components/mini-tools/tool-faq";
import { ToolReviewsSection } from "../_components/tool-reviews/review";

export const metadata: Metadata = {
  title: "Robots.txt Generator | Create SEO-Friendly Website Directives",
  description:
    "Easily generate a robots.txt file to control search engine crawling and indexing of your website. Simple, user-friendly tool for webmasters and SEO professionals.",
  keywords:
    "robots.txt generator, SEO tool, website crawling, search engine optimization, webmaster tools",
};

export default function RobotsTxtGeneratorPage() {
  const toolData = toolsData["robot-txt-generator"];

  return (
    <ToolPageLayout
      title="Robots.txt Generator"
      description="Create custom robots.txt files to optimize your website's search engine indexing"
    >
      <RobotsTxtGenerator />

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mt-8">
        <ToolFeatures tool={toolData} />
        <ToolHowToUse tool={toolData} />
        <ToolFAQ tool={toolData} />
      </div>
      <ToolReviewsSection
        productSlug="robot-txt-generator"
        title="letterhead-creator"
      />
    </ToolPageLayout>
  );
}
