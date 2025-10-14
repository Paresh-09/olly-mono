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
  title: "Username Lookup | Olly.social",
  description:
    "Olly's Username Lookup checks username availability across multiple platforms. Perfect for individuals creating new accounts, businesses establishing brand presence, and social media managers securing consistent usernames. Check availability with multi-platform searching and similar username suggestions.",
  alternates: { canonical: "/products/username-lookup" },
};

export default function UsernameLookup() {
  return (
    <>
      <Heading
        title="Username Lookup"
        subtitle="Olly's Username Lookup checks username availability across multiple platforms. Perfect for individuals creating new accounts, businesses establishing brand presence, and social media managers securing consistent usernames."
        image="/step_main.gif"
        showUsernameInput={true}
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
      <CTA customLink="https://olly.social/tools/username-lookup" customText="Try Username Lookup" />
    </>
  );
} 