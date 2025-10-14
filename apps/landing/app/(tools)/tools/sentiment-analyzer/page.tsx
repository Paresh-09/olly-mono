import { Metadata } from "next";
import { ToolPageLayout } from "../_components/mini-tools/tool-page-layout";
import { ContentAnalyzerTool } from "../_components/mini-tools/content-analysis";
import { toolsData } from "@/data/tool-data";
import { ToolFeatures } from "../_components/mini-tools/tool-features";
import { ToolHowToUse } from "../_components/mini-tools/tool-how-to-use";
import { ToolFAQ } from "../_components/mini-tools/tool-faq";
import { ToolReviewsSection } from "../_components/tool-reviews/review";

export const metadata: Metadata = {
  title: "Social Media Sentiment Analyzer | Post Impact Analysis",
  description:
    "Analyze the emotional impact and audience reception of your social media posts before publishing.",
  keywords:
    "sentiment analysis, social media analyzer, content emotion, post impact",
};

export default function SentimentAnalyzerPage() {
  const toolData = toolsData["sentiment-analyzer"];

  return (
    <ToolPageLayout
      title="Sentiment Analyzer"
      description="Analyze the emotional impact of your posts"
    >
      <ContentAnalyzerTool
        toolType="sentiment-analyzer"
        placeholder="Paste your social media post for sentiment analysis..."
      />

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mt-8">
        <ToolFeatures tool={toolData} />
        <ToolHowToUse tool={toolData} />
        <ToolFAQ tool={toolData} />
      </div>
      <ToolReviewsSection
        productSlug="sentiment-analyzer"
        title="letterhead-creator"
      />
    </ToolPageLayout>
  );
}
