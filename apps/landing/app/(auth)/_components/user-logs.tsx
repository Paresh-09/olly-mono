// usage-logs.tsx
'use client';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from "@repo/ui/components/ui/card";
import { Activity, Chrome } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/components/ui/tabs";
import { Skeleton } from "@repo/ui/components/ui/skeleton";

// Import shadcn chart components
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from '@repo/ui/components/ui/chart';

interface PlatformData {
  [action: string]: number;
}

interface UsageLog {
  date: string;
  hour?: string;
  display?: string;
  total: number;
  auto_commenter?: number;
  licenseKeys?: string[];
  [platform: string]: number | string | PlatformData | string[] | undefined;
}

interface UsageLogsProps {
  usageLogs: {
    date: string;
    hour?: string;
    display?: string;
    total: number;
    auto_commenter?: number;
    licenseKeys?: string[];
    [key: string]: number | string | Record<string, number> | string[] | undefined;
  }[];
  licenseKeys: string[];
  licenses: {
    licenseKey: {
      id: string;
      key: string;
      isActive: boolean;
    };
  }[];
  subLicenses?: {
    id: string;
    key: string;
    status: string;
    organization?: {
      name: string;
    };
  }[];
  isLoading?: boolean;
  selectedLicense?: string;
  onLicenseChange?: (license: string) => void;
}

