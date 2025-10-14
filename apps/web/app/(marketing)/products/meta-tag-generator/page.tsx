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
  title: "Meta Tag Generator | Olly.social",
  description:
    "Olly's Meta Tag Generator creates optimized SEO meta tags for better search visibility and social media sharing. Perfect for webmasters, SEO specialists, and digital marketers looking to enhance their workflow and productivity. Try our easy-to-use tool with advanced features and intuitive interface.",
  alternates: { canonical: "/products/meta-tag-generator" },
};

export default function MetaTagGenerator() {
  return (
    <>
      <Heading
        title="Meta Tag Generator"
        subtitle="Olly's Meta Tag Generator creates optimized SEO meta tags for better search visibility and social media sharing. Perfect for webmasters, SEO specialists, and digital marketers looking to enhance their workflow and productivity."
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
      <CTA customLink="https://olly.social/tools/meta-tag-generator" customText="Try Meta Tag Generator" />
    </>
  );
}
