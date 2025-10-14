import { Suspense } from "react";
import { ReviewSkeleton } from "../../_components/reviews/review-skeleton";

import { ReviewsSection } from "../../_components/reviews/reviews-section";

import { Metadata } from "next";
// import { LogoCloud } from "@/app/(landing)/home/LogoCloud";

import { Heading } from "../../_components/heading";
import { Testimonials } from "../../_components/testimonials";
import { FeaturesAutomation } from "../../_components/features";
import { Pricing } from "../../_components/pricing-2";
import FAQs from "../../_components/faq-section";
import { CTA } from "../../_components/cta";

export const metadata: Metadata = {
  title: "Reddit Comment Generator | Olly.social",
  description:
    "Engage and grow your Reddit community with Olly.social's Reddit Comment Generator. Tailored for subreddits, content creators, and social media strategists, this tool leverages AI to craft comments that spark discussions and boost interaction directly in the browser. Perfect for enhancing Reddit presence, the tool supports personalized, context-aware commenting, efficient engagement strategies, and insights into content that resonates with Reddit users. Ideal for anyone looking to elevate their Reddit discussions and community engagement.",
  alternates: { canonical: "/reddit-comment-generator" },
};

export default function RedditCommentGenerator() {
  return (
    <>
      <Heading
        title="Reddit Comment Generator"
        subtitle="Amplify your Reddit engagement with Olly.social's AI-powered comment generator. Designed for seamless subreddit interaction, it's your partner in driving dynamic discussions."
        image="/step_main.gif"
      />
      {/* <LogoCloud /> */}
      <Testimonials />
      <FeaturesAutomation />
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
