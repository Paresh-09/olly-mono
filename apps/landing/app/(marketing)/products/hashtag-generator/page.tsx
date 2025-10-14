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
  title: "Hashtag Generator | Olly.social",
  description:
    "Olly's Hashtag Generator creates relevant, trending hashtags for your social media content. Perfect for social media managers, influencers, and businesses looking to increase their content visibility. Generate platform-specific tags with engagement rate predictions and trending hashtag analysis.",
  alternates: { canonical: "/products/hashtag-generator" },
};

export default function HashtagGenerator() {
  return (
    <>
      <Heading
        title="Hashtag Generator"
        subtitle="Olly's Hashtag Generator creates relevant, trending hashtags for your social media content. Perfect for social media managers, influencers, and businesses looking to increase their content visibility."
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
      <CTA customLink="https://olly.social/tools/hashtag-generator" customText="Try Hashtag Generator" />
    </>
  );
} 