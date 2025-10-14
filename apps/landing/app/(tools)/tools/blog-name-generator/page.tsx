import { Metadata } from "next";
import { ToolPageLayout } from "../_components/mini-tools/tool-page-layout";
import { BlogNameGenerator } from "../_components/mini-tools/blog-name-generator";
import { toolsData } from "@/data/tool-data";
import { ToolFeatures } from "../_components/mini-tools/tool-features";
import { ToolHowToUse } from "../_components/mini-tools/tool-how-to-use";
import { ToolFAQ } from "../_components/mini-tools/tool-faq";
import { ToolReviewsSection } from "../_components/tool-reviews/review";

export const metadata: Metadata = {
  title: "Blog Name Generator | Find the Perfect Name for Your Blog",
  description:
    "Generate creative, memorable, and SEO-friendly blog names with our AI-powered blog name generator. Find the perfect name for your niche in seconds.",
  keywords:
    "blog name generator, blog title ideas, website name generator, domain name ideas, creative blog names, SEO blog names, blog branding, name finder",
};

export default function BlogNameGeneratorPage() {
  const toolData = toolsData["blog-name-generator"];

  return (
    <ToolPageLayout
      title="Blog Name Generator"
      description="Find the perfect name for your blog with creative, brandable, and SEO-friendly ideas"
    >
      <BlogNameGenerator />
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mt-8">
        <ToolFeatures tool={toolData} />
        <ToolHowToUse tool={toolData} />
        <ToolFAQ tool={toolData} />
      </div>
      <ToolReviewsSection
        productSlug="blog-name-generator"
        title="Customer Reviews"
      />
    </ToolPageLayout>
  );
}
