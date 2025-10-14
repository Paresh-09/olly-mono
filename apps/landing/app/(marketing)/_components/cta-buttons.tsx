"use client";

import { ChromeIcon, GithubIcon, Heart } from "lucide-react";
import { Button } from "@/components/Button";

interface CTAButtonsProps {
  customLink?: string;
  customText?: string;
}

export function CTAButtons({ customLink, customText }: CTAButtonsProps = {}) {
  return (
    <div className="mt-10 grid items-center justify-center gap-x-6 gap-y-2 sm:flex mb-2">
      <Button
        size="2xl"
        color="white"
        className="shadow-lg shadow-teal-500/50"
        link={{ href: "https://chromewebstore.google.com/detail/olly-social-media-sidekic/ofjpapfmglfjdhmadpegoeifocomaeje", target: "_blank"}}
      >
        <ChromeIcon className="mr-2 h-4 w-4" />
        Add Olly to Chrome
      </Button>
      <Button
        size="2xl"
        link={{ href: customLink || "https://olly-ai.lemonsqueezy.com/buy/fa11a2cb-4f49-4959-a95a-215b29c51e89", target: "_blank" }}
        className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white border-0"
      >
        {/* <Heart className="mr-2 h-4 w-4 fill-red-500" /> */}
        {customText || "Lifetime Access"} &nbsp;
        <span className="text-white-600 text-m">$49.99 &nbsp;</span> <span className="line-through text-gray-800 text-xs">$49.99</span>
      </Button>
    </div>
  );
}
