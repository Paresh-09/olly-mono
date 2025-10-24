import React from 'react'
import MainCommentGenerator from '../../_components/main'
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Free GitHub AI Comment Generator | Enhance Collaboration and Code Reviews",
  description: "Generate insightful, constructive, and helpful GitHub comments using our AI-powered Comment Generator. Enhance your code reviews, pull requests, and issue discussions on GitHub. Provide valuable feedback, suggest improvements, and engage in meaningful conversations with fellow developers. Use responsibly to foster collaboration, maintain code quality, and build a supportive developer community. GitHub Comment Generator for improved collaboration, code reviews, and project management.",
  alternates: {
    canonical: "/apps/ai-comment-generators/free-github-comment-generator",
  },
  keywords: "GitHub Comment Generator, GitHub AI Comment Generator, Free GitHub Comment Generator, GitHub Comment Generator Tool, AI Comment Generator for GitHub, GitHub Comment Automation, GitHub Code Review Enhancer, GitHub Comment Creator, GitHub Review Generator, GitHub Collaboration Facilitator, GitHub Comment Assistant, GitHub Discussion Facilitator, GitHub Issue Comment Generator, Generate GitHub Comments, GitHub Pull Request Reviewer, GitHub Developer Community Builder"
 };

const GithubCommentGenerator = () => {
  return (
    <div>
        <MainCommentGenerator platformName="Github" />
    </div>
  )
}

export default GithubCommentGenerator