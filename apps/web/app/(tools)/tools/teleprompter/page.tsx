import { Metadata } from "next";
import { Teleprompter } from "../_components/mini-tools/teleprompter";
import { ToolPageLayout } from "../_components/mini-tools/tool-page-layout";
import { BenefitsList } from "../_components/mini-tools/benefits-list";
import { ToolReviewsSection } from "../_components/tool-reviews/review";

export const metadata: Metadata = {
  title: "Online Teleprompter | Free Script Reading Tool",
  description:
    "Professional online teleprompter with adjustable speed, font size, and color. Perfect for videos, presentations, speeches, and practicing delivery.",
  openGraph: {
    title: "Online Teleprompter | Free Script Reading Tool",
    description:
      "Professional online teleprompter with adjustable speed, font size, and color.",
    type: "website",
  },
  keywords:
    "teleprompter, script reader, online prompter, video teleprompter, speech tool, presentation aid, free teleprompter",
};

const benefits = [
  {
    title: "Professional Script Reading",
    description:
      "Smooth scrolling text with customizable speed for natural delivery",
  },
  {
    title: "Fully Customizable",
    description:
      "Adjust text size, color, background, and mirroring for your specific needs",
  },
  {
    title: "Production Ready",
    description:
      "Works with professional teleprompter setups using mirror mode",
  },
  {
    title: "Practice Tool",
    description:
      "Perfect for rehearsing speeches, presentations, and video scripts",
  },
];

export default function TeleprompterPage() {
  return (
    <ToolPageLayout
      title="Teleprompter"
      description="Professional script reading tool with customizable display and scrolling options"
    >
      <Teleprompter />
      <BenefitsList benefits={benefits} />
      <ToolReviewsSection productSlug="teleprompter" title="social-media-image-resizer" />
    </ToolPageLayout>
  );
}
