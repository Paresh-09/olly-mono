'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@repo/ui/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/components/ui/select';
import { Alert, AlertDescription } from '@repo/ui/components/ui/alert';
import { Button } from '@repo/ui/components/ui/button';
import { Badge } from '@repo/ui/components/ui/badge';
import { 
  CalendarDays, Users, Activity, Layers, MonitorSmartphone, 
  GitBranch, AlertCircle, Filter, RefreshCw, History, Lock
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Legend
} from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from '@repo/ui/components/ui/chart';
import { format } from 'date-fns';
import { DateRangePicker } from '@repo/ui/components/ui/date-range-picker';
import { Skeleton } from '@repo/ui/components/ui/skeleton';

// Types
interface PlatformData {
  [platform: string]: number;
}

interface ActionData {
  [action: string]: number;
}

interface SubLicenseData {
  [id: string]: number;
}

interface DailyUsage {
  date: string;
  count: number;
}

interface SubLicense {
  id: string;
  key: string;
  status: string;
  activationCount: number;
  assignedEmail: string | null;
  usage?: number;
  mainLicenseKey: {
    id: string;
    tier: number | null;
    vendor: string;
    lemonProductId: number | null;
  };
}

interface AnalyticsSummary {
  byPlatform: PlatformData;
  byAction: ActionData;
  bySubLicense: SubLicenseData;
  total: number;
  dailyUsage: DailyUsage[];
}

interface AnalyticsData {
  analytics: AnalyticsSummary;
  subLicenses: SubLicense[];
  subLicenseCount: number;
}

interface AnalyticsDashboardProps {
  initialData: AnalyticsData | null;
  initialStartDate: Date;
  initialEndDate: Date;
  licenseKeys: string[];
  hasTeamPlan: boolean;
}

const COLORS = ['#0891b2', '#2dd4bf', '#fbbf24', '#f87171', '#a78bfa', '#f472b6'];

const chartConfig: ChartConfig = {
  count: {
    label: "Usage Count",
    color: "#0891b2",
  },
  value: {
    label: "Value",
    color: "#0891b2",
  },
} satisfies ChartConfig;

