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
  title: "Teleprompter | Olly.social",
  description:
    "Olly's Teleprompter provides a professional teleprompter tool for smooth script reading and recording. Perfect for content creators, presenters, and video producers looking to enhance their workflow and productivity. Try our easy-to-use tool with advanced features and intuitive interface.",
  alternates: { canonical: "/products/teleprompter" },
};

export default function Teleprompter() {
  return (
    <>
      <Heading
        title="Teleprompter"
        subtitle="Olly's Teleprompter provides a professional teleprompter tool for smooth script reading and recording. Perfect for content creators, presenters, and video producers looking to enhance their workflow and productivity."
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
      <CTA customLink="https://olly.social/tools/teleprompter" customText="Try Teleprompter" />
    </>
  );
}
