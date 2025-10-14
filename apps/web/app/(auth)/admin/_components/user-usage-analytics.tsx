"use client";
import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";
import { Input } from "@repo/ui/components/ui/input";
import { Button } from "@repo/ui/components/ui/button";
import { Badge } from "@repo/ui/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/components/ui/tabs";
import {
  Search,
  User,
  MessageCircle,
  Zap,
  Calendar,
  TrendingUp,
  Activity,
  Smartphone,
  BarChart3,
} from "lucide-react";
import { Gift, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui/components/ui/dialog";
import { Label } from "@repo/ui/components/ui/label";
import { Textarea } from "@repo/ui/components/ui/textarea";

// Type definitions
interface UserData {
  user: {
    id: string;
    email: string;
    name?: string;
    createdAt: string;
    isPremium: boolean;
    isActive: boolean;
    lastActivity: string;
    isAdmin?: boolean;
    isSuperAdmin?: boolean;
    isBetaTester?: boolean;
    signInMethod?: string;
    onboardingComplete?: boolean;
    milestones?: number;
    currentStreak?: number;
    maxStreak?: number;
  };
  usageStats: {
    totalComments: number;
    autoComments: number;
    manualComments: number;
    totalLikes: number;
    totalShares: number;
  };
  platformUsage: {
    [key: string]: {
      comments: number;
      likes: number;
      shares: number;
      autoComments?: number;
      manualComments?: number;
    };
  };
  autoCommentingConfigs: Array<{
    id: string;
    platform: string;
    isEnabled: boolean;
    timeInterval: number;
    postsPerDay: number;
    hashtags: string[];
    lastRun?: any;
    totalComments: number;
    successfulComments: number;
    useBrandVoice?: boolean;
    enabledPlatforms?: string[];
  }>;
  recentActivity: Array<{
    date: string;
    comments: number;
    autoComments: number;
    likes: number;
    shares: number;
    platform?: string;
    platforms?: string[];
  }>;
  subscriptions: Array<{
    id: string;
    status: string;
    planName?: string;
    planTier?: string;
    vendor: string;
    startDate: string;
    nextBillingDate?: string;
    endDate?: string;
    customerId?: string;
  }>;
  licenseKeys: Array<{
    id: string;
    key: string;
    isActive: boolean;
    activatedAt?: string;
    tier?: number;
    vendor?: string;
  }>;
  credits: {
    balance: number;
    totalSpent: number;
  };
  engagementMetrics?: {
    successRate: number;
    totalAttempts: number;
    successfulComments: number;
    failedComments: number;
  };
  timeBasedAnalytics?: {
    totalDaysActive: number;
    avgActivityPerActiveDay: number;
  };
  deviceInfo?: {
    deviceTypes: { [key: string]: number };
    browsers: { [key: string]: number };
    totalActivations: number;
    uniqueIPs: number;
  };
}

const UserUsageAnalytics = () => {
  const [searchEmail, setSearchEmail] = useState<string>("");
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const [giftCreditsOpen, setGiftCreditsOpen] = useState<boolean>(false);
  const [giftAmount, setGiftAmount] = useState<string>("");
  const [giftReason, setGiftReason] = useState<string>("");
  const [giftLoading, setGiftLoading] = useState<boolean>(false);
  const [giftSuccess, setGiftSuccess] = useState<string>("");

  const handleGiftCredits = async () => {
    if (!userData || !giftAmount || parseInt(giftAmount) <= 0) {
      setError("Please enter a valid credit amount");
      return;
    }

    setGiftLoading(true);
    setError("");
    setGiftSuccess("");

    try {
      const response = await fetch("/api/admin/gift-credits", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: userData.user.email,
          credits: parseInt(giftAmount),
          reason: giftReason.trim() || undefined,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to gift credits");
      }

      // Update the userData with new balance
      setUserData((prev) =>
        prev
          ? {
              ...prev,
              credits: {
                ...prev.credits,
                balance: result.newBalance,
              },
            }
          : null,
      );

      setGiftSuccess(
        `Successfully gifted ${giftAmount} credits! New balance: ${result.newBalance}`,
      );
      setGiftAmount("");
      setGiftReason("");

      // Close dialog after 2 seconds
      setTimeout(() => {
        setGiftCreditsOpen(false);
        setGiftSuccess("");
      }, 2000);
    } catch (error: any) {
      console.error("Error gifting credits:", error);
      setError(error.message || "Failed to gift credits");
    } finally {
      setGiftLoading(false);
    }
  };

  const resetGiftForm = () => {
    setGiftAmount("");
    setGiftReason("");
    setError("");
    setGiftSuccess("");
  };

  const handleSearch = async () => {
    if (!searchEmail.trim()) return;

    setLoading(true);
    setError("");
    try {
      const response = await fetch(
        `/api/admin/user-usage?email=${encodeURIComponent(searchEmail)}&days=30&includeHistory=true`,
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch user data");
      }

      const data = await response.json();
      setUserData(data);
    } catch (error: any) {
      console.error("Error fetching user data:", error);
      setError(error.message || "An error occurred");
      setUserData(null);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const calculateEngagementRate = (comments: number, total: number): string => {
    return total > 0 ? ((comments / total) * 100).toFixed(1) : "0";
  };

  const getLastRunInfo = (lastRun: any): string => {
    if (!lastRun) return "Never";
    if (lastRun.lastAttempt) {
      return formatDate(lastRun.lastAttempt);
    }
    return formatDate(lastRun);
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-4 items-end">
        <div className="flex-1">
          <label
            htmlFor="email-search"
            className="block text-sm font-medium mb-2"
          >
            Search User by Email
          </label>
          <Input
            id="email-search"
            type="email"
            placeholder="Enter user email address..."
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
          />
        </div>
        <Button
          onClick={handleSearch}
          disabled={loading || !searchEmail.trim()}
        >
          <Search className="w-4 h-4 mr-2" />
          {loading ? "Searching..." : "Search"}
        </Button>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-red-600 text-sm">{error}</p>
          </CardContent>
        </Card>
      )}

      {userData && (
        <div className="space-y-6">
          {/* User Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                User Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Name
                  </label>
                  <p className="text-lg font-semibold">
                    {userData.user.name || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Email
                  </label>
                  <p className="text-lg">{userData.user.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Status
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    <Badge
                      variant={userData.user.isActive ? "default" : "secondary"}
                    >
                      {userData.user.isActive ? "Active" : "Inactive"}
                    </Badge>
                    {userData.user.isPremium && (
                      <Badge variant="outline">Premium</Badge>
                    )}
                    {userData.user.isAdmin && (
                      <Badge variant="destructive">Admin</Badge>
                    )}
                    {userData.user.isSuperAdmin && (
                      <Badge variant="destructive">Super Admin</Badge>
                    )}
                    {userData.user.isBetaTester && (
                      <Badge variant="secondary">Beta</Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  {/* Add this Gift Credits button */}
                  <Dialog
                    open={giftCreditsOpen}
                    onOpenChange={(open) => {
                      setGiftCreditsOpen(open);
                      if (!open) resetGiftForm();
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button size="sm" className="ml-2">
                        <Gift className="w-4 h-4 mr-2" />
                        Gift Credits
                      </Button>
                    </DialogTrigger>
                    {/* Dialog content same as above */}
                  </Dialog>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Account Age
                  </label>
                  <p className="text-sm">
                    {Math.floor(
                      (new Date().getTime() -
                        new Date(userData.user.createdAt).getTime()) /
                        (1000 * 60 * 60 * 24),
                    )}{" "}
                    days
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Last Activity
                  </label>
                  <p className="text-sm">
                    {formatDate(userData.user.lastActivity)}
                  </p>
                </div>
              </div>

              {/* Additional user info */}
              <div className="mt-4 pt-4 border-t">
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 text-sm">
                  <div>
                    <label className="text-gray-500">Sign-in Method</label>
                    <p className="font-medium">
                      {userData.user.signInMethod || "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="text-gray-500">Onboarding</label>
                    <p className="font-medium">
                      {userData.user.onboardingComplete
                        ? "Complete"
                        : "Incomplete"}
                    </p>
                  </div>
                  <div>
                    <label className="text-gray-500">Milestones</label>
                    <p className="font-medium">
                      {userData.user.milestones || 0}
                    </p>
                  </div>
                  <div>
                    <label className="text-gray-500">Current Streak</label>
                    <p className="font-medium">
                      {userData.user.currentStreak || 0} days
                    </p>
                  </div>
                  <div>
                    <label className="text-gray-500">Max Streak</label>
                    <p className="font-medium">
                      {userData.user.maxStreak || 0} days
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Usage Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Total Comments
                    </p>
                    <p className="text-3xl font-bold">
                      {userData.usageStats.totalComments.toLocaleString()}
                    </p>
                  </div>
                  <MessageCircle className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Auto Comments
                    </p>
                    <p className="text-3xl font-bold">
                      {userData.usageStats.autoComments.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500">
                      {calculateEngagementRate(
                        userData.usageStats.autoComments,
                        userData.usageStats.totalComments,
                      )}
                      % of total
                    </p>
                  </div>
                  <Zap className="w-8 h-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Manual Comments
                    </p>
                    <p className="text-3xl font-bold">
                      {userData.usageStats.manualComments.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500">
                      {calculateEngagementRate(
                        userData.usageStats.manualComments,
                        userData.usageStats.totalComments,
                      )}
                      % of total
                    </p>
                  </div>
                  <Activity className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500">
                      Credits Balance
                    </p>
                    <p className="text-3xl font-bold">
                      {userData.credits.balance.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500">
                      {userData.credits.totalSpent.toLocaleString()} used
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <TrendingUp className="w-8 h-8 text-purple-500" />
                    <Dialog
                      open={giftCreditsOpen}
                      onOpenChange={(open) => {
                        setGiftCreditsOpen(open);
                        if (!open) resetGiftForm();
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline" className="text-xs">
                          <Gift className="w-3 h-3 mr-1" />
                          Gift
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <Gift className="w-5 h-5" />
                            Gift Credits
                          </DialogTitle>
                          <DialogDescription>
                            Gift credits to {userData.user.email}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid gap-2">
                            <Label htmlFor="credit-amount">Credit Amount</Label>
                            <Input
                              id="credit-amount"
                              type="number"
                              placeholder="Enter amount (1-10000)"
                              value={giftAmount}
                              onChange={(e) => setGiftAmount(e.target.value)}
                              min="1"
                              max="10000"
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="gift-reason">
                              Reason (Optional)
                            </Label>
                            <Textarea
                              id="gift-reason"
                              placeholder="e.g., Bug bounty reward, Customer support compensation..."
                              value={giftReason}
                              onChange={(e) => setGiftReason(e.target.value)}
                              rows={3}
                            />
                          </div>
                          {giftSuccess && (
                            <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                              <p className="text-green-600 text-sm">
                                {giftSuccess}
                              </p>
                            </div>
                          )}
                        </div>
                        <DialogFooter>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setGiftCreditsOpen(false)}
                            disabled={giftLoading}
                          >
                            Cancel
                          </Button>
                          <Button
                            type="button"
                            onClick={handleGiftCredits}
                            disabled={
                              giftLoading ||
                              !giftAmount ||
                              parseInt(giftAmount) <= 0
                            }
                          >
                            {giftLoading ? (
                              <>
                                <Plus className="w-4 h-4 mr-2 animate-spin" />
                                Gifting...
                              </>
                            ) : (
                              <>
                                <Gift className="w-4 h-4 mr-2" />
                                Gift Credits
                              </>
                            )}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Success Rate
                    </p>
                    <p className="text-3xl font-bold">
                      {userData.engagementMetrics?.successRate || 0}%
                    </p>
                    <p className="text-sm text-gray-500">
                      {userData.engagementMetrics?.totalAttempts || 0} attempts
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-emerald-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Analytics */}
          <Tabs defaultValue="platform" className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="platform">Platform Usage</TabsTrigger>
              <TabsTrigger value="autocommenting">Auto Commenting</TabsTrigger>
              <TabsTrigger value="activity">Recent Activity</TabsTrigger>
              <TabsTrigger value="subscription">Subscription</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="devices">Devices</TabsTrigger>
            </TabsList>

            <TabsContent value="platform" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Platform Breakdown</CardTitle>
                  <CardDescription>
                    Usage statistics across different social media platforms
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(userData.platformUsage).map(
                      ([platform, stats]) => (
                        <div
                          key={platform}
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <span className="text-blue-600 font-semibold text-sm">
                                {platform.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="font-semibold capitalize">
                                {platform}
                              </p>
                              <p className="text-sm text-gray-500">
                                {stats.comments} comments (
                                {stats.autoComments || 0} auto,{" "}
                                {stats.manualComments || 0} manual)
                              </p>
                              <p className="text-sm text-gray-500">
                                {stats.likes} likes, {stats.shares} shares
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold">
                              {stats.comments}
                            </p>
                            <p className="text-sm text-gray-500">
                              Total Comments
                            </p>
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="autocommenting" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Auto Commenting Configurations</CardTitle>
                  <CardDescription>
                    Settings and status for automated commenting
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {userData.autoCommentingConfigs.map((config) => (
                      <div key={config.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{config.platform}</h3>
                            <Badge
                              variant={
                                config.isEnabled ? "default" : "secondary"
                              }
                            >
                              {config.isEnabled ? "Enabled" : "Disabled"}
                            </Badge>
                          </div>
                          <div className="text-right text-sm text-gray-500">
                            <p>Last run: {getLastRunInfo(config.lastRun)}</p>
                            <p>
                              Success: {config.successfulComments}/
                              {config.totalComments}
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <label className="text-gray-500">Interval</label>
                            <p className="font-medium">
                              {config.timeInterval} hours
                            </p>
                          </div>
                          <div>
                            <label className="text-gray-500">Posts/Day</label>
                            <p className="font-medium">{config.postsPerDay}</p>
                          </div>
                          <div>
                            <label className="text-gray-500">
                              Success Rate
                            </label>
                            <p className="font-medium">
                              {config.totalComments > 0
                                ? (
                                    (config.successfulComments /
                                      config.totalComments) *
                                    100
                                  ).toFixed(1)
                                : 0}
                              %
                            </p>
                          </div>
                          <div>
                            <label className="text-gray-500">Brand Voice</label>
                            <p className="font-medium">
                              {config.useBrandVoice ? "Yes" : "No"}
                            </p>
                          </div>
                        </div>
                        <div className="mt-3">
                          <label className="text-gray-500 text-sm">
                            Hashtags
                          </label>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {config.hashtags.map(
                              (tag: string, index: number) => (
                                <Badge
                                  key={index}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {tag}
                                </Badge>
                              ),
                            )}
                          </div>
                        </div>
                        {config.enabledPlatforms &&
                          config.enabledPlatforms.length > 0 && (
                            <div className="mt-3">
                              <label className="text-gray-500 text-sm">
                                Enabled Platforms
                              </label>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {config.enabledPlatforms.map(
                                  (platform: string, index: number) => (
                                    <Badge
                                      key={index}
                                      variant="secondary"
                                      className="text-xs"
                                    >
                                      {platform}
                                    </Badge>
                                  ),
                                )}
                              </div>
                            </div>
                          )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>
                    Daily breakdown of user engagement
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {userData.recentActivity.map((activity, index: number) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="font-medium">{activity.date}</p>
                            <p className="text-sm text-gray-500">
                              {activity.platforms
                                ? activity.platforms.join(", ")
                                : activity.platform}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">
                            {activity.comments} comments
                          </p>
                          <p className="text-sm text-gray-500">
                            {activity.autoComments} auto,{" "}
                            {activity.comments - activity.autoComments} manual
                          </p>
                          {(activity.likes > 0 || activity.shares > 0) && (
                            <p className="text-sm text-gray-500">
                              {activity.likes} likes, {activity.shares} shares
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="subscription" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Subscription Details</CardTitle>
                  <CardDescription>
                    License keys and subscription information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold mb-3">
                        Active Subscriptions
                      </h4>
                      {userData.subscriptions.map((sub) => (
                        <div
                          key={sub.id}
                          className="border rounded-lg p-4 mb-4"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={
                                  sub.status === "ACTIVE"
                                    ? "default"
                                    : "secondary"
                                }
                              >
                                {sub.status}
                              </Badge>
                              {sub.planTier && (
                                <Badge variant="outline">{sub.planTier}</Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-500">
                              via {sub.vendor}
                            </p>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <label className="text-gray-500">Plan</label>
                              <p className="font-medium">{sub.planName}</p>
                            </div>
                            <div>
                              <label className="text-gray-500">
                                Start Date
                              </label>
                              <p>{formatDate(sub.startDate)}</p>
                            </div>
                            <div>
                              <label className="text-gray-500">
                                Next Billing
                              </label>
                              <p>
                                {sub.nextBillingDate
                                  ? formatDate(sub.nextBillingDate)
                                  : "N/A"}
                              </p>
                            </div>
                            {sub.endDate && (
                              <div>
                                <label className="text-gray-500">
                                  End Date
                                </label>
                                <p>{formatDate(sub.endDate)}</p>
                              </div>
                            )}
                            {sub.customerId && (
                              <div>
                                <label className="text-gray-500">
                                  Customer ID
                                </label>
                                <p className="font-mono text-xs">
                                  {sub.customerId}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3">License Keys</h4>
                      {userData.licenseKeys.map((license) => (
                        <div
                          key={license.id}
                          className="border rounded-lg p-4 mb-4"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                              {license.key}
                            </code>
                            <Badge
                              variant={
                                license.isActive ? "default" : "secondary"
                              }
                            >
                              {license.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <label className="text-gray-500">Tier</label>
                              <p>T{license.tier}</p>
                            </div>
                            <div>
                              <label className="text-gray-500">Vendor</label>
                              <p className="capitalize">{license.vendor}</p>
                            </div>
                            <div>
                              <label className="text-gray-500">Activated</label>
                              <p>{formatDate(license.activatedAt)}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Time-based Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3">Activity Overview</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Total Active Days:</span>
                          <span className="font-semibold">
                            {userData.timeBasedAnalytics?.totalDaysActive || 0}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Avg Activity/Day:</span>
                          <span className="font-semibold">
                            {userData.timeBasedAnalytics?.avgActivityPerActiveDay?.toFixed(
                              1,
                            ) || 0}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Success Rate:</span>
                          <span className="font-semibold">
                            {userData.engagementMetrics?.successRate || 0}%
                          </span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3">Engagement Metrics</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Total Attempts:</span>
                          <span className="font-semibold">
                            {userData.engagementMetrics?.totalAttempts || 0}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Successful:</span>
                          <span className="font-semibold text-green-600">
                            {userData.engagementMetrics?.successfulComments ||
                              0}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Failed:</span>
                          <span className="font-semibold text-red-600">
                            {userData.engagementMetrics?.failedComments || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="devices" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Smartphone className="w-5 h-5" />
                    Device Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3">Device Types</h4>
                      <div className="space-y-2">
                        {userData.deviceInfo?.deviceTypes &&
                          Object.entries(userData.deviceInfo.deviceTypes).map(
                            ([device, count]) => (
                              <div
                                key={device}
                                className="flex justify-between"
                              >
                                <span className="capitalize">{device}:</span>
                                <span className="font-semibold">
                                  {count as number}
                                </span>
                              </div>
                            ),
                          )}
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 pt-6 border-t">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-gray-500">
                          Total Activations
                        </label>
                        <p className="font-semibold">
                          {userData.deviceInfo?.totalActivations || 0}
                        </p>
                      </div>
                      <div>
                        <label className="text-gray-500">Unique IPs</label>
                        <p className="font-semibold">
                          {userData.deviceInfo?.uniqueIPs || 0}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}

      {userData === null && !loading && !error && (
        <Card>
          <CardContent className="p-12 text-center">
            <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Search for a User</h3>
            <p className="text-gray-500">
              Enter a user's email address to view their detailed usage
              analytics
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UserUsageAnalytics;
