import { useState, useEffect } from 'react';
import { DateRange } from 'react-day-picker';
import { Card } from "@repo/ui/components/ui/card";
import { AreaChart, BarChart } from '@tremor/react';

interface UsageData {
  total: number;
  dailyUsage: {
    date: string;
    count: number;
  }[];
  last10Days: {
    total: number;
    daily: {
      date: string;
      count: number;
    }[];
  };
  byPlatform?: {
    platform: string;
    count: number;
  }[];
  topUsers?: {
    userId: string;
    username: string;
    count: number;
  }[];
}

interface UsageTrackingMetricsProps {
  dateRange?: DateRange;
}

export default function UsageTrackingMetrics({ dateRange }: UsageTrackingMetricsProps) {
  const [apiData, setApiData] = useState<UsageData | null>(null);
  const [licenseData, setLicenseData] = useState<UsageData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const params = new URLSearchParams();
        if (dateRange?.from) params.append('from', dateRange.from.toISOString());
        if (dateRange?.to) params.append('to', dateRange.to.toISOString());
        
        const [apiResponse, licenseResponse] = await Promise.all([
          fetch(`/api/admin/analytics/api-usage?${params}`),
          fetch(`/api/admin/analytics/license-usage?${params}`)
        ]);

        const [apiResult, licenseResult] = await Promise.all([
          apiResponse.json(),
          licenseResponse.json()
        ]);

        setApiData(apiResult);
        setLicenseData(licenseResult);
      } catch (error) {
        console.error('Error fetching usage data:', error);
      }
    };

    fetchData();
  }, [dateRange]);

  if (!apiData || !licenseData) return <div>Loading...</div>;

  // Combine API and License usage data for the chart
  const combinedUsageData = apiData.dailyUsage.map(apiDay => {
    const licenseDay = licenseData.dailyUsage.find(ld => ld.date === apiDay.date);
    return {
      date: apiDay.date,
      'API Calls': apiDay.count,
      'License Usage': licenseDay?.count || 0
    };
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4">
          <h3 className="font-semibold text-sm text-muted-foreground">API Usage</h3>
          <p className="text-2xl font-bold mt-2">{apiData.total.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground">
            Last 10 Days: {apiData.last10Days.total.toLocaleString()}
          </p>
          {apiData.topUsers && apiData.topUsers.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">Top API Users</h4>
              <div className="space-y-1">
                {apiData.topUsers.slice(0, 3).map(user => (
                  <p key={user.userId} className="text-sm text-muted-foreground">
                    {user.username}: {user.count.toLocaleString()}
                  </p>
                ))}
              </div>
            </div>
          )}
        </Card>
        <Card className="p-4">
          <h3 className="font-semibold text-sm text-muted-foreground">License Usage</h3>
          <p className="text-2xl font-bold mt-2">{licenseData.total.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground">
            Last 10 Days: {licenseData.last10Days.total.toLocaleString()}
          </p>
          {licenseData.topUsers && licenseData.topUsers.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">Top License Users</h4>
              <div className="space-y-1">
                {licenseData.topUsers.slice(0, 3).map(user => (
                  <p key={user.userId} className="text-sm text-muted-foreground">
                    {user.username}: {user.count.toLocaleString()}
                  </p>
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">Usage Trends</h3>
        </div>
        <AreaChart
          className="h-96"
          data={combinedUsageData}
          index="date"
          categories={["API Calls", "License Usage"]}
          colors={["purple", "indigo"]}
          valueFormatter={(value) => value.toLocaleString()}
          yAxisWidth={60}
          showLegend={true}
          showGridLines={true}
          showAnimation={true}
          minValue={0}
          stack={false}
          startEndOnly={false}
          showXAxis={true}
          showYAxis={true}
          customTooltip={(props) => {
            const { payload, active } = props;
            if (!active || !payload || payload.length === 0) return null;
            return (
              <div className="p-2 bg-white border rounded shadow-lg">
                <p className="font-semibold">{payload[0].payload.date}</p>
                {payload.map((entry: any) => (
                  <p key={entry.name} style={{ color: entry.color }}>
                    {entry.name}: {entry.value.toLocaleString()}
                  </p>
                ))}
              </div>
            );
          }}
        />
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Top API Users</h3>
          {apiData.topUsers && (
            <BarChart
              className="h-72"
              data={apiData.topUsers.slice(0, 5)}
              index="username"
              categories={["count"]}
              colors={["purple"]}
              valueFormatter={(value) => value.toLocaleString()}
              yAxisWidth={60}
              showLegend={false}
              showGridLines={true}
              showAnimation={true}
            />
          )}
        </Card>
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Top License Users</h3>
          {licenseData.topUsers && (
            <BarChart
              className="h-72"
              data={licenseData.topUsers.slice(0, 5)}
              index="username"
              categories={["count"]}
              colors={["indigo"]}
              valueFormatter={(value) => value.toLocaleString()}
              yAxisWidth={60}
              showLegend={false}
              showGridLines={true}
              showAnimation={true}
            />
          )}
        </Card>
      </div>
    </div>
  );
} 