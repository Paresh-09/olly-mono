import { Metadata } from "next";
import { ToolPageLayout } from "../_components/mini-tools/tool-page-layout";
import { ChapterGenerator } from "../_components/mini-tools/youtube-chapter-generator";
import { toolsData } from "@/data/tool-data";
import { ToolFeatures } from "../_components/mini-tools/tool-features";
import { ToolHowToUse } from "../_components/mini-tools/tool-how-to-use";
import { ToolFAQ } from "../_components/mini-tools/tool-faq";
import { ToolReviewsSection } from "../_components/tool-reviews/review";

export const metadata: Metadata = {
  title:
    "Video Transcript Chapter Generator for YouTube | Create Timestamps and Chapters",
  description:
    "Generate structured chapters with timestamps from your video transcripts. Perfect for YouTube videos and podcasts.",
  keywords:
    "chapter generator, video chapters, timestamp generator, transcript chapters, video content tools",
};

export default function ChapterGeneratorPage() {
  const toolData = toolsData["youtube-chapters-generator"];

  return (
    <ToolPageLayout
      title="Video Transcript Chapter Generator"
      description="Create structured chapters and timestamps from your video transcripts"
    >
      <ChapterGenerator />

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mt-8">
        <ToolFeatures tool={toolData} />
        <ToolHowToUse tool={toolData} />
        <ToolFAQ tool={toolData} />
      </div>
      <ToolReviewsSection
        productSlug="youtube-chapters-generator"
        title="social-media-image-resizer"
      />
    </ToolPageLayout>
  );
}
