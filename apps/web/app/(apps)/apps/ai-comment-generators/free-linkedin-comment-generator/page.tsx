import React from 'react'
import MainCommentGenerator from '../../_components/main'
import { Metadata } from 'next';

export const metadata: Metadata = { 
  title: "Free LinkedIn AI Comment Generator | Boost Engagement", 
  description: "Generate realistic and engaging LinkedIn comments with our AI-powered Comment Generator. Enhance your LinkedIn posts and drive meaningful interactions. Captivate your professional network with comments that spark discussions and showcase your expertise. Please use responsibly to add value to the LinkedIn community. LinkedIn Comment Generator for increased visibility and thought leadership.",
  alternates: { 
    canonical: "/apps/ai-comment-generators/free-linkedin-comment-generator",
  },
  keywords: "LinkedIn Comment Generator, LinkedIn AI Comment Generator, Free LinkedIn Comment Generator, LinkedIn Comment Generator Tool, AI Comment Generator for LinkedIn, LinkedIn Comment Automation, LinkedIn Engagement Booster, LinkedIn Comment Creator, LinkedIn Reply Generator, LinkedIn Conversation Starter, LinkedIn Comment Assistant, LinkedIn Discussion Facilitator, LinkedIn Interaction Enhancer, Generate LinkedIn Comments"
 };

const LinkedInCommentGenerator = () => {
  return (
    <div>
        <MainCommentGenerator platformName="LinkedIn" />
    </div>
  )
}

export default LinkedInCommentGenerator