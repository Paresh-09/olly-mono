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
  title: "Engagement Optimizer | Olly.social",
  description:
    "Olly's Engagement Optimizer analyzes and optimizes your content for maximum social media engagement. Perfect for social media managers, content creators, and marketers looking to increase their reach and impact. Get platform-specific recommendations, hashtag suggestions, and best posting time calculations.",
  alternates: { canonical: "/products/engagement-optimizer" },
};

export default function EngagementOptimizer() {
  return (
    <>
      <Heading
        title="Engagement Optimizer"
        subtitle="Olly's Engagement Optimizer analyzes and optimizes your content for maximum social media engagement. Perfect for social media managers, content creators, and marketers looking to increase their reach and impact."
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
      <CTA customLink="https://olly.social/tools/engagement-optimizer" customText="Try Engagement Optimizer" />
    </>
  );
} 