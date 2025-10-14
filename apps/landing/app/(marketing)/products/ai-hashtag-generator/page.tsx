import { Suspense } from "react";
import { ReviewSkeleton } from "../../_components/reviews/review-skeleton";

import { ReviewsSection } from "../../_components/reviews/reviews-section";

import { Metadata } from "next";

import { Heading } from "../../_components/heading";
import { Testimonials } from "../../_components/testimonials";
import { FeaturesAutomation, FeaturesUnsubscribe } from "../../_components/features";
import { Pricing } from "../../_components/pricing-2";
import FAQs from "../../_components/faq-section";
import { CTA } from "../../_components/cta";

export const metadata: Metadata = {
  title: "AI Hashtag Generator | Olly.social",
  description:
    "Boost your social media engagement with Olly.social's AI Hashtag Generator. This innovative tool employs artificial intelligence to generate relevant, trending, and effective hashtags for your posts. Tailored for social media marketers, influencers, and brands, our AI Hashtag Generator helps amplify your content's reach, engagement, and discoverability across platforms. Seamlessly integrate compelling hashtags into your strategy with Olly.social and watch your social media presence grow.",
  alternates: { canonical: "/ai-hashtag-generator" },
};

export default function AIHashtagGenerator() {
  return (
    <>
      <Heading
        title="AI Hashtag Generator"
        subtitle="Unlock the power of hashtags with Olly.social. Leverage our AI technology to generate impactful hashtags that enhance your content's visibility and engagement."
        image="/step_main.gif"
      />
      <Testimonials />
      <FeaturesUnsubscribe />
      <Suspense>
        <Pricing />
      </Suspense>
      <FAQs />
      <Suspense fallback={<ReviewSkeleton />}>
        <ReviewsSection />
      </Suspense>

      <CTA />
    </>
  );
}
