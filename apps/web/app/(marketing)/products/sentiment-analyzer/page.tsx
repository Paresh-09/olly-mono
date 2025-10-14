import { Suspense } from "react";
import { ReviewSkeleton } from "../../_components/reviews/review-skeleton";
import { ReviewsSection } from "../../_components/reviews/reviews-section";
import { Metadata } from "next";
import { Heading } from "../../_components/heading";
import { Testimonials } from "../../_components/testimonials";
import { FeaturesAutomation } from "../../_components/features";
import { Pricing } from "../../_components/pricing-2";
import FAQs from "../../_components/faq-section";
import { CTA } from "../../_components/cta";

export const metadata: Metadata = {
  title: "Sentiment Analyzer | Olly.social",
  description:
    "Olly's Sentiment Analyzer evaluates text sentiment and emotional tone in content. Perfect for marketers, researchers, and customer service teams who need to understand audience reactions. Analyze sentiment with multiple language support, emotional tone detection, and detailed reports.",
  alternates: { canonical: "/products/sentiment-analyzer" },
};

export default function SentimentAnalyzer() {
  return (
    <>
      <Heading
        title="Sentiment Analyzer"
        subtitle="Olly's Sentiment Analyzer evaluates text sentiment and emotional tone in content. Perfect for marketers, researchers, and customer service teams who need to understand audience reactions."
        image="/step_main.gif"
      />
      <Testimonials />
      <FeaturesAutomation />
      <Suspense>
        <Pricing />
      </Suspense>
      <FAQs />
      <Suspense fallback={<ReviewSkeleton />}>
        <ReviewsSection />
      </Suspense>
      <CTA customLink="https://olly.social/tools/sentiment-analyzer" customText="Try Sentiment Analyzer" />
    </>
  );
} 