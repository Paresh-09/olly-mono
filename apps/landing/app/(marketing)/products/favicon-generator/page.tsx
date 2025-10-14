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
  title: "Favicon Generator | Olly.social",
  description:
    "Olly's Favicon Generator generates favicons in all sizes needed for modern websites and apps. Perfect for web developers, designers, and website owners looking to enhance their workflow and productivity. Try our easy-to-use tool with advanced features and intuitive interface.",
  alternates: { canonical: "/products/favicon-generator" },
};

export default function FaviconGenerator() {
  return (
    <>
      <Heading
        title="Favicon Generator"
        subtitle="Olly's Favicon Generator generates favicons in all sizes needed for modern websites and apps. Perfect for web developers, designers, and website owners looking to enhance their workflow and productivity."
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
      <CTA customLink="https://olly.social/tools/favicon-generator" customText="Try Favicon Generator" />
    </>
  );
}
