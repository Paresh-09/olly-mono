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
  title: "Instagram Bio & Caption Generator | Olly.social",
  description:
    "Olly's Instagram Bio & Caption Generator creates engaging Instagram profile bios and captions tailored to your niche and style. Perfect for Instagram users, influencers, and social media managers looking to enhance their workflow and productivity. Try our easy-to-use tool with advanced features and intuitive interface.",
  alternates: { canonical: "/products/instagram-generator" },
};

export default function InstagramBioCaptionGenerator() {
  return (
    <>
      <Heading
        title="Instagram Bio & Caption Generator"
        subtitle="Olly's Instagram Bio & Caption Generator creates engaging Instagram profile bios and captions tailored to your niche and style. Perfect for Instagram users, influencers, and social media managers looking to enhance their workflow and productivity."
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
      <CTA customLink="https://olly.social/tools/instagram-generator" customText="Try Instagram Bio & Caption Generator" />
    </>
  );
}
