import React from "react";
import { Metadata } from "next";
import LeaderboardComponent from "../_components/olly-leaderboard";
import { Zap, TrendingUp } from "lucide-react";

export const metadata: Metadata = {
  title: "Olly Community Leaderboard | AI Social Media Engagement Rankings",
  description:
    "Discover top Olly users on our community leaderboard. See who's leading in AI-powered social media engagement, comment generation, and viral content prediction.",
  alternates: {
    canonical: "/leaderboard",
  },
  keywords: [
    "AI comment generator",
    "social media AI leaderboard",
    "AI-powered engagement rankings",
    "social media visibility growth",
    "profile views boost",
    "viral content prediction",
    "social media automation",
    "AI engagement metrics",
    "OpenAI integration",
    "smart commenting tool",
  ],
  twitter: {
    card: "summary_large_image",
    title: "Olly AI Community Leaderboard - Top Engagement Rankings",
    description:
      "Check out the top performers using Olly, the AI-powered tool for smarter social media engagement and viral content creation.",
    images: ["/olly_leaderboard.png"],
  },
  openGraph: {
    type: "website",
    title: "Olly AI Community Leaderboard",
    description:
      "See who tops the rankings for AI-powered social media engagement and comment generation.",
    url: "https://olly.ai/leaderboard",
    images: [
      {
        url: "/olly_leaderboard.png",
        width: 1200,
        height: 630,
        alt: "Olly AI Community Leaderboard",
      },
    ],
  },
};

// Structured data for search engines
const leaderboardStructuredData = {
  "@context": "https://schema.org",
  "@type": "Table",
  about: {
    "@type": "Thing",
    name: "Olly AI Community Leaderboard",
    description:
      "Ranking of top users on the Olly AI platform by engagement metrics and social media activity.",
  },
};

const LeaderboardPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Add structured data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(leaderboardStructuredData),
        }}
      />

      <div className="flex justify-center mb-6">
        <h1 className="text-4xl font-bold">Leaderboard</h1>
      </div>

      <LeaderboardComponent />

      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
        <div className="border rounded-md p-5 flex flex-col items-center text-center">
          <TrendingUp className="h-8 w-8 text-amber-500 mb-2" />
          <h3 className="text-lg font-semibold">Boost visibility</h3>
          <p className="text-sm text-gray-500 mb-4">
            3-4× more profile views with Team Plan
          </p>
          <a
            href="/pricing"
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            Get Team Plan
          </a>
        </div>

        <div className="border rounded-md p-5 flex flex-col items-center text-center">
          <Zap className="h-8 w-8 text-blue-500 mb-2" />
          <h3 className="text-lg font-semibold">Increase engagement</h3>
          <p className="text-sm text-gray-500 mb-4">
            Team users average 110% more comments/day
          </p>
          <a
            href="/signup"
            className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            Try Free Plan
          </a>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;

