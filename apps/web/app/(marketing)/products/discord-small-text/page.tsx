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
  title: "Discord Small Text Generator | Olly.social",
  description:
    "Olly's Discord Small Text Generator converts normal text to small caps text perfect for Discord messages. Ideal for Discord users, community managers, and gamers looking to make their messages stand out. Create stylish small text with real-time preview and one-click copying.",
  alternates: { canonical: "/products/discord-small-text" },
};

export default function DiscordSmallText() {
  return (
    <>
      <Heading
        title="Discord Small Text Generator"
        subtitle="Olly's Discord Small Text Generator converts normal text to small caps text perfect for Discord messages. Ideal for Discord users, community managers, and gamers looking to make their messages stand out."
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
      <CTA customLink="https://olly.social/tools/discord-small-text" customText="Try Discord Small Text Generator" />
    </>
  );
} 