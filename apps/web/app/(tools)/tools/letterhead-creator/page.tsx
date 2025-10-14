import { Metadata } from "next";
import { ToolPageLayout } from "../_components/mini-tools/tool-page-layout";
import { toolsData } from "@/data/tool-data";
import { ToolFeatures } from "../_components/mini-tools/tool-features";
import { ToolHowToUse } from "../_components/mini-tools/tool-how-to-use";
import { ToolFAQ } from "../_components/mini-tools/tool-faq";
import { LetterheadCreator } from "../_components/mini-tools/letterhead-creator";
import { ToolReviewsSection } from "../_components/tool-reviews/review";
import { toolDetails } from "@/data/tool-details";
import { ToolContentSections } from "../_components/tool-sections/tool-content-sections";

export const metadata: Metadata = {
  title: "Company Letterhead Creator | Professional Business Letterheads",
  description:
    "Create professional company letterheads with customizable templates, logo integration, and content editing. Download or print ready-to-use business communications.",
  keywords:
    "letterhead creator, business letterhead, company letterhead generator, company letterhead, professional letterhead, letterhead template, custom letterhead, business communication, corporate stationery",
};

export default function LetterheadCreatorPage() {
  const toolDetail = toolDetails["letterhead-creator"];

  return (
    <ToolPageLayout
      title="Company Letterhead Creator"
      description="Create professional letterheads with your company branding and custom content for business communications"
    >
      <LetterheadCreator />

      <div className="mt-12">
        <ToolContentSections toolDetail={toolDetail} />
      </div>

      <ToolReviewsSection
        productSlug="letterhead-creator"
        title="Customer Reviews"
      />
    </ToolPageLayout>
  );
}
