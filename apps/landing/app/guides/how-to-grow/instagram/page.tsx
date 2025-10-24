import { Metadata } from "next";
import { Content } from "./content";
import { StructuredData } from "../StructuredData";

export const metadata: Metadata = {
  title: "How to Grow on Instagram Organically: Unlock Your Path to Discoverability",
  description: "Learn proven strategies to grow organically on Instagram, build meaningful community relationships, and maximize engagement. Discover how to navigate Instagram's unique landscape and leverage its features for success.",
  alternates: {
    canonical: "/guides/how-to-grow/instagram",
  },
  robots: {
    index: true,
    follow: true
  },
};

export default function Page() {
  return (
    <>
      <StructuredData
        headline="How to Grow on Instagram Organically: Unlock Your Path to Discoverability"
        datePublished="2024-10-19T08:00:00+00:00"
        dateModified="2024-10-19T08:00:00+00:00"
        authorName="Yash Thakker"
        authorUrl="https://www.goyashy.com"
        image={[]}
      />
      <Content />
    </>
  );
}