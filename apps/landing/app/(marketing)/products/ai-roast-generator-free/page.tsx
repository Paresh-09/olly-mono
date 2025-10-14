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
  title: "AI Roast Generator Free | Olly.social",
  description:
    "Olly's AI Roast Generator creates playful roasts and comebacks for any occasion. Perfect for comedy writers, event hosts, and friends looking to add humor to gatherings. Generate customized roasts with adjustable intensity and clean content filters.",
  alternates: { canonical: "/products/ai-roast-generator-free" },
};

export default function AIRoastGeneratorFree() {
  return (
    <>
      <Heading
        title="AI Roast Generator"
        subtitle="Olly's AI Roast Generator creates playful roasts and comebacks for any occasion. Perfect for comedy writers, event hosts, and friends looking to add humor to gatherings."
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
      <CTA customLink="https://olly.social/tools/ai-roast-generator-free" customText="Try AI Roast Generator" />
    </>
  );
} 