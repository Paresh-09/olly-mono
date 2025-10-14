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
  title: "AI Review Generator | Olly.social",
  description:
    "Olly's AI Review Generator creates authentic, detailed reviews for products, services, and businesses. Perfect for marketers, business owners, and content creators looking to showcase customer experiences. Generate balanced, credible reviews that highlight key features and benefits while maintaining authenticity.",
  alternates: { canonical: "/products/ai-review-generator" },
};

export default function AIReviewGenerator() {
  return (
    <>
      <Heading
        title="AI Review Generator"
        subtitle="Olly's AI Review Generator creates authentic, detailed reviews for products, services, and businesses. Perfect for marketers, business owners, and content creators looking to showcase customer experiences."
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
      <CTA customLink="https://olly.social/tools/ai-review-generator" customText="Try AI Review Generator" />
    </>
  );
} 