import React from 'react'
import MainCommentGenerator from '../../_components/main'
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Free TikTok AI Comment Generator | Boost Views and Engagement",
  description: "Generate viral, engaging, and view-worthy TikTok comments using our AI-powered Comment Generator. Enhance your TikTok videos, boost views, and drive massive engagement. Captivate the TikTok community with comments that showcase your creativity, humor, and trending insights. Use responsibly to add value to your content and engage with fellow TikTokers. TikTok Comment Generator for increased visibility, followers, and influence on the platform.",
  alternates: {
    canonical: "/apps/ai-comment-generators/free-tiktok-comment-generator",
  },
  keywords: "TikTok Comment Generator, TikTok AI Comment Generator, Free TikTok Comment Generator, TikTok Comment Generator Tool, AI Comment Generator for TikTok, TikTok Comment Automation, TikTok View Booster, TikTok Comment Creator, TikTok Reply Generator, TikTok Conversation Starter, TikTok Comment Assistant, TikTok Engagement Facilitator, TikTok Trend Amplifier, Generate TikTok Comments, TikTok Follower Magnet, TikTok Viral Comment Generator"
 };

const TiktokCommentGenerator = () => {
  return (
    <div>
        <MainCommentGenerator platformName="Tiktok" />
    </div>
  )
}

export default TiktokCommentGenerator