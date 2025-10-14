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
  title: "Character Counter | Olly.social",
  description:
    "Olly's Character Counter helps you count characters, words, and paragraphs instantly. Perfect for writers, social media managers, and students who need to meet specific content length requirements. Get real-time statistics and social media length checking with this free tool.",
  alternates: { canonical: "/products/character-counter" },
};

export default function CharacterCounter() {
  return (
    <>
      <Heading
        title="Character Counter"
        subtitle="Olly's Character Counter helps you count characters, words, and paragraphs instantly. Perfect for writers, social media managers, and students who need to meet specific content length requirements."
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
      <CTA customLink="https://olly.social/tools/character-counter" customText="Try Character Counter" />
    </>
  );
} 