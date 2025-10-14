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
  title: "Email Signature Generator | Olly.social",
  description:
    "Olly's Email Signature Generator creates professional and customizable email signatures that leave a lasting impression. Perfect for professionals, businesses, and anyone looking to enhance their email communication. Design signatures with multiple templates, customizable colors and fonts, and social media integration.",
  alternates: { canonical: "/products/email-signature-generator" },
};

export default function EmailSignatureGenerator() {
  return (
    <>
      <Heading
        title="Email Signature Generator"
        subtitle="Olly's Email Signature Generator creates professional and customizable email signatures that leave a lasting impression. Perfect for professionals, businesses, and anyone looking to enhance their email communication."
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
      <CTA customLink="https://olly.social/tools/email-signature-generator" customText="Try Email Signature Generator" />
    </>
  );
}
