import { Metadata } from "next";
import { LinkedInAuditComponent } from "../_components/audit/linkedin-audit";
import { BenefitsList } from "../_components/mini-tools/benefits-list";
import { ToolReviewsSection } from "../_components/tool-reviews/review";

export const metadata: Metadata = {
  title: "LinkedIn Profile Audit | Professional Presence Analysis",
  description:
    "Professional-grade LinkedIn audit tool. Get detailed insights and optimization recommendations for your professional LinkedIn profile.",
  openGraph: {
    title: "LinkedIn Profile Audit | Professional Presence Analysis",
    description:
      "Professional-grade LinkedIn audit tool with AI-powered recommendations.",
    type: "website",
  },
  keywords:
    "linkedin audit, profile analysis, professional presence, linkedin optimization, content strategy, network insights, linkedin analytics",
};

const benefits = [
  {
    title: "Professional Presence Analysis",
    description:
      "Evaluate your profile completeness, headline, and about section",
  },
  {
    title: "Content Performance Metrics",
    description: "Understand which posts drive the most engagement",
  },
  {
    title: "Network Quality Assessment",
    description: "Analyze your connections and potential industry reach",
  },
  {
    title: "Career Optimization",
    description:
      "Get actionable recommendations to improve your professional brand",
  },
];

export default function LinkedInAuditPage() {
  return (
    <div className="container py-8 space-y-8">
      <LinkedInAuditComponent />
      <div className="max-w-4xl mx-auto">
        <BenefitsList benefits={benefits} />
        <ToolReviewsSection
          productSlug="linkedin-audit"
          title="letterhead-creator"
        />
      </div>
    </div>
  );
}
