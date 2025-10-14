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
  title: "AI Chrome Extension | Olly.social",
  description:
    "Enhance your browsing experience with Olly.social's AI Chrome Extension. This cutting-edge tool leverages artificial intelligence to streamline your online activities, offering features like smart content analysis, automated summarization, and personalized recommendations. Ideal for professionals, researchers, and anyone looking to boost their productivity and web experience, our AI Chrome Extension provides intuitive, AI-driven assistance directly in your browser.",
  alternates: { canonical: "/ai-chrome-extension" },
};

export default function AIChromeExtension() {
  return (
    <>
      <Heading
        title="AI Chrome Extension"
        subtitle="Transform your browser into a smart assistant with Olly.social's AI Chrome Extension. Experience AI-powered browsing that understands and enhances your online journey."
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
