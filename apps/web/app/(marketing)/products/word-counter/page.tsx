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
  title: "Word Counter | Olly.social",
  description:
    "Olly's Word Counter counts words, characters, sentences, and provides readability metrics. Perfect for writers, students, and content creators who need to meet specific content requirements. Get real-time statistics, readability scoring, and SEO analysis for your text.",
  alternates: { canonical: "/products/word-counter" },
};

export default function WordCounter() {
  return (
    <>
      <Heading
        title="Word Counter"
        subtitle="Olly's Word Counter counts words, characters, sentences, and provides readability metrics. Perfect for writers, students, and content creators who need to meet specific content requirements."
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
      <CTA customLink="https://olly.social/tools/word-counter" customText="Try Word Counter" />
    </>
  );
} 