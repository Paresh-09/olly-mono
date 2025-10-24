"use client";

import { ArrowRight, Sparkles, ChevronDown, Play, Zap, Search } from "lucide-react";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/Button";
import Image from "next/image";
import { cn } from "@/utils";
import { VideoDemo } from "./video-demo";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@repo/ui/components/ui/input";

export function HeroText(props: { children: React.ReactNode; className?: string; }) {
  const { className, ...rest } = props;
  return (
    <h1
      className={cn(
        "font-cal text-3xl sm:text-4xl lg:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 dark:from-white dark:via-gray-100 dark:to-white leading-tight tracking-tight",
        className
      )}
      {...rest}
    />
  );
}

export function HeroSubtitle(props: { children: React.ReactNode }) {
  return (
    <p className="mt-6 text-lg sm:text-xl leading-relaxed text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
      {props.children}
    </p>
  );
}

export const Heading = (props: {
  title?: string;
  subtitle?: string;
  image?: string;
  showUsernameInput?: boolean;
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [username, setUsername] = useState("");
  const router = useRouter();
  const dashboardUrl = process.env.NEXT_PUBLIC_DASHBOARD_URL || process.env.DASHBOARD_URL || "http://localhost:3000";

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleUsernameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      router.push(`/tools/username-lookup?username=${encodeURIComponent(username.trim())}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleUsernameSubmit(e);
    }
  };

  return (
    <div className="relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(99,102,241,0.15)_1px,transparent_0)] [background-size:20px_20px]"></div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-10 opacity-20 animate-pulse">
        <Sparkles className="w-6 h-6 text-teal-600" />
      </div>
      <div className="absolute top-32 right-16 opacity-15 animate-pulse delay-700">
        <Zap className="w-8 h-8 text-gray-400" />
      </div>
      <div className="absolute bottom-40 left-20 opacity-25 animate-pulse delay-1000">
        <div className="w-3 h-3 bg-teal-300 rounded-full"></div>
      </div>

      <div className="relative pt-16 pb-24 sm:pt-24 sm:pb-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">

          {/* Content Container */}
          <div className="mx-auto max-w-4xl text-center">

            {/* Badge */}
            <div className={cn(
              "inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 mb-8 transition-all duration-700",
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}>
              <Sparkles className="w-4 h-4 text-teal-600" />
              <span className="text-sm font-medium text-teal-700 dark:text-teal-300">
                AI-Powered Social Media Tool
              </span>
            </div>

            {/* Title */}
            <div className={cn(
              "transition-all duration-700 delay-200",
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}>
              <HeroText>
                {props.title || "Amplify Your Social Media Presence"}
              </HeroText>
            </div>

            {/* Subtitle */}
            <div className={cn(
              "transition-all duration-700 delay-400",
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}>
              <HeroSubtitle>
                {props.subtitle || "Transform your social media strategy with AI-powered insights, automated commenting, and viral content optimization across all platforms."}
              </HeroSubtitle>
            </div>

            {/* Username Input Form - Only show when showUsernameInput is true */}
            {props.showUsernameInput && (
              <div className={cn(
                "mt-8 max-w-md mx-auto transition-all duration-700 delay-500",
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              )}>
                <form onSubmit={handleUsernameSubmit} className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Enter username..."
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1 h-12 text-lg border-2 border-teal-200 focus:border-teal-400 rounded-full px-4"
                  />
                  <button
                    type="submit"
                    disabled={!username.trim()}
                    className="h-12 px-6 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-300 text-white rounded-full font-semibold transition-colors duration-200 flex items-center gap-2"
                  >
                    <Search className="w-4 h-4" />
                    Start
                  </button>
                </form>
              </div>
            )}

            {/* CTA Buttons - Only show when not showing username input */}
            {!props.showUsernameInput && (
              <div className={cn(
                "mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 transition-all duration-700 delay-600",
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              )}>
                <Button
                  className="inline-flex items-center justify-center rounded-full text-base md:text-lg lg:text-xl tracking-tight transition-colors duration-200 bg-teal-600 text-white hover:bg-teal-700 px-8 py-4 shadow-sm"
                  link={{ href: `${dashboardUrl}/dashboard` }}
                >
                  <Play className="mr-2 h-4 w-4" />
                  Get Started Free
                </Button>
                <Link
                  className="inline-flex items-center justify-center rounded-sm text-base md:text-lg lg:text-xl tracking-tight transition-colors duration-200 bg-white text-teal-600 hover:bg-teal-700 hover:text-white px-8 py-4 shadow-sm"
                  href="https://youtube.com/watch?v=Fe-oz0cyGDs&embeds_referring_euri=https%3A%2F%2Fwww.olly.social%2F&source_ve_path=MjM4NTE"
                >
                  <ArrowRight className="mr-2 h-4 w-4 " />
                  Watch Demo
                </Link>
              </div>
            )}

            {/* Trust Indicator */}
            <div className={cn(
              "mt-6 text-sm text-gray-500 dark:text-gray-400 transition-all duration-700 delay-800",
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}>
              No credit card required • Free forever plan available
            </div>
          </div>

          {/* Media Section */}
          <div className={cn(
            "mt-16 sm:mt-24 transition-all duration-1000 delay-1000",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}>
            <div className="relative mx-auto max-w-5xl">
              {/* Glow Effect */}
              <div className="absolute -inset-4 bg-gradient-to-r from-teal-500/20 via-transparent to-teal-500/20 rounded-3xl blur-3xl"></div>

              {/* Image Container */}
              <div className="relative rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-2 ring-1 ring-gray-200 dark:ring-gray-700 shadow-2xl hover:shadow-teal-500/25 transition-all duration-500 hover:scale-[1.02] group">
                <div className="relative overflow-hidden rounded-xl">
                  <Image
                    src={props.image || "/new_video_thumbnail.webp"}
                    alt="Product Demo"
                    width={2432}
                    height={1442}
                    className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                    priority={true}
                    quality={90}
                  />
                  <VideoDemo />

                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="bg-white/90 dark:bg-gray-900/90 rounded-full p-4 shadow-lg">
                      <Play className="w-8 h-8 text-teal-600" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className={cn(
            "mt-16 flex justify-center transition-all duration-700 delay-1200",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}>
            <div className="animate-bounce">
              <ChevronDown className="w-6 h-6 text-gray-400" />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
