import React from "react";
import FakeTweet from "../_components/fake-tweet/fake-tweet";
import FakeTweetPageIntroduction from "../_components/fake-tweet/fake-tweet-intro";
import FakeTweetHowToUse from "../_components/fake-tweet/fake-tweet-how-to";
import FakeTweetFAQ from "../_components/fake-tweet/fake-tweet-faq";
import { Metadata } from "next";
import { ToolReviewsSection } from "../_components/tool-reviews/review";

export const metadata: Metadata = {
  title: "Tweet Generator for X (Twitter) - olly.social",
  description:
    "Create tweet mockups for X (formerly Twitter) with our tweet generator. Perfect for presentations and mockups. Note: We do not support or encourage the generation of fake tweets for impersonation or misinformation.",
  alternates: {
    canonical: "/tools/fake-tweet-generator",
  },
  keywords:
    "Tweet Generator, Tweet Mockup Generator, Fake Tweet Generator, X Tweet Generator, Twitter Post Generator, Tweet Image Generator, Tweet Mockup Tool, Tweet Preview Generator, Social Media Mockup, Twitter Mockup, X Mockup, Tweet Design Tool, Tweet Template Creator, Social Media Preview Tool",
};

const FakeTweetPage = () => {
  return (
    <div className="container mx-auto px-4">
      <h1 className="text-3xl font-bold text-center my-8">
        Tweet Generator for X (Twitter)
      </h1>
      <div className="mb-12">
        <FakeTweet />
      </div>
      <FakeTweetPageIntroduction />
      <FakeTweetHowToUse />
      <FakeTweetFAQ />
      <ToolReviewsSection
        productSlug="tweet-generator"
        title="social-media-image-resizer"
      />
    </div>
  );
};

export default FakeTweetPage;
