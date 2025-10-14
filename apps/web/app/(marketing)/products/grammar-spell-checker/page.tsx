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
  title: "Grammar Checker | Olly.social",
  description:
    "Olly's Grammar Checker enhances your writing with advanced AI-powered grammar and spelling correction. Perfect for writers, students, and professionals looking to enhance their workflow and productivity. Try our easy-to-use tool with advanced features and intuitive interface.",
  alternates: { canonical: "/products/grammar-spell-checker" },
};

export default function GrammarChecker() {
  return (
    <>
      <Heading
        title="Grammar Checker"
        subtitle="Olly's Grammar Checker enhances your writing with advanced AI-powered grammar and spelling correction. Perfect for writers, students, and professionals looking to enhance their workflow and productivity."
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
      <CTA customLink="https://olly.social/tools/grammar-spell-checker" customText="Try Grammar Checker" />
    </>
  );
}
