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
  LabelList,
} from "recharts";
import { PieChart, Pie, Cell } from "recharts";
import { LineChart, Line } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/components/ui/tabs";
import { Skeleton } from "@repo/ui/components/ui/skeleton";
import { MilestoneType } from "@repo/db";

// Updated interface types to match the simplified API
interface MilestoneStats {
  milestone: string;
  displayName: string;
  order: number;
  count: number;
  completionRate: number;
  avgDaysFromSignup: number;
}

interface JourneyTransition {
  fromMilestone: string;
  fromDisplayName: string;
  toMilestone: string;
  toDisplayName: string;
  avgDays: number;
  userCount: number;
  conversionRate: number;
}

interface PlatformDistribution {
  platform: string;
  count: number;
  percentage: number;
}

interface LabelProps {
  x: number;
  y: number;
  width: number;
  value: number;
}

// Interface for tooltip parameters
interface TooltipFormatterParams {
  name: string;
  value: number;
  payload: any;
}

interface ChartDataItem {
  fromDisplayName: string;
  toDisplayName?: string;
  avgDays?: number;
  conversionRate?: number;
  [key: string]: any;
}

// Helper function to format time in minutes, hours or days
const formatTimeMinDays = (days: number | null | undefined): string => {
  if (days == null || isNaN(days)) return "?";

  // Convert days to minutes
  const minutes = days * 24 * 60; // days * 24 hours * 60 minutes

  if (minutes < 1) {
    // For very small values, show seconds
    const seconds = minutes * 60;
    return `${Math.round(seconds)} sec`;
  } else if (minutes < 60) {
    // For values less than 60 minutes, show minutes
    return `${Math.round(minutes)} min`;
  } else if (minutes < 24 * 60) {
    // For values less than 24 hours, show hours
    const hours = minutes / 60;
    return `${Math.round(hours)} hours`;
  } else {
    // For larger values, show days
    return `${Math.round(days)} days`;
  }
};

// Custom label component for bar charts
const CustomTimeLabel = (props: LabelProps) => {
  const { x, y, width, value } = props;
  // Don't display labels for very small values
  if (value < 0.001) return null;

  return (
    <text
      x={x + width / 2}
      y={y - 6}
      textAnchor="middle"
      fill="#666"
      fontSize={12}
    >
      {formatTimeMinDays(value)}
    </text>
  );
};

