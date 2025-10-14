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
  title: "Viral Scorer | Olly.social",
  description:
    "Olly's Viral Scorer analyzes content's viral potential and provides optimization tips. Perfect for content creators, social media managers, and marketers looking to maximize content impact. Analyze viral potential with platform-specific scoring, trend alignment checks, and engagement predictions.",
  alternates: { canonical: "/products/viral-scorer" },
};

export default function ViralScorer() {
  return (
    <>
      <Heading
        title="Viral Scorer"
        subtitle="Olly's Viral Scorer analyzes content's viral potential and provides optimization tips. Perfect for content creators, social media managers, and marketers looking to maximize content impact."
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
      <CTA customLink="https://olly.social/tools/viral-scorer" customText="Try Viral Scorer" />
    </>
  );
} 