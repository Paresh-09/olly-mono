import { Metadata } from "next";
import { Content } from "./content";
import { StructuredData } from "../StructuredData";

export const metadata: Metadata = {
  title: "How to Grow on Reddit Organically: Unlock the Power of Community Engagement",
  description: "Learn proven strategies to grow organically on Reddit, build meaningful community relationships, and maximize engagement. Discover how to navigate Reddit's unique landscape and leverage its features for success.",
  alternates: {
    canonical: "/guides/how-to-grow/reddit",
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
        headline="How to Grow on Reddit Organically: Unlock the Power of Community Engagement"
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