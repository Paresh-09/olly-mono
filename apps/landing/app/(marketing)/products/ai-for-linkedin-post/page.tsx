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
  title: "AI for LinkedIn Post Creation | Olly.social",
  description:
    "Unlock the potential of your LinkedIn content with Olly.social's AI for LinkedIn Post Creation. This advanced tool empowers professionals, marketers, and businesses to craft compelling LinkedIn posts using AI-driven insights and automation. Enhance your LinkedIn strategy by generating posts that engage your network, reflect your professional brand, and drive meaningful interactions. Olly's AI analyzes trends, suggests content strategies, and helps you maintain a consistent posting schedule, making it easier to achieve your LinkedIn objectives.",
  alternates: { canonical: "/ai-for-linkedin-post" },
};

export default function AILinkedInPost() {
  return (
    <>
      <Heading
        title="AI for LinkedIn Post Creation"
        subtitle="Elevate your LinkedIn presence with Olly.social's AI-powered post creation. Streamline your content strategy with targeted, engaging posts designed to connect and resonate with your professional audience."
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