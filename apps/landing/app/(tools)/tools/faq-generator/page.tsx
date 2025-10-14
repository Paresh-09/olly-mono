import { Metadata } from "next";
import { ToolPageLayout } from "../_components/mini-tools/tool-page-layout";
import { FaqGenerator } from "../_components/mini-tools/faq-generator";
import { toolsData } from "@/data/tool-data";
import { ToolFeatures } from "../_components/mini-tools/tool-features";
import { ToolHowToUse } from "../_components/mini-tools/tool-how-to-use";
import { ToolFAQ } from "../_components/mini-tools/tool-faq";
import { ToolReviewsSection } from "../_components/tool-reviews/review";

export const metadata: Metadata = {
  title: "FAQ Generator | Create Comprehensive FAQ Sections",
  description:
    "Generate professional, SEO-friendly FAQ sections for your website, product, or service with our AI-powered FAQ generator. Includes schema markup for better search visibility.",
  keywords:
    "FAQ generator, question answers, FAQ maker, FAQ schema, FAQPage schema, SEO FAQ, structured data, website FAQ generator, product FAQs",
};

export default function FaqGeneratorPage() {
  const toolData = toolsData["faq-generator"];

  return (
    <ToolPageLayout
      title="FAQ Generator"
      description="Create comprehensive, SEO-friendly FAQ sections with schema markup"
    >
      <FaqGenerator />
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mt-8">
        <ToolFeatures tool={toolData} />
        <ToolHowToUse tool={toolData} />
        <ToolFAQ tool={toolData} />
      </div>
      <ToolReviewsSection
        productSlug="faq-generator"
        title="Customer Reviews"
      />
    </ToolPageLayout>
  );
}
