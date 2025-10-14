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
  title: "AI Course Promotion Generator | Olly.social",
  description:
    "Olly's AI Course Promotion Generator creates compelling marketing content for online courses in seconds. Perfect for course creators, educational marketers, and online instructors looking to enhance their workflow and productivity. Try our easy-to-use tool with advanced features and intuitive interface.",
  alternates: { canonical: "/products/ai-course-promotion-generator" },
};

export default function AICoursePromotionGenerator() {
  return (
    <>
      <Heading
        title="AI Course Promotion Generator"
        subtitle="Olly's AI Course Promotion Generator creates compelling marketing content for online courses in seconds. Perfect for course creators, educational marketers, and online instructors looking to enhance their workflow and productivity."
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
      <CTA customLink="https://olly.social/tools/ai-course-promotion-generator" customText="Try AI Course Promotion Generator" />
    </>
  );
}
