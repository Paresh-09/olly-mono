import React from 'react'
import MainCommentGenerator from '../../_components/main'
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Free Instagram AI Comment Generator | Boost Engagement and Followers",
  description: "Generate captivating, authentic, and engaging Instagram comments using our AI-powered Comment Generator. Enhance your posts, boost engagement, and attract more followers on Instagram. Captivate your audience with comments that show appreciation, start conversations, and encourage others to interact with your content. Use responsibly to add value to your posts and build a strong Instagram community. Instagram Comment Generator for increased visibility, likes, and influence on the platform.",
  alternates: {
    canonical: "/apps/ai-comment-generators/free-instagram-comment-generator",
  },
  keywords: "Instagram Comment Generator, Instagram AI Comment Generator, Free Instagram Comment Generator, Instagram Comment Generator Tool, AI Comment Generator for Instagram, Instagram Comment Automation, Instagram Engagement Booster, Instagram Comment Creator, Instagram Reply Generator, Instagram Conversation Starter, Instagram Comment Assistant, Instagram Interaction Facilitator, Instagram Post Amplifier, Generate Instagram Comments, Instagram Like Magnet, Instagram Follower Booster"
 };

const InstagramCommentGenerator = () => {
  return (
    <div>
        <MainCommentGenerator platformName="HackerNews" />
    </div>
  )
}

export default InstagramCommentGenerator