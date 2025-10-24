"use client";

import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/components/ui/tabs";
import { Badge } from "@repo/ui/components/ui/badge";
import { Skeleton } from "@repo/ui/components/ui/skeleton";
import { Progress } from "@repo/ui/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/components/ui/select";

interface PremiumUserJourneyData {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  vendor: string;
  licenseKey: string;
  licenseStatus: string;
  milestones: UserMilestone[];
  lastActive: string;
  activationStatus: string;
  daysSinceSignup: number;
  subscriptionStatus: string;
  isTrialUser: boolean;
  trialEndsAt: string | null;
  cancelledAt: string | null;
  progressPercentage: number;
  currentStage: string;
  stagesCompleted: string[];
  hasUnsubscribed: boolean;
}

interface UserMilestone {
  milestone: string;
  displayName: string;
  achievedAt: string;
  daysSinceSignup: number;
}

interface PremiumJourneyResponse {
  totalUsers: number;
  users: PremiumUserJourneyData[];
  milestoneOverview: MilestoneOverview[];
  timeframe: string;
}

interface MilestoneOverview {
  milestone: string;
  displayName: string;
  count: number;
  percentage: number;
}

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const getActivationStatusBadge = (status: string) => {
  switch (status) {
    case "Fully Activated":
      return <Badge className="bg-green-100 text-green-800">Fully Activated</Badge>;
    case "First Comment":
      return <Badge className="bg-blue-100 text-blue-800">First Comment</Badge>;
    case "Extension Installed":
      return <Badge className="bg-yellow-100 text-yellow-800">Extension Installed</Badge>;
    default:
      return <Badge className="bg-gray-100 text-gray-800">Not Started</Badge>;
  }
};

const getVendorBadge = (vendor: string) => {
  const normalizedVendor = vendor?.toLowerCase() || "";
  
  switch (normalizedVendor) {
    case "stripe":
      return <Badge className="bg-purple-100 text-purple-800">Stripe</Badge>;
    case "lemon":
    case "lemonsqueezy":
      return <Badge className="bg-orange-100 text-orange-800">LemonSqueezy</Badge>;
    case "olly":
      return <Badge className="bg-blue-100 text-blue-800">Olly</Badge>;
    case "appsumo":
      return <Badge className="bg-green-100 text-green-800">AppSumo</Badge>;
    default:
      return <Badge className="bg-gray-100 text-gray-800">{vendor || "Unknown"}</Badge>;
  }
};

const getSubscriptionStatusBadge = (status: string, hasUnsubscribed: boolean) => {
  if (hasUnsubscribed) {
    return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>;
  }
  
  switch (status.toUpperCase()) {
    case "ACTIVE":
      return <Badge className="bg-green-100 text-green-800">Active</Badge>;
    case "TRIALING":
      return <Badge className="bg-blue-100 text-blue-800">Trial</Badge>;
    case "PAST_DUE":
      return <Badge className="bg-yellow-100 text-yellow-800">Past Due</Badge>;
    case "CANCELLED":
      return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>;
    default:
      return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
  }
};

const getLicenseStatusBadge = (status: string) => {
  switch (status.toLowerCase()) {
    case "active":
      return <Badge className="bg-green-100 text-green-800">Active License</Badge>;
    case "inactive":
      return <Badge className="bg-red-100 text-red-800">Inactive License</Badge>;
    default:
      return <Badge className="bg-gray-100 text-gray-800">{status} License</Badge>;
  }
};

const COLORS = [
  "#0088FE",
  "#00C49F", 
  "#FFBB28",
  "#FF8042",
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff7300",
  "#a4de6c",
  "#ffc0cb"
];

