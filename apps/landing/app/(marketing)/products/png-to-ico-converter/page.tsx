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
  title: "PNG to ICO Converter | Olly.social",
  description:
    "Olly's PNG to ICO Converter converts PNG images to ICO format for favicons and desktop icons. Perfect for web developers, designers, and website owners looking to enhance their workflow and productivity. Try our easy-to-use tool with advanced features and intuitive interface.",
  alternates: { canonical: "/products/png-to-ico-converter" },
};

export default function PNGtoICOConverter() {
  return (
    <>
      <Heading
        title="PNG to ICO Converter"
        subtitle="Olly's PNG to ICO Converter converts PNG images to ICO format for favicons and desktop icons. Perfect for web developers, designers, and website owners looking to enhance their workflow and productivity."
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
      <CTA customLink="https://olly.social/tools/png-to-ico-converter" customText="Try PNG to ICO Converter" />
    </>
  );
}
