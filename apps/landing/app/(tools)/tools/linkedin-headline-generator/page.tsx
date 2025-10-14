import { Metadata } from "next";
import { ToolPageLayout } from "../_components/mini-tools/tool-page-layout";
import { LinkedInHeadlineGenerator } from "../_components/mini-tools/linkedin-headline-generator";
import { toolsData } from "@/data/tool-data";
import { ToolFeatures } from "../_components/mini-tools/tool-features";
import { ToolHowToUse } from "../_components/mini-tools/tool-how-to-use";
import { ToolFAQ } from "../_components/mini-tools/tool-faq";
import { ToolReviewsSection } from "../_components/tool-reviews/review";

export const metadata: Metadata = {
  title: "LinkedIn Headline Generator | Professional Profile Optimizer",
  description:
    "Create impactful, industry-specific LinkedIn headlines that highlight your expertise and attract recruiters and connections.",
  keywords:
    "LinkedIn headline generator, professional headline, LinkedIn profile optimization, career branding, job search, personal branding",
};

export default function LinkedInHeadlineGeneratorPage() {
  const toolData = toolsData["linkedin-headline-generator"];

  return (
    <ToolPageLayout
      title="LinkedIn Headline Generator"
      description="Create powerful, attention-grabbing LinkedIn headlines tailored to your industry and experience"
    >
      <LinkedInHeadlineGenerator />

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mt-8">
        <ToolFeatures tool={toolData} />
        <ToolHowToUse tool={toolData} />
        <ToolFAQ tool={toolData} />
        
      </div>
      <ToolReviewsSection
          productSlug="linkedin-headline-generator"
          title="letterhead-creator"
        />
    </ToolPageLayout>
  );
}
