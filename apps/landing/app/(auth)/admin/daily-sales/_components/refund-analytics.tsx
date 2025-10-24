import { useState, useEffect } from 'react';
import { DateRange } from 'react-day-picker';
import { Card } from "@repo/ui/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/components/ui/tabs";
import { LineChart, BarChart, DonutChart } from '@tremor/react';

interface RefundData {
  total: number;
  revenue: number;
  refundRate: number;
  byVendor: {
    appsumo: number;
    lemonsqueezy: number;
    other: number;
  };
  dailyTrend: {
    date: string;
    refunds: number;
    revenue: number;
    rate: number;
  }[];
  monthlyTrend: {
    month: string;
    refunds: number;
    revenue: number;
    rate: number;
  }[];
}

interface RefundAnalyticsProps {
  dateRange?: DateRange;
}

function RefundRate({ dateRange }: RefundAnalyticsProps) {
  const [data, setData] = useState<{ rate: number } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const params = new URLSearchParams();
        if (dateRange?.from) params.append('from', dateRange.from.toISOString());
        if (dateRange?.to) params.append('to', dateRange.to.toISOString());
        
        const response = await fetch(`/api/admin/analytics/refunds-rate?${params}`);
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error('Error fetching refund rate:', error);
      }
    };

    fetchData();
  }, [dateRange]);

  if (!data) return <div>Loading...</div>;

  return (
    <div className="mt-2">
      <p className="text-2xl font-bold">{(data.rate * 100).toFixed(1)}%</p>
    </div>
  );
}

export default function RefundAnalytics({ dateRange }: RefundAnalyticsProps) {
  const [data, setData] = useState<RefundData | null>(null);
  const [view, setView] = useState<'daily' | 'monthly'>('daily');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const params = new URLSearchParams();
        if (dateRange?.from) params.append('from', dateRange.from.toISOString());
        if (dateRange?.to) params.append('to', dateRange.to.toISOString());
        
        const response = await fetch(`/api/admin/analytics/refunds-all?${params}`);
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error('Error fetching refund analytics:', error);
      }
    };

    fetchData();
  }, [dateRange]);

  if (!data) return <div>Loading...</div>;

  const vendorRefundData = [
    { name: 'AppSumo', value: data.byVendor.appsumo },
    { name: 'LemonSqueezy', value: data.byVendor.lemonsqueezy },
    { name: 'Other', value: data.byVendor.other },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4">
          <h3 className="font-semibold text-sm text-muted-foreground">Total Refunds</h3>
          <p className="text-2xl font-bold mt-2">{data.total.toLocaleString()}</p>
        </Card>
        <Card className="p-4">
          <h3 className="font-semibold text-sm text-muted-foreground">Refund Revenue</h3>
          <p className="text-2xl font-bold mt-2">${data.revenue.toLocaleString()}</p>
        </Card>
        <Card className="p-4">
          <h3 className="font-semibold text-sm text-muted-foreground">Refund Rate</h3>
          <p className="text-2xl font-bold mt-2">{(data.refundRate * 100).toFixed(1)}%</p>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Refunds by Vendor</h3>
          <DonutChart
            className="h-60"
            data={vendorRefundData}
            category="value"
            index="name"
            valueFormatter={(value) => value.toString()}
            colors={["blue", "green", "gray"]}
          />
        </Card>
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Refund Impact</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">AppSumo Refund Rate</p>
              <p className="text-lg font-semibold">
                {((data.byVendor.appsumo / data.total) * 100).toFixed(1)}%
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">LemonSqueezy Refund Rate</p>
              <p className="text-lg font-semibold">
                {((data.byVendor.lemonsqueezy / data.total) * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">Refund Trends</h3>
          <Tabs value={view} onValueChange={(v) => setView(v as 'daily' | 'monthly')}>
            <TabsList>
              <TabsTrigger value="daily">Daily</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {view === 'daily' ? (
          <LineChart
            className="h-96"
            data={data.dailyTrend}
            index="date"
            categories={["refunds", "rate"]}
            colors={["red", "orange"]}
            valueFormatter={(value: number) => 
              typeof value === 'number' && value >= 0 && value <= 1 ? 
                `${(value * 100).toFixed(1)}%` : 
                value.toString()
            }
            yAxisWidth={60}
          />
        ) : (
          <BarChart
            className="h-96"
            data={data.monthlyTrend}
            index="month"
            categories={["refunds", "rate"]}
            colors={["red", "orange"]}
            valueFormatter={(value: number) => 
              typeof value === 'number' && value >= 0 && value <= 1 ? 
                `${(value * 100).toFixed(1)}%` : 
                value.toString()
            }
            yAxisWidth={60}
          />
        )}
      </Card>
    </div>
  );
}

RefundAnalytics.RefundRate = RefundRate; 