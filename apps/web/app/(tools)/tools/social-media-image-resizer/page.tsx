import { Metadata } from "next";
import { ToolPageLayout } from "../_components/mini-tools/tool-page-layout";
import { toolsData } from "@/data/tool-data";
import { ToolFeatures } from "../_components/mini-tools/tool-features";
import { ToolHowToUse } from "../_components/mini-tools/tool-how-to-use";
import { ToolFAQ } from "../_components/mini-tools/tool-faq";
import SocialMediaImageResizer from "../_components/mini-tools/social-img-resize";
import { ToolReviewsSection } from "../_components/tool-reviews/review";

export const metadata: Metadata = {
  title: "Social Media Image Resizer | Optimize Images for All Platforms",
  description:
    "Quickly resize images for Facebook, Instagram, Twitter, LinkedIn, Pinterest, and more. Get the perfect image dimensions for all social media platforms.",
  keywords:
    "social media image resizer, image dimensions, Facebook image size, Instagram image size, Twitter image size, LinkedIn image size, Pinterest image size, social media optimization",
};

export default function SocialMediaImageResizerPage() {
  const toolData = toolsData["social-media-image-resizer"];

  return (
    <ToolPageLayout title="Social Image Resizer" description="Create">
      <div className="flex flex-col gap-6">
        <SocialMediaImageResizer />
        <ToolFeatures tool={toolData} />
        <ToolHowToUse tool={toolData} />
        <ToolFAQ tool={toolData} />
      </div>
      <ToolReviewsSection productSlug="" title="social-media-image-resizer" />
    </ToolPageLayout>
  );
}
