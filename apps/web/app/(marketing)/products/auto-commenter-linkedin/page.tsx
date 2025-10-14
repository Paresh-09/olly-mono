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
  title: "LinkedIn Auto Commenter | Olly.social",
  description:
    "Olly's LinkedIn Auto Commenter helps you automatically generate and post professional comments on LinkedIn content. Perfect for professionals, recruiters, and businesses looking to maintain an active presence on LinkedIn. Save time while building meaningful connections through consistent, intelligent engagement that drives visibility and networking opportunities.",
  alternates: { canonical: "/products/auto-commenter-linkedin" },
};

export default function AutoCommenterLinkedIn() {
  return (
    <>
      <Heading
        title="LinkedIn Auto Commenter"
        subtitle="Olly's LinkedIn Auto Commenter helps you automatically generate and post professional comments on LinkedIn content. Perfect for professionals, recruiters, and businesses looking to maintain an active presence."
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
      <CTA />
    </>
  );
} 