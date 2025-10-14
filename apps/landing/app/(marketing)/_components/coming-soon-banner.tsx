"use client";

import Link from "next/link";
import { BoltIcon } from "lucide-react";

export const ComingSoonBanner = () => {
  return (
    <div className="mt-5 bg-green-600 text-white py-1.5 text-center text-sm font-medium">
      <span className="inline-flex items-center">
        <span className="h-2 w-2 bg-white rounded-full mr-2 animate-pulse"></span>
          LinkedIn Agent is now LIVE!
        <Link href="/ai-agent-social-media" className="ml-2 underline hover:text-green-100">Try it now</Link>
      </span>
    </div>
  );
}; 