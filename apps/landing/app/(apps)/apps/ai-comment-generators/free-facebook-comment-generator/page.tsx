import React from 'react'
import MainCommentGenerator from '../../_components/main'
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Free Facebook AI Comment Generator | Boost Engagement and Shares",
  description: "Generate engaging, thought-provoking, and share-worthy Facebook comments using our AI-powered Comment Generator. Enhance your posts, boost engagement, and drive meaningful interactions on Facebook. Captivate your friends and followers with comments that spark discussions, provide valuable insights, and encourage others to engage with your content. Use responsibly to add value to your posts and connect with your Facebook community. Facebook Comment Generator for increased visibility, likes, and influence on the platform.",
  alternates: {
    canonical: "/apps/ai-comment-generators/free-facebook-comment-generator",
  },
  keywords: "Facebook Comment Generator, Facebook AI Comment Generator, Free Facebook Comment Generator, Facebook Comment Generator Tool, AI Comment Generator for Facebook, Facebook Comment Automation, Facebook Engagement Booster, Facebook Comment Creator, Facebook Reply Generator, Facebook Conversation Starter, Facebook Comment Assistant, Facebook Discussion Facilitator, Facebook Post Amplifier, Generate Facebook Comments, Facebook Like Magnet, Facebook Share Booster"
 };

const FacebookCommentGenerator = () => {
  return (
    <div>
        <MainCommentGenerator platformName="Facebook" />
    </div>
  )
}

export default FacebookCommentGenerator