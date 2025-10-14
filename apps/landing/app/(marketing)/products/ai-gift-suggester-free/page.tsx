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
  title: "AI Gift Suggester Free | Olly.social",
  description:
    "Olly's AI Gift Suggester helps you find the perfect gift for any occasion. Perfect for those struggling with gift ideas, last-minute shoppers, and anyone wanting to give thoughtful, personalized presents. Get tailored gift recommendations based on recipient preferences, occasion, budget, and interests.",
  alternates: { canonical: "/products/ai-gift-suggester-free" },
};

export default function AIGiftSuggesterFree() {
  return (
    <>
      <Heading
        title="AI Gift Suggester"
        subtitle="Olly's AI Gift Suggester helps you find the perfect gift for any occasion. Perfect for those struggling with gift ideas, last-minute shoppers, and anyone wanting to give thoughtful, personalized presents."
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
      <CTA customLink="https://olly.social/tools/ai-gift-suggester-free" customText="Try AI Gift Suggester" />
    </>
  );
} 