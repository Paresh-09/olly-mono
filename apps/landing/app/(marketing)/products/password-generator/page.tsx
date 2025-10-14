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
  title: "Password Generator | Olly.social",
  description:
    "Olly's Password Generator creates strong, secure passwords with custom requirements. Perfect for security-conscious users, IT professionals, and businesses looking to enhance their security practices. Generate passwords with custom length, complexity, and special character options.",
  alternates: { canonical: "/products/password-generator" },
};

export default function PasswordGenerator() {
  return (
    <>
      <Heading
        title="Password Generator"
        subtitle="Olly's Password Generator creates strong, secure passwords with custom requirements. Perfect for security-conscious users, IT professionals, and businesses looking to enhance their security practices."
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
      <CTA customLink="https://olly.social/tools/password-generator" customText="Try Password Generator" />
    </>
  );
} 