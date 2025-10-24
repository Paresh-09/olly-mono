"use client";

import { BadgeCheck, BarChart3, Shield, Zap, ArrowDown } from "lucide-react";
import Image from "next/image";
import { Competitor } from "@/data/competitors";
import { cn } from "@/utils";
import LogoStrip from "../../_components/logo-cloud";
import BadgesDisplay from "../../_components/ph-embed-v2";
import * as LucideIcons from "lucide-react";
import { CTA } from "../../_components/cta";
import { CTAButtonsAB } from "../../_components/cta-ab";
import { CTAButtons } from "../../_components/cta-buttons";
import { HeroCTA } from "../../_components/hero-cta";
import { Button } from "@repo/ui/components/ui/button";

export function HeroText(props: { children: React.ReactNode; className?: string; }) {
  const { className, ...rest } = props;
  return (
    <h1
      className={cn(
        "font-cal text-4xl sm:text-5xl lg:text-7xl bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-100 dark:to-white",
        className
      )}
      {...rest}
    />
  );
}

export function HeroSubtitle(props: { children: React.ReactNode }) {
  return (
    <p className="mt-6 text-2xs sm:text-sm leading-8 text-gray-600 dark:text-gray-300 relative">
      <span className="relative">
        {props.children}
      </span>
    </p>
  );
}

export const ComparisonHeading = ({
  title,
  subtitle,
  competitor
}: {
  title: string;
  subtitle: string;
  competitor: Competitor;
}) => {
  // Get a Lucide icon for competitor
  const iconName = competitor.name.replace(/\s+/g, '');
  const CompetitorIcon = (LucideIcons as any)[iconName] ||
    (LucideIcons as any).Briefcase ||
    (LucideIcons as any).Activity;

  // Function to scroll to comparison table
  const scrollToComparisonTable = () => {
    const tableElement = document.getElementById('comparison-table');
    if (tableElement) {
      tableElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative isolate pt-14 pb-8">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="animate-fade-in-up">
          <BadgesDisplay />
        </div>

        <div className="mx-auto max-w-3xl text-center mt-8">
          <div className="animate-fade-in-up delay-100">
            <HeroText>{title}</HeroText>
          </div>

          <div className="animate-fade-in-up delay-200">
            <HeroSubtitle>{subtitle}</HeroSubtitle>
          </div>
        </div>

        <div className="mt-10 flex flex-col lg:flex-row gap-8 items-center justify-center animate-fade-in-up delay-300">
          <div className="w-full lg:w-2/5 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-center mb-4">
              <Image
                src="/icon-2.png"
                alt="Olly.social Logo"
                width={60}
                height={60}
                className="h-12 w-auto"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-teal-100 dark:bg-teal-900 rounded-full flex items-center justify-center">
                  <Zap className="w-4 h-4 text-teal-700 dark:text-teal-300" />
                </div>
                <div className="ml-4">
                  <h3 className="font-medium text-gray-900 dark:text-white">Superior AI Capabilities</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Multiple AI models with custom personalities</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center">
                  <BadgeCheck className="w-4 h-4 text-indigo-700 dark:text-indigo-300" />
                </div>
                <div className="ml-4">
                  <h3 className="font-medium text-gray-900 dark:text-white">Robust Platform Support</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Supports 12+ social platforms vs. competitors' limited options</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-amber-100 dark:bg-amber-900 rounded-full flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-amber-700 dark:text-amber-300" />
                </div>
                <div className="ml-4">
                  <h3 className="font-medium text-gray-900 dark:text-white">Exclusive Features</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Virality scores, custom panels, and user-defined actions</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-rose-100 dark:bg-rose-900 rounded-full flex items-center justify-center">
                  <Shield className="w-4 h-4 text-rose-700 dark:text-rose-300" />
                </div>
                <div className="ml-4">
                  <h3 className="font-medium text-gray-900 dark:text-white">Privacy & Security</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Local data storage for maximum security and privacy</p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center text-3xl font-bold text-gray-500 dark:text-gray-400">VS</div>

          <div className="w-full lg:w-2/5 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md">
            <div className="flex items-center justify-center mb-4">
              <div className="h-12 w-12 flex items-center justify-center">
                <CompetitorIcon size={40} />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  <Zap className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                </div>
                <div className="ml-4">
                  <h3 className="font-medium text-gray-900 dark:text-white">Limited AI Options</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Restricted to fewer AI models with basic customization</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  <BadgeCheck className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                </div>
                <div className="ml-4">
                  <h3 className="font-medium text-gray-900 dark:text-white">Fewer Platforms</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Limited platform support, typically {competitor.features[1]?.features[0]?.competitor && typeof competitor.features[1]?.features[0]?.competitor === 'object' ? (competitor.features[1]?.features[0]?.competitor as string[]).length : '2-3'} platforms</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                </div>
                <div className="ml-4">
                  <h3 className="font-medium text-gray-900 dark:text-white">Basic Feature Set</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Missing advanced analytics and engagement tools</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  <Shield className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                </div>
                <div className="ml-4">
                  <h3 className="font-medium text-gray-900 dark:text-white">Cloud-Based Storage</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Your data may be stored on their servers, raising privacy concerns</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-center animate-fade-in-up delay-400">
          <Button
            onClick={scrollToComparisonTable}
            className="group"
            variant="outline"
            size="lg"
          >
            <span>View Detailed Comparison</span>
            <ArrowDown className="ml-2 h-4 w-4 transition-transform group-hover:translate-y-1" />
          </Button>
        </div>

        <div className="mt-10 flex flex-col lg:flex-row gap-8 items-center justify-center animate-fade-in-up delay-300">
          <HeroCTA />
        </div>

        <div className="animate-fade-in-up delay-500 mt-10">
          <LogoStrip />
        </div>
      </div>
    </div>
  );
}; 