"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { releaseData } from '@/data/release-notes';

const LatestReleaseBar: React.FC = () => {
  const latestFeaturedRelease = releaseData.find(release => release.isFeatured);

  if (!latestFeaturedRelease) {
    return null;
  }

  const featureTitles = latestFeaturedRelease.features
    .slice(0, 2)
    .map(feature => feature.title)
    .join(' and ');

  return (
    <div className="sticky top-0 z-50 bg-gray-50 text-gray-700 py-2 px-4 text-sm border-b border-gray-200">
      <div className="container mx-auto flex justify-center items-center">
        <span className="hidden md:inline mr-2">
          v{latestFeaturedRelease.version} is live: We&apos;ve added {featureTitles}
        </span>
        <span className="md:hidden mr-2">
          v{latestFeaturedRelease.version} is live!
        </span>
        <Link 
          href="/release-notes" 
          className="text-gray-700 hover:text-gray-900 flex items-center"
        >
          See what&apos;s new
          <ArrowRight className="ml-1 h-4 w-4" />
        </Link>
      </div>
    </div>
  );
};

export default LatestReleaseBar;