import { Metadata } from "next";
import { ToolPageLayout } from "../_components/mini-tools/tool-page-layout";
import { toolDetails } from "@/data/tool-details";
import { ToolContentSections } from "../_components/tool-sections/tool-content-sections";
import { GiftSuggester } from "../_components/mini-tools/gift-suggester";
import { ToolReviewsSection } from "../_components/tool-reviews/review";

export const metadata: Metadata = {
  title: "Free AI Gift Suggester | Personalized Gift Recommendations",
  description:
    "Get personalized gift suggestions based on recipient interests, occasion, budget, and relationship. Perfect for birthdays, holidays, and special events.",
  keywords:
    "gift suggester, gift ideas, personalized gifts, ai gift recommendations, perfect gift finder",
};

export default function GiftSuggesterPage() {
  const toolDetail = toolDetails["ai-gift-suggester-free"];

  return (
    <ToolPageLayout
      title={toolDetail.name}
      description={toolDetail.shortDescription}
    >
      <GiftSuggester />

      <div className="mt-12">
        <ToolContentSections toolDetail={toolDetail} />
      </div>

      <ToolReviewsSection
        productSlug="ai-gift-suggester-free"
        title="Customer Reviews"
      />
    </ToolPageLayout>
  );
}
