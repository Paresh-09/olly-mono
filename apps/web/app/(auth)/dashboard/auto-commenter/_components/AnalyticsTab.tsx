'use client';

import { useEffect, useState } from 'react';
import Link from "next/link";
import { Button } from "@repo/ui/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { ActionType, CommentPlatform, CommentStatus } from "@repo/db";
import { FaComment, FaCalendarAlt, FaExclamationTriangle, FaCheckCircle, FaExternalLinkAlt, FaLinkedin, FaReddit } from "react-icons/fa";
import { HiOutlineStatusOnline } from "react-icons/hi";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { Progress } from "@repo/ui/components/ui/progress";
import {
  ChartContainer,
  ChartTooltipContent,
  type ChartConfig,
} from '@repo/ui/components/ui/chart';

const chartConfig: ChartConfig = {
  Comments: {
    label: "Comments",
    color: "#0891b2",
  },
  value: {
    label: "Count",
    color: "#0891b2",
  },
} satisfies ChartConfig;

const COLORS = ['#0891b2', '#f97316', '#ef4444', '#10b981', '#8b5cf6'];

// Analytics Stat Card Component
function StatCard({ title, value, icon, description, color }: { 
  title: string; 
  value: number | string; 
  icon: React.ReactNode; 
  description?: string;
  color: string;
}) {
  return (
    <Card className="shadow-none border bg-white">
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">{title}</p>
            <h4 className="text-base font-bold mt-0.5">{value}</h4>
            {description && <p className="text-xs text-muted-foreground leading-tight mt-1">{description}</p>}
          </div>
          <div className={`p-1.5 rounded-full ${color}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Define the analytics data interface 
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

interface AnalyticsTabProps {
  commentHistory: any[];
  analytics: AnalyticsData;
}

export default function AnalyticsTab({ commentHistory: initialCommentHistory, analytics: initialAnalytics }: AnalyticsTabProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(initialAnalytics);
  const [commentHistory, setCommentHistory] = useState<any[]>(initialCommentHistory);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch('/api/ac/analytics');
        if (!response.ok) {
          throw new Error('Failed to fetch analytics data');
        }
        
        const data = await response.json();
        setAnalytics(data.analytics);
        // If the API returns comment history separately
        if (data.commentHistory) {
          setCommentHistory(data.commentHistory);
        }
      } catch (err) {
        console.error('Error fetching analytics:', err);
        setError('Failed to load analytics data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalyticsData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <Card className="bg-destructive/10 border-destructive/30">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <FaExclamationTriangle className="h-4 w-4 text-destructive" />
            <h3 className="text-sm font-medium text-destructive">Error Loading Data</h3>
          </div>
          <p className="text-xs text-destructive/80 mb-3">{error || "Failed to load analytics. Try again later."}</p>
          <Button 
            variant="destructive"
            size="sm"
            className="h-7 text-xs"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Format data for Tremor charts
  const platformData = analytics.platformBreakdown.map(item => ({
    name: item.platform,
    value: item.count
  }));

  const statusData = analytics.statusBreakdown.map(item => ({
    name: item.status,
    value: item.count
  }));

  const dailyData = analytics.dailyStats.map(day => ({
    date: new Date(day.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    Comments: day.count
  }));

  return (
    <>
      {commentHistory.length > 0 ? (
        <div className="space-y-4">
          <div>
            <h2 className="text-sm font-medium mb-2">Activity Overview</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <StatCard 
                title="Total Comments" 
                value={analytics.totalComments} 
                icon={<FaComment className="text-white h-3 w-3" />} 
                color="bg-blue-500" 
              />
              <StatCard 
                title="Success Rate" 
                value={`${analytics.commentSuccess}%`} 
                icon={<FaCheckCircle className="text-white h-3 w-3" />} 
                color="bg-green-500" 
              />
              <StatCard 
                title="Failed" 
                value={analytics.failedComments} 
                icon={<FaExclamationTriangle className="text-white h-3 w-3" />} 
                color="bg-red-500" 
              />
              <StatCard 
                title="Last Activity" 
                value={analytics.lastActivity 
                  ? new Date(analytics.lastActivity).toLocaleDateString() 
                  : 'None'} 
                icon={<FaCalendarAlt className="text-white h-3 w-3" />} 
                color="bg-purple-500" 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Card className="shadow-none overflow-hidden">
              <CardHeader className="p-3 pb-1">
                <CardTitle className="text-xs font-medium">Platform Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0 h-[120px]">
                <ChartContainer config={chartConfig}>
                  <PieChart>
                    <Pie
                      data={platformData}
                      cx="50%"
                      cy="50%"
                      innerRadius={25}
                      outerRadius={45}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {platformData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                     <Tooltip
                       content={<ChartTooltipContent nameKey="value" />}
                     />
                  </PieChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card className="shadow-none overflow-hidden">
              <CardHeader className="p-3 pb-1">
                <CardTitle className="text-xs font-medium">Status Distribution</CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-1">
                <div className="space-y-2 text-xs">
                  {analytics.statusBreakdown.map((status) => (
                    <div key={status.status} className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span>{status.status}</span>
                        <span className="font-medium">{status.count}</span>
                      </div>
                      <Progress
                        value={(status.count / analytics.totalComments) * 100}
                        className="h-1"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-none overflow-hidden">
            <CardHeader className="p-3 pb-1">
              <CardTitle className="text-xs font-medium">Daily Activity</CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="h-[120px]">
                <ChartContainer config={chartConfig}>
                  <BarChart data={dailyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickLine={false}
                      axisLine={false}
                      fontSize={10}
                    />
                    <YAxis 
                      tickLine={false}
                      axisLine={false}
                      fontSize={10}
                      width={20}
                    />
                     <Tooltip content={<ChartTooltipContent />} />
                    <Bar 
                      dataKey="Comments" 
                      fill="var(--color-Comments)" 
                      radius={2}
                    />
                  </BarChart>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-none overflow-hidden">
            <CardHeader className="p-3 pb-1">
              <CardTitle className="text-xs font-medium">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <div className="overflow-x-auto text-xs">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="pb-1 text-left font-medium text-muted-foreground px-2 w-[20%]">Platform</th>
                      <th className="pb-1 text-left font-medium text-muted-foreground px-2 w-[15%]">Action</th>
                      <th className="pb-1 text-left font-medium text-muted-foreground px-2 w-[15%]">Status</th>
                      <th className="pb-1 text-left font-medium text-muted-foreground px-2 w-[20%]">Author</th>
                      <th className="pb-1 text-left font-medium text-muted-foreground px-2 w-[15%]">Date</th>
                      <th className="pb-1 text-left font-medium text-muted-foreground px-2 w-[15%]">Link</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.recentActivity.slice(0, 4).map((activity) => (
                      <tr key={activity.id} className="border-b hover:bg-muted/30">
                        <td className="py-1 px-2">
                          <div className="flex items-center">
                            {activity.platform === CommentPlatform.LINKEDIN ? (
                              <FaLinkedin className="text-blue-600 mr-1.5 h-2.5 w-2.5" />
                            ) : (
                              <FaReddit className="text-orange-600 mr-1.5 h-2.5 w-2.5" />
                            )}
                            <span className="truncate">{activity.platform}</span>
                          </div>
                        </td>
                        <td className="py-1 px-2 truncate">
                          {activity.action === ActionType.COMMENT ? 'Comment' : 
                          activity.action === ActionType.LIKE ? 'Like' : 
                          activity.action === ActionType.SHARE ? 'Share' : 
                          String(activity.action)}
                        </td>
                        <td className="py-1 px-2">
                          <span className={`px-1.5 py-0.5 text-[9px] rounded-sm inline-block w-11 text-center text-white 
                            ${activity.status === CommentStatus.POSTED ? 'bg-green-500' : 
                            activity.status === CommentStatus.FAILED ? 'bg-red-500' : 
                            activity.status === CommentStatus.PENDING ? 'bg-yellow-500' : 
                            'bg-gray-500'}`}>
                            {activity.status}
                          </span>
                        </td>
                        <td className="py-1 px-2 truncate">{activity.authorName || '—'}</td>
                        <td className="py-1 px-2 truncate">
                          {activity.postedAt 
                            ? new Date(activity.postedAt).toLocaleDateString() 
                            : '—'}
                        </td>
                        <td className="py-1 px-2">
                          <a 
                            href={activity.postUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline flex items-center"
                          >
                            View <FaExternalLinkAlt size={8} className="ml-1" />
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card className="shadow-none border-muted">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <HiOutlineStatusOnline className="h-5 w-5 text-muted-foreground mb-2" />
            <h3 className="text-sm font-medium mb-1">No Activity Yet</h3>
            <p className="text-xs text-muted-foreground mb-3">
              Once you create a configuration, you'll see analytics here.
            </p>
            <Link href="/dashboard/auto-commenter/linkedin/config">
              <Button size="sm" className="h-7 text-xs">
                Create Configuration
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </>
  );
} 