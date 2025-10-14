// app/(auth)/admin/_components/user-analytics.tsx
"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
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
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Loader2, CalendarIcon } from "lucide-react";
import { Checkbox } from "@repo/ui/components/ui/checkbox";
import { Label } from "@repo/ui/components/ui/label";
import { Button } from "@repo/ui/components/ui/button";
import { Calendar } from "@repo/ui/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@repo/ui/components/ui/popover";
import { addDays, format, subDays } from "date-fns";
import { DateRange } from "react-day-picker";

// Type definitions for our data
type OnboardingStats = {
  totalUsers: number;
  filledOnboarding: number;
  skippedOnboarding: number;
  industries: { name: string; count: number }[];
  roles: { name: string; count: number }[];
  platforms: { name: string; count: number }[];
  businessTypes: { name: string; count: number }[];
  referralSources: { name: string; count: number }[];
};

type LicenseStats = {
  totalLicenses: number;
  activeLicenses: number;
  inactiveLicenses: number;
  byTier: { tier: string; count: number }[];
  byVendor: { vendor: string; count: number }[];
  topPlans: { plan: string; count: number }[];
  usersByTier?: { tier: string; count: number }[];
};

type DatePreset = "7d" | "30d" | "90d" | "180d" | "360d" | "all" | "custom";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
  "#82ca9d",
  "#ffc658",
];

