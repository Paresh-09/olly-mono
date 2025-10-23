// Navbar Component
"use client";

import Link from "next/link";
import { useScrollTop } from "@/components/hooks/use-scroll-top";
import { Button } from "@repo/ui/components/ui/button";
import { cn } from "@repo/ui/lib/utils";
import { Logo } from "./logo";
import Image from "next/image";

export const Navbar = () => {
  const scrolled = useScrollTop();

  return (
    <div className={cn(
      "z-50 bg-background dark:bg-[#1F1F1F] fixed top-0 flex items-center w-full md:p-3 p-2",
      scrolled && "border-b shadow-sm",
      "md:text-base text-xs overflow-x-hidden"
    )}>
      <Logo />
      <div className="flex flex-wrap md:ml-auto md:justify-end justify-between w-full items-center gap-x-2">
        <>
          {/* <Button variant="ghost" size="sm">
                <Link href="https://chromewebstore.google.com/u/2/detail/safegpt/fecdlcopjiaeaoachfgpocdgaanolkkc?hl=en-GB">
                  Add Now
                </Link>
              </Button> */}

          {/* <div className="hidden md:flex">
                <AddOllyButton />
              </div>               */}

          <Button variant="ghost" size="sm">
            <Link href="/privacy-policy">
              Privacy Policy
            </Link>
          </Button>

          {/* Small logo for mobile view */}
          <div className="flex md:hidden">
            <Link href="/">
              <Image src="/logo.svg" height="40" width="40" alt="Logo" />
            </Link>
          </div>

          <Button variant="ghost" size="sm">
            <Link href="/activation-guide">
              How to Use?
            </Link>
          </Button>

          <div className="hidden md:flex">
            <Button variant="ghost" size="sm">
              <Link href="https://youtu.be/I5jyvy5S5T4">
                Watch Demo
              </Link>
            </Button>
          </div>

          <div className="hidden md:flex">
            <Button variant="ghost" size="sm">
              <Link href="https://blog.olly.social">
                Blog
              </Link>
            </Button>
          </div>

          <div className="hidden md:flex">
            <Button variant="ghost" className="text-blue-500" size="sm">
              <Link href="https://olly-ai.lemonsqueezy.com/affiliates">
                Become an Affiliate 🤝 (Get 25% per sale)
              </Link>
            </Button>
          </div>
        </>
      </div>
    </div>
  )
}
