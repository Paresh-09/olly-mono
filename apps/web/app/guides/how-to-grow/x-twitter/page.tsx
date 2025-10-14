import { Metadata } from "next";
import { Content } from "./content";
import { StructuredData } from "../StructuredData";

export const metadata: Metadata = {
  title: "Growth Guide for X (Twitter): A Step-by-Step Guide",
  description: "Learn proven strategies to grow organically on X (Twitter), build meaningful connections, and maximize engagement. Discover how to navigate X's unique landscape and leverage its features for success.",
  alternates: {
    canonical: "/guides/how-to-grow/x-twitter",
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
        headline="Growth Guide for X (Twitter): A Step-by-Step Guide"
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