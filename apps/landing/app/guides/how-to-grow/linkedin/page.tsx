import { Metadata } from "next";
import { Content } from "./content";
import { StructuredData } from "../StructuredData";

export const metadata: Metadata = {
  title: "How to Grow Organically on LinkedIn: A Comprehensive Guide",
  description: "Learn proven strategies to grow organically on LinkedIn, establish thought leadership, and maximize professional engagement. Discover how to navigate LinkedIn's unique landscape and leverage its features for success.",
  alternates: {
    canonical: "/guides/how-to-grow/linkedin",
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
        headline="How to Grow Organically on LinkedIn: A Comprehensive Guide"
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