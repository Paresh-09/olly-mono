import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getAllUseCases } from "../../../../lib/use-cases/index";

export const metadata: Metadata = {
  title: "Use Cases | Olly Social - AI-Powered Social Media Assistant",
  description:
    "Explore how Olly Social AI transforms social media management with advanced automation, engagement tools, and analytics.",
  keywords: [
    "olly social ai use cases",
    "social media automation",
    "ai-powered engagement",
    "personalized comments",
    "virality prediction",
    "social media analytics",
    "content optimization",
    "social media growth"
  ].join(", "),
  alternates: {
    canonical: "/use-cases",
  },
  openGraph: {
    title: "AI-Powered Social Media Solutions | Olly Social",
    description:
      "Discover how Olly Social AI can help you automate engagement, optimize content, and grow your audience effortlessly.",
    url: "https://www.olly.social/use-cases",
    siteName: "Olly Social",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "AI-Powered Social Media Use Cases | Olly Social",
    description:
      "Learn how Olly Social AI transforms social media management with automation and analytics."
  }
};

export default function UseCasesPage() {
  const useCases = getAllUseCases();

  return (
    <div>
      {/* Hero Section */}
      <div className="relative isolate overflow-hidden pt-14">
        <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              AI-Powered Tools for Effortless Social Media Growth
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Discover how Olly Social's AI-driven tools can help you create viral content, automate engagement, and grow your audience across multiple platforms.
            </p>
          </div>
        </div>
      </div>

      {/* Use Cases Grid */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8 pb-24">
        <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2">
          {useCases.map((useCase) => (
            <Link
              key={useCase.slug}
              href={`/use-cases/${useCase.slug}`}
              className="relative isolate flex flex-col gap-8 lg:flex-row group"
            >
              <div className="relative aspect-[16/9] sm:aspect-[2/1] lg:aspect-square lg:w-64 lg:shrink-0">
                <Image
                  src={'/olly_home.png'}
                  alt={useCase.title}
                  fill
                  className="absolute inset-0 h-full w-full rounded-2xl bg-gray-50 object-cover"
                />
                <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-gray-900/10" />
              </div>
              <div>
                <div className="flex items-center gap-x-4 text-xs">
                  <span className="text-gray-500">{useCase.keywords[0]}</span>
                </div>
                <div className="group relative max-w-xl">
                  <h3 className="mt-3 text-lg font-semibold leading-6 text-gray-900 group-hover:text-gray-600">
                    {useCase.title}
                  </h3>
                  <p className="mt-5 text-sm leading-6 text-gray-600">
                    {useCase.description}
                  </p>
                </div>
                <div className="mt-6 flex border-t border-gray-900/5 pt-6">
                  <div className="relative flex items-center gap-x-4">
                    <div className="text-sm font-semibold leading-6">
                      Learn more{" "}
                      <ArrowRight className="inline-block w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div >
        <div className="mx-auto max-w-7xl py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="relative isolate overflow-hidden bg-indigo-600 px-6 py-24 text-center shadow-xl sm:rounded-lg sm:px-16">
            <h2 className="mx-auto max-w-xl text-xl font-bold tracking-tight text-white sm:text-xl md:text-xl lg:text-xl ">
              Ready to elevate your social media strategy with Olly?
            </h2>
            <p className="mt-4 mx-auto max-w-lg text-lg leading-relaxed text-indigo-200">
              Join thousands of users leveraging Olly to automate engagement, predict virality, and optimize their content strategy.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                href="/dashboard"
                className="rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-indigo-600 shadow-sm hover:bg-gray-100 focus-visible:outline focus-visible:outline-offset focus-visible:outline-white"
              >
               Login Now
              </Link>
              <Link
                href="/dashboard"
                className="text-sm font-semibold leading-relaxed text-white"
              >
                Extension<span aria-hidden="true"> →</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
