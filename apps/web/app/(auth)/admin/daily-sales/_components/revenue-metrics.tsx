import { useState, useEffect } from 'react';
import { DateRange } from 'react-day-picker';
import { Card } from "@repo/ui/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/components/ui/tabs";
import { AreaChart, LineChart, BarChart, type CustomTooltipProps } from '@tremor/react';

interface RevenueData {
  totalRevenue: number;
  netRevenue: number;
  revenueByVendor: {
    appsumo: number;
    lemonsqueezy: number;
    other: number;
  };
  dailyRevenue: {
    date: string;
    revenue: number;
    netRevenue: number;
  }[];
  monthlyRevenue: {
    month: string;
    revenue: number;
    netRevenue: number;
  }[];
}

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
}

interface RevenueMetricsProps {
  dateRange?: DateRange;
}

function TotalRevenue({ dateRange }: RevenueMetricsProps) {
  const [data, setData] = useState<{ total: number; net: number } | null>(null);

  useEffect(() => {
    // Fetch total revenue data
    const fetchData = async () => {
      try {
        const params = new URLSearchParams();
        if (dateRange?.from) params.append('from', dateRange.from.toISOString());
        if (dateRange?.to) params.append('to', dateRange.to.toISOString());
        
        const response = await fetch(`/api/admin/analytics/revenue?${params}`);
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error('Error fetching revenue data:', error);
      }
    };

    fetchData();
  }, [dateRange]);

  if (!data) return <div>Loading...</div>;

  return (
    <div className="mt-2">
      <p className="text-2xl font-bold">${data.total.toLocaleString()}</p>
      <p className="text-sm text-muted-foreground">
        Net: ${data.net.toLocaleString()}
      </p>
    </div>
  );
}

function RevenueTrend({ dateRange }: RevenueMetricsProps) {
  const [data, setData] = useState<RevenueData['dailyRevenue']>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const params = new URLSearchParams();
        if (dateRange?.from) params.append('from', dateRange.from.toISOString());
        if (dateRange?.to) params.append('to', dateRange.to.toISOString());
        
        const response = await fetch(`/api/admin/analytics/revenue-trend?${params}`);
        const result = await response.json();
        setData(result.dailyRevenue);
      } catch (error) {
        console.error('Error fetching revenue trend:', error);
      }
    };

    fetchData();
  }, [dateRange]);

  if (!data || data.length === 0) {
    return (
      <div className="h-80 flex items-center justify-center">
        <p className="text-muted-foreground">No revenue data available</p>
      </div>
    );
  }

  return (
    <AreaChart
      className="h-80"
      data={data}
      index="date"
      categories={["revenue", "netRevenue"]}
      colors={["blue", "green"]}
      valueFormatter={(value: number) => `$${value.toLocaleString()}`}
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
            <p className="font-semibold">{new Date(payload[0].payload.date).toLocaleDateString()}</p>
            {payload.map((entry) => (
              <p key={entry.name} style={{ color: entry.color }}>
                {entry.name === 'revenue' ? 'Gross Revenue: ' : 'Net Revenue: '}
                ${(entry.value ?? 0).toLocaleString()}
              </p>
            ))}
          </div>
        );
      }}
    />
  );
}

function UsageMetrics({ type, dateRange }: { type: 'api' | 'license', dateRange?: DateRange }) {
  const [data, setData] = useState<UsageData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const params = new URLSearchParams();
        if (dateRange?.from) params.append('from', dateRange.from.toISOString());
        if (dateRange?.to) params.append('to', dateRange.to.toISOString());
        
        const response = await fetch(`/api/admin/analytics/${type}-usage?${params}`);
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error(`Error fetching ${type} usage:`, error);
      }
    };

    fetchData();
  }, [dateRange, type]);

  if (!data) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4">
          <h3 className="font-semibold text-sm text-muted-foreground">Total {type.toUpperCase()} Usage</h3>
          <p className="text-2xl font-bold mt-2">{data.total.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground">
            Last 10 Days: {data.last10Days.total.toLocaleString()}
          </p>
        </Card>
        {data.byPlatform && (
          <Card className="p-4">
            <h3 className="font-semibold text-sm text-muted-foreground">Top Platforms</h3>
            <div className="mt-2 space-y-1">
              {data.byPlatform.slice(0, 5).map(p => (
                <p key={p.platform}>
                  {p.platform}: {p.count.toLocaleString()}
                </p>
              ))}
            </div>
          </Card>
        )}
      </div>

      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">{type.toUpperCase()} Usage Over Time</h3>
        </div>
        <LineChart
          className="h-96"
          data={data.dailyUsage}
          index="date"
          categories={["count"]}
          colors={["purple"]}
          valueFormatter={(value) => value.toLocaleString()}
          yAxisWidth={60}
          showLegend={true}
          curveType="monotone"
          connectNulls={true}
          showAnimation={true}
          minValue={0}
          customTooltip={(props) => {
            const { payload, active } = props;
            if (!active || !payload || payload.length === 0) return null;
            const data = payload[0] as { payload: { date: string }, value: number };
            return (
              <div className="p-2 bg-white border rounded shadow-lg">
                <p className="font-semibold">{data.payload.date}</p>
                <p style={{ color: 'purple' }}>
                  Usage: {data.value.toLocaleString()}
                </p>
              </div>
            );
          }}
        />
      </Card>
    </div>
  );
}

