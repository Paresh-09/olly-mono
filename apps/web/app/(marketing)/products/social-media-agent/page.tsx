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
  title: "Olly: Your AI Social Media Agent | Olly.social",
  description:
    "Meet Olly, your AI Social Media Agent from Olly.social, designed to revolutionize the way you engage on social media. Olly automates comment generation, calculates post virality, and offers insights to elevate your social media strategy. Ideal for content creators, digital marketers, and businesses, Olly simplifies social media management by providing AI-powered tools for dynamic interaction, content optimization, and audience growth across multiple platforms.",
  alternates: { canonical: "/social-media-agent" },
};

export default function OllySocialMediaAgent() {
  return (
    <>
      <Heading
        title="Olly: Your AI Social Media Agent"
        subtitle="Automate and enhance your social media engagement with Olly's cutting-edge AI technology. From generating comments to calculating virality scores, Olly empowers you to achieve unparalleled growth and interaction."
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