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
  title: "Report Card Generator | Olly.social",
  description:
    "Olly's Report Card Generator creates detailed academic report cards with personalized feedback and recommendations. Perfect for teachers, educators, and school administrators looking to streamline the reporting process. Generate comprehensive grade analysis, personalized strengths and improvements, and actionable recommendations.",
  alternates: { canonical: "/products/report-card-generator" },
};

export default function ReportCardGenerator() {
  return (
    <>
      <Heading
        title="Report Card Generator"
        subtitle="Olly's Report Card Generator creates detailed academic report cards with personalized feedback and recommendations. Perfect for teachers, educators, and school administrators looking to streamline the reporting process."
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
      <CTA customLink="https://olly.social/tools/report-card-generator" customText="Try Report Card Generator" />
    </>
  );
} 