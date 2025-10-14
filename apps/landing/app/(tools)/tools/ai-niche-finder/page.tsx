import { Metadata } from "next";
import { ToolPageLayout } from "../_components/mini-tools/tool-page-layout";
import { toolsData } from "@/data/tool-data";
import { ToolFeatures } from "../_components/mini-tools/tool-features";
import { ToolHowToUse } from "../_components/mini-tools/tool-how-to-use";
import { ToolFAQ } from "../_components/mini-tools/tool-faq";
import NicheFinder from "../_components/mini-tools/ai-niche-finder";
import { ToolReviewsSection } from "../_components/tool-reviews/review";
import { toolDetails } from "@/data/tool-details";
import { ToolContentSections } from "../_components/tool-sections/tool-content-sections";

export const metadata: Metadata = {
  title: "AI Content Creator Niche Finder | Find Your Perfect Content Niche",
  description:
    "Discover your ideal content creation niche with AI-powered analysis. Get personalized recommendations based on your skills, interests, and market opportunities.",
  keywords:
    "content creator niche finder, profitable niche ideas, niche research tool, content niche analysis, ai niche finder, youtube niche finder, content creator ideas, niche market analysis, content strategy tool, niche validation tool, profitable content niches, content creator guide",
};

export default function NicheFinderPage() {
  const toolDetail = toolDetails["ai-niche-finder"];

  return (
    <ToolPageLayout
      title="AI Content Creator Niche Finder"
      description="Find your perfect content creation niche with AI-powered analysis"
    >
      <NicheFinder />

      <div className="mt-12">
        <ToolContentSections toolDetail={toolDetail} />
      </div>
      <ToolReviewsSection
        productSlug="ai-niche-finder"
        title="Customer Reviews"
      />
    </ToolPageLayout>
  );
}
