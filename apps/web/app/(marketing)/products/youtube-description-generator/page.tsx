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
  title: "YouTube Channel Description Generator | Olly.social",
  description:
    "Olly's YouTube Channel Description Generator creates professional, SEO-optimized YouTube channel descriptions that attract subscribers. Perfect for YouTubers, video creators, and content marketers looking to enhance their workflow and productivity. Try our easy-to-use tool with advanced features and intuitive interface.",
  alternates: { canonical: "/products/youtube-description-generator" },
};

export default function YouTubeChannelDescriptionGenerator() {
  return (
    <>
      <Heading
        title="YouTube Channel Description Generator"
        subtitle="Olly's YouTube Channel Description Generator creates professional, SEO-optimized YouTube channel descriptions that attract subscribers. Perfect for YouTubers, video creators, and content marketers looking to enhance their workflow and productivity."
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
      <CTA customLink="https://olly.social/tools/youtube-description-generator" customText="Try YouTube Channel Description Generator" />
    </>
  );
}
