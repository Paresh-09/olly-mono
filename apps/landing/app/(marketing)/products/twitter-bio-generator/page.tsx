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
  title: "Twitter/X Bio Generator | Olly.social",
  description:
    "Olly's Twitter/X Bio Generator creates concise, attention-grabbing Twitter/X bios that showcase your personality. Perfect for Twitter users, social media managers, and personal brands looking to enhance their workflow and productivity. Try our easy-to-use tool with advanced features and intuitive interface.",
  alternates: { canonical: "/products/twitter-bio-generator" },
};

export default function TwitterXBioGenerator() {
  return (
    <>
      <Heading
        title="Twitter/X Bio Generator"
        subtitle="Olly's Twitter/X Bio Generator creates concise, attention-grabbing Twitter/X bios that showcase your personality. Perfect for Twitter users, social media managers, and personal brands looking to enhance their workflow and productivity."
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
      <CTA customLink="https://olly.social/tools/twitter-bio-generator" customText="Try Twitter/X Bio Generator" />
    </>
  );
}
