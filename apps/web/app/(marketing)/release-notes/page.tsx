import React from 'react'
import { Metadata } from 'next'
import ReleaseNoteTimeline from './_components/notes'

export const metadata: Metadata = {
  title: 'Release Notes | Olly AI',
  description: 'Stay up-to-date with the latest features and improvements in Olly AI. Our release notes provide detailed information about each update and new functionality.',
  alternates: {
    canonical: '/release-notes'
  },
  openGraph: {
    title: 'Release Notes | Olly AI',
    description: 'Discover the latest updates and features in Olly AI',
    images: [
      {
        url: '/release-notes.png',
        width: 1200,
        height: 630,
        alt: 'Olly AI Release Notes',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Release Notes | Olly AI',
    description: 'Discover the latest updates and features in Olly AI',
    images: ['/release-notes.png'],
  },
}

const ReleasePage = () => {
  return (
    <div>
      <ReleaseNoteTimeline />
    </div>
  )
}

export default ReleasePage