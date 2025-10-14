import { Metadata } from "next";
import { ToolPageLayout } from "../_components/mini-tools/tool-page-layout";
import YoutubeSubscriptionButtonCreator from "./_components/youtube-subscription-button-creator";
import { toolsData } from "@/data/tool-data";
import { ToolFeatures } from "../_components/mini-tools/tool-features";
import { ToolHowToUse } from "../_components/mini-tools/tool-how-to-use";
import { ToolFAQ } from "../_components/mini-tools/tool-faq";
import { ToolReviewsSection } from "../_components/tool-reviews/review";

export const metadata: Metadata = {
  title:
    "YouTube Subscription Button Creator | Add Subscribe Buttons to Your Website",
  description:
    "Create customizable YouTube subscription buttons for your website. Easily generate code for YouTube channel subscribe buttons with just a few clicks.",
  keywords:
    "YouTube subscription button, YouTube subscribe button, channel subscribe button, YouTube channel button, website integration",
};

export default function YoutubeSubscriptionButtonCreatorPage() {
  const toolData = toolsData["youtube-subscription-button-creator"];

  return (
    <ToolPageLayout
      title="YouTube Subscription Button Creator"
      description="Create customizable YouTube subscription buttons for your website"
    >
      <YoutubeSubscriptionButtonCreator />

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mt-8">
        <ToolFeatures tool={toolData} />
        <ToolHowToUse tool={toolData} />
        <ToolFAQ tool={toolData} />
      </div>
      <ToolReviewsSection
        productSlug="youtube-subscription-button-creator"
        title="youtube-description-generator"
      />
    </ToolPageLayout>
  );
}
