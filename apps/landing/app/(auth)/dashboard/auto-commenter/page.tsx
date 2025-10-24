"use client";

import { validateRequest } from "@/lib/auth";
import prismadb from "@/lib/prismadb";
import Link from "next/link";
import { Button } from "@repo/ui/components/ui/button";
import { Card } from "@repo/ui/components/ui/card";
import {
  MessageSquare,
  BarChart3,
  HelpCircle,
  ArrowRight,
  CircleDot,
  Bot,
  Zap,
  Target,
  X,
} from "lucide-react";
import { redirect } from "next/navigation";
import { CommentPlatform, CommentStatus, ActionType } from "@repo/db";
import PlatformsTab from "./_components/PlatformsTab";
import AnalyticsTab from "./_components/AnalyticsTab";
import HowItWorks from "./_components/HowItWorks";
import { useState, useEffect } from "react";
import {
  FaLinkedin,
  FaInstagram,
  FaReddit,
  FaFacebook,
  FaTwitter,
} from "react-icons/fa";

// Interface for analytics data
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
  configurations?: {
    linkedin: boolean;
    reddit: boolean;
  };
}

function LoadingSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 py-6 animate-pulse">
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col space-y-2">
          <div className="h-8 w-48 bg-gray-200 rounded"></div>
          <div className="h-4 w-96 bg-gray-200 rounded"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 bg-gray-200 rounded-lg"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>

        <div className="mt-8">
          <div className="h-6 w-48 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AutoCommenterPage() {
  return redirect("/dashboard/auto-commenter/config");
  // const [activeTab, setActiveTab] = useState('platforms');
  // const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  // const [isLoading, setIsLoading] = useState(true);

  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       setIsLoading(true);
  //       const response = await fetch('/api/auto-commenter/analytics');
  //       if (!response.ok) {
  //         throw new Error('Failed to fetch analytics');
  //       }
  //       const data = await response.json();
  //       setAnalytics(data);
  //     } catch (error) {
  //       console.error('Error fetching analytics:', error);
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };

  //   fetchData();
  // }, []);

  // if (isLoading) {
  //   return <LoadingSkeleton />;
  // }

  // if (!analytics) {
  //   return (
  //     <div className="max-w-7xl mx-auto px-2 sm:px-4 py-6">
  //       <div className="bg-red-50 border border-red-200 rounded-lg p-4">
  //         <h2 className="text-red-800 font-medium">Error Loading Data</h2>
  //         <p className="text-red-600 text-sm mt-1">Failed to load analytics data. Please try again later.</p>
  //       </div>
  //     </div>
  //   );
  // }

  // return (
  //   <div className="max-w-7xl mx-auto px-2 sm:px-4 py-6">
  //     <div className="flex flex-col space-y-6">
  //       <div className="flex flex-col space-y-2">
  //         <h1 className="text-2xl font-bold">Auto Commenter</h1>
  //         <p className="text-gray-600">Automatically engage with relevant content across platforms while maintaining your brand voice.</p>
  //       </div>

  //       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  //         <Card className="p-6 relative overflow-hidden bg-gradient-to-br from-white to-blue-50">
  //           <div className="absolute top-0 right-0 w-32 h-32 -mt-8 -mr-8 bg-blue-500/5 rounded-full"></div>
  //           <div className="absolute bottom-0 left-0 w-24 h-24 -mb-6 -ml-6 bg-purple-500/5 rounded-full"></div>

  //           <div className="relative z-10">
  //             <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center mb-4">
  //               <Zap className="h-6 w-6" />
  //             </div>
  //             <h2 className="text-xl font-semibold mb-2">Configure LinkedIn</h2>
  //             <p className="text-gray-600 mb-4">
  //               Set up automatic commenting for LinkedIn to engage with your target audience automatically.
  //             </p>
  //             <ul className="space-y-2 mb-6">
  //               <li className="flex items-start">
  //                 <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-full p-1 mr-2 mt-0.5">
  //                   <CheckIcon className="h-3 w-3" />
  //                 </div>
  //                 <span className="text-sm">Connect your LinkedIn account</span>
  //               </li>
  //               <li className="flex items-start">
  //                 <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-full p-1 mr-2 mt-0.5">
  //                   <CheckIcon className="h-3 w-3" />
  //                 </div>
  //                 <span className="text-sm">Define your target keywords and topics</span>
  //               </li>
  //               <li className="flex items-start">
  //                 <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-full p-1 mr-2 mt-0.5">
  //                   <CheckIcon className="h-3 w-3" />
  //                 </div>
  //                 <span className="text-sm">Set up engagement rules and filters</span>
  //               </li>
  //             </ul>
  //             <Link href="/dashboard/auto-commenter/linkedin/config">
  //               <Button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">
  //                 Configure LinkedIn
  //                 <ArrowRight className="ml-2 h-4 w-4" />
  //               </Button>
  //             </Link>
  //           </div>
  //         </Card>

  //         <div className="flex flex-col space-y-4">
  //           <Card className="p-5 flex items-center bg-gradient-to-br from-white to-amber-50">
  //             <div className="bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-full w-10 h-10 flex items-center justify-center mr-4">
  //               <Bot className="h-5 w-5" />
  //             </div>
  //             <div className="flex-1">
  //               <h3 className="font-medium mb-1">AI-Powered Engagement</h3>
  //               <p className="text-sm text-gray-600">Smart commenting that matches your brand voice and engagement style.</p>
  //             </div>
  //           </Card>

  //           <Card className="p-5 flex items-center bg-gradient-to-br from-white to-purple-50">
  //             <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-full w-10 h-10 flex items-center justify-center mr-4">
  //               <Target className="h-5 w-5" />
  //             </div>
  //             <div className="flex-1">
  //               <h3 className="font-medium mb-1">Targeted Engagement</h3>
  //               <p className="text-sm text-gray-600">Engage with relevant content based on your defined criteria.</p>
  //             </div>
  //           </Card>

  //           <Card className="p-5 flex items-center bg-gradient-to-br from-white to-blue-50">
  //             <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center mr-4">
  //               <BarChart3 className="h-5 w-5" />
  //             </div>
  //             <div className="flex-1">
  //               <h3 className="font-medium mb-1">Performance Analytics</h3>
  //               <p className="text-sm text-gray-600">Track engagement metrics and optimize your strategy.</p>
  //               <Link href="/dashboard/auto-commenter/analytics" className="text-xs text-blue-600 hover:text-blue-700 mt-2 inline-block">
  //                 View Analytics →
  //               </Link>
  //             </div>
  //           </Card>

  //           <Card className="p-5 flex items-center bg-gradient-to-br from-white to-green-50">
  //             <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-full w-10 h-10 flex items-center justify-center mr-4">
  //               <HelpCircle className="h-5 w-5" />
  //             </div>
  //             <div className="flex-1">
  //               <h3 className="font-medium mb-1">How It Works</h3>
  //               <p className="text-sm text-gray-600">Learn how our auto-commenter helps you engage effectively.</p>
  //               <button
  //                 onClick={() => setActiveTab('how-it-works')}
  //                 className="text-xs text-green-600 hover:text-green-700 mt-2 inline-block"
  //               >
  //                 Learn More →
  //               </button>
  //             </div>
  //           </Card>

  //           <Card className="p-5 bg-gradient-to-r from-blue-50 via-purple-50 to-blue-50 rounded-lg border border-blue-100">
  //             <div className="flex items-center justify-between">
  //               <div>
  //                 <h3 className="font-medium mb-1">Need Help?</h3>
  //                 <p className="text-sm text-gray-600">Check out our guide on setting up auto-commenting.</p>
  //               </div>
  //               <Link href="https://docs.olly.social/docs/features/auto-commenter" target="_blank">
  //                 <Button variant="outline" size="sm" className="border-blue-200 hover:bg-blue-50">View Guide</Button>
  //               </Link>
  //             </div>
  //           </Card>
  //         </div>
  //       </div>

  //       {/* Platform Status */}
  //       <div className="mt-8">
  //         <div className="flex items-center justify-between mb-4">
  //           <h2 className="text-lg font-semibold">Platform Status</h2>
  //           <div className="flex items-center text-xs text-gray-500">
  //             {analytics.configurations?.linkedin ? (
  //               <div className="flex items-center">
  //                 <span className="mr-2">Active:</span>
  //                 <span className="text-blue-600 flex items-center">
  //                   <CircleDot className="h-2 w-2 mr-0.5 text-blue-600" />
  //                   LinkedIn
  //                 </span>
  //               </div>
  //             ) : (
  //               <span className="text-amber-600 flex items-center">
  //                 <CircleDot className="h-2 w-2 mr-0.5 text-amber-600" />
  //                 No active configurations
  //               </span>
  //             )}
  //           </div>
  //         </div>

  //         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
  //           <div className="bg-gradient-to-br from-white to-blue-50 p-4 rounded-lg border border-blue-100 text-center">
  //             <div className="text-xs text-gray-500">Total Comments</div>
  //             <div className="text-lg font-medium">{analytics.totalComments}</div>
  //           </div>
  //           <div className="bg-gradient-to-br from-white to-purple-50 p-4 rounded-lg border border-purple-100 text-center">
  //             <div className="text-xs text-gray-500">Success Rate</div>
  //             <div className="text-lg font-medium">{analytics.commentSuccess}%</div>
  //           </div>
  //           <div className="bg-gradient-to-br from-white to-amber-50 p-4 rounded-lg border border-amber-100 text-center">
  //             <div className="text-xs text-gray-500">Last Activity</div>
  //             <div className="text-lg font-medium">
  //               {analytics.lastActivity ? new Date(analytics.lastActivity).toLocaleDateString() : 'Never'}
  //             </div>
  //           </div>
  //         </div>
  //       </div>

  //       {/* How It Works Modal */}
  //       {activeTab === 'how-it-works' && (
  //         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
  //           <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
  //             <div className="flex justify-between items-start mb-4">
  //               <h2 className="text-xl font-semibold">How It Works</h2>
  //               <button
  //                 onClick={() => setActiveTab('platforms')}
  //                 className="text-gray-500 hover:text-gray-700"
  //               >
  //                 <X className="h-5 w-5" />
  //               </button>
  //             </div>
  //             <HowItWorks />
  //           </div>
  //         </div>
  //       )}
  //     </div>
  //   </div>
}

// // Simple check icon component
// const CheckIcon = ({ className }: { className?: string }) => (
// <svg
//   xmlns="http://www.w3.org/2000/svg"
//   viewBox="0 0 24 24"
//   fill="none"
//   stroke="currentColor"
//   strokeWidth="3"
//   strokeLinecap="round"
//   strokeLinejoin="round"
//   className={className}
// >
//   <polyline points="20 6 9 17 4 12" />
// </svg>
// );
