"use client";

import { useState, useEffect } from "react";
import { Card } from "@repo/ui/components/ui/card";
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import { Progress } from "@repo/ui/components/ui/progress";
import { useToast } from "@repo/ui/hooks/use-toast";import {
  Loader2,
  TrendingUp,
  Users,
  Heart,
  MessageCircle,
  Share2,
  Eye,
  Clock,
} from "lucide-react";
import { Alert, AlertDescription } from "@repo/ui/components/ui/alert";
import AuthPopup from "../authentication";

interface EngagementCalculatorProps {
  toolType: string;
  placeholder: string;
  platforms?: string[];
  platform?: string;
}

interface EngagementResult {
  engagementRate: number;
  totalEngagement: number;
  grade: string;
  insights: string[];
  benchmark: string;
  creditsRemaining: number;
}

interface AuthCheckResponse {
  authenticated: boolean;
  user: {
    id: string;
    email: string;
    username: string;
  } | null;
}

interface UsageTracking {
  count: number;
  date: string;
}

const DAILY_FREE_LIMIT = 5;

export const EngagementCalculatorTool: React.FC<EngagementCalculatorProps> = ({
  toolType,
  placeholder,
  platforms,
  platform = "instagram",
}) => {
  const [avgLikes, setAvgLikes] = useState("");
  const [avgComments, setAvgComments] = useState("");
  const [avgShares, setAvgShares] = useState("");
  const [avgSaves, setAvgSaves] = useState("");
  const [followerCount, setFollowerCount] = useState("");
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [result, setResult] = useState<EngagementResult | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuthPopup, setShowAuthPopup] = useState(false);
  const [dailyUsage, setDailyUsage] = useState<UsageTracking>({
    count: 0,
    date: "",
  });
  const { toast } = useToast();

  // Platform-specific configurations
  const platformConfig = {
    instagram: {
      name: "Instagram",
      followerLabel: "Follower Count",
      fields: {
        likes: {
          label: "Average Likes",
          icon: Heart,
          color: "text-red-500",
          placeholder: "e.g., 150",
        },
        comments: {
          label: "Average Comments",
          icon: MessageCircle,
          color: "text-blue-500",
          placeholder: "e.g., 25",
        },
        shares: {
          label: "Average Shares",
          icon: Share2,
          color: "text-green-500",
          placeholder: "e.g., 10",
        },
        saves: {
          label: "Average Saves",
          icon: TrendingUp,
          color: "text-purple-500",
          placeholder: "e.g., 5",
        },
      },
      benchmarks: {
        small: { excellent: 7, good: 4, average: 2 },
        medium: { excellent: 5, good: 3, average: 1.5 },
        large: { excellent: 3, good: 2, average: 1 },
      },
    },
    facebook: {
      name: "Facebook",
      followerLabel: "Page Followers",
      fields: {
        likes: {
          label: "Average Likes/Reactions",
          icon: Heart,
          color: "text-red-500",
          placeholder: "e.g., 20",
        },
        comments: {
          label: "Average Comments",
          icon: MessageCircle,
          color: "text-blue-500",
          placeholder: "e.g., 5",
        },
        shares: {
          label: "Average Shares",
          icon: Share2,
          color: "text-green-500",
          placeholder: "e.g., 3",
        },
        saves: {
          label: "Average Clicks",
          icon: TrendingUp,
          color: "text-purple-500",
          placeholder: "e.g., 8",
        },
      },
      benchmarks: {
        small: { excellent: 5, good: 3, average: 1.5 },
        medium: { excellent: 3, good: 2, average: 1 },
        large: { excellent: 2, good: 1.5, average: 0.5 },
      },
    },
    tiktok: {
      name: "TikTok",
      followerLabel: "Follower Count",
      fields: {
        likes: {
          label: "Average Likes",
          icon: Heart,
          color: "text-red-500",
          placeholder: "e.g., 500",
        },
        comments: {
          label: "Average Comments",
          icon: MessageCircle,
          color: "text-blue-500",
          placeholder: "e.g., 50",
        },
        shares: {
          label: "Average Shares",
          icon: Share2,
          color: "text-green-500",
          placeholder: "e.g., 25",
        },
        saves: {
          label: "Average Favorites",
          icon: TrendingUp,
          color: "text-purple-500",
          placeholder: "e.g., 15",
        },
      },
      benchmarks: {
        small: { excellent: 15, good: 10, average: 5 },
        medium: { excellent: 10, good: 7, average: 3 },
        large: { excellent: 7, good: 5, average: 2 },
      },
    },
    youtube: {
      name: "YouTube",
      followerLabel: "Subscriber Count",
      fields: {
        likes: {
          label: "Average Likes",
          icon: Heart,
          color: "text-red-500",
          placeholder: "e.g., 100",
        },
        comments: {
          label: "Average Comments",
          icon: MessageCircle,
          color: "text-blue-500",
          placeholder: "e.g., 15",
        },
        shares: {
          label: "Average Shares",
          icon: Share2,
          color: "text-green-500",
          placeholder: "e.g., 5",
        },
        saves: {
          label: "Average Views (in 1000s)",
          icon: Eye,
          color: "text-purple-500",
          placeholder: "e.g., 10 (for 10K views)",
        },
      },
      benchmarks: {
        small: { excellent: 8, good: 5, average: 2 },
        medium: { excellent: 6, good: 4, average: 1.5 },
        large: { excellent: 4, good: 3, average: 1 },
      },
    },
    linkedin: {
      name: "LinkedIn",
      followerLabel: "Connections/Followers",
      fields: {
        likes: {
          label: "Average Likes",
          icon: Heart,
          color: "text-red-500",
          placeholder: "e.g., 30",
        },
        comments: {
          label: "Average Comments",
          icon: MessageCircle,
          color: "text-blue-500",
          placeholder: "e.g., 8",
        },
        shares: {
          label: "Average Shares",
          icon: Share2,
          color: "text-green-500",
          placeholder: "e.g., 4",
        },
        saves: {
          label: "Average Clicks",
          icon: TrendingUp,
          color: "text-purple-500",
          placeholder: "e.g., 12",
        },
      },
      benchmarks: {
        small: { excellent: 4, good: 2.5, average: 1.5 },
        medium: { excellent: 3, good: 2, average: 1 },
        large: { excellent: 2, good: 1.5, average: 0.8 },
      },
    },
  };

  const currentPlatform =
    platformConfig[platform as keyof typeof platformConfig] ||
    platformConfig.instagram;

  useEffect(() => {
    checkAuthStatus();
    loadDailyUsage();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch("/api/user/auth");
      const data: AuthCheckResponse = await response.json();
      setIsAuthenticated(data.authenticated);
    } catch (error) {
      console.error("Error checking auth status:", error);
    }
  };

  const loadDailyUsage = () => {
    const today = new Date().toDateString();
    const savedUsage = localStorage.getItem(
      `engagementCalculator_${toolType}_dailyUsage`,
    );

    if (savedUsage) {
      const usage: UsageTracking = JSON.parse(savedUsage);
      if (usage.date === today) {
        setDailyUsage(usage);
      } else {
        const newUsage = { count: 0, date: today };
        setDailyUsage(newUsage);
        localStorage.setItem(
          `engagementCalculator_${toolType}_dailyUsage`,
          JSON.stringify(newUsage),
        );
      }
    } else {
      const newUsage = { count: 0, date: today };
      setDailyUsage(newUsage);
      localStorage.setItem(
        `engagementCalculator_${toolType}_dailyUsage`,
        JSON.stringify(newUsage),
      );
    }
  };

  const incrementDailyUsage = () => {
    const today = new Date().toDateString();
    const newUsage = {
      count: dailyUsage.count + 1,
      date: today,
    };
    setDailyUsage(newUsage);
    localStorage.setItem(
      `engagementCalculator_${toolType}_dailyUsage`,
      JSON.stringify(newUsage),
    );
  };

  const checkUsageLimit = (): boolean => {
    if (isAuthenticated) {
      return true;
    }

    if (dailyUsage.count >= DAILY_FREE_LIMIT) {
      setShowAuthPopup(true);
      toast({
        title: "Daily Limit Reached",
        description: `You've reached your daily limit of ${DAILY_FREE_LIMIT} free calculations. Please sign in for unlimited access.`,
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const calculateEngagement = async () => {
    if (!avgLikes.trim() || !avgComments.trim() || !followerCount.trim()) {
      toast({
        title: "Error",
        description:
          "Please fill in at least likes, comments, and follower count",
        variant: "destructive",
      });
      return;
    }

    if (!checkUsageLimit()) {
      return;
    }

    setCalculating(true);

    // Add realistic loading delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    try {
      const likes = parseInt(avgLikes) || 0;
      const comments = parseInt(avgComments) || 0;
      const shares = parseInt(avgShares) || 0;
      let saves = parseInt(avgSaves) || 0;
      const followers = parseInt(followerCount) || 0;

      if (followers === 0) {
        throw new Error("Follower count must be greater than 0");
      }

      // Platform-specific calculations
      let totalEngagement = likes + comments + shares;

      if (platform === "youtube" && saves > 0) {
        // For YouTube, 'saves' represents views in thousands
        // Calculate engagement based on views instead of subscribers for more accuracy
        const views = saves * 1000;
        totalEngagement = likes + comments + shares;
        // Use views as denominator for YouTube engagement rate
        const engagementRate = Math.min((totalEngagement / views) * 100, 99.99);

        const mockResult: EngagementResult = {
          engagementRate: parseFloat(engagementRate.toFixed(2)),
          totalEngagement,
          grade: getGradeForPlatform(engagementRate, followers, platform),
          insights: getInsightsForPlatform(
            engagementRate,
            comments,
            likes,
            platform,
          ),
          benchmark: getBenchmarkForPlatform(
            engagementRate,
            followers,
            platform,
          ),
          creditsRemaining: isAuthenticated
            ? 999
            : DAILY_FREE_LIMIT - dailyUsage.count - 1,
        };

        setResult(mockResult);
      } else {
        // For other platforms, include saves/favorites/clicks in total engagement
        totalEngagement += saves;

        // Calculate engagement rate (ensure it stays under 100%)
        const engagementRate = Math.min(
          (totalEngagement / followers) * 100,
          99.99,
        );

        const mockResult: EngagementResult = {
          engagementRate: parseFloat(engagementRate.toFixed(2)),
          totalEngagement,
          grade: getGradeForPlatform(engagementRate, followers, platform),
          insights: getInsightsForPlatform(
            engagementRate,
            comments,
            likes,
            platform,
          ),
          benchmark: getBenchmarkForPlatform(
            engagementRate,
            followers,
            platform,
          ),
          creditsRemaining: isAuthenticated
            ? 999
            : DAILY_FREE_LIMIT - dailyUsage.count - 1,
        };

        setResult(mockResult);
      }

      if (!isAuthenticated) {
        incrementDailyUsage();
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          "Failed to calculate engagement. Please check your inputs and try again.",
        variant: "destructive",
      });
    } finally {
      setCalculating(false);
    }
  };

  const getGradeForPlatform = (
    engagementRate: number,
    followers: number,
    platform: string,
  ): string => {
    const benchmarks = currentPlatform.benchmarks;
    let tier;

    if (followers < 10000) tier = benchmarks.small;
    else if (followers < 100000) tier = benchmarks.medium;
    else tier = benchmarks.large;

    if (engagementRate >= tier.excellent) return "Excellent";
    if (engagementRate >= tier.good) return "Good";
    if (engagementRate >= tier.average) return "Average";
    return "Needs Improvement";
  };

  const getBenchmarkForPlatform = (
    engagementRate: number,
    followers: number,
    platform: string,
  ): string => {
    const grade = getGradeForPlatform(engagementRate, followers, platform);
    const followerTier =
      followers < 10000
        ? "under 10K"
        : followers < 100000
          ? "10K-100K"
          : "100K+";

    return `${grade} for ${currentPlatform.name} accounts with ${followerTier} followers`;
  };

  const getInsightsForPlatform = (
    engagementRate: number,
    comments: number,
    likes: number,
    platform: string,
  ): string[] => {
    const insights = [];
    const benchmarks = currentPlatform.benchmarks;
    const avgBenchmark = benchmarks.medium.average;

    if (engagementRate < avgBenchmark) {
      switch (platform) {
        case "tiktok":
          insights.push(
            "Try using trending sounds and hashtags to increase discoverability",
          );
          insights.push(
            "Post consistently and engage with comments quickly for better algorithm performance",
          );
          insights.push(
            "Create content that encourages rewatches and completion",
          );
          break;
        case "youtube":
          insights.push(
            "Improve your thumbnails and titles to increase click-through rates",
          );
          insights.push(
            "Ask viewers to like, comment, and subscribe during your videos",
          );
          insights.push(
            "Focus on improving average view duration and watch time",
          );
          break;
        case "linkedin":
          insights.push(
            "Share professional insights and industry news to boost engagement",
          );
          insights.push(
            "Post during business hours when your professional network is most active",
          );
          insights.push(
            "Use LinkedIn polls and ask thought-provoking questions",
          );
          break;
        case "facebook":
          insights.push(
            "Focus on creating shareable content that sparks conversations",
          );
          insights.push("Use Facebook Groups and engage with your community");
          insights.push(
            "Post videos and live content for better organic reach",
          );
          break;
        default: // Instagram
          insights.push(
            "Use Instagram Stories, Reels, and carousels for better engagement",
          );
          insights.push(
            "Post at optimal times when your audience is most active",
          );
          insights.push("Create content that encourages saves and shares");
      }
    } else if (engagementRate < benchmarks.medium.good) {
      insights.push(
        `Your ${currentPlatform.name} engagement is decent but has room for improvement`,
      );
      insights.push(
        "Focus on creating more interactive content and engaging with your audience",
      );
    } else {
      insights.push(
        `Great ${currentPlatform.name} engagement rate! Keep up the excellent work`,
      );
      insights.push(
        "Continue building relationships with your audience through consistent, quality content",
      );
    }

    // Platform-specific additional insights
    if (comments > 0 && likes > 0) {
      const commentRatio = comments / likes;
      if (commentRatio < 0.05 && platform !== "youtube") {
        insights.push(
          "Consider asking more questions in your captions to boost comments",
        );
      }
    }

    return insights;
  };

  const resetForm = () => {
    setAvgLikes("");
    setAvgComments("");
    setAvgShares("");
    setAvgSaves("");
    setFollowerCount("");
    setResult(null);
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {!isAuthenticated && (
          <Alert>
            <AlertDescription>
              {dailyUsage.count >= DAILY_FREE_LIMIT
                ? "You've reached your daily limit. Sign in for unlimited access."
                : `You have ${DAILY_FREE_LIMIT - dailyUsage.count} free calculations remaining today. Sign in for unlimited access.`}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="avgLikes" className="flex items-center gap-2">
              <currentPlatform.fields.likes.icon
                className={`h-4 w-4 ${currentPlatform.fields.likes.color}`}
              />
              {currentPlatform.fields.likes.label} *
            </Label>
            <Input
              id="avgLikes"
              type="number"
              placeholder={currentPlatform.fields.likes.placeholder}
              value={avgLikes}
              onChange={(e) => setAvgLikes(e.target.value)}
              min="0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="avgComments" className="flex items-center gap-2">
              <currentPlatform.fields.comments.icon
                className={`h-4 w-4 ${currentPlatform.fields.comments.color}`}
              />
              {currentPlatform.fields.comments.label} *
            </Label>
            <Input
              id="avgComments"
              type="number"
              placeholder={currentPlatform.fields.comments.placeholder}
              value={avgComments}
              onChange={(e) => setAvgComments(e.target.value)}
              min="0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="avgShares" className="flex items-center gap-2">
              <currentPlatform.fields.shares.icon
                className={`h-4 w-4 ${currentPlatform.fields.shares.color}`}
              />
              {currentPlatform.fields.shares.label} (Optional)
            </Label>
            <Input
              id="avgShares"
              type="number"
              placeholder={currentPlatform.fields.shares.placeholder}
              value={avgShares}
              onChange={(e) => setAvgShares(e.target.value)}
              min="0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="avgSaves" className="flex items-center gap-2">
              <currentPlatform.fields.saves.icon
                className={`h-4 w-4 ${currentPlatform.fields.saves.color}`}
              />
              {currentPlatform.fields.saves.label} (Optional)
            </Label>
            <Input
              id="avgSaves"
              type="number"
              placeholder={currentPlatform.fields.saves.placeholder}
              value={avgSaves}
              onChange={(e) => setAvgSaves(e.target.value)}
              min="0"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="followerCount" className="flex items-center gap-2">
            <Users className="h-4 w-4 text-orange-500" />
            {currentPlatform.followerLabel} *
          </Label>
          <Input
            id="followerCount"
            type="number"
            placeholder={platform === "youtube" ? "e.g., 5000" : "e.g., 5000"}
            value={followerCount}
            onChange={(e) => setFollowerCount(e.target.value)}
            min="1"
          />
        </div>

        <div className="flex gap-2">
          <Button
            onClick={calculateEngagement}
            className="flex-1"
            disabled={
              calculating ||
              (!isAuthenticated && dailyUsage.count >= DAILY_FREE_LIMIT)
            }
          >
            {calculating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Calculating...
              </>
            ) : (
              `Calculate ${currentPlatform.name} Engagement Rate`
            )}
          </Button>

          <Button onClick={resetForm} variant="outline" disabled={calculating}>
            Reset
          </Button>
        </div>

        {calculating && (
          <div className="flex items-center justify-center py-8">
            <div className="text-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              <p className="text-sm text-gray-600">
                Analyzing your {currentPlatform.name} engagement...
              </p>
            </div>
          </div>
        )}

        {result && !calculating && (
          <div className="mt-6 space-y-6">
            <div className="text-center space-y-2">
              <div className="text-4xl font-bold text-primary">
                {result.engagementRate}%
              </div>
              <div className="text-xl font-semibold text-gray-700">
                {result.grade}
              </div>
              <div className="text-sm text-gray-500">{result.benchmark}</div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Engagement Rate</span>
                <span>{result.engagementRate}%</span>
              </div>
              <Progress value={Math.min(result.engagementRate * 5, 100)} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">
                  Total Engagement
                </h4>
                <p className="text-2xl font-bold text-blue-700">
                  {result.totalEngagement.toLocaleString()}
                </p>
              </div>

              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">
                  Engagement Rate
                </h4>
                <p className="text-2xl font-bold text-green-700">
                  {result.engagementRate}%
                </p>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium mb-3">
                💡 {currentPlatform.name} Insights & Recommendations:
              </h3>
              <ul className="space-y-2">
                {result.insights.map((insight, index) => (
                  <li
                    key={index}
                    className="text-gray-600 flex items-start gap-2"
                  >
                    <span className="text-primary mt-1">•</span>
                    <span>{insight}</span>
                  </li>
                ))}
              </ul>
            </div>

            {!isAuthenticated && (
              <p className="text-sm text-gray-500 text-center">
                Calculations remaining today: {result.creditsRemaining}
              </p>
            )}
          </div>
        )}
      </div>

      <AuthPopup
        isOpen={showAuthPopup}
        onClose={() => setShowAuthPopup(false)}
        onSuccess={() => {
          setIsAuthenticated(true);
          setShowAuthPopup(false);
        }}
      />
    </Card>
  );
};
