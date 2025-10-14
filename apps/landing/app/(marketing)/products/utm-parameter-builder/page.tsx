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
  title: "UTM Parameter Builder | Olly.social",
  description:
    "Olly's UTM Parameter Builder creates trackable campaign URLs with UTM parameters. Perfect for digital marketers, campaign managers, and analytics specialists looking to enhance their workflow and productivity. Try our easy-to-use tool with advanced features and intuitive interface.",
  alternates: { canonical: "/products/utm-parameter-builder" },
};

export default function UTMParameterBuilder() {
  return (
    <>
      <Heading
        title="UTM Parameter Builder"
        subtitle="Olly's UTM Parameter Builder creates trackable campaign URLs with UTM parameters. Perfect for digital marketers, campaign managers, and analytics specialists looking to enhance their workflow and productivity."
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
      <CTA customLink="https://olly.social/tools/utm-parameter-builder" customText="Try UTM Parameter Builder" />
    </>
  );
}
