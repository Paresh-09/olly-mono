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
  title: "LinkedIn Profile Audit | Olly.social",
  description:
    "Olly's LinkedIn Profile Audit provides professional insights and optimization recommendations for your LinkedIn presence. Perfect for professionals, job seekers, and businesses looking to enhance their professional brand. Get profile completeness scores, network quality analysis, and visibility recommendations.",
  alternates: { canonical: "/products/linkedin-audit" },
};

export default function LinkedInAudit() {
  return (
    <>
      <Heading
        title="LinkedIn Profile Audit"
        subtitle="Olly's LinkedIn Profile Audit provides professional insights and optimization recommendations for your LinkedIn presence. Perfect for professionals, job seekers, and businesses looking to enhance their professional brand."
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
      <CTA customLink="https://olly.social/tools/linkedin-audit" customText="Try LinkedIn Profile Audit" />
    </>
  );
} 