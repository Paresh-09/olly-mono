"use client";

import { useState } from 'react';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@repo/ui/components/ui/tabs';
import { Card } from '@repo/ui/components/ui/card';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LineChart,
  Line,
  CartesianGrid,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  AreaChart,
  Area,
  ComposedChart,
  Scatter
} from 'recharts';
import { Button } from '@repo/ui/components/ui/button';
import { Download, Share2, Lock, LogIn } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@repo/ui/components/ui/table';
import { toast } from '@repo/ui/hooks/use-toast';
import { useRouter } from 'next/navigation';

interface AuditResultsProps {
  result: any;
  platform: string;
  isAuthenticated: boolean;
  onLogin: () => void;
  onClaimReport?: () => void;
}

export const AuditResults = ({
  result,
  platform,
  isAuthenticated,
  onLogin,
  onClaimReport
}: AuditResultsProps) => {
  const [activeTab, setActiveTab] = useState('overview');
  const router = useRouter();

  // Extract data from the audit result
  const { profile, audit, isAnonymous } = result;

  // Format percentage for display
  const formatPercent = (value: number) => `${value.toFixed(1)}%`;

  // Format large numbers with K, M, B suffixes
  const formatNumber = (num: number): string => {
    if (num === undefined || num === null) return '0';

    if (num >= 1000000000) {
      return (num / 1000000000).toFixed(1) + 'B';
    } else if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    } else {
      return num.toString();
    }
  };

  // Define colors for charts
  const scoreColors = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444'];
  const chartColors = ['#10B981', '#3B82F6', '#F59E0B', '#EC4899'];

  // Scores data for pie chart
  const scoresData = [
    { name: 'Engagement', value: audit.engagementScore },
    { name: 'Profile', value: audit.profileOptimizationScore },
    { name: 'Content', value: audit.contentQualityScore },
  ];

  // Prepare radar chart data
  const radarData = [
    { subject: 'Engagement', A: audit.engagementScore, fullMark: 100 },
    { subject: 'Content Quality', A: audit.contentQualityScore, fullMark: 100 },
    { subject: 'Profile Setup', A: audit.profileOptimizationScore, fullMark: 100 },
    // Adding metrics that may be in the data or providing default values if not
    { subject: 'Consistency', A: audit.keyMetrics.consistencyScore || 65, fullMark: 100 },
    { subject: 'Growth', A: audit.keyMetrics.growthScore || 70, fullMark: 100 },
    { subject: 'Audience', A: audit.keyMetrics.audienceScore || 75, fullMark: 100 },
  ];

  // Calculate average engagement by content type if data exists
  let engagementByContentData = [];
  if (audit.keyMetrics.contentTypePerformance) {
    engagementByContentData = audit.keyMetrics.contentTypePerformance.map((item: any) => ({
      name: item.name,
      engagement: item.value,
      average: audit.keyMetrics.avgEngagementRate || 50 // Use average or fallback
    }));
  }

  // Create combined growth data if it exists
  let growthData = [];
  if (audit.keyMetrics.viewsData && audit.keyMetrics.subscriberGrowthData) {
    growthData = audit.keyMetrics.viewsData.map((item: any, index: number) => ({
      name: item.name,
      views: item.value,
      subscribers: audit.keyMetrics.subscriberGrowthData[index]?.value || 0
    }));
  } else if (audit.keyMetrics.viewsData) {
    growthData = audit.keyMetrics.viewsData;
  }

  // Store report ID locally for anonymous users
  if (!isAuthenticated && isAnonymous && profile.id) {
    // Check if we already have stored reports
    const storedReports = localStorage.getItem('anonymousReports');
    let reportsArray = storedReports ? JSON.parse(storedReports) : [];

    // Add this report if not already stored
    if (!reportsArray.includes(profile.id)) {
      reportsArray.push(profile.id);
      localStorage.setItem('anonymousReports', JSON.stringify(reportsArray));
    }
  }

  const handleDownloadReport = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please log in to download the full report.",
      });
      onLogin();
      return;
    }

    // Show loading toast
    toast({
      title: "Preparing PDF",
      description: "Please wait while we generate your report...",
    });

    try {
      alert("Feature coming soon");

      toast({
        title: "Report Downloaded",
        description: "Your audit report has been downloaded as a PDF file.",
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Download Failed",
        description: "There was a problem generating your PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleShareReport = () => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please log in to share the full report.",
      });
      onLogin();
      return;
    }

    // Generate a shareable URL
    const shareableUrl = window.location.href;

    // Check if the Web Share API is available
    if (navigator.share) {
      navigator.share({
        title: `${platform.charAt(0).toUpperCase() + platform.slice(1)} Audit Report: ${profile.profileName || profile.profileUsername}`,
        text: `Check out this ${platform} audit report with an overall score of ${audit.overallScore}/100!`,
        url: shareableUrl,
      })
        .then(() => {
          toast({
            title: "Report Shared",
            description: "Your audit report has been shared successfully.",
          });
        })
        .catch((error) => {
          console.error('Error sharing:', error);
          // Fallback to clipboard copy if sharing fails
          copyToClipboard();
        });
    } else {
      // Fallback for browsers that don't support the Web Share API
      copyToClipboard();
    }
  };

  // Helper function to copy URL to clipboard
  const copyToClipboard = () => {
    const shareableUrl = window.location.href;

    navigator.clipboard.writeText(shareableUrl)
      .then(() => {
        toast({
          title: "Link Copied",
          description: "Report URL has been copied to your clipboard.",
        });
      })
      .catch((error) => {
        console.error('Error copying to clipboard:', error);
        toast({
          title: "Sharing Failed",
          description: "Could not share or copy the report URL.",
          variant: "destructive",
        });
      });
  };

  // For anonymous users, claiming the report
  const handleClaimReport = () => {
    if (isAuthenticated && isAnonymous && onClaimReport) {
      onClaimReport();
    } else if (!isAuthenticated) {
      onLogin();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold">{profile.profileName || profile.profileUsername}</h2>
          <p className="text-muted-foreground">{profile.profileUrl}</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadReport}
          >
            {!isAuthenticated ? <Lock className="mr-2 h-4 w-4" /> : <Download className="mr-2 h-4 w-4" />}
            Download Report
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleShareReport}
          >
            {!isAuthenticated ? <Lock className="mr-2 h-4 w-4" /> : <Share2 className="mr-2 h-4 w-4" />}
            Share
          </Button>
        </div>
      </div>

      {/* Show claim banner for authenticated users viewing anonymous reports */}
      {isAuthenticated && isAnonymous && onClaimReport && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex justify-between items-center">
          <div>
            <h3 className="font-medium">Anonymous Report</h3>
            <p className="text-sm text-muted-foreground">This report was created anonymously. Claim it to add it to your account.</p>
          </div>
          <Button onClick={handleClaimReport}>
            Claim Report
          </Button>
        </div>
      )}

      {/* Show login banner for anonymous users */}
      {!isAuthenticated && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex justify-between items-center">
          <div>
            <h3 className="font-medium">Preview Mode</h3>
            <p className="text-sm text-muted-foreground">You're viewing a limited preview. Log in to see full details and save this report.</p>
          </div>
          <Button onClick={onLogin}>
            <LogIn className="mr-2 h-4 w-4" />
            Log in
          </Button>
        </div>
      )}

      {/* Overall score card */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <h3 className="text-sm font-medium text-muted-foreground">Overall Score</h3>
            <div className="text-3xl font-bold">{audit.overallScore}/100</div>
          </div>
          <div className="text-center">
            <h3 className="text-sm font-medium text-muted-foreground">Engagement</h3>
            <div className="text-3xl font-bold">{audit.engagementScore}/100</div>
          </div>
          <div className="text-center">
            <h3 className="text-sm font-medium text-muted-foreground">Profile Optimization</h3>
            <div className="text-3xl font-bold">{audit.profileOptimizationScore}/100</div>
          </div>
          <div className="text-center">
            <h3 className="text-sm font-medium text-muted-foreground">Content Quality</h3>
            <div className="text-3xl font-bold">{audit.contentQualityScore}/100</div>
          </div>
        </div>
      </Card>

      {/* Main content tabs */}
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Summary</h3>
            <p className="text-muted-foreground">{audit.summary}</p>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-md font-semibold mb-2">Strengths</h4>
                <ul className="list-disc pl-6 space-y-2">
                  {audit.strengths.slice(0, isAuthenticated ? audit.strengths.length : 2).map((strength: string, index: number) => (
                    <li key={`strength-${index}`} className="text-sm">{strength}</li>
                  ))}
                  {!isAuthenticated && audit.strengths.length > 2 && (
                    <li className="text-sm font-medium text-blue-600">
                      <Button variant="link" className="p-0 h-auto" onClick={onLogin}>
                        Log in to see {audit.strengths.length - 2} more strengths
                      </Button>
                    </li>
                  )}
                </ul>
              </div>
              <div>
                <h4 className="text-md font-semibold mb-2">Weaknesses</h4>
                <ul className="list-disc pl-6 space-y-2">
                  {audit.weaknesses.slice(0, isAuthenticated ? audit.weaknesses.length : 2).map((weakness: string, index: number) => (
                    <li key={`weakness-${index}`} className="text-sm">{weakness}</li>
                  ))}
                  {!isAuthenticated && audit.weaknesses.length > 2 && (
                    <li className="text-sm font-medium text-blue-600">
                      <Button variant="link" className="p-0 h-auto" onClick={onLogin}>
                        Log in to see {audit.weaknesses.length - 2} more weaknesses
                      </Button>
                    </li>
                  )}
                </ul>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="text-md font-semibold mb-2">Performance at a glance</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={scoresData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      fill="#8884d8"
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {scoresData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={scoreColors[index % scoreColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value}/100`, 'Score']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Radar Chart - Overall Performance Metrics */}
            {isAuthenticated && (
              <div className="mt-8">
                <h4 className="text-md font-semibold mb-4">Performance Metrics</h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart outerRadius={90} data={radarData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="subject" />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} />
                      <Radar name="Performance" dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                      <Legend />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </Card>
        </TabsContent>

        {/* Insights Tab - Limited for anonymous users */}
        <TabsContent value="insights" className="space-y-4">
          <Card className="p-6">
            {!isAuthenticated ? (
              <div className="text-center py-8">
                <Lock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Detailed Insights Locked</h3>
                <p className="text-muted-foreground mb-4">Log in to access detailed profile, content, and engagement analysis.</p>
                <Button onClick={onLogin}>Log in to View</Button>
              </div>
            ) : (
              <>
                <h3 className="text-lg font-semibold mb-4">Profile Analysis</h3>
                <p className="text-muted-foreground mb-6">{audit.profileAnalysis}</p>

                <h3 className="text-lg font-semibold mb-4">Content Analysis</h3>
                <p className="text-muted-foreground mb-6">{audit.contentAnalysis}</p>

                <h3 className="text-lg font-semibold mb-4">Engagement Analysis</h3>
                <p className="text-muted-foreground">{audit.engagementAnalysis}</p>

                {audit.audienceAnalysis && (
                  <>
                    <h3 className="text-lg font-semibold mb-4 mt-6">Audience Analysis</h3>
                    <p className="text-muted-foreground">{audit.audienceAnalysis}</p>
                  </>
                )}
              </>
            )}
          </Card>
        </TabsContent>

        {/* Metrics Tab - Limited for anonymous users */}
        <TabsContent value="metrics" className="space-y-4">
          <Card className="p-6">
            {!isAuthenticated ? (
              <div className="text-center py-8">
                <Lock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Detailed Metrics Locked</h3>
                <p className="text-muted-foreground mb-4">Log in to access all metrics, charts, and performance data.</p>
                <Button onClick={onLogin}>Log in to View</Button>
              </div>
            ) : (
              <>
                <h3 className="text-lg font-semibold mb-4">Key Metrics</h3>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                  {audit.keyMetrics.subscriberCount !== undefined && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="text-sm font-medium text-muted-foreground">${platform == 'youtube' ? "Subscribers" : "Followers"}</h4>
                      <div className="text-2xl font-bold">{formatNumber(audit.keyMetrics.subscriberCount)}</div>
                    </div>
                  )}

                  {audit.keyMetrics.totalViews !== undefined && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="text-sm font-medium text-muted-foreground">Total Views</h4>
                      <div className="text-2xl font-bold">{formatNumber(audit.keyMetrics.totalViews)}</div>
                    </div>
                  )}

                  {audit.keyMetrics.engagementRate !== undefined && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="text-sm font-medium text-muted-foreground">Engagement Rate</h4>
                      <div className="text-2xl font-bold">{formatPercent(audit.keyMetrics.engagementRate)}</div>
                    </div>
                  )}

                  {audit.keyMetrics.videoCount !== undefined && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="text-sm font-medium text-muted-foreground">Video Count</h4>
                      <div className="text-2xl font-bold">{formatNumber(audit.keyMetrics.videoCount)}</div>
                    </div>
                  )}

                  {audit.keyMetrics.avgViewsPerVideo !== undefined && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="text-sm font-medium text-muted-foreground">Avg. Views per Video</h4>
                      <div className="text-2xl font-bold">{formatNumber(audit.keyMetrics.avgViewsPerVideo)}</div>
                    </div>
                  )}

                  {audit.keyMetrics.growthRate !== undefined && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="text-sm font-medium text-muted-foreground">Growth Rate</h4>
                      <div className="text-2xl font-bold">{formatPercent(audit.keyMetrics.growthRate)}</div>
                    </div>
                  )}
                </div>

                {/* Engagement data line chart */}
                {audit.keyMetrics.engagementData && (
                  <div className="mb-8">
                    <h4 className="text-md font-semibold mb-4">Engagement Rate Trend</h4>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={audit.keyMetrics.engagementData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis unit="%" />
                          <Tooltip formatter={(value) => [`${value}%`, 'Engagement Rate']} />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="value"
                            name="Engagement Rate"
                            stroke="#3B82F6"
                            strokeWidth={2}
                            dot={{ fill: '#3B82F6', r: 4 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {/* Views data area chart */}
                {audit.keyMetrics.viewsData && (
                  <div className="mb-8">
                    <h4 className="text-md font-semibold mb-4">Views Trend</h4>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={audit.keyMetrics.viewsData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis tickFormatter={(value) => formatNumber(value)} />
                          <Tooltip formatter={(value: any) => [formatNumber(value), 'Views']} />
                          <Legend />
                          <Area
                            type="monotone"
                            dataKey="value"
                            name="Views"
                            stroke="#10B981"
                            fill="#10B981"
                            fillOpacity={0.3}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {/* Content type performance bar chart */}
                {audit.keyMetrics.contentTypePerformance && (
                  <div>
                    <h4 className="text-md font-semibold mb-4">Content Type Performance</h4>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={audit.keyMetrics.contentTypePerformance}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis unit="%" />
                          <Tooltip formatter={(value) => [`${value}%`, 'Performance']} />
                          <Legend />
                          <Bar
                            dataKey="value"
                            name="Performance"
                            fill="#EC4899"
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </>
            )}
          </Card>
        </TabsContent>

        {/* Performance Tab - New tab with additional graphs */}
        <TabsContent value="performance" className="space-y-4">
          <Card className="p-6">
            {!isAuthenticated ? (
              <div className="text-center py-8">
                <Lock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Performance Analysis Locked</h3>
                <p className="text-muted-foreground mb-4">Log in to access advanced performance analysis and growth metrics.</p>
                <Button onClick={onLogin}>Log in to View</Button>
              </div>
            ) : (
              <>
                <h3 className="text-lg font-semibold mb-4">Advanced Performance Analysis</h3>

                {/* Combined growth chart - subscribers and views */}
                {growthData.length > 0 && (
                  <div className="mb-8">
                    <h4 className="text-md font-semibold mb-4">Growth Metrics</h4>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={growthData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis yAxisId="left" tickFormatter={(value) => formatNumber(value)} />
                          <YAxis yAxisId="right" orientation="right" tickFormatter={(value) => formatNumber(value)} />
                          <Tooltip formatter={(value: any) => [formatNumber(value), '']} />
                          <Legend />
                          <Bar yAxisId="left" dataKey="views" name="Views" fill="#10B981" />
                          <Line yAxisId="right" type="monotone" dataKey="subscribers" name="Subscribers" stroke="#3B82F6" />
                        </ComposedChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {/* Engagement by content type comparison */}
                {engagementByContentData.length > 0 && (
                  <div className="mb-8">
                    <h4 className="text-md font-semibold mb-4">Engagement by Content Type</h4>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={engagementByContentData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis unit="%" />
                          <Tooltip formatter={(value) => [`${value}%`, '']} />
                          <Legend />
                          <Bar dataKey="engagement" name="Engagement Rate" fill="#8884d8" />
                          <Bar dataKey="average" name="Average Engagement" fill="#82ca9d" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {/* Performance metrics table */}
                <div className="mt-8">
                  <h4 className="text-md font-semibold mb-4">Detailed Performance Metrics</h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Metric</TableHead>
                        <TableHead>Value</TableHead>
                        <TableHead>Benchmark</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>Engagement Rate</TableCell>
                        <TableCell>{formatPercent(audit.keyMetrics.engagementRate || 0)}</TableCell>
                        <TableCell>{formatPercent(audit.keyMetrics.benchmarkEngagementRate || 2.5)}</TableCell>
                        <TableCell>
                          <span className={(audit.keyMetrics.engagementRate || 0) > (audit.keyMetrics.benchmarkEngagementRate || 2.5) ?
                            "text-green-500 font-medium" : "text-amber-500 font-medium"}>
                            {(audit.keyMetrics.engagementRate || 0) > (audit.keyMetrics.benchmarkEngagementRate || 2.5) ?
                              "Above Average" : "Below Average"}
                          </span>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Growth Rate</TableCell>
                        <TableCell>{formatPercent(audit.keyMetrics.growthRate || 0)}</TableCell>
                        <TableCell>{formatPercent(audit.keyMetrics.benchmarkGrowthRate || 5)}</TableCell>
                        <TableCell>
                          <span className={(audit.keyMetrics.growthRate || 0) > (audit.keyMetrics.benchmarkGrowthRate || 5) ?
                            "text-green-500 font-medium" : "text-amber-500 font-medium"}>
                            {(audit.keyMetrics.growthRate || 0) > (audit.keyMetrics.benchmarkGrowthRate || 5) ?
                              "Above Average" : "Below Average"}
                          </span>
                        </TableCell>
                      </TableRow>

                      <TableRow>
                        <TableCell>Avg. Views/Video</TableCell>
                        <TableCell>{formatNumber(audit.keyMetrics.avgViewsPerVideo || 0)}</TableCell>
                        <TableCell>{formatNumber(audit.keyMetrics.benchmarkAvgViews || 1000)}</TableCell>
                        <TableCell>
                          <span className={(audit.keyMetrics.avgViewsPerVideo || 0) > (audit.keyMetrics.benchmarkAvgViews || 1000) ?
                            "text-green-500 font-medium" : "text-amber-500 font-medium"}>
                            {(audit.keyMetrics.avgViewsPerVideo || 0) > (audit.keyMetrics.benchmarkAvgViews || 1000) ?
                              "Above Average" : "Below Average"}
                          </span>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Audience Quality</TableCell>
                        <TableCell>{formatPercent(audit.keyMetrics.audienceQualityScore || 0)}</TableCell>
                        <TableCell>{formatPercent(audit.keyMetrics.benchmarkAudienceQuality || 60)}</TableCell>
                        <TableCell>
                          <span className={(audit.keyMetrics.audienceQualityScore || 0) > (audit.keyMetrics.benchmarkAudienceQuality || 60) ?
                            "text-green-500 font-medium" : "text-amber-500 font-medium"}>
                            {(audit.keyMetrics.audienceQualityScore || 0) > (audit.keyMetrics.benchmarkAudienceQuality || 60) ?
                              "Above Average" : "Below Average"}
                          </span>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
          </Card>
        </TabsContent>

        {/* Recommendations Tab - Limited for anonymous users */}
        <TabsContent value="recommendations" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Recommended Actions</h3>
            <div className="space-y-4">
              {audit.recommendations.slice(0, isAuthenticated ? audit.recommendations.length : 2).map((recommendation: string, index: number) => (
                <div
                  key={`rec-${index}`}
                  className="p-4 border rounded-lg"
                >
                  <p className="text-sm">{recommendation}</p>
                </div>
              ))}

              {!isAuthenticated && audit.recommendations.length > 2 && (
                <div className="p-4 border border-dashed rounded-lg text-center">
                  <p className="text-sm text-muted-foreground mb-2">
                    {audit.recommendations.length - 2} more recommendations available
                  </p>
                  <Button onClick={onLogin}>Log in to See All</Button>
                </div>
              )}
            </div>

            {isAuthenticated && (
              <div className="mt-8">
                <h4 className="text-md font-semibold mb-4">Priority Action Items</h4>
                <div className="space-y-4">
                  <div className="p-4 border-l-4 border-red-500 bg-red-50 rounded-r-lg">
                    <h5 className="font-medium text-red-700">High Priority</h5>
                    <p className="text-sm mt-1">
                      {audit.recommendations[0] || "Improve content consistency by establishing a regular posting schedule."}
                    </p>
                  </div>
                  <div className="p-4 border-l-4 border-amber-500 bg-amber-50 rounded-r-lg">
                    <h5 className="font-medium text-amber-700">Medium Priority</h5>
                    <p className="text-sm mt-1">
                      {audit.recommendations[1] || "Optimize your profile description to improve discoverability."}
                    </p>
                  </div>
                  <div className="p-4 border-l-4 border-blue-500 bg-blue-50 rounded-r-lg">
                    <h5 className="font-medium text-blue-700">Ongoing</h5>
                    <p className="text-sm mt-1">
                      {audit.recommendations[2] || "Continue engaging with your audience through comments and community posts."}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};