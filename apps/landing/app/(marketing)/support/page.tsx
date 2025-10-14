import { Metadata } from "next";
import ContactForm from "./_components/contact-form";
import ContactFAQs from "../contact/_components/faq-section-contact";

export const metadata: Metadata = {
  title: "Contact Us | Olly Social AI - Get Support and Share Feedback",
  description:
    "The Olly Social AI team is here to help you with any questions or concerns you may have. Contact us for support, feedback, or any other inquiries about our AI comment generator and Reddit summarizer tools.",
  alternates: {
    canonical: "/contact",
  },
  keywords:
    "olly, olly ai, ai comment generator, ai comment maker, ai comment creator, ai comments generator, ai reply generator, ai comment image generator, ai comment generator with profile picture, ai comment generator online, ai comment generator app, ai comment generator download, ai comment generator free, ai comment generator no watermark, ai comment generator without watermark, ai comment generator without logo, ai comment generator without watermark free, ai comment generator without watermark online, ai comment generator without watermark app, ai comment generator without watermark download, ai comment generator without watermark free online, ai comment generator without watermark free download, ai comment generator without watermark free app, reddit summariser, reddit summarizer, reddit summary, reddit summarization, reddit summarization tool, reddit summarization app, reddit summarization software, reddit summarization tool online, reddit summarization tool free, reddit summarization tool without watermark, reddit summarization tool without logo, reddit summarization tool without watermark free, reddit summarization tool without watermark online, reddit summarization tool free online, reddit summarization tool free download, post summarizer, contact Olly, Olly support, Olly feedback",
  openGraph: {
    title: "Contact Olly Social AI - We're Here to Help!",
    description:
      "Reach out to the Olly Social AI team for support, feedback, or inquiries about our AI comment generator and Reddit summarizer. We're committed to enhancing your social media experience.",
    url: "https://www.olly.social/contact",
    siteName: "Olly Social",
    images: [
      {
        url: "https://www.olly.social/features/twitter-main.png",
        width: 1200,
        height: 630,
        alt: "Olly Social AI Contact Us",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Get in Touch with Olly Social AI Support",
    description:
      "Have questions about our AI comment generator or Reddit summarizer? Contact the Olly Social AI team for prompt assistance and support.",
    images: ["https://www.olly.social/features/twitter-main.png"],
  },
};

export default function ContactPage() {
  return (
    <div>
      <div className="container mx-auto py-12 px-20">

        <ContactForm />
      </div>
      <ContactFAQs />
    </div>
  );
}
