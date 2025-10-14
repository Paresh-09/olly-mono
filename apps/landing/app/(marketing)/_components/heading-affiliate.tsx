"use client";

import { Accessibility, ArrowBigDown, ArrowBigDownDash, ArrowRight, Brain, BrainCircuit, Heart } from "lucide-react";

import React, { useState, useEffect } from "react";

import { Button } from "@repo/ui/components/ui/button";
import AddOllyButton from "./add-olly";
import ProductHuntBadge from "./ph-embed";
import Image from "next/image";
import SupportedPlatforms from "./supported-platforms";
import { VideoDemo } from "./video-demo";
import {cn} from "@/utils";
import { CTAButtons } from "./cta-buttons";
import HeroHeadingAB from "./HeroHeadingAB";
import { CTAButtonsAffiliate } from "./cta-affiliates";
import PHBadgeV2 from "./ph-embed-v2";

export function HeroText(props: {
  children: React.ReactNode;
  className?: string;
}) {
  const { className, ...rest } = props;

  return (
    <h1
      className={cn("font-cal text-4xl text-gray-900 sm:text-6xl", className)}
      {...rest}
    />
  );
}

export function HeroSubtitle(props: { children: React.ReactNode }) {
  return <p className="mt-6 text-lg leading-8 text-gray-600" {...props} />;
}


export const HeadingAffiliate = (props: {
  title?: string;
  subtitle?: string;
  image?: string;
}) => {

  const handleButtonClick = () => {
    window.open("https://olly-ai.lemonsqueezy.com/buy/fa11a2cb-4f49-4959-a95a-215b29c51e89", "_blank")
  }

  return (
    <div className="relative pt-14">
      <div className="pt-5 sm:pb-12 sm:pt-5">

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
          {/* <HeroTag /> */}
          <div className="mb-10">
            <PHBadgeV2 />
          </div>

      {/* <BackgroundImage /> */}
      {/* <ProductHuntBadge /> */}
      {/* <h1 className="text-3xl sm:text-5xl m-2 md:text-6xl font-bold md:mb-5">
        Your AI-Powered Second Brain <BrainCircuit size={45} className="inline-block" />
      </h1>
      <h3 className="text-xs md:text-m font-small mb-2 text-gray-500">
        In-Browser AI Generated Comments, Replies, Virality Scores & similar Posts in seconds. Works on LinkedIn, Facebook, Instagram, YouTube, Product Hunt, Hacker News, Quora and more! 
      </h3>
      <div className="flex flex-col md:flex-row justify-center items-center md:items-start">
        <AddOllyButton />
        <Button variant="premium" size="lg" className="mt-2 md:mt-0 md:ml-2" onClick={handleButtonClick}>
            Get Lifetime Access at&nbsp;
            <span className="line-through text-gray-800 text-l justify-bottom">$49.99</span>
            <span className="text-white-600 text-l">&nbsp;$49.99</span>
        </Button> */}

        <div className="mx-auto max-w-xl text-center">
            {/* <HeroText>{props.title || <HeroHeadingAB />}</HeroText> */}
            <HeroText>
              {props.title || <HeroHeadingAB />}
              {/* <BrainCircuit size={45} className="inline-block" /> */}
            </HeroText>
            <HeroSubtitle>
              {props.subtitle || (
                <>
                  Generate AI Powered Comments, Suggestions, Replies, & Real-time Virality Scores for your Posts, directly on your Social Media Pages.
                </>
              )}
            </HeroSubtitle>
            <CTAButtonsAffiliate />
          </div>
      {/* <p className="text-xs text-red-500">Olly is one time payment. We hate subscriptions. But you will get lifetime updates. Note: After January 31st the price will be $49.99.</p> */}

      <div className="mt-16 flow-root sm:mt-24">
            <div className="relative -m-2 rounded-xl bg-gray-900/5 p-2 ring-1 ring-inset ring-gray-900/10 lg:-m-4 lg:rounded-2xl lg:p-4">
              <Image
                src={props.image || "/video_thumbnail.png"}
                alt="Olly Social Alternatives"
                width={2432}
                height={1442}
                className="rounded-md shadow ring-1 ring-gray-900/10"
              />

              <VideoDemo />
            </div>
          </div>
          </div>
          </div>
    </div>
  )
}