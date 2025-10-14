import { Suspense } from "react";
import { ReviewSkeleton } from "../../_components/reviews/review-skeleton";

import { ReviewsSection } from "../../_components/reviews/reviews-section";

import { Metadata } from "next";

import { Heading } from "../../_components/heading";
import { Testimonials } from "../../_components/testimonials";
import { FeaturesAutomation, FeaturesStats } from "../../_components/features";
import { Pricing } from "../../_components/pricing-2";
import FAQs from "../../_components/faq-section";
import { CTA } from "../../_components/cta";

export const metadata: Metadata = {
  title: "Virality Score AI | Olly.social",
  description:
    "Predict the potential virality of your content with Olly.social's Virality Score AI. Utilizing advanced AI algorithms, this tool analyzes your content's engagement metrics, social signals, and audience interaction to provide a comprehensive virality score. Ideal for marketers, content creators, and social media strategists seeking to maximize their online impact, Virality Score AI offers actionable insights to optimize content for virality, ensuring your posts are primed for sharing and engagement.",
  alternates: { canonical: "/virality-score-ai" },
};

export default function ViralityScoreAI() {
  return (
    <>
      <Heading
        title="Virality Score AI"
        subtitle="Harness the power of AI to predict your content's virality with Olly.social. Gain insights into engagement metrics and social signals to strategically boost your online presence."
        image="/step_main.gif"
      />
      <Testimonials />
      <FeaturesStats />
      <Suspense>
        <Pricing />
      </Suspense>
      <FAQs />
      <Suspense fallback={<ReviewSkeleton />}>
        <ReviewsSection />
      </Suspense>

      <CTA />
    </>
  );
}
