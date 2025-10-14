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
  title: "Automatic Blog Commenting | Olly.social",
  description:
    "Enhance your blog's engagement effortlessly with Olly.social's Automatic Blog Commenting tool. Powered by advanced AI, it intelligently generates and posts relevant comments on blogs, fostering interaction and community growth. Ideal for bloggers, content creators, and digital marketers, this tool streamlines the process of engaging with readers, ensuring consistent activity and visibility for your blog content.",
  alternates: { canonical: "/automatic-blog-commenting" },
};

export default function AutomaticBlogCommenting() {
  return (
    <>
      <Heading
        title="Automatic Blog Commenting"
        subtitle="Boost your blog's engagement with Olly.social's AI-powered automatic commenting. Engage with your audience seamlessly and grow your community."
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