function formatAction(action: string): string {
  return action
    .split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

export default function UsageLogs({
  usageLogs,
  licenseKeys,
  licenses,
  subLicenses,
  isLoading: initialLoading,
  selectedLicense = "all",
  onLicenseChange
}: UsageLogsProps) {
  const [isLoading, setIsLoading] = useState<boolean>(initialLoading || false);
  const platforms = ["linkedin", "twitter", "instagram", "reddit", "producthunt"];

  // Detect if we are showing hourly data
  const isHourlyData = usageLogs.length > 0 && usageLogs[0].hour !== undefined;

  // Handle license selection changes
  const handleLicenseChange = (value: string) => {
    if (onLicenseChange) {
      onLicenseChange(value);
    }
  };

  // Set loading state based on props
  useEffect(() => {
    setIsLoading(initialLoading || false);
  }, [initialLoading]);

  // Transform data for the chart
  const data = usageLogs.map((log) => {
    const entry: UsageLog = {
      fullDate: log.date,
      date: '',
      total: log.total,
      auto_commenter: log.auto_commenter || 0,
      licenseKeys: log.licenseKeys || [],
    };

    // Format date
    if (isHourlyData && log.display) {
      entry.date = log.display as string;
    } else {
      const dateObj = new Date(log.date);
      entry.date = dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    }

    // Process ALL platform data, not just predefined ones
    Object.keys(log).forEach(key => {
      // Skip non-platform keys
      if (['date', 'total', 'auto_commenter', 'licenseKeys', 'hour', 'display', 'fullDate'].includes(key)) {
        return;
      }

      // Handle platform data
      if (typeof log[key] === 'object' && log[key] !== null) {
        const platformData = log[key] as Record<string, number>;
        // Sum up all action counts for this platform
        const total = Object.values(platformData).reduce((sum, count) => sum + count, 0);
        entry[key] = total;
      }
    });

    return entry;
  });

  // Sort and filter data
  data.sort((a, b) => new Date(a.fullDate as string).getTime() - new Date(b.fullDate as string).getTime());

  // Since the API now handles license filtering, we don't need client-side filtering
  // The data coming from usageLogs is already filtered based on the selected license
  const filteredData = data;

  // Check if there's any data to display
  const hasAutoCommenterData = filteredData.some(item => item.auto_commenter && item.auto_commenter > 0);

  // Find all platforms that have data
  const allPlatformsInData = new Set<string>();
  filteredData.forEach(item => {
    Object.keys(item).forEach(key => {
      // Check if it's a platform key (not one of our special keys)
      if (!['date', 'total', 'auto_commenter', 'licenseKeys', 'fullDate'].includes(key) &&
        typeof item[key] === 'number' && (item[key] as number) > 0) {
        allPlatformsInData.add(key);
      }
    });
  });

  // Check if there's any displayable data
  const hasDisplayableData = filteredData.length > 0 && filteredData.some(item => {
    // Check if any item has a total > 0 or any platform data > 0
    if (item.total > 0) return true;
    if (item.auto_commenter && item.auto_commenter > 0) return true;

    // Check platform data
    return Object.keys(item).some(key => {
      if (['date', 'total', 'auto_commenter', 'licenseKeys', 'fullDate'].includes(key)) {
        return false;
      }
      return typeof item[key] === 'number' && (item[key] as number) > 0;
    });
  });

  // Prepare chart data
  const chartData = filteredData.map(item => {
    // Start with the date
    const chartItem: Record<string, any> = {
      date: item.date,
    };

    // Add each platform's data with proper capitalization
    allPlatformsInData.forEach(platform => {
      const capitalizedPlatform = platform.charAt(0).toUpperCase() + platform.slice(1);
      chartItem[capitalizedPlatform] = typeof item[platform] === 'number' ? item[platform] : 0;
    });

    // Add auto commenter if it exists
    if (hasAutoCommenterData) {
      chartItem['Auto-Commenter'] = typeof item.auto_commenter === 'number' ? item.auto_commenter : 0;
    }

    return chartItem;
  });

  // Display loading skeleton
  if (isLoading) {
    return (
      <Card className="shadow-none border-0">
        <CardHeader className="py-2 px-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-8 w-[180px]" />
          </div>
        </CardHeader>
        <CardContent className="px-0 pb-2 pt-0">
          <div className="px-4 mb-2">
            <Skeleton className="h-8 w-full" />
          </div>
          <div className="h-[400px] px-4">
            <div className="h-full w-full flex flex-col space-y-4">
              <Skeleton className="h-8 w-full" />
              <div className="flex space-x-2 items-end h-40">
                <Skeleton className="h-[30%] w-6" />
                <Skeleton className="h-[60%] w-6" />
                <Skeleton className="h-[40%] w-6" />
                <Skeleton className="h-[80%] w-6" />
                <Skeleton className="h-[50%] w-6" />
                <Skeleton className="h-[70%] w-6" />
                <Skeleton className="h-[90%] w-6" />
              </div>
              <Skeleton className="h-8 w-full" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Always show the card with header (including license selector)
  const showEmptyState = !filteredData.length || !hasDisplayableData;

  // Define chart categories and colors based on discovered platforms
  const categories = Array.from(allPlatformsInData).map(platform =>
    platform.charAt(0).toUpperCase() + platform.slice(1)
  );
  if (hasAutoCommenterData) categories.push('Auto-Commenter');

  // Generate colors for each platform
  const defaultColors = {
    linkedin: "#0066CC",
    twitter: "#1A91DA",
    instagram: "#D6336C",
    reddit: "#E62F17",
    producthunt: "#DA552F",
    facebook: "#4267B2",
    youtube: "#FF0000",
    tiktok: "#000000",
    pinterest: "#E60023",
    "auto-commenter": "#7C3AED"
  };

  // Dynamic colors object
  const colors: Record<string, string> = {};
  categories.forEach(category => {
    const lowerCaseCategory = category.toLowerCase();
    // Use the default color if available, otherwise generate a color
    colors[category] = defaultColors[lowerCaseCategory as keyof typeof defaultColors] ||
      `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
  });

  // Create chart config for shadcn
  const chartConfig: ChartConfig = categories.reduce((config, category) => {
    config[category] = {
      label: category.replace(/([a-z])([A-Z])/g, '$1 $2'), // Add space between camelCase
      color: colors[category],
    };
    return config;
  }, {} as ChartConfig);

  // If we have data, show the graph
  return (
    <Card className="shadow-none border-0">
      <CardHeader className="py-2 px-4">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium">
            Total: <span className="text-blue-600">{filteredData.reduce((sum, log) => sum + log.total, 0).toLocaleString()}</span>
          </div>
          <Select value={selectedLicense} onValueChange={handleLicenseChange}>
            <SelectTrigger className="w-[180px] h-8 text-xs">
              <SelectValue placeholder="Select license" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Licenses</SelectItem>
              {licenses?.filter(l => l.licenseKey.isActive).map((license) => (
                <SelectItem key={license.licenseKey.id} value={license.licenseKey.key}>
                  Main: {license.licenseKey.key.slice(0, 8)}...
                </SelectItem>
              ))}
              {subLicenses?.filter(s => s.status === 'ACTIVE').map((subLicense) => (
                <SelectItem key={subLicense.id} value={subLicense.key}>
                  {subLicense.organization?.name ?
                    `Team: ${subLicense.organization.name}` :
                    `Team: ${subLicense.key.slice(0, 8)}...`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="px-0 pb-2 pt-0">
        {!hasDisplayableData ? (
          <div className="h-[400px] flex items-center justify-center">
            <div className="text-center">
              <div className="text-gray-400 mb-2">
                <Activity className="h-12 w-12 mx-auto" />
              </div>
              <p className="text-sm text-gray-500">
                {selectedLicense === "all"
                  ? "No usage data available for the selected period"
                  : "No usage data available for this license in the selected period"}
              </p>
              <p className="text-xs text-gray-400 mt-1">Data will appear here once you start using the extension</p>
            </div>
          </div>
        ) : (
          <Tabs defaultValue="line" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-2 px-4">
              <TabsTrigger value="line">Line</TabsTrigger>
              <TabsTrigger value="bar">Bar</TabsTrigger>
            </TabsList>
            <TabsContent value="line" className="mt-0">
              <div className="h-[400px] w-full px-4">
                <ChartContainer config={chartConfig}>
                  <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 12 }}
                      width={40}
                    />
                    <ChartTooltip 
                      content={<ChartTooltipContent 
                        formatter={(value, name) => [
                          `${name?.toString().replace(/([a-z])([A-Z])/g, '$1 $2').replace('-', ' ')} ${value}`,
                          ''
                        ]}
                        labelFormatter={(label) => label}
                      />} 
                    />
                    <ChartLegend 
                      content={<ChartLegendContent />}
                      verticalAlign="top"
                      height={36}
                    />
                    {categories.map((category) => (
                      <Line
                        key={category}
                        type="monotone"
                        dataKey={category}
                        stroke={`var(--color-${category})`}
                        strokeWidth={2.5}
                        dot={false}
                        activeDot={{ r: 6, style: { fill: `var(--color-${category})`, opacity: 0.8 } }}
                      />
                    ))}
                  </LineChart>
                </ChartContainer>
              </div>
            </TabsContent>
            <TabsContent value="bar" className="mt-0">
              <div className="h-[400px] w-full px-4">
                <ChartContainer config={chartConfig}>
                  <BarChart accessibilityLayer data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="date"
                      tickLine={false}
                      tickMargin={10}
                      axisLine={false}
                      tick={{ fontSize: 12 }}
                    />
                    <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                    <ChartLegend 
                      content={<ChartLegendContent />}
                      verticalAlign="top"
                      height={36}
                    />
                    {categories.map((category, index) => (
                      <Bar
                        key={category}
                        dataKey={category}
                        stackId="a"
                        fill={`var(--color-${category})`}
                        radius={index === 0 ? [0, 0, 4, 4] : index === categories.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                      />
                    ))}
                  </BarChart>
                </ChartContainer>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}