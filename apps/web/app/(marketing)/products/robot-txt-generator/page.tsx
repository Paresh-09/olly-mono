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
  title: "Robots.txt Generator | Olly.social",
  description:
    "Olly's Robots.txt Generator helps you create custom robots.txt files to optimize your website's search engine indexing. Perfect for webmasters, SEO specialists, and website owners looking to control crawler access. Generate robots.txt with multiple user agents, allow and disallow rules, and instant preview.",
  alternates: { canonical: "/products/robot-txt-generator" },
};

export default function RobotTxtGenerator() {
  return (
    <>
      <Heading
        title="Robots.txt Generator"
        subtitle="Olly's Robots.txt Generator helps you create custom robots.txt files to optimize your website's search engine indexing. Perfect for webmasters, SEO specialists, and website owners looking to control crawler access."
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
      <CTA customLink="https://olly.social/tools/robot-txt-generator" customText="Try Robots.txt Generator" />
    </>
  );
}
