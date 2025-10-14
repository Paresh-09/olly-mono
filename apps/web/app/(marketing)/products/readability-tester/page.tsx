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
  title: "AI Readability Tester | Olly.social",
  description:
    "Olly's AI Readability Tester provides advanced AI-powered text analysis and readability insights. Perfect for writers, content creators, and educators looking to enhance their workflow and productivity. Try our easy-to-use tool with advanced features and intuitive interface.",
  alternates: { canonical: "/products/readability-tester" },
};

export default function AIReadabilityTester() {
  return (
    <>
      <Heading
        title="AI Readability Tester"
        subtitle="Olly's AI Readability Tester provides advanced AI-powered text analysis and readability insights. Perfect for writers, content creators, and educators looking to enhance their workflow and productivity."
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
      <CTA customLink="https://olly.social/tools/readability-tester" customText="Try AI Readability Tester" />
    </>
  );
}
