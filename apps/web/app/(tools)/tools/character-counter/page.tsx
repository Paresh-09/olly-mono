import { Metadata } from "next";
import { ToolPageLayout } from "../_components/mini-tools/tool-page-layout";
import { CharacterCounter } from "../_components/mini-tools/character-counter";
import { toolsData } from "@/data/tool-data";
import { ToolFeatures } from "../_components/mini-tools/tool-features";
import { ToolHowToUse } from "../_components/mini-tools/tool-how-to-use";
import { ToolFAQ } from "../_components/mini-tools/tool-faq";
import { ToolReviewsSection } from "../_components/tool-reviews/review";
import { toolDetails } from "@/data/tool-details";
import { ToolContentSections } from "../_components/tool-sections/tool-content-sections";

export const metadata: Metadata = {
  title: "Social Media Character Counter | Twitter, Instagram, LinkedIn Limits",
  description:
    "Free character counter for social media posts. Track Twitter, Instagram, LinkedIn, and TikTok character limits in real-time.",
  keywords:
    "social media character counter, twitter character limit, instagram caption length, linkedin post length",
};

export default function CharacterCounterPage() {
  const toolDetail = toolDetails["social-media-character-counter"];

  return (
    <ToolPageLayout
      title="Social Media Character Counter"
      description="Track character limits for all your social media posts"
    >
      <CharacterCounter />

      <div className="mt-12">
        <ToolContentSections toolDetail={toolDetail} />
      </div>

      <ToolReviewsSection
        productSlug="character-counter"
        title="Customer Reviews"
      />
    </ToolPageLayout>
  );
}
