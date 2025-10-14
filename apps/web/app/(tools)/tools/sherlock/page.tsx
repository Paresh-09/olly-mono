import { Metadata } from "next";
import { ToolPageLayout } from "../_components/mini-tools/tool-page-layout";
import SherlockLookup from "../_components/sherlock/sherlock-lookup";
import { BenefitsList } from "../_components/mini-tools/benefits-list";
import { ToolReviewsSection } from "../_components/tool-reviews/review";

export const metadata: Metadata = {
  title: "Sherlock Project | Hunt Down Social Media Accounts",
  description:
    "Detective-grade social media account search across platforms. Track digital footprints and discover connected profiles.",
  openGraph: {
    title: "Sherlock Project | Hunt Down Social Media Accounts",
    description:
      "Detective-grade social media account search across platforms.",
    type: "website",
  },
  keywords:
    "sherlock project, social media detective, account hunter, profile search, digital investigation, username search, social media accounts",
};

const benefits = [
  {
    title: "Detective-Grade Search",
    description: "Hunt across 300+ social platforms and websites",
  },
  {
    title: "Lightning Fast",
    description: "Uncover accounts in seconds with advanced tracking",
  },
  {
    title: "Ethical Discovery",
    description: "Only investigates publicly available information",
  },
  {
    title: "Elementary Usage",
    description: "Simply enter a username to start your investigation",
  },
];

export default function UsernameLookupPage() {
  return (
   <>
      <SherlockLookup title="Sherlock Project" description="Hunt down social media accounts across platforms" />
     <div className="max-w-7xl mx-auto">
     <BenefitsList benefits={benefits} />
     <ToolReviewsSection
        productSlug="sherlock"
        title="letterhead-creator"
      />
     </div>
     
</>
  );
}
