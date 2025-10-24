import React from 'react'
import MainCommentGenerator from '../../_components/main'
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Free YouTube AI Comment Generator | Boost Views and Engagement",
  description: "Generate engaging, thoughtful, and attention-grabbing YouTube comments using our AI-powered Comment Generator. Enhance your videos, boost views, and drive meaningful interactions. Captivate the YouTube community with comments that spark discussions, provide valuable insights, and encourage viewers to engage with your content. Use responsibly to add value to your videos and connect with your audience. YouTube Comment Generator for increased visibility, subscribers, and influence on the platform.",
  alternates: {
    canonical: "/apps/ai-comment-generators/free-youtube-comment-generator",
  },
  keywords: "YouTube Comment Generator, YouTube AI Comment Generator, Free YouTube Comment Generator, YouTube Comment Generator Tool, AI Comment Generator for YouTube, YouTube Comment Automation, YouTube View Booster, YouTube Comment Creator, YouTube Reply Generator, YouTube Conversation Starter, YouTube Comment Assistant, YouTube Engagement Facilitator, YouTube Audience Magnet, Generate YouTube Comments, YouTube Subscriber Booster, YouTube Comment Section Enhancer"
 };

const YouTubeCommentGenerator = () => {
  return (
    <div>
        <MainCommentGenerator platformName="YouTube" />
    </div>
  )
}

export default YouTubeCommentGenerator