// page.tsx
import { Metadata } from "next";
import { Content } from "./content";
import { StructuredData } from "../StructuredData";

export const metadata: Metadata = {
  title: "How to Grow on Facebook Organically: Unlock the Potential of Community and Engagement",
  description: "Learn proven strategies to grow organically on Facebook, build meaningful community relationships, and maximize engagement. Discover how to navigate Facebook's unique landscape and leverage its features for success.",
  alternates: {
    canonical: "/guides/how-to-grow/facebook",
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
        headline="How to Grow on Facebook Organically: Unlock the Potential of Community and Engagement"
        datePublished="2024-10-22T08:00:00+00:00"
        dateModified="2024-10-22T08:00:00+00:00"
        authorName="Yash Thakker"
        authorUrl="https://www.goyashy.com"
        image={[]}
      />
      <Content />
    </>
  );
}