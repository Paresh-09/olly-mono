import React from 'react'
import TiktokComment from '../_components/instagram/instagram'
import { Metadata } from 'next'
import InstagramHowToUse from '../_components/instagram/insta-how-to-use';
import InstagramFAQ from '../_components/instagram/insta-faq';
import InstagramPageIntroduction from '../_components/instagram/insta-intro';
import InstagramComment from '../_components/instagram/instagram';
import InstagramCommentGuide from '../_components/instagram/insta-how-to';
import { ReviewSchema } from '@/app/(marketing)/_components/reviews/review-schema';
import { ToolReviewsSection } from '../_components/tool-reviews/review';

export const metadata: Metadata = {
  title: "Free Instagram Comment Generator",
  description: "Create stunning Instagram comments responsibly with our generator. Enhance your experience with engaging comments. No fake comments supported.",
  alternates: {
    canonical: "/tools/instagram-comment-generator",
  },
  keywords: "Instagram Comment Generator, Free Instagram AI Comment Generator, Instagram Comment Generator image, Fake Instagram Comment Generator, AI Comment Generator, Instagram Comment Maker, Instagram comment reply generator, Instagram comment creator, Instagram comments generator, Instagram reply generator, Instagram comment image generator, Instagram comment generator with profile picture, Instagram comment generator online, Instagram comment generator app, Instagram comment generator download, Instagram comment generator free, Instagram comment generator no watermark, Instagram comment generator without watermark, Instagram comment generator without logo, Instagram comment generator without watermark free, Instagram comment generator without watermark online, Instagram comment generator without watermark app, Instagram comment generator without watermark download, Instagram comment generator without watermark free online, Instagram comment generator without watermark free download, Instagram comment generator without watermark free app, Instagram comment generator without watermark free download online, Instagram comment generator without watermark free download"
};

const InstagramPage = () => {
  return (
    <div>
        <InstagramComment />
        {/* <StickyBuyButton 
          showOnlyPriceText={true} 
          topMessage="10x your social Presence in days."
        />         */}
        <InstagramPageIntroduction />
        <InstagramCommentGuide/>
        
       <div className='max-w-7xl mx-auto'>
       <InstagramHowToUse />
       <InstagramFAQ />
       <ToolReviewsSection
        productSlug="instagram-comment-generator"
        title="Customer Reviews"
      />
       </div>


    </div>
  )
}

export default InstagramPage