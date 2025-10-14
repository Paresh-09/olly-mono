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
  title: "AI Insult Generator | Olly.social",
  description:
    "Olly's AI Insult Generator creates witty, creative insults for comedic purposes. Perfect for comedy writers, roast events, and entertainment content creators looking for humorous material. Generate clever, boundary-pushing jokes while maintaining ethical standards and avoiding truly offensive content.",
  alternates: { canonical: "/products/ai-insult-generator" },
};

export default function AIInsultGenerator() {
  return (
    <>
      <Heading
        title="AI Insult Generator"
        subtitle="Olly's AI Insult Generator creates witty, creative insults for comedic purposes. Perfect for comedy writers, roast events, and entertainment content creators looking for humorous material."
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
      <CTA customLink="https://www.olly.social/tools/ai-insult-generator-free" customText="Try AI Insult Generator" />
    </>
  );
} 