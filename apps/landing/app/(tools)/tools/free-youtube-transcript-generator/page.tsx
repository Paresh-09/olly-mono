// app/tools/youtube-transcript-extractor/page.tsx
import { Metadata } from "next";
import { ToolPageLayout } from "../_components/mini-tools/tool-page-layout";
import { TranscriptLanding } from "../_components/mini-tools/yt-basic-transcript-input";
import { toolsData } from "@/data/tool-data";
import { ToolFeatures } from "../_components/mini-tools/tool-features";
import { ToolHowToUse } from "../_components/mini-tools/tool-how-to-use";
import { ToolFAQ } from "../_components/mini-tools/tool-faq";
import { ToolReviewsSection } from "../_components/tool-reviews/review";

export const metadata: Metadata = {
  title: "YouTube Transcript Generator | Extract & Download Video Transcripts",
  description:
    "Generate YouTube video transcripts easily. Search through captions, download in multiple formats (TXT, SRT), and get AI-powered summaries and chapters.",
  keywords:
    "youtube transcript generator, video captions, youtube subtitles, transcript downloader, video transcription tool, caption search, AI summary",
  openGraph: {
    title:
      "YouTube Transcript Generator | Extract & Download Video Transcripts",
    description:
      "Generate YouTube video transcripts easily. Search through captions, download in multiple formats, and get AI-powered summaries.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "YouTube Transcript Generator | Extract & Download Video Transcripts",
    description:
      "Generate YouTube video transcripts easily. Search through captions, download in multiple formats, and get AI-powered summaries.",
  },
};

export default function YouTubeTranscriptGeneratorPage() {
  const toolData = toolsData["free-youtube-transcript-generator"];

  return (
    <ToolPageLayout
      title="YouTube Transcript Generator"
      description="Generate transcripts from any YouTube video. Search through captions and download in multiple formats."
    >
      <TranscriptLanding />

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mt-8">
        <ToolFeatures tool={toolData} />
        <ToolHowToUse tool={toolData} />
        <ToolFAQ tool={toolData} />
      </div>
      <ToolReviewsSection
        productSlug="free-youtube-transcript-generator"
        title="Customer Reviews"
      />
    </ToolPageLayout>
  );
}
