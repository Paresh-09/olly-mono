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
  title: "YouTube Subscription Button Creator | Olly.social",
  description:
    "Olly's YouTube Subscription Button Creator creates customizable YouTube subscription buttons for your website. Perfect for YouTubers, web developers, and content creators looking to enhance their workflow and productivity. Try our easy-to-use tool with advanced features and intuitive interface.",
  alternates: { canonical: "/products/youtube-subscription-button-creator" },
};

export default function YouTubeSubscriptionButtonCreator() {
  return (
    <>
      <Heading
        title="YouTube Subscription Button Creator"
        subtitle="Olly's YouTube Subscription Button Creator creates customizable YouTube subscription buttons for your website. Perfect for YouTubers, web developers, and content creators looking to enhance their workflow and productivity."
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
      <CTA customLink="https://olly.social/tools/youtube-subscription-button-creator" customText="Try YouTube Subscription Button Creator" />
    </>
  );
}
