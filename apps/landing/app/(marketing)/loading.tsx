import { Skeleton } from "@repo/ui/components/ui/skeleton";
import Image from "next/image";

export default function Loading() {
  return (
    <div className="min-h-screen relative">
      {/* Fixed background gradients */}
      <div className="fixed inset-0 -z-10">
        {/* Primary gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-white via-gray-50/50 to-white dark:from-gray-950 dark:via-gray-900/50 dark:to-gray-950">
          {/* Animated gradient orbs */}
          <div className="absolute inset-x-0 -top-40 transform-gpu overflow-hidden blur-3xl sm:-top-80">
            <div
              className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#50c4aa] to-[#9089fc] opacity-20 dark:opacity-10 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem] animate-gradient-x"
              style={{ clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)' }}
            />
          </div>

          {/* Middle gradient orb */}
          <div className="absolute inset-x-0 top-[25%] transform-gpu overflow-hidden blur-3xl">
            <div
              className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#9089fc] to-[#50c4aa] opacity-10 dark:opacity-5 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem] animate-gradient-y"
              style={{ clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)' }}
            />
          </div>

          {/* Bottom gradient orb */}
          <div className="absolute inset-x-0 top-[calc(100%-13rem)] transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]">
            <div
              className="relative left-[calc(50%-3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#50c4aa] to-[#9089fc] opacity-20 dark:opacity-10 sm:left-[calc(50%-36rem)] sm:w-[72.1875rem] animate-gradient-x"
              style={{ clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)' }}
            />
          </div>
        </div>
      </div>

      {/* Logo */}
      <div className="absolute top-8 left-8">
        <Image
          src="/icon-2.png"
          alt="Olly"
          width={40}
          height={40}
          className="rounded-xl"
        />
      </div>

      {/* Header Skeleton */}
      <div className="pt-10">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          {/* PH Badge Skeleton */}
          <div className="mb-4 flex justify-center">
            <Skeleton className="h-10 w-32" />
          </div>

          {/* Hero Text Skeleton */}
          <div className="mx-auto max-w-2xl text-center">
            <Skeleton className="h-16 w-full mb-4" />
            <Skeleton className="h-12 w-3/4 mx-auto mb-8" />

            {/* CTA Buttons Skeleton */}
            <div className="flex justify-center gap-4 mb-6">
              <Skeleton className="h-12 w-32" />
              <Skeleton className="h-12 w-32" />
            </div>

            {/* Refund Option Skeleton */}
            <Skeleton className="h-6 w-48 mx-auto" />
          </div>

          {/* Before/After Engagement Skeleton */}
          <div className="mt-12">
            <div className="grid md:grid-cols-2 gap-4">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
          </div>

          {/* Logo Strip Skeleton */}
          <div className="mt-12">
            <div className="flex justify-center gap-8">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-8 w-20" />
              ))}
            </div>
          </div>

          {/* Video Section Skeleton */}
          <div className="mt-12">
            <Skeleton className="aspect-video w-full rounded-xl" />
          </div>
        </div>
      </div>

      {/* Features Section Skeleton */}
      <div className="mt-20 px-6">
        <div className="grid md:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-10 w-10" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-20 w-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
