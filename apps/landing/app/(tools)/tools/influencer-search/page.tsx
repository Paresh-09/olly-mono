import { Metadata } from "next";
import { ToolPageLayout } from "../_components/mini-tools/tool-page-layout";
import { BenefitsList } from "../_components/mini-tools/benefits-list";
import SherlockLookup from "../_components/sherlock/sherlock-lookup";
import { ToolReviewsSection } from "../_components/tool-reviews/review";

export const metadata: Metadata = {
  title: "Influencer Lookup Tool | Find Creator Profiles",
  description:
    "Search for influencers and content creators across multiple social media platforms. Find their linked profiles and verify authenticity.",
  openGraph: {
    title: "Influencer Lookup Tool | Find Creator Profiles",
    description:
      "Search for influencers and content creators across multiple social media platforms.",
    type: "website",
  },
  keywords:
    "influencer lookup, creator search, social media influencers, content creator finder, social media profiles, influencer verification",
};

const benefits = [
  {
    title: "Creator Discovery",
    description:
      "Find influencers across 300+ social media platforms and websites",
  },
  {
    title: "Instant Results",
    description: "Locate creator profiles in seconds with our efficient search",
  },
  {
    title: "Profile Verification",
    description: "Verify authentic creator profiles using public information",
  },
  {
    title: "Simple Interface",
    description: "Easy creator lookup - just enter their username and search",
  },
];

export default function UsernameLookupPage() {
  return (
    <ToolPageLayout
      title="Influencer Lookup"
      description="Find creator profiles across multiple platforms"
    >
      <SherlockLookup 
        title="Influencer Lookup"
        description="Find creator profiles across multiple platforms"
      />
      <BenefitsList benefits={benefits} />
      <ToolReviewsSection
        productSlug="influencer-search"
        title="Customer Reviews"
      />
    </ToolPageLayout>
  );
}