export default function RevenueMetrics({ dateRange }: RevenueMetricsProps) {
  const [data, setData] = useState<RevenueData | null>(null);
  const [view, setView] = useState<'daily' | 'monthly'>('daily');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const params = new URLSearchParams();
        if (dateRange?.from) params.append('from', dateRange.from.toISOString());
        if (dateRange?.to) params.append('to', dateRange.to.toISOString());
        
        const response = await fetch(`/api/admin/analytics/revenue-all?${params}`);
        const result = await response.json();
        setData({
          totalRevenue: result.totalRevenue,
          netRevenue: result.netRevenue,
          revenueByVendor: result.revenueByVendor,
          dailyRevenue: result.dailyRevenue,
          monthlyRevenue: result.monthlyRevenue
        });
      } catch (error) {
        console.error('Error fetching revenue metrics:', error);
      }
    };

    fetchData();
  }, [dateRange]);

  if (!data) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4">
          <h3 className="font-semibold text-sm text-muted-foreground">Total Revenue</h3>
          <p className="text-2xl font-bold mt-2">${data.totalRevenue.toLocaleString()}</p>
        </Card>
        <Card className="p-4">
          <h3 className="font-semibold text-sm text-muted-foreground">Net Revenue</h3>
          <p className="text-2xl font-bold mt-2">${data.netRevenue.toLocaleString()}</p>
        </Card>
        <Card className="p-4">
          <h3 className="font-semibold text-sm text-muted-foreground">Revenue by Vendor</h3>
          <div className="mt-2 space-y-1">
            <p>AppSumo: ${data.revenueByVendor.appsumo.toLocaleString()}</p>
            <p>LemonSqueezy: ${data.revenueByVendor.lemonsqueezy.toLocaleString()}</p>
            <p>Other: ${data.revenueByVendor.other.toLocaleString()}</p>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">Revenue Over Time</h3>
          <Tabs value={view} onValueChange={(v) => setView(v as 'daily' | 'monthly')}>
            <TabsList>
              <TabsTrigger value="daily">Daily</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {view === 'daily' ? (
          <AreaChart
            className="h-96"
            data={data.dailyRevenue}
            index="date"
            categories={["revenue", "netRevenue"]}
            colors={["blue", "green"]}
            valueFormatter={(value) => `$${value.toLocaleString()}`}
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
                  <p className="font-semibold">{new Date(payload[0].payload.date).toLocaleDateString()}</p>
                  {payload.map((entry: any) => (
                    <p key={entry.name} style={{ color: entry.color }}>
                      {entry.name === 'revenue' ? 'Gross Revenue: ' : 'Net Revenue: '}
                      ${entry.value.toLocaleString()}
                    </p>
                  ))}
                </div>
              );
            }}
          />
        ) : (
          <BarChart
            className="h-96"
            data={data.monthlyRevenue}
            index="month"
            categories={["revenue", "netRevenue"]}
            colors={["blue", "green"]}
            valueFormatter={(value) => `$${value.toLocaleString()}`}
            yAxisWidth={60}
            showLegend={true}
            showGridLines={true}
            showAnimation={true}
            minValue={0}
            customTooltip={(props) => {
              const { payload, active } = props;
              if (!active || !payload || payload.length === 0) return null;
              return (
                <div className="p-2 bg-white border rounded shadow-lg">
                  <p className="font-semibold">{payload[0].payload.month}</p>
                  {payload.map((entry: any) => (
                    <p key={entry.name} style={{ color: entry.color }}>
                      {entry.name === 'revenue' ? 'Gross Revenue: ' : 'Net Revenue: '}
                      ${entry.value.toLocaleString()}
                    </p>
                  ))}
                </div>
              );
            }}
          />
        )}
      </Card>

      <div className="space-y-8">
        <UsageMetrics type="api" dateRange={dateRange} />
        <UsageMetrics type="license" dateRange={dateRange} />
      </div>
    </div>
  );
}

RevenueMetrics.TotalRevenue = TotalRevenue;
RevenueMetrics.RevenueTrend = RevenueTrend; 