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
  title: "AI Rizz Generator | Olly.social",
  description:
    "Olly's AI Rizz Generator creates smooth, witty, and engaging conversation starters and pickup lines. Perfect for dating app users, social butterflies, and anyone looking to improve their conversational skills. Generate context-aware responses with customizable personality styles.",
  alternates: { canonical: "/products/ai-rizz-generator" },
};

export default function AIRizzGenerator() {
  return (
    <>
      <Heading
        title="AI Rizz Generator"
        subtitle="Olly's AI Rizz Generator creates smooth, witty, and engaging conversation starters and pickup lines. Perfect for dating app users, social butterflies, and anyone looking to improve their conversational skills."
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
      <CTA customLink="https://olly.social/tools/ai-rizz-generator" customText="Try AI Rizz Generator" />
    </>
  );
} 