export default function UserAnalytics() {
  const [onboardingStats, setOnboardingStats] =
    useState<OnboardingStats | null>(null);
  const [licenseStats, setLicenseStats] = useState<LicenseStats | null>(null);
  const [userFilter, setUserFilter] = useState("all"); // 'all', 'paid', 'free', 'refunded'
  const [includeUnknown, setIncludeUnknown] = useState(true);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [isFilteringByDate, setIsFilteringByDate] = useState(false);
  const [activeDatePreset, setActiveDatePreset] = useState<DatePreset>("all");

  const applyDatePreset = (preset: DatePreset) => {
    const today = new Date();
    let newDateRange: DateRange | undefined;

    switch (preset) {
      case "7d":
        newDateRange = {
          from: subDays(today, 7),
          to: today,
        };
        break;
      case "30d":
        newDateRange = {
          from: subDays(today, 30),
          to: today,
        };
        break;
      case "90d":
        newDateRange = {
          from: subDays(today, 90),
          to: today,
        };
        break;
      case "180d":
        newDateRange = {
          from: subDays(today, 180),
          to: today,
        };
        break;
      case "360d":
        newDateRange = {
          from: subDays(today, 360),
          to: today,
        };
        break;
      case "all":
        newDateRange = undefined;
        setIsFilteringByDate(false);
        break;
      default:
        // Keep current custom range
        return;
    }

    setDateRange(newDateRange);
    setActiveDatePreset(preset);

    if (preset !== "all") {
      setIsFilteringByDate(true);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let queryParams = `filter=${userFilter}&includeUnknown=${includeUnknown}`;

        // Add date range parameters if they exist
        if (dateRange?.from) {
          queryParams += `&startDate=${dateRange.from.toISOString()}`;
          setIsFilteringByDate(true);
        }

        if (dateRange?.to) {
          queryParams += `&endDate=${dateRange.to.toISOString()}`;
          setIsFilteringByDate(true);
        }

        const onboardingRes = await axios.get(
          `/api/admin/analytics/onboarding?${queryParams}`,
        );
        const licenseRes = await axios.get(
          `/api/admin/analytics/licenses?${queryParams}`,
        );

        setOnboardingStats(onboardingRes.data);
        setLicenseStats(licenseRes.data);
      } catch (error) {
        console.error("Error fetching analytics data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userFilter, includeUnknown, dateRange]);

  const clearDateFilter = () => {
    setDateRange(undefined);
    setIsFilteringByDate(false);
    setActiveDatePreset("all");
  };

  const handleCustomDateChange = (range: DateRange | undefined) => {
    setDateRange(range);
    if (range?.from) {
      setActiveDatePreset("custom");
    }
  };

  const renderCompletionPieChart = () => {
    if (!onboardingStats) return null;

    const data = [
      { name: "Completed", value: onboardingStats.filledOnboarding },
      { name: "Skipped", value: onboardingStats.skippedOnboarding },
    ];

    return (
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) =>
              `${name}: ${(percent * 100).toFixed(0)}%`
            }
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    );
  };

  const renderBarChart = (
    data: { name: string; count: number }[],
    title: string,
  ) => {
    if (!data || data.length === 0) return null;

    // Sort data by count in descending order and take top 10
    const sortedData = [...data].sort((a, b) => b.count - a.count).slice(0, 10);

    return (
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={sortedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        <span className="ml-2 text-gray-500">Loading analytics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold">User Analytics</h2>
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={activeDatePreset === "7d" ? "default" : "outline"}
              size="sm"
              onClick={() => applyDatePreset("7d")}
            >
              Last 7 days
            </Button>
            <Button
              variant={activeDatePreset === "30d" ? "default" : "outline"}
              size="sm"
              onClick={() => applyDatePreset("30d")}
            >
              Last 30 days
            </Button>
            <Button
              variant={activeDatePreset === "90d" ? "default" : "outline"}
              size="sm"
              onClick={() => applyDatePreset("90d")}
            >
              Last 90 days
            </Button>
            <Button
              variant={activeDatePreset === "180d" ? "default" : "outline"}
              size="sm"
              onClick={() => applyDatePreset("180d")}
            >
              Last 180 days
            </Button>
            <Button
              variant={activeDatePreset === "360d" ? "default" : "outline"}
              size="sm"
              onClick={() => applyDatePreset("360d")}
            >
              Last 360 days
            </Button>
            <Button
              variant={activeDatePreset === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => applyDatePreset("all")}
            >
              All time
            </Button>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={
                    activeDatePreset === "custom" ? "default" : "outline"
                  }
                  size="sm"
                  className="flex items-center"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from && activeDatePreset === "custom" ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "LLL dd, y")} -{" "}
                        {format(dateRange.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Custom range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  selected={dateRange}
                  onSelect={handleCustomDateChange}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="includeUnknown"
              checked={includeUnknown}
              onCheckedChange={(checked) =>
                setIncludeUnknown(checked as boolean)
              }
            />
            <Label htmlFor="includeUnknown">Include Unknown Sources</Label>
          </div>
          <Select value={userFilter} onValueChange={setUserFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by user type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Users</SelectItem>
              <SelectItem value="paid">Paid Users</SelectItem>
              <SelectItem value="free">Free Users</SelectItem>
              <SelectItem value="refunded">Refunded Users</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isFilteringByDate && (
        <div className="bg-muted p-3 rounded-md text-sm flex items-center justify-between">
          <span>
            {activeDatePreset !== "custom" ? (
              <>
                Showing data for last{" "}
                {activeDatePreset === "7d"
                  ? "7 days"
                  : activeDatePreset === "30d"
                    ? "30 days"
                    : activeDatePreset === "90d"
                      ? "90 days"
                      : activeDatePreset === "180d"
                        ? "180 days"
                        : "360 days"}
              </>
            ) : (
              <>
                Showing data for period:{" "}
                {dateRange?.from && format(dateRange.from, "MMMM d, yyyy")}
                {dateRange?.to && ` to ${format(dateRange.to, "MMMM d, yyyy")}`}
              </>
            )}
          </span>
          <Button variant="ghost" size="sm" onClick={clearDateFilter}>
            Clear Filter
          </Button>
        </div>
      )}

      <Tabs defaultValue="onboarding">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="onboarding">Onboarding Insights</TabsTrigger>
          <TabsTrigger value="licenses">License Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="onboarding" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>Onboarding Completion</CardTitle>
                <CardDescription>
                  {onboardingStats &&
                    `Total Users: ${onboardingStats.totalUsers}`}
                </CardDescription>
              </CardHeader>
              <CardContent>{renderCompletionPieChart()}</CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <span className="font-medium">Total Users:</span>{" "}
                    {onboardingStats?.totalUsers}
                  </div>
                  <div>
                    <span className="font-medium">Completed Onboarding:</span>{" "}
                    {onboardingStats?.filledOnboarding} (
                    {onboardingStats && onboardingStats.totalUsers > 0
                      ? (
                          (onboardingStats.filledOnboarding /
                            onboardingStats.totalUsers) *
                          100
                        ).toFixed(1)
                      : 0}
                    %)
                  </div>
                  <div>
                    <span className="font-medium">Skipped Onboarding:</span>{" "}
                    {onboardingStats?.skippedOnboarding} (
                    {onboardingStats && onboardingStats.totalUsers > 0
                      ? (
                          (onboardingStats.skippedOnboarding /
                            onboardingStats.totalUsers) *
                          100
                        ).toFixed(1)
                      : 0}
                    %)
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>User Acquisition Sources</CardTitle>
              <CardDescription>How users found Olly</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={
                    onboardingStats?.referralSources
                      .sort((a, b) => b.count - a.count)
                      .slice(0, 15) || []
                  }
                  margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    height={70}
                    interval={0}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#82ca9d" name="Users" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {renderBarChart(onboardingStats?.industries || [], "Industries")}
            {renderBarChart(onboardingStats?.roles || [], "Roles")}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {renderBarChart(
              onboardingStats?.platforms || [],
              "Primary Platforms",
            )}
            {renderBarChart(
              onboardingStats?.businessTypes || [],
              "Business Types",
            )}
          </div>
        </TabsContent>

        <TabsContent value="licenses" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>License Status</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={[
                        {
                          name: "Active",
                          value: licenseStats?.activeLicenses || 0,
                        },
                        {
                          name: "Inactive",
                          value: licenseStats?.inactiveLicenses || 0,
                        },
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      <Cell fill="#4CAF50" />
                      <Cell fill="#F44336" />
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {renderBarChart(
              licenseStats?.byVendor.map((item) => ({
                name: item.vendor,
                count: item.count,
              })) || [],
              "Licenses by Vendor",
            )}
            {renderBarChart(
              licenseStats?.byTier.map((item) => ({
                name: item.tier,
                count: item.count,
              })) || [],
              "Licenses by Tier",
            )}
          </div>

          {userFilter !== "all" && licenseStats?.usersByTier && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>
                  {userFilter === "paid"
                    ? "Paid Users by Tier"
                    : userFilter === "refunded"
                      ? "Refunded Users by Tier"
                      : "Free Users by Tier"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={licenseStats.usersByTier.map((item) => ({
                      name: item.tier,
                      count: item.count,
                    }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Top Plans</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={
                    licenseStats?.topPlans.map((item) => ({
                      name: item.plan,
                      count: item.count,
                    })) || []
                  }
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

