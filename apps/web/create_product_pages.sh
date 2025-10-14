#!/bin/bash

# Array of remaining tools to create pages for
tools=(
  "game-theory-simulator:Game Theory Simulator:creates and tests various game theory scenarios with our interactive simulator:game theorists, economists, and educators"
  "teleprompter:Teleprompter:provides a professional teleprompter tool for smooth script reading and recording:content creators, presenters, and video producers"
  "meta-tag-generator:Meta Tag Generator:creates optimized SEO meta tags for better search visibility and social media sharing:webmasters, SEO specialists, and digital marketers"
  "social-media-image-resizer:Social Media Image Resizer:instantly resizes images to the perfect dimensions for all major social media platforms:social media managers, content creators, and marketers"
  "linkedin-headline-generator:LinkedIn Headline Generator:creates powerful, attention-grabbing LinkedIn headlines tailored to your industry and experience:professionals, job seekers, and career coaches"
  "instagram-generator:Instagram Bio & Caption Generator:creates engaging Instagram profile bios and captions tailored to your niche and style:Instagram users, influencers, and social media managers"
  "youtube-description-generator:YouTube Channel Description Generator:creates professional, SEO-optimized YouTube channel descriptions that attract subscribers:YouTubers, video creators, and content marketers"
  "twitter-bio-generator:Twitter/X Bio Generator:creates concise, attention-grabbing Twitter/X bios that showcase your personality:Twitter users, social media managers, and personal brands"
  "favicon-generator:Favicon Generator:generates favicons in all sizes needed for modern websites and apps:web developers, designers, and website owners"
  "chrome-extension-logo-generator:Chrome Extension Logo Generator:generates all required logo sizes for Chrome extensions and the Chrome Web Store:extension developers, software engineers, and app creators"
  "free-ai-logo-generator:Free AI Logo Generator:creates beautiful logos using AI-generated designs with gradient backgrounds:startups, small businesses, and entrepreneurs"
  "png-to-ico-converter:PNG to ICO Converter:converts PNG images to ICO format for favicons and desktop icons:web developers, designers, and website owners"
  "grammar-spell-checker:Grammar Checker:enhances your writing with advanced AI-powered grammar and spelling correction:writers, students, and professionals"
  "link-shortener:Link Shortener:instantly creates short, memorable links with powerful analytics tracking:marketers, social media managers, and content creators"
  "utm-parameter-builder:UTM Parameter Builder:creates trackable campaign URLs with UTM parameters:digital marketers, campaign managers, and analytics specialists"
  "ai-course-outline-generator:AI Course Outline Generator:creates structured, comprehensive course outlines in seconds:educators, trainers, and course creators"
  "ai-script-generator:AI Script Generator:creates professional scripts for videos, podcasts, and presentations:content creators, marketers, and presenters"
  "ai-course-reviews-generator:AI Course Reviews Generator:creates detailed, professional course reviews in seconds:course creators, educational platforms, and review sites"
  "ai-course-promotion-generator:AI Course Promotion Generator:creates compelling marketing content for online courses in seconds:course creators, educational marketers, and online instructors"
  "ai-course-image-generator:AI Course Image Generator:creates professional, custom images for your online courses in seconds:course creators, educational platforms, and online instructors"
  "readability-tester:AI Readability Tester:provides advanced AI-powered text analysis and readability insights:writers, content creators, and educators"
  "youtube-subscription-button-creator:YouTube Subscription Button Creator:creates customizable YouTube subscription buttons for your website:YouTubers, web developers, and content creators"
)

# Template for the product page
create_product_page() {
  local tool_id=$1
  local tool_name=$2
  local description_verb=$3
  local target_audience=$4
  
  # Create directory if it doesn't exist
  mkdir -p "app/(marketing)/products/${tool_id}"
  
  # Create the page.tsx file
  cat > "app/(marketing)/products/${tool_id}/page.tsx" << EOF
import { Suspense } from "react";
import { ReviewSkeleton } from "../../_components/reviews/review-skeleton";
import { ReviewsSection } from "../../_components/reviews/reviews-section";
import { Metadata } from "next";
import { Heading } from "../../_components/heading";
import { Testimonials } from "../../_components/testimonials";
import { FeaturesAutomation } from "../../_components/features";
import { Pricing } from "../../_components/pricing-2";
import FAQs from "../../_components/faq-section";
import { CTA } from "../../_components/cta";

export const metadata: Metadata = {
  title: "${tool_name} | Olly.social",
  description:
    "Olly's ${tool_name} ${description_verb}. Perfect for ${target_audience} looking to enhance their workflow and productivity. Try our easy-to-use tool with advanced features and intuitive interface.",
  alternates: { canonical: "/products/${tool_id}" },
};

export default function ${tool_name//[^a-zA-Z0-9]/}() {
  return (
    <>
      <Heading
        title="${tool_name}"
        subtitle="Olly's ${tool_name} ${description_verb}. Perfect for ${target_audience} looking to enhance their workflow and productivity."
        image="/step_main.gif"
      />
      <Testimonials />
      <FeaturesAutomation />
      <Suspense>
        <Pricing />
      </Suspense>
      <FAQs />
      <Suspense fallback={<ReviewSkeleton />}>
        <ReviewsSection />
      </Suspense>
      <CTA customLink="https://olly.social/tools/${tool_id}" customText="Try ${tool_name}" />
    </>
  );
}
EOF

  echo "Created product page for ${tool_name}"
}

# Create product pages for all tools
for tool in "${tools[@]}"; do
  IFS=':' read -r id name description audience <<< "$tool"
  create_product_page "$id" "$name" "$description" "$audience"
done

echo "All product pages created successfully!"
