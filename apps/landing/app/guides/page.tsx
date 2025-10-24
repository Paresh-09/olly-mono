"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BasicLayout } from "../(marketing)/_components/BasicLayout";

const guidesData = [
  {
    title: "How to Grow on Instagram Organically: Unlock Your Path to Discoverability",
    description: "Learn proven strategies to grow organically on Instagram, build meaningful community relationships, and maximize engagement. Discover how to navigate Instagram's unique landscape and leverage its features for success.",
    date: "Oct 22, 2024",
    datetime: "2024-10-22",
    file: "instagram",
    language: "en",
    author: {
      name: "Yash Thakker",
      role: "Founder",
      href: "https://www.goyashy.com",
      imageUrl: "/images/blog/yt.jpg"
    },
    url: "/guides/how-to-grow/instagram"
  },
  {
    title: "How to Grow Organically on LinkedIn: A Comprehensive Guide",
    description: "Learn proven strategies to grow organically on LinkedIn, establish thought leadership, and maximize professional engagement. Discover how to navigate LinkedIn's unique landscape and leverage its features for success.",
    date: "Oct 22, 2024",
    datetime: "2024-10-22",
    file: "linkedin",
    language: "en",
    author: {
      name: "Yash Thakker",
      role: "Founder",
      href: "https://www.goyashy.com",
      imageUrl: "/images/blog/yt.jpg"
    },
    url: "/guides/how-to-grow/linkedin"
  },
  {
    title: "How to Grow on Reddit Organically: Unlock the Power of Community Engagement",
    description: "Learn proven strategies to grow organically on Reddit, build meaningful community relationships, and maximize engagement. Discover how to navigate Reddit's unique landscape and leverage its features for success.",
    date: "Oct 22, 2024",
    datetime: "2024-10-22",
    file: "reddit",
    language: "en",
    author: {
      name: "Yash Thakker",
      role: "Founder",
      href: "https://www.goyashy.com",
      imageUrl: "/images/blog/yt.jpg"
    },
    url: "/guides/how-to-grow/reddit"
  },
  {
    title: "Growth Guide for X (Twitter): A Step-by-Step Guide",
    description: "Learn proven strategies to grow organically on X (Twitter), build meaningful connections, and maximize engagement. Discover how to navigate X's unique landscape and leverage its features for success.",
    date: "Oct 22, 2024",
    datetime: "2024-10-22",
    file: "x-twitter",
    language: "en",
    author: {
      name: "Yash Thakker",
      role: "Founder",
      href: "https://www.goyashy.com",
      imageUrl: "/images/blog/yt.jpg"
    },
    url: "/guides/how-to-grow/x-twitter"
  },
  {
    title: "How to Grow on Facebook Organically: Unlock the Potential of Community and Engagement",
    description: "Learn proven strategies to grow organically on Facebook, build meaningful community relationships, and maximize engagement. Discover how to navigate Facebook's unique landscape and leverage its features for success.",
    date: "Oct 22, 2024",
    datetime: "2024-10-22",
    file: "facebook",
    language: "en",
    author: {
      name: "Yash Thakker",
      role: "Founder",
      href: "https://www.goyashy.com",
      imageUrl: "/images/blog/yt.jpg"
    },
    url: "/guides/how-to-grow/facebook"
  },
];

export default async function GuidesPage() {
  return (
    <BasicLayout>
      <Guides />
    </BasicLayout>
  );
}

function Guides() {
  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <div>
              <h2 className="font-cal text-3xl tracking-tight text-gray-900 sm:text-4xl">
                Platform Growth Guides
              </h2>
              <p className="mt-2 text-lg leading-8 text-gray-600">
                Comprehensive guides to help you grow on major social platforms.
              </p>
            </div>
            <Button 
              variant="default" 
              className="mt-3 sm:mt-0"
            >
              Get Olly
            </Button>
          </div>
          <div className="mt-5 space-y-16 border-t border-gray-200 pt-10 sm:mt-16 sm:pt-16">
            {guidesData.map((guide) => (
              <article
                key={guide.title}
                className="flex max-w-xl flex-col items-start justify-between"
              >
                <div className="flex items-center gap-x-4 text-xs">
                  <time dateTime={guide.datetime} className="text-gray-500">
                    {guide.date}
                  </time>
                </div>
                <div className="group relative">
                  <h3 className="mt-3 font-cal text-lg leading-6 text-gray-900 group-hover:text-gray-600">
                    <Link href={guide.url} locale={guide.language}>
                      <span className="absolute inset-0" />
                      {guide.title}
                    </Link>
                  </h3>
                  <p className="mt-5 line-clamp-3 text-sm leading-6 text-gray-600">
                    {guide.description}
                  </p>
                </div>
                <div className="relative mt-8 flex items-center gap-x-4">
                  <Image
                    src={guide.author.imageUrl}
                    alt=""
                    className="h-10 w-10 rounded-full bg-gray-50"
                    width={40}
                    height={40}
                  />
                  <div className="text-sm leading-6">
                    <p className="font-semibold text-gray-900">
                      <a href={guide.author.href} hrefLang={guide.language}>
                        <span className="absolute inset-0" />
                        {guide.author.name}
                      </a>
                    </p>
                    <p className="text-gray-600">{guide.author.role}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}