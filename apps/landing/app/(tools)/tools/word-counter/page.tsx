import { Metadata } from "next";
import { TextAnalyzer } from "../_components/mini-tools/text-analyzer";
import { ToolPageLayout } from "../_components/mini-tools/tool-page-layout";
import { BenefitsList } from "../_components/mini-tools/benefits-list";
import { ToolReviewsSection } from "../_components/tool-reviews/review";

export const metadata: Metadata = {
  title: "Free Word Counter Tool | Count Characters, Sentences & More",
  description:
    "Free online word counter tool to count words, characters, sentences and estimate reading time. Perfect for essays, social media posts, and content writing.",
  openGraph: {
    title: "Free Word Counter Tool | Count Characters, Sentences & More",
    description:
      "Free online word counter tool to count words, characters, sentences and estimate reading time.",
    type: "website",
  },
  keywords:
    "word counter, character counter, sentence counter, reading time calculator, text analysis tool",
};

const benefits = [
  {
    title: "Instant Word Count",
    description: "Get real-time word count as you type or paste text",
  },
  {
    title: "Detailed Statistics",
    description:
      "View character count, sentence count, and estimated reading time",
  },
  {
    title: "User Friendly",
    description: "Clean interface with easy-to-read statistics",
  },
];

export default function WordCounterPage() {
  return (
    <ToolPageLayout
      title="Word Counter"
      description="Instantly count words, characters, and more"
    >
      <TextAnalyzer />
      <BenefitsList benefits={benefits} />
      <ToolReviewsSection
        productSlug="word-counter"
        title="User Reviews"
      />
    </ToolPageLayout>
  );
}
