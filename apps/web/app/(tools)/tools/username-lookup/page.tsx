// app/(tools)/username-lookup/page.tsx
import { Metadata } from "next";
import { Suspense } from "react";
import { ToolPageLayout } from "../_components/mini-tools/tool-page-layout";
import { BenefitsList } from "../_components/mini-tools/benefits-list";
import SherlockLookup from "../_components/sherlock/sherlock-lookup";
import { ToolReviewsSection } from "../_components/tool-reviews/review";
import { ToolContentSections } from "../_components/tool-sections/tool-content-sections";
import { toolDetails } from "@/data/tool-details";

export const metadata: Metadata = {
  title: "Username Lookup Tool | Find Social Media Profiles",
  description:
    "Search for usernames across multiple social media platforms. Find linked profiles and verify username availability.",
  openGraph: {
    title: "Username Lookup Tool | Find Social Media Profiles",
    description: "Search for usernames across multiple social media platforms.",
    type: "website",
  },
  keywords:
    "username lookup, social media search, profile finder, username checker, social media profiles",
};



export default function UsernameLookupPage() {
  const toolDetail = toolDetails['username-lookup']
  return (
   <>
      <Suspense fallback={<div className="bg-gradient-to-br from-purple-100 via-pink-50 to-purple-100 p-4 pt-10 py-10 min-h-96 flex items-center justify-center"><div className="text-lg text-gray-600">Loading...</div></div>}>
        <SherlockLookup title="Username Lookup Free" description="Find social media profiles and lookup usernames for free across multiple platforms" />
      </Suspense>
      <div className="mt-12 max-w-7xl mx-auto px-6">
        <ToolContentSections toolDetail={toolDetail} />
        <ToolReviewsSection
        productSlug="username-lookup"
        title="username-lookup"
      />
      </div>
     
</>
  );
}
