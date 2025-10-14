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
  title: "AI Rap Generator | Olly.social",
  description:
    "Olly's AI Rap Generator creates unique, professional-quality rap lyrics using advanced AI technology. Perfect for musicians, content creators, and hip-hop enthusiasts looking to generate creative lyrics. Choose from multiple rap styles and themes with optimized rhyme schemes.",
  alternates: { canonical: "/products/ai-rap-generator" },
};

export default function AIRapGenerator() {
  return (
    <>
      <Heading
        title="AI Rap Generator"
        subtitle="Olly's AI Rap Generator creates unique, professional-quality rap lyrics using advanced AI technology. Perfect for musicians, content creators, and hip-hop enthusiasts looking to generate creative lyrics."
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
      <CTA customLink="https://olly.social/tools/ai-rap-generator" customText="Try AI Rap Generator" />
    </>
  );
} 