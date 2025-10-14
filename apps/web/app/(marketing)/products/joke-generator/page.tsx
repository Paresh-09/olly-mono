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
  title: "Joke Generator | Olly.social",
  description:
    "Olly's Joke Generator creates clean, funny jokes for any occasion. Perfect for public speakers, content creators, and anyone looking to add humor to their communications. Generate jokes from multiple categories with family-friendly content that's suitable for all audiences.",
  alternates: { canonical: "/products/joke-generator" },
};

export default function JokeGenerator() {
  return (
    <>
      <Heading
        title="Joke Generator"
        subtitle="Olly's Joke Generator creates clean, funny jokes for any occasion. Perfect for public speakers, content creators, and anyone looking to add humor to their communications."
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
      <CTA customLink="https://olly.social/tools/joke-generator" customText="Try Joke Generator" />
    </>
  );
} 