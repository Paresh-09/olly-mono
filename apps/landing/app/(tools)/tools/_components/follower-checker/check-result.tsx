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
  CartesianGrid
} from 'recharts';
import { Button } from '@repo/ui/components/ui/button';
import {
  Download,
  Share2,
  Lock,
  LogIn,
  AlertTriangle,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { toast } from '@repo/ui/hooks/use-toast';
import { useRouter } from 'next/navigation';

interface FakeFollowerResultProps {
  result: {
    profile: {
      id: string;
      profileName?: string;
      profileUsername?: string;
      profileUrl: string;
    };
    audit: {
      overallScore: number;
      summary: string;
      keyMetrics: {
        totalFollowers: number;
        realFollowers: number;
        fakeFollowers: number;
        followBackRatio: number;
        fakeFollowerPercentage: number;
      };
      detailedAnalysis?: string[];
      insights?: string[];
      strengths?: string[];
      weaknesses?: string[];
      recommendations?: string[];
    };
    isAnonymous?: boolean;
  };
  platform: string;
  isAuthenticated: boolean;
  onLogin: () => void;
  onClaimReport?: () => void;
}

export const FakeFollowerResult = ({
  result,
  platform,
  isAuthenticated,
  onLogin,
  onClaimReport
}: FakeFollowerResultProps) => {
  const [activeTab, setActiveTab] = useState('overview');
  const router = useRouter();

  // Destructure result
  const { profile, audit, isAnonymous } = result;

  // Utility functions
  const formatPercent = (value: number) => {
    if (value === undefined || value === null || isNaN(value)) return '0.0%';
    return `${value.toFixed(1)}%`;
  };

  const formatNumber = (num: number) => {
    if (num === undefined || num === null || isNaN(num)) return '0';

    if (num >= 1000000000) return (num / 1000000000).toFixed(1) + 'B';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  // Calculate percentages safely to avoid division by zero
  const calculatePercentage = (part: number, total: number) => {
    if (!total || total === 0) return 0;
    return (part / total) * 100;
  };

  // Follower composition data
  const followerCompositionData = [
    {
      name: 'Real Followers',
      value: audit.keyMetrics.realFollowers || 0,
      color: '#10B981' // Green
    },
    {
      name: 'Potential Fake Followers',
      value: audit.keyMetrics.fakeFollowers || 0,
      color: '#EF4444' // Red
    }
  ];

  // Follow-back ratio classification
  const getFollowBackRatioClassification = (ratio: number) => {
    if (ratio === undefined || ratio === null || isNaN(ratio) || ratio < 2) return {
      status: 'Suspicious Low',
      message: 'Potential Bot Activity - Very Low Follow-Back Rate',
      icon: <XCircle className="text-red-600" />,
      color: 'text-red-600'
    };

    if (ratio >= 2 && ratio <= 10) return {
      status: 'Healthy',
      message: 'Authentic Follower Base - Balanced Follow-Back Rate',
      icon: <CheckCircle2 className="text-green-600" />,
      color: 'text-green-600'
    };

    return {
      status: 'Suspicious High',
      message: 'Potential Bot Activity - Unusually High Follow-Back Rate',
      icon: <AlertTriangle className="text-amber-600" />,
      color: 'text-amber-600'
    };
  };

  // Get color based on score - handling 0 scores properly
  const getScoreColor = (score: number) => {
    if (score === undefined || score === null || isNaN(score)) score = 0;

    if (score > 70) return 'text-green-600';
    if (score > 40) return 'text-amber-600';
    return 'text-red-600';
  };

  // Get risk level based on score - handling 0 scores properly
  const getRiskLevel = (score: number) => {
    if (score === undefined || score === null || isNaN(score)) score = 0;

    if (score > 70) return 'Low';
    if (score > 40) return 'Medium';
    return 'High';
  };

  // Report handling functions
  const handleDownloadReport = () => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please log in to download the full report.",
      });
      onLogin();
      return;
    }

    try {
      alert("Feature coming soon");


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

    const shareableUrl = window.location.href;

    if (navigator.share) {
      navigator.share({
        title: `${platform.charAt(0).toUpperCase() + platform.slice(1)} Follower Authenticity Report`,
        text: `Check out this follower authenticity analysis with a score of ${audit.overallScore || 0}/100!`,
        url: shareableUrl,
      })
        .then(() => {
          toast({
            title: "Report Shared",
            description: "Your follower authenticity report has been shared successfully.",
          });
        })
        .catch((error) => {
          console.error('Error sharing:', error);
          copyToClipboard();
        });
    } else {
      copyToClipboard();
    }
  };

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

  const handleClaimReport = () => {
    if (isAuthenticated && isAnonymous && onClaimReport) {
      onClaimReport();
    } else if (!isAuthenticated) {
      onLogin();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold">
            {profile.profileName || profile.profileUsername || 'Unnamed Profile'}
          </h2>
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

      {/* Anonymous/Login Banners */}
      {isAuthenticated && isAnonymous && onClaimReport && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex justify-between items-center">
          <div>
            <h3 className="font-medium">Anonymous Report</h3>
            <p className="text-sm text-muted-foreground">
              This report was created anonymously. Claim it to add it to your account.
            </p>
          </div>
          <Button onClick={handleClaimReport}>
            Claim Report
          </Button>
        </div>
      )}

      {!isAuthenticated && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex justify-between items-center">
          <div>
            <h3 className="font-medium">Preview Mode</h3>
            <p className="text-sm text-muted-foreground">
              You're viewing a limited preview. Log in to see full details and save this report.
            </p>
          </div>
          <Button onClick={onLogin}>
            <LogIn className="mr-2 h-4 w-4" />
            Log in
          </Button>
        </div>
      )}

      {/* Overall Scores Card */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <h3 className="text-sm font-medium text-muted-foreground">Authenticity Score</h3>
            <div className={`text-3xl font-bold ${getScoreColor(audit.overallScore)}`}>
              {audit.overallScore !== undefined && audit.overallScore !== null ? audit.overallScore : 0}/100
            </div>
          </div>
          <div className="text-center">
            <h3 className="text-sm font-medium text-muted-foreground">Total Followers</h3>
            <div className="text-3xl font-bold">
              {formatNumber(audit.keyMetrics.totalFollowers)}
            </div>
          </div>
          <div className="text-center">
            <h3 className="text-sm font-medium text-muted-foreground">Real Followers</h3>
            <div className="text-3xl font-bold text-green-600">
              {formatNumber(audit.keyMetrics.realFollowers)}
            </div>
          </div>
          <div className="text-center">
            <h3 className="text-sm font-medium text-muted-foreground">Potential Fake Followers</h3>
            <div className="text-3xl font-bold text-red-600">
              {formatNumber(audit.keyMetrics.fakeFollowers)}
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="composition">Composition</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Summary</h3>
            <p className="text-muted-foreground">{audit.summary || "No summary available."}</p>

            {/* Follow-Back Ratio */}
            <div className="mt-6">
              <h4 className="text-md font-semibold mb-4">Follow-Back Ratio</h4>
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                {(() => {
                  const ratioClassification = getFollowBackRatioClassification(
                    audit.keyMetrics.followBackRatio || 0
                  );
                  return (
                    <>
                      {ratioClassification.icon}
                      <div>
                        <p className={`font-bold ${ratioClassification.color}`}>
                          {formatPercent(audit.keyMetrics.followBackRatio || 0)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {ratioClassification.message}
                        </p>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>

            {/* Follower Composition Pie Chart */}
            <div className="mt-6 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={followerCompositionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${formatNumber(value)}`}
                  >
                    {followerCompositionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number, name) => [formatNumber(value), name]}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </TabsContent>

        {/* Composition Tab */}
        <TabsContent value="composition" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Follower Composition Breakdown</h3>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-md font-semibold mb-3">Composition Percentages</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-green-600">Real Followers</span>
                    <span className="font-bold">
                      {formatPercent(
                        calculatePercentage(
                          audit.keyMetrics.realFollowers || 0,
                          audit.keyMetrics.totalFollowers || 0
                        )
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-red-600">Potential Fake Followers</span>
                    <span className="font-bold">
                      {formatPercent(
                        calculatePercentage(
                          audit.keyMetrics.fakeFollowers || 0,
                          audit.keyMetrics.totalFollowers || 0
                        )
                      )}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-md font-semibold mb-3">Composition Visualization</h4>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      {
                        name: 'Real Followers',
                        value: audit.keyMetrics.realFollowers || 0,
                        percentage: formatPercent(calculatePercentage(
                          audit.keyMetrics.realFollowers || 0,
                          audit.keyMetrics.totalFollowers || 0
                        ))
                      },
                      {
                        name: 'Potential Fake Followers',
                        value: audit.keyMetrics.fakeFollowers || 0,
                        percentage: formatPercent(calculatePercentage(
                          audit.keyMetrics.fakeFollowers || 0,
                          audit.keyMetrics.totalFollowers || 0
                        ))
                      }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip
                        formatter={(value: number, name, props) => [
                          `${formatNumber(value)} (${props.payload.percentage})`,
                          name
                        ]}
                      />
                      <Bar dataKey="value" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Analysis Tab */}
        <TabsContent value="analysis" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Detailed Follower Analysis</h3>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Detailed Analysis Points */}
              <div>
                <h4 className="text-md font-semibold mb-3">Authenticity Indicators</h4>
                {audit.detailedAnalysis && audit.detailedAnalysis.length > 0 ? (
                  <ul className="space-y-3 list-disc pl-5">
                    {audit.detailedAnalysis.map((point, index) => (
                      <li key={index} className="text-sm text-muted-foreground">
                        {point}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">No detailed analysis available.</p>
                )}
              </div>

              {/* Insights */}
              <div>
                <h4 className="text-md font-semibold mb-3">Key Insights</h4>
                {audit.insights && audit.insights.length > 0 ? (
                  <ul className="space-y-3 list-disc pl-5">
                    {audit.insights.map((point, index) => (
                      <li key={index} className="text-sm text-muted-foreground">
                        {point}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">No insights available.</p>
                )}
              </div>
            </div>

            {/* Follow-Back Ratio Deep Dive */}
            <div className="mt-6">
              <h4 className="text-md font-semibold mb-4">Follow-Back Ratio Analysis</h4>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h5 className="font-medium mb-2">Current Follow-Back Ratio</h5>
                  <div className="flex items-center gap-3">
                    {(() => {
                      const ratioClassification = getFollowBackRatioClassification(
                        audit.keyMetrics.followBackRatio || 0
                      );
                      return (
                        <>
                          {ratioClassification.icon}
                          <div>
                            <p className={`font-bold ${ratioClassification.color}`}>
                              {formatPercent(audit.keyMetrics.followBackRatio || 0)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {ratioClassification.message}
                            </p>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h5 className="font-medium mb-2">Interpretation</h5>
                  <p className="text-sm text-muted-foreground">
                    A follow-back ratio between 2-10% indicates an authentic and engaged follower base.
                    Ratios outside this range may suggest the presence of bot accounts or purchased followers.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Follower Performance Metrics</h3>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-md font-semibold mb-3">Authenticity Metrics</h4>
                <div className="space-y-3">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Fake Follower Percentage</span>
                      <span className={`font-bold ${(audit.keyMetrics.fakeFollowerPercentage || 0) > 20 ? 'text-red-600' :
                        (audit.keyMetrics.fakeFollowerPercentage || 0) > 10 ? 'text-amber-600' :
                          'text-green-600'
                        }`}>
                        {formatPercent(audit.keyMetrics.fakeFollowerPercentage || 0)}
                      </span>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Follow-Back Ratio</span>
                      <span className={`font-bold ${(audit.keyMetrics.followBackRatio || 0) >= 2 && (audit.keyMetrics.followBackRatio || 0) <= 10
                        ? 'text-green-600'
                        : 'text-red-600'
                        }`}>
                        {formatPercent(audit.keyMetrics.followBackRatio || 0)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-md font-semibold mb-3">Performance Classification</h4>
                <div className="space-y-3">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Authenticity Score</span>
                      <span className={`font-bold ${getScoreColor(audit.overallScore)}`}>
                        {audit.overallScore !== undefined && audit.overallScore !== null ? audit.overallScore : 0}/100
                      </span>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Risk Level</span>
                      <span className={`font-bold ${getScoreColor(audit.overallScore)}`}>
                        {getRiskLevel(audit.overallScore)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Recommended Actions</h3>

            <div className="space-y-4">
              {audit.recommendations && audit.recommendations.length > 0 ? (
                audit.recommendations.map((recommendation, index) => (
                  <div
                    key={`rec-${index}`}
                    className="p-4 border rounded-lg flex items-start gap-3"
                  >
                    <AlertTriangle className="text-amber-600 flex-shrink-0 mt-1" />
                    <p className="text-sm">{recommendation}</p>
                  </div>
                ))
              ) : (
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">No recommendations available.</p>
                </div>
              )}
            </div>

            {/* Priority Recommendations */}
            <div className="mt-8">
              <h4 className="text-md font-semibold mb-4">Priority Action Items</h4>
              <div className="space-y-4">
                <div className="p-4 border-l-4 border-red-500 bg-red-50 rounded-r-lg">
                  <h5 className="font-medium text-red-700">High Priority</h5>
                  <p className="text-sm mt-1">
                    {audit.recommendations?.[0] || "Investigate and remove suspicious bot followers"}
                  </p>
                </div>
                <div className="p-4 border-l-4 border-amber-500 bg-amber-50 rounded-r-lg">
                  <h5 className="font-medium text-amber-700">Medium Priority</h5>
                  <p className="text-sm mt-1">
                    {audit.recommendations?.[1] || "Improve follower engagement strategies"}
                  </p>
                </div>
                <div className="p-4 border-l-4 border-blue-500 bg-blue-50 rounded-r-lg">
                  <h5 className="font-medium text-blue-700">Ongoing</h5>
                  <p className="text-sm mt-1">
                    {audit.recommendations?.[2] || "Regularly monitor follower authenticity"}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FakeFollowerResult;