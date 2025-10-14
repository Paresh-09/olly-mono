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
  title: "Social Media Image Resizer | Olly.social",
  description:
    "Olly's Social Media Image Resizer instantly resizes images to the perfect dimensions for all major social media platforms. Perfect for social media managers, content creators, and marketers looking to enhance their workflow and productivity. Try our easy-to-use tool with advanced features and intuitive interface.",
  alternates: { canonical: "/products/social-media-image-resizer" },
};

export default function SocialMediaImageResizer() {
  return (
    <>
      <Heading
        title="Social Media Image Resizer"
        subtitle="Olly's Social Media Image Resizer instantly resizes images to the perfect dimensions for all major social media platforms. Perfect for social media managers, content creators, and marketers looking to enhance their workflow and productivity."
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
      <CTA customLink="https://olly.social/tools/social-media-image-resizer" customText="Try Social Media Image Resizer" />
    </>
  );
}
