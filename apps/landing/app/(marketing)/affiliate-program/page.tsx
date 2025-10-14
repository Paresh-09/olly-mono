import { Suspense } from "react";
import { Metadata } from "next";

import { Testimonials } from "../_components/testimonials";
import { FeaturesAutomation, FeaturesUnsubscribe } from "../_components/features";
import { Pricing } from "../_components/pricing-2";
import FAQs from "../_components/faq-section";
import { CTA } from "../_components/cta";
import { HeadingAffiliate } from "../_components/heading-affiliate";

export const metadata: Metadata = {
  title: "Affiliate Program | Top Affiliate Programs for Creators | AI Chrome Extension | Olly.social",
  description: "Join Olly.social's affiliate program and earn money by promoting our AI Chrome Extension. Our affiliate program is designed for creators, influencers, and anyone with an audience. Sign up today and start earning commissions for every sale you refer.",
  keywords: "Olly affiliate program, AI Chrome Extension, creator affiliate program, social media affiliate, earn commissions",
  alternates: { canonical: "/affiliate-program" },
  openGraph: {
    title: "Olly.social Affiliate Program - Earn with AI-Powered Social Media Tools",
    description: "Join our affiliate program and earn 25% commission on every sale. Promote Olly's AI Chrome Extension to your audience and benefit from high conversions and a 30-day cookie duration.",
    url: "https://www.olly.social/affiliate-program",
    siteName: "Olly",
    images: [
      {
        url: "https://www.olly.social/step_main.gif",
        width: 1200,
        height: 630,
        alt: "Olly Affiliate Program",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Olly.social Affiliate Program - Top Earnings for Creators",
    description: "Become an Olly affiliate and earn 25% commission promoting our AI Chrome Extension. $10 minimum payout, 30-day cookie duration, and high conversion rates.",
    images: ["https://www.olly.social/step_main.gif"],
  },
};

export default function AIChromeExtension() {
  return (
    <>
      <HeadingAffiliate
        title="Affiliate Partner Program"
        subtitle="25% of every sale. $10 minimum payout. 30-day cookie duration. High conversion because one-time payment."
        image="/step_main.gif"
      />
      <Testimonials />
      <FeaturesUnsubscribe />
      <Suspense>
        <Pricing />
      </Suspense>
      <FAQs />
      <CTA />
    </>
  );
}