export default function AnalyticsDashboard({ 
  initialData, 
  initialStartDate, 
  initialEndDate, 
  licenseKeys,
  hasTeamPlan 
}: AnalyticsDashboardProps) {
  // States
  const [data, setData] = useState<AnalyticsData | null>(initialData);
  const [startDate, setStartDate] = useState<Date>(initialStartDate);
  const [endDate, setEndDate] = useState<Date>(initialEndDate);
  const [selectedLicenseKey, setSelectedLicenseKey] = useState(licenseKeys[0]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedSubLicense, setSelectedSubLicense] = useState<string>('all');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [selectedAction, setSelectedAction] = useState<string>('all');
  const [error, setError] = useState<string | null>(null);

  // Fetch Data
  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const queryParams = new URLSearchParams({
        licenseKey: selectedLicenseKey,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        ...(selectedSubLicense !== 'all' && { subLicense: selectedSubLicense }),
        ...(selectedPlatform !== 'all' && { platform: selectedPlatform }),
        ...(selectedAction !== 'all' && { action: selectedAction })
      });

      const response = await fetch(`/api/analytics/team?${queryParams}`);
      if (!response.ok) throw new Error('Failed to fetch analytics data');
      
      const jsonData: AnalyticsData = await response.json();
      setData(jsonData);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [selectedLicenseKey, startDate, endDate, selectedSubLicense, selectedPlatform, selectedAction]);

  // Memoized Data Transformations
  const chartData = useMemo(() => {
    if (!data) return null;

    return {
      platforms: Object.entries(data.analytics.byPlatform).map(([name, value]) => ({
        name,
        value
      })),
      actions: Object.entries(data.analytics.byAction).map(([name, value]) => ({
        name,
        value
      })),
      subLicenses: Object.entries(data.analytics.bySubLicense).map(([id, value]) => {
        const license = data.subLicenses.find(l => l.id === id);
        return {
          name: license?.assignedEmail ? `${license.assignedEmail} (${license.key})` : license?.key || id,
          value
        };
      })
    };
  }, [data]);

  const formatSelectedSubLicense = (value: string) => {
    if (value === 'all') return "All Sublicenses";
    
    const license = data?.subLicenses.find(l => l.id === value);
    if (!license) return value;
  
    return license.assignedEmail || license.key;
  };

  // Filters Section
  const renderFilters = () => (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardContent className="pt-6">
          <Select value={selectedLicenseKey} onValueChange={setSelectedLicenseKey}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select License Key" />
            </SelectTrigger>
            <SelectContent>
              {licenseKeys.map((key) => (
                <SelectItem key={key} value={key}>
                  {key}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <DateRangePicker
            date={{ from: startDate, to: endDate }}
            onDateChange={(dateRange?: { from?: Date; to?: Date }) => {
              if (dateRange) {
                const { from, to } = dateRange;
                if (from) setStartDate(from);
                if (to) setEndDate(to);
              }
            }}
          />
        </CardContent>
      </Card>

      <Card>
      <CardContent className="pt-6">
        <div className="flex space-x-2">
          <Select 
            value={selectedSubLicense} 
            onValueChange={setSelectedSubLicense}
            disabled={loading || !hasTeamPlan}
          >
            <SelectTrigger className="w-full">
              <SelectValue>
                {!hasTeamPlan ? (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Lock className="h-3 w-3" />
                    Team Members
                  </div>
                ) : (
                  formatSelectedSubLicense(selectedSubLicense)
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {hasTeamPlan ? (
                <>
                  <SelectItem value="all">All Team Members</SelectItem>
                  {data?.subLicenses.map((license) => (
                    <SelectItem key={license.id} value={license.id}>
                      {license.assignedEmail || license.key.slice(0, 8)}
                    </SelectItem>
                  ))}
                </>
              ) : (
                <SelectItem value="locked" disabled>
                  Upgrade to Team Plan
                </SelectItem>
              )}
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            size="icon"
            onClick={fetchAnalytics}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardContent>
    </Card>
    </div>
  );

  const NoDataDisplay = () => (
    <div className="h-full flex items-center justify-center">
      <div className="text-center">
        <p className="text-muted-foreground">No data available for the selected period</p>
        <p className="text-sm text-muted-foreground mt-1">Try adjusting your filters or date range</p>
      </div>
    </div>
  );

  const LoadingChart = () => (
    <div className="h-80 flex items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Loading data...</p>
      </div>
    </div>
  );

  const renderDetailedAnalysis = () => {
    if (!data) return null;

    if (!data || !chartData) return null;

    // Safely check for subLicense data
    const hasData = data.analytics.total > 0;
    const hasSubLicenseData = Boolean(chartData.subLicenses?.length);
    const hasPlatformData = Boolean(chartData.platforms?.length);
    const hasActionData = Boolean(chartData.actions?.length);
    
    return (
      <div className="space-y-6">
        {/* Daily Usage Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Usage Trends</CardTitle>
            <CardDescription>Usage patterns over time</CardDescription>
          </CardHeader>
          <CardContent className="h-[400px]">
            {loading ? (
              <LoadingChart />
            ) : !hasData ? (
              <NoDataDisplay />
            ) : (
              <ChartContainer config={chartConfig}>
                <LineChart data={data.analytics.dailyUsage}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(date) => format(new Date(date), 'MMM dd')}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    tickLine={false}
                    axisLine={false}
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        labelFormatter={(date) => format(new Date(date), 'MMMM dd, yyyy')}
                      />
                    }
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke="var(--color-count)" 
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{ r: 6 }}
                    name="Usage Count"
                  />
                </LineChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
  
        {/* Usage by Sublicense */}
        <Card>
          <CardHeader>
            <CardTitle>Sublicense Usage Distribution</CardTitle>
            <CardDescription>Usage breakdown by team member</CardDescription>
          </CardHeader>
          <CardContent className="h-[400px]">
            {loading ? (
              <LoadingChart />
            ) : !hasSubLicenseData ? (
              <NoDataDisplay />
            ) : (

            <ChartContainer config={chartConfig}>
              <BarChart data={chartData?.subLicenses} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  type="number" 
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  width={150}
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar 
                  dataKey="value" 
                  fill="var(--color-value)"
                  radius={4}
                />
              </BarChart>
            </ChartContainer>
            )}
          </CardContent>
        </Card>
  
        {/* Platform Usage Details */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Platform Breakdown</CardTitle>
              <CardDescription>Detailed platform usage statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(data.analytics.byPlatform)
                  .sort(([, a], [, b]) => b - a)
                  .map(([platform, count], index) => (
                    <div key={platform} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="font-medium">{platform}</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span>{count.toLocaleString()}</span>
                        <span className="text-sm text-muted-foreground">
                          ({((count / data.analytics.total) * 100).toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
  
          {/* Action Type Details */}
          <Card>
            <CardHeader>
              <CardTitle>Action Type Analysis</CardTitle>
              <CardDescription>Breakdown of different actions performed</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(data.analytics.byAction)
                  .sort(([, a], [, b]) => b - a)
                  .map(([action, count], index) => (
                    <div key={action} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="font-medium">{action}</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span>{count.toLocaleString()}</span>
                        <span className="text-sm text-muted-foreground">
                          ({((count / data.analytics.total) * 100).toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
  
        {/* Time-based Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Usage Patterns</CardTitle>
            <CardDescription>Analysis of usage patterns over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Add time-based metrics here */}
              <div className="grid gap-4 md:grid-cols-3">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-500">Peak Usage Day</p>
                  <p className="text-lg font-semibold mt-1">
                    {data?.analytics?.dailyUsage?.reduce(
                      (max, day) => day.count > max.count ? day : max,
                      data?.analytics?.dailyUsage?.[0]
                    )?.date ? format(new Date(data.analytics.dailyUsage.reduce(
                      (max, day) => day.count > max.count ? day : max,
                      data.analytics.dailyUsage[0]
                    ).date), 'MMMM dd') : 'N/A'}
                  </p>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-500">Average Daily Usage</p>
                  <p className="text-lg font-semibold mt-1">
                    {Math.round(data?.analytics?.total / (data?.analytics?.dailyUsage?.filter(day => day.count > 0).length || 1)).toLocaleString()}
                  </p>
                </div>
  
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-500">Active Days</p>
                  <p className="text-lg font-semibold mt-1">
                    {data?.analytics?.dailyUsage?.filter(day => day.count > 0).length} days
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Overview Cards
  const renderOverviewCards = () => (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Usage</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {data?.analytics.total.toLocaleString() || 0}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Sublicenses</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {data?.subLicenses.filter(l => l.status === 'ACTIVE').length || 0}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Platforms</CardTitle>
          <MonitorSmartphone className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {Object.keys(data?.analytics.byPlatform || {}).length}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Actions</CardTitle>
          <Layers className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {Object.keys(data?.analytics.byAction || {}).length}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Charts
  const renderCharts = () => (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Platform Distribution</CardTitle>
          <CardDescription>Usage breakdown by platform</CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          {loading ? (
            <LoadingChart />
          ) : !chartData?.platforms.length ? (
            <NoDataDisplay />
          ) : (
            <ChartContainer config={chartConfig}>
              <PieChart data={chartData?.platforms}>
                <Pie data={chartData?.platforms} dataKey="value" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} fill="#8884d8" label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                  {chartData?.platforms.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
              </PieChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Usage by Action</CardTitle>
          <CardDescription>Actions performed over time</CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          {loading ? (
            <LoadingChart />
          ) : !chartData?.platforms.length ? (
            <NoDataDisplay />
          ) : (
            <ChartContainer config={chartConfig}>
              <BarChart data={chartData?.actions} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  type="number" 
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  width={120}
                  tickLine={false}
                  axisLine={false}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar 
                  dataKey="value" 
                  fill="var(--color-value)"
                  radius={4}
                />
              </BarChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );

  // Sublicenses Section
  const renderSublicenses = () => (
    <div className="space-y-4">
      {loading ? (
        Array(3).fill(0).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="space-y-3">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-1/4" />
              </div>
            </CardContent>
          </Card>
        ))
      ) : (
        data?.subLicenses.map((license) => (
          <Card key={license.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{license.key}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge variant={license.status === 'ACTIVE' ? 'default' : 'secondary'}>
                      {license.status}
                    </Badge>
                    {license.assignedEmail && (
                      <span className="text-sm text-muted-foreground">
                        {license.assignedEmail}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm">
                    <span className="font-medium">Usage: </span>
                    {license.usage?.toLocaleString() || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium">Activations: </span>
                    {license.activationCount}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );

  const renderChartSkeleton = () => (
    <div className="h-[350px] w-full space-y-4 p-4">
      <div className="flex justify-between items-center">
        <div className="h-6 w-1/4 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-6 w-1/6 bg-gray-200 rounded animate-pulse"></div>
      </div>
      <div className="h-[300px] w-full pt-8 flex flex-col justify-between">
        <div className="w-full h-1 bg-gray-100"></div>
        <div className="w-full h-1 bg-gray-100"></div>
        <div className="w-full h-1 bg-gray-100"></div>
        <div className="w-full h-1 bg-gray-100"></div>
        <div className="w-full h-1 bg-gray-100"></div>
        
        <div className="flex h-[200px] w-full px-6 items-end space-x-10">
          <div className="h-[40%] w-6 bg-blue-100 rounded-t animate-pulse"></div>
          <div className="h-[65%] w-6 bg-blue-100 rounded-t animate-pulse"></div>
          <div className="h-[85%] w-6 bg-blue-100 rounded-t animate-pulse"></div>
          <div className="h-[55%] w-6 bg-blue-100 rounded-t animate-pulse"></div>
          <div className="h-[70%] w-6 bg-blue-100 rounded-t animate-pulse"></div>
          <div className="h-[90%] w-6 bg-blue-100 rounded-t animate-pulse"></div>
        </div>
        
        <div className="w-full h-1 bg-gray-100"></div>
      </div>
      <div className="flex justify-between pt-4">
        <div className="h-4 w-1/12 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-4 w-1/12 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-4 w-1/12 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-4 w-1/12 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-4 w-1/12 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-4 w-1/12 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-4 w-1/12 bg-gray-200 rounded animate-pulse"></div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-2 sm:px-4 py-2 sm:py-4 max-w-7xl">
      <div className="space-y-2 sm:space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-lg font-medium">Team Analytics</h2>
          <div className="flex items-center gap-2">
            <DateRangePicker
              date={{ from: startDate, to: endDate }}
              onDateChange={(dateRange?: { from?: Date; to?: Date }) => {
                if (dateRange) {
                  const { from, to } = dateRange;
                  if (from) setStartDate(from);
                  if (to) setEndDate(to);
                }
              }}
            />
            <Button 
              variant="outline" 
              size="icon"
              onClick={fetchAnalytics}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 sm:gap-4">
          <Card className="border-0 bg-white lg:col-span-8">
            <CardContent className="p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between mb-3">
                <div className="text-sm font-medium">
                  Total Actions: <span className="text-blue-600">{data?.analytics.total.toLocaleString() || 0}</span>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  <Select value={selectedLicenseKey} onValueChange={setSelectedLicenseKey}>
                    <SelectTrigger className="w-full sm:w-[200px] h-9 text-sm">
                      <SelectValue placeholder="Select license" />
                    </SelectTrigger>
                    <SelectContent>
                      {licenseKeys.map((key) => {
                        const foundLicense = data?.subLicenses?.find(l => l?.mainLicenseKey?.id === key);
                        const isTeam = foundLicense?.mainLicenseKey?.tier && [2, 3, 4, 7].includes(foundLicense.mainLicenseKey.tier);
                        return (
                          <SelectItem key={key} value={key}>
                            <div className="flex items-center gap-2">
                              <span>{key.slice(0, 8)}...</span>
                              {isTeam && (
                                <Badge variant="secondary" className="text-[10px] h-4 px-1 bg-blue-100 text-blue-700">
                                  TEAM
                                </Badge>
                              )}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  
                  <Select 
                    value={selectedSubLicense} 
                    onValueChange={setSelectedSubLicense}
                    disabled={loading || !hasTeamPlan}
                  >
                    <SelectTrigger className="w-full sm:w-[200px] h-9 text-sm">
                      <SelectValue>
                        {!hasTeamPlan ? (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Lock className="h-3 w-3" />
                            Team Members
                          </div>
                        ) : (
                          formatSelectedSubLicense(selectedSubLicense)
                        )}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {hasTeamPlan ? (
                        <>
                          <SelectItem value="all">All Team Members</SelectItem>
                          {data?.subLicenses.map((license) => (
                            <SelectItem key={license.id} value={license.id}>
                              {license.assignedEmail || license.key.slice(0, 8)}
                            </SelectItem>
                          ))}
                        </>
                      ) : (
                        <SelectItem value="locked" disabled>
                          Upgrade to Team Plan
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="w-full h-[350px]">
                {loading ? (
                  <div className="w-full h-full">
                    {renderChartSkeleton()}
                  </div>
                ) : (
                  <ChartContainer config={chartConfig}>
                    <LineChart 
                      data={data?.analytics.dailyUsage || []} 
                      margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="date"
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => format(new Date(value), 'MMM dd')}
                        tickMargin={10}
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => value.toLocaleString()}
                        domain={[0, 'auto']}
                        allowDecimals={false}
                        tickMargin={10}
                      />
                      <ChartTooltip
                        content={
                          <ChartTooltipContent
                            labelFormatter={(date) => format(new Date(date), 'MMMM dd, yyyy')}
                          />
                        }
                      />
                      <Line
                        type="monotone"
                        dataKey="count"
                        stroke="var(--color-count)"
                        strokeWidth={2.5}
                        dot={false}
                        activeDot={{
                          r: 6,
                          style: { fill: "var(--color-count)", opacity: 0.8 },
                        }}
                      />
                    </LineChart>
                  </ChartContainer>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-2 sm:space-y-4 lg:col-span-4">
            <Card className="border-0 bg-white">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-medium">Platform Breakdown</h2>
                </div>
                <div className="space-y-3">
                  {Object.entries(data?.analytics.byPlatform || {})
                    .sort(([, a], [, b]) => b - a)
                    .map(([platform, count], index) => (
                      <div key={platform} className="flex items-center justify-between py-1">
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-2 h-2 rounded-full" 
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <span className="text-sm font-medium">{platform}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm">{count.toLocaleString()}</span>
                          <span className="text-xs text-muted-foreground">
                            ({((count / (data?.analytics.total || 1)) * 100).toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 bg-white">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-medium">Action Types</h2>
                </div>
                <div className="space-y-3">
                  {Object.entries(data?.analytics.byAction || {})
                    .sort(([, a], [, b]) => b - a)
                    .map(([action, count], index) => (
                      <div key={action} className="flex items-center justify-between py-1">
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-2 h-2 rounded-full" 
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <span className="text-sm font-medium">{action}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm">{count.toLocaleString()}</span>
                          <span className="text-xs text-muted-foreground">
                            ({((count / (data?.analytics.total || 1)) * 100).toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}