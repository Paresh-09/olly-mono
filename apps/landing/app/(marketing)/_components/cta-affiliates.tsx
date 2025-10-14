"use client";

import { ChromeIcon, GithubIcon, Heart } from "lucide-react";
import { Button } from "@/components/Button";

export function CTAButtonsAffiliate() {
  return (
    <div className="mt-10 grid items-center justify-center gap-x-6 gap-y-2 sm:flex mb-2">
      <Button
        size="2xl"
        link={{ href: "https://olly-ai.lemonsqueezy.com/affiliates", target: "_blank" }}
        className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white border-0"
      >
        {/* <Heart className="mr-2 h-4 w-4 fill-red-500" /> */}
        Join Now
        {/* <span className="text-white-600 text-m">$49.99 &nbsp;</span> <span className="line-through text-gray-800 text-xs">$49.99</span> */}
      </Button>
    </div>
  );
}