const UserJourneyAnalytics = () => {
  const [milestoneData, setMilestoneData] = useState<MilestoneStats[]>([]);
  const [transitionData, setTransitionData] = useState<JourneyTransition[]>([]);
  const [platformData, setPlatformData] = useState<PlatformDistribution[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState<string>("week");
  const [view, setView] = useState<string>("activation");
  const [totalUsers, setTotalUsers] = useState<number>(0);

  // Key milestones for activation tracking - updated to match requirements
  const activationMilestones = [
    "SIGNUP", 
    "FIRST_LOGIN", 
    "EXTENSION_INSTALLED", 
    "FIRST_COMMENT", 
    "TENTH_COMMENT"
  ];

  // Fetch data from our API
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);

      try {
        // Construct URL with query parameters
        const url = `/api/analytics/user-journey?timeframe=${timeframe}`;

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`API returned status ${response.status}`);
        }

        const data = await response.json();

        // Filter milestone data to include only activation-related milestones
        const activationMilestoneData = (data.milestones || []).filter(
          (milestone: MilestoneStats) => activationMilestones.includes(milestone.milestone)
        );
        
        setMilestoneData(activationMilestoneData);
        
        // Filter transition data to include only transitions between activation milestones
        const activationTransitions = (data.transitions || []).filter(
          (transition: JourneyTransition) => 
            activationMilestones.includes(transition.fromMilestone) && 
            activationMilestones.includes(transition.toMilestone)
        );
        
        setTransitionData(activationTransitions);
        setTotalUsers(data.totalUsers || 0);
      } catch (err) {
        console.error("Error fetching user journey data:", err);
        setError(
          err instanceof Error ? err.message : "An unknown error occurred",
        );

        // For development purposes, generate mock data if API fails
        generateMockData();
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [timeframe]);

  // Generate mock data for development/preview
  const generateMockData = () => {
    // Only include activation-focused milestones
    const milestones = [
      { milestone: "SIGNUP", displayName: "Sign Up", order: 1 },
      { milestone: "FIRST_LOGIN", displayName: "First Login", order: 2 },
      { milestone: "EXTENSION_INSTALLED", displayName: "Extension Installed", order: 3 },
      { milestone: "FIRST_COMMENT", displayName: "First Comment", order: 4 },
      { milestone: "TENTH_COMMENT", displayName: "Activation (10th Comment)", order: 5 },
    ];

    const baseUsers = 500;

    // Generate mock milestone stats
    const mockMilestoneData: MilestoneStats[] = milestones.map(
      (milestone, index) => {
        // Create realistic drop-off at each stage of activation funnel
        const dropOffFactors = [1, 0.85, 0.65, 0.45, 0.25]; 
        const count = Math.floor(baseUsers * dropOffFactors[index]);
        const completionRate = count / baseUsers;

        // Create realistic times to reach each milestone
        let avgDaysFromSignup;
        if (index === 0) {
          // Signup is immediate
          avgDaysFromSignup = 0;
        } else if (index === 1) {
          // First login happens quickly
          avgDaysFromSignup = 0.005; // ~7 minutes
        } else if (index === 2) {
          // Extension installation within a day
          avgDaysFromSignup = 0.8; // ~19 hours
        } else if (index === 3) {
          // First comment within 3 days
          avgDaysFromSignup = 2.5; // 2.5 days
        } else {
          // 10th comment (activation) within 14 days
          avgDaysFromSignup = 14; // 14 days
        }

        return {
          ...milestone,
          count,
          completionRate,
          avgDaysFromSignup,
        };
      },
    );

    setMilestoneData(mockMilestoneData);
    setTotalUsers(baseUsers);

    // Remove platform data as it's not needed for activation focus
    setPlatformData([]);

    // Generate mock transitions between sequential milestones in activation journey
    const mockTransitions: JourneyTransition[] = [];
    for (let i = 0; i < mockMilestoneData.length - 1; i++) {
      const fromMilestone = mockMilestoneData[i];
      const toMilestone = mockMilestoneData[i + 1];
      
      // Create realistic transition times between milestones
      let avgDays;
      if (i === 0) {
        // Signup to login - minutes
        avgDays = 0.005; // ~7 minutes
      } else if (i === 1) {
        // Login to extension installation - hours to a day
        avgDays = 0.8; // ~19 hours
      } else if (i === 2) {
        // Extension to first comment - days
        avgDays = 1.7; // ~1.7 days
      } else {
        // First comment to tenth comment (activation) - days to weeks
        avgDays = 11.5; // ~11.5 days
      }
      
      // Calculate realistic conversion rates for activation journey
      const conversionRates = [0.85, 0.76, 0.69, 0.56];
      const conversionRate = conversionRates[i];
      
      mockTransitions.push({
        fromMilestone: fromMilestone.milestone,
        fromDisplayName: fromMilestone.displayName,
        toMilestone: toMilestone.milestone,
        toDisplayName: toMilestone.displayName,
        avgDays,
        conversionRate,
        userCount: Math.floor(fromMilestone.count * conversionRate)
      });
    }
    
    setTransitionData(mockTransitions);
  };

  // Create activation funnel data
  const getActivationFunnelData = () => {
    return milestoneData
      .sort((a, b) => a.order - b.order)
      .map((item) => ({
        name: item.displayName,
        users: item.count,
        rate: (item.completionRate * 100).toFixed(1) + "%"
      }));
  };

  // Create transition time data
  const getTransitionTimeData = () => {
    return transitionData
      .sort((a, b) => {
        const fromOrderA = milestoneData.find(m => m.milestone === a.fromMilestone)?.order || 0;
        const fromOrderB = milestoneData.find(m => m.milestone === b.fromMilestone)?.order || 0;
        return fromOrderA - fromOrderB;
      })
      .map((item) => ({
        name: `${item.fromDisplayName} → ${item.toDisplayName}`,
        days: item.avgDays,
        users: item.userCount,
        rate: (item.conversionRate * 100).toFixed(1) + "%"
      }));
  };

  // Get time to activation data for time view
  const getTimeToActivationData = () => {
    return milestoneData
      .sort((a, b) => a.order - b.order)
      .map((item) => ({
        name: item.displayName,
        days: item.avgDaysFromSignup,
      }));
  };

  // Calculate activation rate (users who reached 10th comment divided by signups)
  const getActivationRate = (): string => {
    const signups = milestoneData.find(m => m.milestone === "SIGNUP")?.count || 0;
    const activated = milestoneData.find(m => m.milestone === "TENTH_COMMENT")?.count || 0;
    
    if (signups === 0) return "0%";
    return ((activated / signups) * 100).toFixed(1) + "%";
  };

  // Get average time to activation
  const getTimeToActivation = (): string => {
    const activationTime = milestoneData.find(m => m.milestone === "TENTH_COMMENT")?.avgDaysFromSignup || 0;
    return formatTimeMinDays(activationTime);
  };

  // Colors for charts
  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884d8",
  ];

  // Loading and error states
  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>User Activation Analytics</CardTitle>
            <CardDescription>Loading activation data...</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 mb-6">
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Timeframe
                </label>
                <div className="flex flex-wrap gap-2 mb-1">
                  <button
                    disabled
                    className={`px-3 py-2 text-sm font-medium rounded-md ${
                      timeframe === "day"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    Yesterday
                  </button>
                  <button
                    disabled
                    className={`px-3 py-2 text-sm font-medium rounded-md ${
                      timeframe === "week"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    Last 7 days
                  </button>
                  <button
                    disabled
                    className={`px-3 py-2 text-sm font-medium rounded-md ${
                      timeframe === "month"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    Last 28 days
                  </button>
                  <button
                    disabled
                    className={`px-3 py-2 text-sm font-medium rounded-md ${
                      timeframe === "3months"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    Last 90 days
                  </button>
                </div>
                <p className="text-xs text-gray-500">
                  {timeframe === "day" && "Data from the last 24 hours"}
                  {timeframe === "week" && "Data from the last 7 days"}
                  {timeframe === "month" && "Data from the last 30 days"}
                  {timeframe === "3months" && "Data from the last 90 days"}
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-blue-50 border border-blue-100 rounded-md p-4">
                <h3 className="font-medium text-blue-800">Activation Rate</h3>
                <div className="h-8 w-20 mt-2">
                  <Skeleton className="h-full w-full" />
                </div>
              </div>
              
              <div className="bg-green-50 border border-green-100 rounded-md p-4">
                <h3 className="font-medium text-green-800">Time to Activation</h3>
                <div className="h-8 w-20 mt-2">
                  <Skeleton className="h-full w-full" />
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <Skeleton className="h-8 w-full mb-4" />
              <Skeleton className="h-64 w-full" />
            </div>
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
            There was a problem fetching the activation data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-red-600">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>User Activation Analytics</CardTitle>
          <CardDescription>
            Track user progression through activation stages: signup, extension install, first comment, and full activation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-6">
            <div className="w-full">
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
                  Last 28 days
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
              </div>
              <p className="text-xs text-gray-500">
                {timeframe === "day" && "Data from the last 24 hours"}
                {timeframe === "week" && "Data from the last 7 days"}
                {timeframe === "month" && "Data from the last 30 days"}
                {timeframe === "3months" && "Data from the last 90 days"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-blue-50 border border-blue-100 rounded-md p-4">
              <h3 className="font-medium text-blue-800">Activation Rate</h3>
              <p className="text-3xl font-bold mt-2">{getActivationRate()}</p>
              <p className="text-sm text-blue-600 mt-1">
                Users who reached 10th comment
              </p>
            </div>
            
            <div className="bg-green-50 border border-green-100 rounded-md p-4">
              <h3 className="font-medium text-green-800">Time to Activation</h3>
              <p className="text-3xl font-bold mt-2">{getTimeToActivation()}</p>
              <p className="text-sm text-green-600 mt-1">
                Average time from signup to 10th comment
              </p>
            </div>
          </div>

          <Tabs value={view} onValueChange={setView} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="activation">Activation Funnel</TabsTrigger>
              <TabsTrigger value="timing">Time to Milestones</TabsTrigger>
              <TabsTrigger value="transitions">Step Transitions</TabsTrigger>
            </TabsList>

            <TabsContent value="activation" className="mt-6">
              <h3 className="text-lg font-medium mb-4">
                Activation Funnel
              </h3>
              <div className="overflow-hidden rounded-lg border">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-slate-600">Milestone</th>
                      <th className="px-4 py-3 text-right font-medium text-slate-600">Users</th>
                      <th className="px-4 py-3 text-right font-medium text-slate-600">Conversion Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getActivationFunnelData().map((item, index) => (
                      <tr key={index} className="border-t hover:bg-slate-50">
                        <td className="px-4 py-3 text-slate-700">{item.name}</td>
                        <td className="px-4 py-3 text-right text-slate-700">{item.users.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right text-slate-700">{item.rate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="h-80 mt-6">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={getActivationFunnelData()}
                    margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="name"
                      angle={-45}
                      textAnchor="end"
                      tick={{ fontSize: 12 }}
                      height={80}
                    />
                    <YAxis />
                    <Tooltip
                      formatter={(value: number) => [`${value.toLocaleString()} users`, "Count"]}
                    />
                    <Legend />
                    <Bar
                      dataKey="users"
                      name="Users Reached"
                      fill="#4f46e5"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>

            <TabsContent value="timing" className="mt-6">
              <h3 className="text-lg font-medium mb-4">
                Time to Reach Activation Milestones
              </h3>
              <div className="overflow-hidden rounded-lg border">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-slate-600">Milestone</th>
                      <th className="px-4 py-3 text-right font-medium text-slate-600">Time from Signup</th>
                      <th className="px-4 py-3 text-right font-medium text-slate-600">Users</th>
                    </tr>
                  </thead>
                  <tbody>
                    {milestoneData.sort((a, b) => a.order - b.order).map((item, index) => (
                      <tr key={index} className="border-t hover:bg-slate-50">
                        <td className="px-4 py-3 text-slate-700">{item.displayName}</td>
                        <td className="px-4 py-3 text-right text-slate-700">{formatTimeMinDays(item.avgDaysFromSignup)}</td>
                        <td className="px-4 py-3 text-right text-slate-700">{item.count.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="h-80 mt-6">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={getTimeToActivationData()}
                    margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="name"
                      angle={-45}
                      textAnchor="end"
                      tick={{ fontSize: 12 }}
                      height={80}
                    />
                    <YAxis
                      label={{
                        value: "Time from signup",
                        angle: -90,
                        position: "insideLeft",
                      }}
                    />
                    <Tooltip
                      formatter={(value: number) => [
                        formatTimeMinDays(value),
                        "Average Time",
                      ]}
                    />
                    <Legend />
                    <Bar dataKey="days" name="Average Time" fill="#8884d8">
                      <LabelList
                        dataKey="days"
                        position="top"
                        formatter={formatTimeMinDays}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>

            <TabsContent value="transitions" className="mt-6">
              <h3 className="text-lg font-medium mb-4">
                Time Between Activation Steps
              </h3>
              <div className="overflow-hidden rounded-lg border">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-slate-600">Transition</th>
                      <th className="px-4 py-3 text-right font-medium text-slate-600">Time</th>
                      <th className="px-4 py-3 text-right font-medium text-slate-600">Conversion</th>
                      <th className="px-4 py-3 text-right font-medium text-slate-600">Users</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getTransitionTimeData().map((item, index) => (
                      <tr key={index} className="border-t hover:bg-slate-50">
                        <td className="px-4 py-3 text-slate-700">{item.name}</td>
                        <td className="px-4 py-3 text-right text-slate-700">{formatTimeMinDays(item.days)}</td>
                        <td className="px-4 py-3 text-right text-slate-700">{item.rate}</td>
                        <td className="px-4 py-3 text-right text-slate-700">{item.users.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="h-80 mt-6">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={getTransitionTimeData()}
                    margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="name"
                      angle={-45}
                      textAnchor="end"
                      tick={{ fontSize: 12 }}
                      height={80}
                    />
                    <YAxis
                      label={{
                        value: "Time",
                        angle: -90,
                        position: "insideLeft",
                      }}
                    />
                    <Tooltip
                      formatter={(value: number) => [
                        formatTimeMinDays(value),
                        "Average Time",
                      ]}
                    />
                    <Legend />
                    <Bar
                      dataKey="days"
                      name="Time Between Steps"
                      fill="#FF8042"
                    >
                      <LabelList
                        dataKey="days"
                        position="top"
                        formatter={formatTimeMinDays}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Activation Insights</CardTitle>
          <CardDescription>
            Key metrics for your user activation journey
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {milestoneData.find(m => m.milestone === "SIGNUP") && 
             milestoneData.find(m => m.milestone === "EXTENSION_INSTALLED") && (
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-green-100 text-green-800">
                    1
                  </span>
                </div>
                <p className="ml-3 text-sm text-gray-700">
                  <strong>Extension adoption:</strong>{" "}
                  {milestoneData.find((m) => m.milestone === "EXTENSION_INSTALLED")
                    ?.count || 0}{" "}
                  users (
                  {Math.round(
                    ((milestoneData.find(
                      (m) => m.milestone === "EXTENSION_INSTALLED",
                    )?.count || 0) /
                      (milestoneData.find((m) => m.milestone === "SIGNUP")
                        ?.count || 1)) *
                      100,
                  )}
                  %) installed the extension, taking{" "}
                  {formatTimeMinDays(
                    transitionData.find(
                      (t) => 
                        t.fromMilestone === "FIRST_LOGIN" && 
                        t.toMilestone === "EXTENSION_INSTALLED"
                    )?.avgDays || 0
                  )}{" "}
                  on average after first login.
                </p>
              </div>
            )}

            {milestoneData.find(m => m.milestone === "EXTENSION_INSTALLED") && 
             milestoneData.find(m => m.milestone === "FIRST_COMMENT") && (
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-800">
                    2
                  </span>
                </div>
                <p className="ml-3 text-sm text-gray-700">
                  <strong>First engagement:</strong>{" "}
                  {Math.round(
                    ((milestoneData.find((m) => m.milestone === "FIRST_COMMENT")
                      ?.count || 0) /
                      (milestoneData.find((m) => m.milestone === "EXTENSION_INSTALLED")
                        ?.count || 1)) *
                      100,
                  )}
                  % of users who installed the extension made their first comment, taking{" "}
                  {formatTimeMinDays(
                    transitionData.find(
                      (t) => 
                        t.fromMilestone === "EXTENSION_INSTALLED" && 
                        t.toMilestone === "FIRST_COMMENT"
                    )?.avgDays || 0
                  )}{" "}
                  on average.
                </p>
              </div>
            )}

            {milestoneData.find(m => m.milestone === "FIRST_COMMENT") && 
             milestoneData.find(m => m.milestone === "TENTH_COMMENT") && (
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-purple-100 text-purple-800">
                    3
                  </span>
                </div>
                <p className="ml-3 text-sm text-gray-700">
                  <strong>Full activation:</strong>{" "}
                  {Math.round(
                    ((milestoneData.find((m) => m.milestone === "TENTH_COMMENT")
                      ?.count || 0) /
                      (milestoneData.find((m) => m.milestone === "FIRST_COMMENT")
                        ?.count || 1)) *
                      100,
                  )}
                  % of users who made their first comment reached full activation (10th comment), taking{" "}
                  {formatTimeMinDays(
                    transitionData.find(
                      (t) => 
                        t.fromMilestone === "FIRST_COMMENT" && 
                        t.toMilestone === "TENTH_COMMENT"
                    )?.avgDays || 0
                  )}{" "}
                  on average.
                </p>
              </div>
            )}

            {transitionData.length > 0 && (
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-yellow-100 text-yellow-800">
                    !
                  </span>
                </div>
                <p className="ml-3 text-sm text-gray-700">
                  <strong>Biggest drop-off:</strong>{" "}
                  {(() => {
                    const worstTransition = [...transitionData].sort((a, b) => 
                      a.conversionRate - b.conversionRate
                    )[0];
                    return worstTransition ? 
                      `The transition from ${worstTransition.fromDisplayName} to ${worstTransition.toDisplayName} has only ${(worstTransition.conversionRate * 100).toFixed(1)}% conversion.` :
                      "No drop-off data available.";
                  })()}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserJourneyAnalytics;
