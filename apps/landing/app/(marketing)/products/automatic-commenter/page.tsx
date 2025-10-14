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
  title: "Automatic Commenter | Olly.social",
  description:
    "Streamline your online interactions with Olly.social's Automatic Commenter, an AI-powered tool designed to automate commenting across various social media platforms and blogs. Perfect for businesses, influencers, and content creators, it offers a hassle-free way to maintain engagement, increase visibility, and foster community by generating relevant, personalized comments. With advanced natural language processing capabilities, ensure your brand's voice is consistently represented across all digital conversations.",
  alternates: { canonical: "/automatic-commenter" },
};

export default function AutomaticCommenter() {
  return (
    <>
      <Heading
        title="Automatic Commenter"
        subtitle="Elevate your online engagement effortlessly with Olly.social's AI-powered automatic commenting tool. Stay active and relevant across multiple platforms without the manual work."
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

      <CTA />
    </>
  );
}
