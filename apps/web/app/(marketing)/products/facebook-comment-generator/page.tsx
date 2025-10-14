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
  title: "Facebook Comment Generator | Olly.social",
  description:
    "Olly's Facebook comment generator is the ultimate tool for crafting engaging comments for your Facebook posts. Perfect for social media managers, influencers, and digital marketers, it simplifies engagement and boosts your social media presence. Compatible with major platforms like Facebook, Instagram, Twitter, and LinkedIn, SocialBoost offers custom-tailored responses, efficient comment management, and insights into engagement strategies. Enhance your social media interaction, save time on comment creation, and discover content strategies that attract and retain followers.",
  alternates: { canonical: "/facebook-comment-generator" },
};

export default function FacebookCommentGenerator() {
  return (
    <>
      <Heading
        title="Facebook Comment Generator"
        subtitle="Olly's Facebook comment generator streamlines creating engaging comments for your Facebook posts. Ideal for social media aficionados, digital marketers, and brands looking to elevate their online presence."
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

