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
  title: "Line Breaker | Olly.social",
  description:
    "Olly's Line Breaker formats text with custom line breaks for optimal readability. Perfect for writers, developers, and content creators who need to format text for different platforms. Format text with custom break patterns, multiple output formats, and batch processing capabilities.",
  alternates: { canonical: "/products/line-breaker" },
};

export default function LineBreaker() {
  return (
    <>
      <Heading
        title="Line Breaker"
        subtitle="Olly's Line Breaker formats text with custom line breaks for optimal readability. Perfect for writers, developers, and content creators who need to format text for different platforms."
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
      <CTA customLink="https://olly.social/tools/line-breaker" customText="Try Line Breaker" />
    </>
  );
} 