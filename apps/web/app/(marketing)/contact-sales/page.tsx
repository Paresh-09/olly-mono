import { Metadata } from "next";
import { SalesContactForm } from "./_components/component-contact-sales";
import ContactFAQs from "../contact/_components/faq-section-contact";

export const metadata: Metadata = {
  title: "Contact Sales | Olly Social AI - Enterprise Solutions",
  description:
    "Get in touch with our sales team to learn how Olly Social AI can transform your social media strategy with enterprise-grade features, team collaboration tools, and dedicated support.",
  alternates: {
    canonical: "/contact-sales",
  },
  openGraph: {
    title: "Contact Olly Social AI Sales - Enterprise Solutions",
    description:
      "Discover how Olly Social AI's enterprise solutions can elevate your social media presence. Get custom pricing, priority support, and advanced team features.",
    url: "https://www.olly.social/contact-sales",
    siteName: "Olly Social",
    images: [
      {
        url: "https://www.olly.social/features/twitter-main.png",
        width: 1200,
        height: 630,
        alt: "Olly Social AI Enterprise Solutions",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Enterprise Solutions for Social Media Management",
    description:
      "Connect with Olly Social AI's sales team to transform your social media strategy with our enterprise-grade tools and dedicated support.",
    images: ["https://www.olly.social/features/twitter-main.png"],
  },
};

export default function ContactSalesPage() {
  return (
    <div>
      <div className="container mx-auto py-12">
        <SalesContactForm />
      </div>
      <ContactFAQs/>
    </div>
  );
}
