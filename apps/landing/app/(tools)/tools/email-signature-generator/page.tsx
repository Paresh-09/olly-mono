import { Metadata } from "next";
import { ToolPageLayout } from "../_components/mini-tools/tool-page-layout";
import { EmailSignatureGenerator } from "../_components/email-sign/sign-generator";
import { toolsData } from "@/data/tool-data";
import { ToolFeatures } from "../_components/mini-tools/tool-features";
import { ToolHowToUse } from "../_components/mini-tools/tool-how-to-use";
import { ToolFAQ } from "../_components/mini-tools/tool-faq";
import { ToolReviewsSection } from "../_components/tool-reviews/review";

export const metadata: Metadata = {
  title: "Email Signature Generator | Create Professional Email Signatures",
  description:
    "Create professional and customizable email signatures for your business or personal use. Free, easy-to-use generator with multiple templates and styling options.",
  keywords:
    "email signature generator, professional email signature, custom signature, business email, signature templates, email branding, digital signature",
};

export default function EmailSignatureGeneratorPage() {
  const toolData = toolsData["email-signature-generator"];

  return (
    <ToolPageLayout
      title="Email Signature Generator"
      description="Create professional and customizable email signatures that leave a lasting impression"
    >
      <EmailSignatureGenerator />

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mt-8">
        <ToolFeatures tool={toolData} />
        <ToolHowToUse tool={toolData} />
        <ToolFAQ tool={toolData} />
      </div>
      <ToolReviewsSection
        productSlug="email-signature-generator"
        title="Customer Reviews"
      />
    </ToolPageLayout>
  );
}
