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
  title: "Chrome Extension Logo Generator | Olly.social",
  description:
    "Olly's Chrome Extension Logo Generator generates all required logo sizes for Chrome extensions and the Chrome Web Store. Perfect for extension developers, software engineers, and app creators looking to enhance their workflow and productivity. Try our easy-to-use tool with advanced features and intuitive interface.",
  alternates: { canonical: "/products/chrome-extension-logo-generator" },
};

export default function ChromeExtensionLogoGenerator() {
  return (
    <>
      <Heading
        title="Chrome Extension Logo Generator"
        subtitle="Olly's Chrome Extension Logo Generator generates all required logo sizes for Chrome extensions and the Chrome Web Store. Perfect for extension developers, software engineers, and app creators looking to enhance their workflow and productivity."
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
      <CTA customLink="https://olly.social/tools/chrome-extension-logo-generator" customText="Try Chrome Extension Logo Generator" />
    </>
  );
}
