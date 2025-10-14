'use client';

import { useState, useEffect } from "react";
import { BarChart3, ArrowLeft } from "lucide-react";
import Link from "next/link";
import AnalyticsTab from "../_components/AnalyticsTab";
import { CommentPlatform, CommentStatus, ActionType } from "@repo/db";

interface AnalyticsData {
  totalComments: number;
  pendingComments: number;
  postedComments: number;
  failedComments: number;
  skippedComments: number;
  linkedinComments: number;
  redditComments: number;
  commentSuccess: number;
  lastActivity?: Date;
  dailyStats: Array<{
    date: string;
    count: number;
  }>;
  actionBreakdown: Array<{
    action: string;
    count: number;
  }>;
  platformBreakdown: Array<{
    platform: string;
    count: number;
  }>;
  statusBreakdown: Array<{
    status: string;
    count: number;
  }>;
  topHashtags: Array<{
    hashtag: string;
    count: number;
  }>;
  recentActivity: Array<{
    id: string;
    platform: CommentPlatform;
    action: ActionType;
    status: CommentStatus;
    postUrl: string;
    postedAt?: Date;
    authorName?: string;
  }>;
}

function LoadingSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 py-6 animate-pulse">
      <div className="flex flex-col space-y-6">
        <div className="flex items-center space-x-4">
          <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
          <div className="h-8 w-48 bg-gray-200 rounded"></div>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [commentHistory, setCommentHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/auto-commenter/analytics');
        if (!response.ok) {
          throw new Error('Failed to fetch analytics');
        }
        const data = await response.json();
        setAnalytics(data);
        setCommentHistory(data.recentActivity || []);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (!analytics) {
    return (
      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h2 className="text-red-800 font-medium">Error Loading Data</h2>
          <p className="text-red-600 text-sm mt-1">Failed to load analytics data. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 py-6">
      <div className="flex flex-col space-y-6">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/auto-commenter">
            <button className="text-gray-500 hover:text-gray-700">
              <ArrowLeft className="h-5 w-5" />
            </button>
          </Link>
          <div className="flex items-center space-x-2">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center">
              <BarChart3 className="h-4 w-4" />
            </div>
            <h1 className="text-2xl font-bold">Analytics</h1>
          </div>
        </div>

        <AnalyticsTab 
          commentHistory={commentHistory}
          analytics={analytics}
        />
      </div>
    </div>
  );
} 