const PremiumUserJourney = () => {
  const [data, setData] = useState<PremiumJourneyResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState<string>("month");
  const [activeTab, setActiveTab] = useState<string>("user-progress");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [userTypeFilter, setUserTypeFilter] = useState<string>("all");
  const [vendorFilter, setVendorFilter] = useState<string>("all");
  const [licenseStatusFilter, setLicenseStatusFilter] = useState<string>("all");
  const [showUnknownUsers, setShowUnknownUsers] = useState<boolean>(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);

      try {
        const url = `/api/analytics/premium-user-journey?timeframe=${timeframe}`;
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`API returned status ${response.status}`);
        }

        const result = await response.json();
        setData(result);
      } catch (err) {
        console.error("Error fetching premium user journey data:", err);
        setError(
          err instanceof Error ? err.message : "An unknown error occurred",
        );
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [timeframe]);

  const getActivationStatusData = () => {
    if (!data) return [];
    
    const statusCounts = data.users.reduce((acc, user) => {
      acc[user.activationStatus] = (acc[user.activationStatus] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(statusCounts).map(([status, count]) => ({
      name: status,
      value: count,
      percentage: Math.round((count / data.totalUsers) * 100)
    }));
  };

  const getVendorDistribution = () => {
    if (!data) return [];
    
    const vendorCounts = data.users.reduce((acc, user) => {
      acc[user.vendor] = (acc[user.vendor] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(vendorCounts).map(([vendor, count]) => ({
      name: vendor,
      value: count,
      percentage: Math.round((count / data.totalUsers) * 100)
    }));
  };

  const getTopMilestonesData = () => {
    if (!data) return [];
    
    return data.milestoneOverview.slice(0, 10).map(milestone => ({
      name: milestone.displayName,
      count: milestone.count,
      percentage: milestone.percentage
    }));
  };

  // Filter users based on selected filters
  const getFilteredUsers = () => {
    if (!data) return [];
    
    return data.users.filter(user => {
      // Status filter
      if (statusFilter === "active" && user.hasUnsubscribed) return false;
      if (statusFilter === "inactive" && !user.hasUnsubscribed) return false;
      if (statusFilter === "trial" && !user.isTrialUser) return false;
      if (statusFilter === "cancelled" && !user.hasUnsubscribed) return false;
      
      // User type filter
      if (userTypeFilter === "trial" && !user.isTrialUser) return false;
      if (userTypeFilter === "paid" && user.isTrialUser) return false;
      
      // Vendor filter
      if (vendorFilter !== "all" && user.vendor?.toLowerCase() !== vendorFilter.toLowerCase()) return false;
      
      // License status filter
      if (licenseStatusFilter !== "all" && user.licenseStatus?.toLowerCase() !== licenseStatusFilter.toLowerCase()) return false;
      
      // Unknown users filter
      if (!showUnknownUsers && user.name === "Unknown") return false;
      
      return true;
    });
  };

  // Get available vendors from data
  const getAvailableVendors = () => {
    if (!data) return [];
    
    const vendors = data.users.map(user => user.vendor?.toLowerCase()).filter(Boolean);
    const uniqueVendors = Array.from(new Set(vendors));
    return uniqueVendors.filter(vendor => vendor && vendor !== 'unknown');
  };

  // Get drop-off analysis data
  const getDropOffAnalysis = () => {
    if (!data) return [];
    
    const stages = ['Sign Up', 'First Login', 'Extension Installed', 'First Comment', 'Fifth Comment', 'Tenth Comment'];
    const filteredUsers = getFilteredUsers();
    
    return stages.map((stage, index) => {
      const usersAtStage = filteredUsers.filter(user => user.stagesCompleted.length > index);
      const droppedOffAfterStage = filteredUsers.filter(user => 
        user.stagesCompleted.length === index + 1 && user.hasUnsubscribed
      );
      
      return {
        stage,
        usersAtStage: usersAtStage.length,
        droppedOff: droppedOffAfterStage.length,
        dropOffRate: usersAtStage.length > 0 ? Math.round((droppedOffAfterStage.length / usersAtStage.length) * 100) : 0
      };
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>User Journey Analytics (All Vendors)</CardTitle>
            <CardDescription>Loading user data from all vendors...</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-700">Error Loading Data</CardTitle>
          <CardDescription className="text-red-600">
            There was a problem fetching the user journey data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-red-600">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>User Journey Analytics (All Vendors)</CardTitle>
          <CardDescription>
            Journey progress for users with active licenses from all vendors (Stripe, LemonSqueezy, AppSumo, Olly)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Timeframe
              </label>
              <div className="flex flex-wrap gap-2 mb-1">
                <button
                  onClick={() => setTimeframe("day")}
                  className={`px-3 py-2 text-sm font-medium rounded-md ${
                    timeframe === "day"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Yesterday
                </button>
                <button
                  onClick={() => setTimeframe("week")}
                  className={`px-3 py-2 text-sm font-medium rounded-md ${
                    timeframe === "week"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Last 7 days
                </button>
                <button
                  onClick={() => setTimeframe("month")}
                  className={`px-3 py-2 text-sm font-medium rounded-md ${
                    timeframe === "month"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Last 30 days
                </button>
                <button
                  onClick={() => setTimeframe("3months")}
                  className={`px-3 py-2 text-sm font-medium rounded-md ${
                    timeframe === "3months"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Last 90 days
                </button>
                <button
                  onClick={() => setTimeframe("all")}
                  className={`px-3 py-2 text-sm font-medium rounded-md ${
                    timeframe === "all"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  All time
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status Filter
              </label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Cancelled</SelectItem>
                  <SelectItem value="trial">Trial Users</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                User Type
              </label>
              <Select value={userTypeFilter} onValueChange={setUserTypeFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="trial">Trial Only</SelectItem>
                  <SelectItem value="paid">Paid Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vendor
              </label>
              <Select value={vendorFilter} onValueChange={setVendorFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Select vendor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Vendors</SelectItem>
                  {getAvailableVendors().map(vendor => (
                    <SelectItem key={vendor} value={vendor.toLowerCase()}>
                      {vendor.toLowerCase() === 'lemonsqueezy' ? 'LemonSqueezy' :
                       vendor.toLowerCase() === 'appsumo' ? 'AppSumo' :
                       vendor.charAt(0).toUpperCase() + vendor.slice(1).toLowerCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                License Status
              </label>
              <Select value={licenseStatusFilter} onValueChange={setLicenseStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Licenses</SelectItem>
                  <SelectItem value="active">Active Only</SelectItem>
                  <SelectItem value="inactive">Inactive Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Display Options
              </label>
              <div className="flex items-center space-x-2 mt-2">
                <input
                  type="checkbox"
                  id="showUnknownUsers"
                  checked={showUnknownUsers}
                  onChange={(e) => setShowUnknownUsers(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="showUnknownUsers" className="text-sm text-gray-700">
                  Show users with "Unknown" names
                </label>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 border border-blue-100 rounded-md p-4">
              <h3 className="font-medium text-blue-800">Filtered Users</h3>
              <p className="text-3xl font-bold mt-2">{getFilteredUsers().length}</p>
              <p className="text-sm text-blue-600 mt-1">
                {statusFilter === "all" ? "All licensed users" : 
                 statusFilter === "trial" ? "Trial users" :
                 statusFilter === "active" ? "Active users" : "Cancelled users"}
                {vendorFilter !== "all" && ` (${vendorFilter})`}
                {!showUnknownUsers && " (excluding unknown)"}
              </p>
            </div>
            
            <div className="bg-green-50 border border-green-100 rounded-md p-4">
              <h3 className="font-medium text-green-800">Fully Activated</h3>
              <p className="text-3xl font-bold mt-2">
                {getFilteredUsers().filter(u => u.activationStatus === "Fully Activated").length}
              </p>
              <p className="text-sm text-green-600 mt-1">
                {getFilteredUsers().length > 0 ? Math.round((getFilteredUsers().filter(u => u.activationStatus === "Fully Activated").length / getFilteredUsers().length) * 100) : 0}% of filtered users
              </p>
            </div>
            
            <div className="bg-red-50 border border-red-100 rounded-md p-4">
              <h3 className="font-medium text-red-800">Trial Users Cancelled</h3>
              <p className="text-3xl font-bold mt-2">
                {data.users.filter(u => u.isTrialUser && u.hasUnsubscribed).length}
              </p>
              <p className="text-sm text-red-600 mt-1">
                {data.users.filter(u => u.isTrialUser).length > 0 ? Math.round((data.users.filter(u => u.isTrialUser && u.hasUnsubscribed).length / data.users.filter(u => u.isTrialUser).length) * 100) : 0}% of trial users
              </p>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-100 rounded-md p-4">
              <h3 className="font-medium text-yellow-800">Average Progress</h3>
              <p className="text-3xl font-bold mt-2">
                {getFilteredUsers().length > 0 ? Math.round(getFilteredUsers().reduce((acc, user) => acc + user.progressPercentage, 0) / getFilteredUsers().length) : 0}%
              </p>
              <p className="text-sm text-yellow-600 mt-1">
                Journey completion rate
              </p>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="user-progress">User Progress</TabsTrigger>
              <TabsTrigger value="drop-off-analysis">Drop-off Analysis</TabsTrigger>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="insights">Insights</TabsTrigger>
            </TabsList>

            <TabsContent value="user-progress" className="mt-6">
              <div className="space-y-4">
                {getFilteredUsers().map((user, index) => (
                  <Card key={user.id} className={`${user.hasUnsubscribed ? 'border-red-200 bg-red-50' : ''}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div>
                            <div className="font-medium text-slate-700">{user.name}</div>
                            <div className="text-sm text-slate-500">{user.email}</div>
                          </div>
                          <div className="flex space-x-2">
                            {getVendorBadge(user.vendor)}
                            {getLicenseStatusBadge(user.licenseStatus)}
                            {getSubscriptionStatusBadge(user.subscriptionStatus, user.hasUnsubscribed)}
                            {user.isTrialUser && <Badge className="bg-orange-100 text-orange-800">Trial</Badge>}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold">{user.progressPercentage}%</div>
                          <div className="text-sm text-slate-500">{user.daysSinceSignup} days ago</div>
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Journey Progress</span>
                          <span>{user.stagesCompleted.length} of 6 stages</span>
                        </div>
                        <Progress value={user.progressPercentage} className="h-2" />
                      </div>
                      
                      <div className="grid grid-cols-6 gap-2 text-xs">
                        {['Sign Up', 'First Login', 'Extension', 'First Comment', '5th Comment', '10th Comment'].map((stage, stageIndex) => {
                          const isCompleted = user.stagesCompleted.length > stageIndex;
                          return (
                            <div 
                              key={stage}
                              className={`text-center p-2 rounded ${
                                isCompleted 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-gray-100 text-gray-500'
                              }`}
                            >
                              {stage}
                            </div>
                          );
                        })}
                      </div>
                      
                      <div className="mt-3 flex justify-between items-center text-sm">
                        <span className="text-slate-600">Current Stage: <strong>{user.currentStage}</strong></span>
                        {user.hasUnsubscribed && (
                          <span className="text-red-600 font-medium">
                            Cancelled {user.cancelledAt ? formatDate(user.cancelledAt) : ''}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {getFilteredUsers().length === 0 && (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <p className="text-slate-500">No users match the selected filters.</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="drop-off-analysis" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>User Drop-off Analysis</CardTitle>
                  <CardDescription>
                    Where users are dropping off in their journey (especially trial users)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-hidden rounded-lg border">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-4 py-3 text-left font-medium text-slate-600">Journey Stage</th>
                          <th className="px-4 py-3 text-right font-medium text-slate-600">Users at Stage</th>
                          <th className="px-4 py-3 text-right font-medium text-slate-600">Dropped Off</th>
                          <th className="px-4 py-3 text-right font-medium text-slate-600">Drop-off Rate</th>
                        </tr>
                      </thead>
                      <tbody>
                        {getDropOffAnalysis().map((stage, index) => (
                          <tr key={stage.stage} className="border-t hover:bg-slate-50">
                            <td className="px-4 py-3 text-slate-700">{stage.stage}</td>
                            <td className="px-4 py-3 text-right text-slate-700">{stage.usersAtStage}</td>
                            <td className="px-4 py-3 text-right text-slate-700">{stage.droppedOff}</td>
                            <td className="px-4 py-3 text-right">
                              <span className={`font-medium ${
                                stage.dropOffRate > 20 ? 'text-red-600' : 
                                stage.dropOffRate > 10 ? 'text-yellow-600' : 'text-green-600'
                              }`}>
                                {stage.dropOffRate}%
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="mt-6 h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={getDropOffAnalysis()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="stage" angle={-45} textAnchor="end" height={80} />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="usersAtStage" name="Users at Stage" fill="#8884d8" />
                        <Bar dataKey="droppedOff" name="Dropped Off" fill="#ff7300" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="overview" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Activation Status Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={getActivationStatusData()}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percentage }) => `${name}: ${percentage}%`}
                          >
                            {getActivationStatusData().map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">License Vendor Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={getVendorDistribution()}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="value" fill="#8884d8" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="insights" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Key Insights</CardTitle>
                  <CardDescription>
                    Analysis of premium user journey patterns
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-800">
                          1
                        </span>
                      </div>
                      <p className="ml-3 text-sm text-gray-700">
                        <strong>Activation Rate:</strong> {Math.round((data.users.filter(u => u.activationStatus === "Fully Activated").length / data.totalUsers) * 100)}% of premium users reach full activation (10th comment milestone).
                      </p>
                    </div>

                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-green-100 text-green-800">
                          2
                        </span>
                      </div>
                      <p className="ml-3 text-sm text-gray-700">
                        <strong>Extension Installation:</strong> {Math.round((data.users.filter(u => u.milestones.some(m => m.milestone === "EXTENSION_INSTALLED")).length / data.totalUsers) * 100)}% of premium users have installed the extension.
                      </p>
                    </div>

                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-yellow-100 text-yellow-800">
                          3
                        </span>
                      </div>
                      <p className="ml-3 text-sm text-gray-700">
                        <strong>Vendor Distribution:</strong> Most premium users are from {getVendorDistribution().sort((a, b) => b.value - a.value)[0]?.name || 'Unknown'} licenses.
                      </p>
                    </div>

                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-purple-100 text-purple-800">
                          4
                        </span>
                      </div>
                      <p className="ml-3 text-sm text-gray-700">
                        <strong>Engagement Level:</strong> Premium users have completed an average of {Math.round(data.users.reduce((acc, user) => acc + user.milestones.length, 0) / data.totalUsers)} milestones each.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default PremiumUserJourney; 