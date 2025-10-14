import React from 'react'
import MainCommentGenerator from '../../_components/main'
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Free Reddit AI Comment Generator | Boost Karma and Engagement",
  description: "Generate witty, engaging, and upvote-worthy Reddit comments using our AI-powered Comment Generator. Enhance your Reddit posts, boost karma, and drive lively discussions. Captivate the Reddit community with comments that showcase your humor, knowledge, and unique perspective. Use responsibly to add value to subreddits and engage with fellow Redditors. Reddit Comment Generator for increased visibility and influence on the platform.",
  alternates: {
    canonical: "/apps/ai-comment-generators/free-reddit-comment-generator",
  },
  keywords: "Reddit Comment Generator, Reddit AI Comment Generator, Free Reddit Comment Generator, Reddit Comment Generator Tool, AI Comment Generator for Reddit, Reddit Comment Automation, Reddit Karma Booster, Reddit Comment Creator, Reddit Reply Generator, Reddit Conversation Starter, Reddit Comment Assistant, Reddit Discussion Facilitator, Reddit Upvote Magnet, Generate Reddit Comments, Reddit Engagement Booster"
};

const RedditCommentGenerator = () => {
  return (
    <div>
        <MainCommentGenerator platformName="Reddit" />
    </div>
  )
}

export default RedditCommentGenerator