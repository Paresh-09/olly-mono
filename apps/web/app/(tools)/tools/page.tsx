// app/(tools)/tools/page.tsx
"use client";
import React, { useState } from "react";
import { BasicLayout } from "@/app/(marketing)/_components/BasicLayout";
import Link from "next/link";
import { Search, Sparkles, ArrowRight } from "lucide-react";
import { Input } from "@repo/ui/components/ui/input";
import { Button } from "@repo/ui/components/ui/button";
import { Badge } from "@repo/ui/components/ui/badge";
import { Card } from "@repo/ui/components/ui/card";
import toolData from "@/data/usable-tools-data";
import { ToolReviewsSection } from "./_components/tool-reviews/review";
const categories = [
  "All",
  "Content Creation",
  "Analytics",
  "Social Media",
  "Generation",
] as const;

type Category = (typeof categories)[number];

type ToolWithCategory = (typeof toolData)[number] & {
  category: Category;
  isNew: boolean;
  isPro: boolean;
};

// Use deterministic logic instead of random
const toolsWithCategories: ToolWithCategory[] = toolData
  .filter(
    (tool) =>
      !tool.title.includes("Error") && !tool.description.includes("Error"),
  )
  .map((tool, index) => ({
    ...tool,
    category:
      index % 4 === 0
        ? "Analytics"
        : index % 3 === 0
          ? "Social Media"
          : index % 2 === 0
            ? "Generation"
            : "Content Creation",
    isNew: index < 2,
    isPro: index % 3 === 0,
  }));

function HeroSection() {
  return (
    <div className="text-center">
      <h1 className="text-4xl font-cal font-bold tracking-tight text-gray-900 sm:text-6xl">
        AI-Powered Tools
      </h1>
      <p className="mt-6 text-lg leading-8 text-gray-600">
        Supercharge your content creation with our suite of AI tools. Transform
        your ideas into engaging content in minutes.
      </p>
      <div className="mt-10 flex items-center justify-center gap-x-6">
        <Link href="/dashboard">
          <Button size="lg">
            Get Started
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
        <Link href="/#pricing">
          <Button variant="outline" size="lg">
            View Pricing
          </Button>
        </Link>
      </div>
    </div>
  );
}

function PromoSection() {
  return (
    <div className="mt-20 rounded-2xl bg-gradient-to-r from-gray-900 to-blue-900 p-8 sm:p-12">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-cal font-bold tracking-tight text-white">
            10x Your Social Media Presence
          </h2>
          <p className="mt-2 text-lg text-gray-200">
            Join thousands of creators who have multiplied their following in
            just days using our AI tools.
          </p>
          <div className="mt-4 flex gap-4">
            <div className="flex items-center gap-2">
              <Badge className="bg-blue-500">10x Growth</Badge>
              <Badge className="bg-green-500">7 Days</Badge>
              <Badge className="bg-purple-500">AI-Powered</Badge>
            </div>
          </div>
        </div>
        <Link href="/#pricing">
          <Button
            size="lg"
            className="bg-white text-gray-900 hover:bg-gray-100 transform hover:scale-105 transition-all"
          >
            <Sparkles className="mr-2 h-4 w-4" />
            Get Started Now
          </Button>
        </Link>
      </div>
    </div>
  );
}

function SearchAndFilter({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
}: {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: Category;
  setSelectedCategory: (category: Category) => void;
}) {
  return (
    <div className="mt-16 flex flex-col sm:flex-row gap-4 items-center justify-between">
      <div className="relative w-full sm:w-96">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
        <Input
          type="text"
          placeholder="Search tools..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <div className="flex gap-2 overflow-x-auto pb-2 w-full sm:w-auto">
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </Button>
        ))}
      </div>
    </div>
  );
}

function ToolCard({ tool }: { tool: ToolWithCategory }) {
  // Ensure we have a valid href
  const href = tool.id ? `/tools/${encodeURIComponent(tool.id)}` : "/tools";

  return (
    <Link href={href} key={tool.id}>
      <Card className="group h-full p-6 hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
        <div className="flex flex-col h-full">
          <div className="flex items-start justify-between">
            <h3 className="font-cal text-lg font-semibold text-gray-900 group-hover:text-blue-600">
              {tool.title}
            </h3>
            <div className="flex gap-2">
              {tool.isNew && <Badge className="bg-green-500">New</Badge>}
              {tool.isPro && (
                <Badge
                  variant="outline"
                  className="border-amber-500 text-amber-500"
                >
                  Pro
                </Badge>
              )}
            </div>
          </div>

          <p className="mt-4 flex-grow text-sm text-gray-600 line-clamp-3">
            {tool.description}
          </p>

          <div className="mt-4 flex items-center justify-between">
            <Badge variant="secondary">{tool.category}</Badge>
            <Button
              variant="ghost"
              size="sm"
              className="group-hover:translate-x-1 transition-transform"
            >
              Try Now <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </Link>
  );
}

function Tools() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Category>("All");

  const validTools = toolsWithCategories.filter((tool) => {
    // First filter out error tools
    return !tool.title.includes("Error") && !tool.description.includes("Error");
  });

  const filteredTools = validTools.filter((tool) => {
    const matchesSearch =
      tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || tool.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen py-12 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <HeroSection />
        <PromoSection />

        <SearchAndFilter
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
        />

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTools.map((tool) => (
            <ToolCard key={tool.title} tool={tool} />
          ))}
        </div>

        {filteredTools.length === 0 && (
          <div className="mt-10 text-center">
            <h3 className="text-lg font-medium text-gray-900">
              No tools found
            </h3>
            <p className="mt-1 text-gray-500">
              Try adjusting your search or filter to find what you&apos;re
              looking for.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ToolsPage() {
  return (
    <>
      <Tools />
    </>
  );
}

