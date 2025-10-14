import { Suspense } from "react";
import { ReviewSkeleton } from "../../_components/reviews/review-skeleton";

import { Metadata } from "next";

import { Heading } from "../../_components/heading";
import { Testimonials } from "../../_components/testimonials";
import { FeaturesAutomation } from "../../_components/features";
import { Pricing } from "../../_components/pricing-2";
import FAQs from "../../_components/faq-section";
import { CTA } from "../../_components/cta";
import { ReviewsSection } from "../../_components/reviews/reviews-section";

export const metadata: Metadata = {
  title: "AGI Agent for Enterprise | Olly.ai",
  description:
    "Experience the future with Olly's AGI Agent. Our advanced artificial general intelligence solution tackles complex business challenges through adaptive learning, multi-domain problem solving, and human-like reasoning capabilities. Perfect for enterprises, research institutions, and innovation-driven organizations, this AGI Agent delivers unprecedented automation, decision support, and cognitive assistance across diverse business operations.",
  alternates: { canonical: "/agi-agent" },
};

export default function AGIAgent() {
  return (
    <>
      <Heading
        title="AGI Agent for Enterprise"
        subtitle="Leverage Olly's advanced AGI capabilities to transform your business operations. From complex problem-solving to adaptive learning and reasoning, our AGI Agent serves as your cognitive partner in achieving breakthrough innovations and operational excellence."
        image="/step_main.gif"
      />
      <Testimonials />
      <FeaturesAutomation />
      <Suspense fallback={<ReviewSkeleton />}>
        <ReviewsSection />
      </Suspense>
      <Suspense>
        <Pricing />
      </Suspense>
      <FAQs />
      <CTA />
    </>
  );
}