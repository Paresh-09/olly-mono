import { Metadata } from "next";
import { ToolPageLayout } from "../_components/mini-tools/tool-page-layout";
import MetaTagGenerator from "../_components/mini-tools/meta-tag-generator";
import { toolsData } from "@/data/tool-data";
import { ToolFeatures } from "../_components/mini-tools/tool-features";
import { ToolHowToUse } from "../_components/mini-tools/tool-how-to-use";
import { ToolFAQ } from "../_components/mini-tools/tool-faq";
import { ToolReviewsSection } from "../_components/tool-reviews/review";

export const metadata: Metadata = {
  title: "Meta Tag Generator | Create SEO-Friendly Meta Tags for Your Website",
  description:
    "Generate optimized meta tags for better SEO. Create title, description, Open Graph, and Twitter Card tags to improve your site visibility.",
  keywords:
    "meta tag generator, SEO meta tags, Open Graph tags, Twitter Cards, SEO optimization, HTML meta tags",
};

export default function MetaTagGeneratorPage() {
  const toolData = toolsData["meta-tag-generator"];

  return (
    <ToolPageLayout
      title="Meta Tag Generator"
      description="Create SEO-friendly meta tags to improve your website's search engine visibility"
    >
      <MetaTagGenerator />

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mt-8">
        <ToolFeatures tool={toolData} />
        <ToolHowToUse tool={toolData} />
        <ToolFAQ tool={toolData} />
      </div>
      <ToolReviewsSection
        productSlug="meta-tag-generator"
        title="letterhead-creator"
      />
    </ToolPageLayout>
  );
}
