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
  title: "Fancy Text Generator | Olly.social",
  description:
    "Olly's Fancy Text Generator transforms ordinary text into stylish unicode text for social media, bio, and more. Perfect for social media users, content creators, and anyone looking to make their text stand out. Create stylish text with multiple font styles, real-time transformation, and one-click copying.",
  alternates: { canonical: "/products/fancy-text-generator" },
};

export default function FancyTextGenerator() {
  return (
    <>
      <Heading
        title="Fancy Text Generator"
        subtitle="Olly's Fancy Text Generator transforms ordinary text into stylish unicode text for social media, bio, and more. Perfect for social media users, content creators, and anyone looking to make their text stand out."
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
      <CTA customLink="https://olly.social/tools/fancy-text-generator" customText="Try Fancy Text Generator" />
    </>
  );
}
