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
  title: "AI Content Detector | Olly.social",
  description:
    "Olly's AI Content Detector identifies AI-generated content with high accuracy. Perfect for educators, publishers, and content managers who need to verify content authenticity. Detect AI-written text with 99.9% accuracy, receive detailed analysis reports, and ensure content originality with our advanced detection technology.",
  alternates: { canonical: "/products/ai-content-detector" },
};

export default function AIContentDetector() {
  return (
    <>
      <Heading
        title="AI Content Detector"
        subtitle="Olly's AI Content Detector identifies AI-generated content with high accuracy. Perfect for educators, publishers, and content managers who need to verify content authenticity."
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
      <CTA customLink="https://olly.social/tools/ai-content-detector" customText="Try AI Content Detector" />
    </>
  );
} 