import { Suspense } from "react";
import { ReviewSkeleton } from "../../_components/reviews/review-skeleton";

import { ReviewsSection } from "../../_components/reviews/reviews-section";

import { Metadata } from "next";

import { Heading } from "../../_components/heading";
import { Testimonials } from "../../_components/testimonials";
import { FeaturesAutomation, FeaturesUnsubscribe } from "../../_components/features";
import { Pricing } from "../../_components/pricing-2";
import FAQs from "../../_components/faq-section";
import { CTA } from "../../_components/cta";

export const metadata: Metadata = {
  title: "Social Media Post Virality Score Calculator | Olly.social",
  description:
    "Maximize your social media impact with Olly.social's Virality Score Calculator. This advanced tool uses AI to predict the potential virality of your posts, offering insights into engagement, reach, and effectiveness. Designed for marketers, content creators, and social media enthusiasts, our calculator provides actionable feedback to enhance your posts' performance, ensuring they resonate with your audience and increase your social media presence.",
  alternates: { canonical: "/social-media-post-virality-score-calculator" },
};

export default function SocialMediaPostViralityScoreCalculator() {
  return (
    <>
      <Heading
        title="Social Media Post Virality Score Calculator"
        subtitle="Elevate your social media strategy with Olly.social. Discover the potential of your posts with our AI-powered Virality Score Calculator and make every post count."
        image="/step_main.gif"
      />
      <Testimonials />
      <FeaturesUnsubscribe />
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
