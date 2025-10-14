// app/utm-parameter-builder/page.tsx
import { Metadata } from "next";
import { ToolPageLayout } from "../_components/mini-tools/tool-page-layout";
import UTMParameterBuilder from "../_components/mini-tools/utm-parameter-builder";
import { toolsData } from "@/data/tool-data";
import { ToolFeatures } from "../_components/mini-tools/tool-features";
import { ToolHowToUse } from "../_components/mini-tools/tool-how-to-use";
import { ToolFAQ } from "../_components/mini-tools/tool-faq";
import { ToolReviewsSection } from "../_components/tool-reviews/review";

export const metadata: Metadata = {
  title: "UTM Parameter Builder | Create Campaign Tracking URLs",
  description:
    "Easily create and manage UTM parameters for your marketing campaigns. Track sources, mediums, and campaigns with properly formatted URLs.",
  keywords:
    "UTM parameters, campaign tracking, URL builder, marketing analytics, UTM generator",
};

export default function UTMParameterBuilderPage() {
  const toolData = toolsData["utm-parameter-builder"];

  return (
    <ToolPageLayout
      title="UTM Parameter Builder"
      description="Create trackable campaign URLs with UTM parameters"
    >
      <UTMParameterBuilder />

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mt-8">
        <ToolFeatures tool={toolData} />
        <ToolHowToUse tool={toolData} />
        <ToolFAQ tool={toolData} />
      </div>

      <ToolReviewsSection
        productSlug="username-lookup"
        title="social-media-image-resizer"
      />
    </ToolPageLayout>
  );
}
