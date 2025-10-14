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
  title: "Case Converter | Olly.social",
  description:
    "Olly's Case Converter transforms text between multiple case formats instantly. Perfect for developers, writers, and content creators who need to convert between camelCase, snake_case, kebab-case, and more. Convert text with batch processing capabilities and instant previews.",
  alternates: { canonical: "/products/case-converter" },
};

export default function CaseConverter() {
  return (
    <>
      <Heading
        title="Case Converter"
        subtitle="Olly's Case Converter transforms text between multiple case formats instantly. Perfect for developers, writers, and content creators who need to convert between camelCase, snake_case, kebab-case, and more."
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
      <CTA customLink="https://olly.social/tools/case-converter" customText="Try Case Converter" />
    </>
  );
} 