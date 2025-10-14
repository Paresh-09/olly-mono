import React from 'react'
import GoodByeFeedback from '../_components/goodbye'
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Olly Uninstall Feedback | Help Us Improve",
  description: "We value your opinion. Please share your feedback to help us enhance Olly's AI-powered social media tools. Your insights are crucial for our improvement.",
  alternates: {
    canonical: "/goodbye",
  },
  keywords: "Olly uninstall, feedback, user experience, AI comment generator, Reddit summarizer, Chrome extension feedback, product improvement, user retention, social media tools, AI tools feedback, uninstall survey, customer satisfaction, user opinion, product development",
  openGraph: {
    title: "Share Your Thoughts on Olly | Your Feedback Shapes Our Future",
    description: "Your opinion matters. Tell us about your experience with Olly's AI-powered social media tools. Help us improve our Chrome extension for future users.",
    url: "https://www.olly.social/uninstall-feedback",
    siteName: "Olly Social",
    images: [
      {
        url: "https://www.olly.social/features/twitter-main.png",
        width: 1200,
        height: 630,
        alt: "Olly Uninstall Feedback",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Help Improve Olly | Share Your Feedback",
    description: "Your insights are valuable. Let us know why you're uninstalling Olly and how we can enhance our AI-powered social media tools.",
    images: ["https://www.olly.social/features/twitter-main.png"],
  },
};

const GoodByePage = () => {
  return (
    <div>
        <GoodByeFeedback />
    </div>
  )
}

export default GoodByePage