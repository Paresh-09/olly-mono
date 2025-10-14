import { useState, useEffect } from 'react';
import { DateRange } from 'react-day-picker';
import { Card } from "@repo/ui/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/components/ui/tabs";
import { LineChart, BarChart, DonutChart } from '@tremor/react';

interface SalesData {
  totalSales: number;
  salesByVendor: {
    appsumo: {
      tier1: number;
      tier2: number;
      tier3: number;
      total: number;
    };
    lemonsqueezy: {
      individual: number;
      team: number;
      agency: number;
      enterprise: number;
      total: number;
    };
    other: number;
  };
  dailySales: {
    date: string;
    total: number;
    appsumo: number;
    lemonsqueezy: number;
    other: number;
  }[];
  monthlySales: {
    month: string;
    total: number;
    appsumo: number;
    lemonsqueezy: number;
    other: number;
  }[];
}

interface SalesBreakdownProps {
  dateRange?: DateRange;
}

function TotalSales({ dateRange }: SalesBreakdownProps) {
  const [data, setData] = useState<{ total: number } | null>(null);

  useEffect(() => {
    // Fetch total sales data
    const fetchData = async () => {
      try {
        const params = new URLSearchParams();
        if (dateRange?.from) params.append('from', dateRange.from.toISOString());
        if (dateRange?.to) params.append('to', dateRange.to.toISOString());
        
        const response = await fetch(`/api/admin/analytics/sales?${params}`);
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error('Error fetching sales data:', error);
      }
    };

    fetchData();
  }, [dateRange]);

  if (!data) return <div>Loading...</div>;

  return (
    <div className="mt-2">
      <p className="text-2xl font-bold">{data.total.toLocaleString()}</p>
    </div>
  );
}

export default function SalesBreakdown({ dateRange }: SalesBreakdownProps) {
  const [data, setData] = useState<SalesData | null>(null);
  const [view, setView] = useState<'daily' | 'monthly'>('daily');

  useEffect(() => {
    // Fetch all sales metrics
    const fetchData = async () => {
      try {
        const params = new URLSearchParams();
        if (dateRange?.from) params.append('from', dateRange.from.toISOString());
        if (dateRange?.to) params.append('to', dateRange.to.toISOString());
        
        const response = await fetch(`/api/admin/analytics/sales/all?${params}`);
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error('Error fetching sales metrics:', error);
      }
    };

    fetchData();
  }, [dateRange]);

  if (!data) return <div>Loading...</div>;

  const appsumoData = [
    { name: 'Tier 1', value: data.salesByVendor.appsumo.tier1 },
    { name: 'Tier 2', value: data.salesByVendor.appsumo.tier2 },
    { name: 'Tier 3', value: data.salesByVendor.appsumo.tier3 },
  ];

  const lemonsqueezyData = [
    { name: 'Individual', value: data.salesByVendor.lemonsqueezy.individual },
    { name: 'Team', value: data.salesByVendor.lemonsqueezy.team },
    { name: 'Agency', value: data.salesByVendor.lemonsqueezy.agency },
    { name: 'Enterprise', value: data.salesByVendor.lemonsqueezy.enterprise },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4">
          <h3 className="font-semibold text-sm text-muted-foreground">Total Sales</h3>
          <p className="text-2xl font-bold mt-2">{data.totalSales.toLocaleString()}</p>
        </Card>
        <Card className="p-4">
          <h3 className="font-semibold text-sm text-muted-foreground">AppSumo Sales</h3>
          <p className="text-2xl font-bold mt-2">{data.salesByVendor.appsumo.total.toLocaleString()}</p>
        </Card>
        <Card className="p-4">
          <h3 className="font-semibold text-sm text-muted-foreground">LemonSqueezy Sales</h3>
          <p className="text-2xl font-bold mt-2">{data.salesByVendor.lemonsqueezy.total.toLocaleString()}</p>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">AppSumo Breakdown</h3>
          <DonutChart
            className="h-60"
            data={appsumoData}
            category="value"
            index="name"
            valueFormatter={(value) => value.toString()}
            colors={["blue", "cyan", "indigo"]}
          />
        </Card>
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">LemonSqueezy Breakdown</h3>
          <DonutChart
            className="h-60"
            data={lemonsqueezyData}
            category="value"
            index="name"
            valueFormatter={(value) => value.toString()}
            colors={["green", "emerald", "teal", "lime"]}
          />
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">Sales Over Time</h3>
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
            data={data.dailySales}
            index="date"
            categories={["total", "appsumo", "lemonsqueezy", "other"]}
            colors={["blue", "cyan", "green", "gray"]}
            valueFormatter={(value) => value.toString()}
            yAxisWidth={60}
          />
        ) : (
          <BarChart
            className="h-96"
            data={data.monthlySales}
            index="month"
            categories={["total", "appsumo", "lemonsqueezy", "other"]}
            colors={["blue", "cyan", "green", "gray"]}
            valueFormatter={(value) => value.toString()}
            yAxisWidth={60}
          />
        )}
      </Card>
    </div>
  );
}

SalesBreakdown.TotalSales = TotalSales; 