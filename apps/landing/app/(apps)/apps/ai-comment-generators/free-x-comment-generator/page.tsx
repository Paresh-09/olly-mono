import React from 'react'
import MainCommentGenerator from '../../_components/main'
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Free X AI Comment Generator | Boost Engagement and Reposts",
  description: "Generate witty, thought-provoking, and viral X comments using our AI-powered Comment Generator. Enhance your posts, boost engagement, and drive meaningful conversations on X. Captivate the X community with comments that showcase your humor, insights, and unique perspective. Use responsibly to add value to your content and engage with fellow X users. X Comment Generator for increased visibility, followers, and influence on the platform.",
  alternates: {
    canonical: "/apps/ai-comment-generators/free-x-comment-generator",
  },
  keywords: "X Comment Generator, X AI Comment Generator, Free X Comment Generator, X Comment Generator Tool, AI Comment Generator for X, X Comment Automation, X Engagement Booster, X Comment Creator, X Reply Generator, X Conversation Starter, X Comment Assistant, X Discussion Facilitator, X Viral Post Amplifier, Generate X Comments, X Follower Magnet, X Repost Booster"
 };

const XCommentGenerator = () => {
  return (
    <div>
        <MainCommentGenerator platformName="X" />
    </div>
  )
}

export default XCommentGenerator