import React from 'react'
import MainCommentGenerator from '../../_components/main'
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Free BlueSky AI Comment Generator",
  description: "Generate realistic and visually stunning BlueSky comments with the Blue Sky Comment Generator. Enhance your Blue Sky experience with engaging and captivating comments that will captivate your audience. We do not support or Generate Fake Blue Sky Comments. Please use it responsibly. Comment image Generator Blue Sky.",
  alternates: {
    canonical: "/apps/ai-comment-generators/free-bluesky-comment-generator",
  },
  keywords: "BlueSky Comment Generator, Free BlueSky AI Comment Generator, BlueSky Comment Generator image, Fake Blue Sky Comment Generator, AI Comment Generator, Blue Sky Comment Maker, Blue Sky comment reply generator, Blue Sky comment creator, Blue Sky comments generator, Blue Sky reply generator, Blue Sky comment image generator, Blue Sky comment generator with profile picture, Blue Sky comment generator online, Blue Sky comment generator app, Blue Sky comment generator download, Blue Sky comment generator free, Blue Sky comment generator no watermark, Blue Sky comment generator without watermark, Blue Sky comment generator without logo, Blue Sky comment generator without watermark free, Blue Sky comment generator without watermark online, Blue Sky comment generator without watermark app, Blue Sky comment generator without watermark download, Blue Sky comment generator without watermark free online, Blue Sky comment generator without watermark free download, Blue Sky comment generator without watermark free app, Blue Sky comment generator without watermark free download online, Blue Sky comment generator without watermark free download"
};


const BlueSkyCommentGenerator = () => {
  return (
    <div>
        <MainCommentGenerator platformName="Bluesky" />
    </div>
  )
}

export default BlueSkyCommentGenerator