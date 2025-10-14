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
  title: "Free AI Logo Generator | Olly.social",
  description:
    "Olly's Free AI Logo Generator creates beautiful logos using AI-generated designs with gradient backgrounds. Perfect for startups, small businesses, and entrepreneurs looking to enhance their workflow and productivity. Try our easy-to-use tool with advanced features and intuitive interface.",
  alternates: { canonical: "/products/free-ai-logo-generator" },
};

export default function FreeAILogoGenerator() {
  return (
    <>
      <Heading
        title="Free AI Logo Generator"
        subtitle="Olly's Free AI Logo Generator creates beautiful logos using AI-generated designs with gradient backgrounds. Perfect for startups, small businesses, and entrepreneurs looking to enhance their workflow and productivity."
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
      <CTA customLink="https://olly.social/tools/free-ai-logo-generator" customText="Try Free AI Logo Generator" />
    </>
  );
}
