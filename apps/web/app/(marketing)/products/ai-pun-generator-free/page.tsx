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
  title: "AI Pun Generator Free | Olly.social",
  description:
    "Olly's AI Pun Generator creates clever puns and wordplay for any topic. Perfect for content creators, social media managers, and anyone looking to add humor to their writing. Generate multiple pun styles with adjustable complexity for any subject matter.",
  alternates: { canonical: "/products/ai-pun-generator-free" },
};

export default function AIPunGeneratorFree() {
  return (
    <>
      <Heading
        title="AI Pun Generator"
        subtitle="Olly's AI Pun Generator creates clever puns and wordplay for any topic. Perfect for content creators, social media managers, and anyone looking to add humor to their writing."
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
      <CTA customLink="https://olly.social/tools/ai-pun-generator-free" customText="Try AI Pun Generator" />
    </>
  );
} 