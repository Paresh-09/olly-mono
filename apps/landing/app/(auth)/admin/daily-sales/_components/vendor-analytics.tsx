import { useState, useEffect } from 'react';
import { DateRange } from 'react-day-picker';
import { Card } from "@repo/ui/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/components/ui/tabs";
import { LineChart, BarChart, DonutChart } from '@tremor/react';

interface VendorData {
  appsumo: {
    total: number;
    revenue: number;
    tiers: {
      tier1: number;
      tier2: number;
      tier3: number;
    };
  };
  lemonsqueezy: {
    total: number;
    revenue: number;
    plans: {
      individual: number;
      team: number;
      agency: number;
      enterprise: number;
    };
  };
  dailyTrend: Array<{
    date: string;
    appsumo_sales: number;
    appsumo_revenue: number;
    lemonsqueezy_sales: number;
    lemonsqueezy_revenue: number;
  }>;
  monthlyTrend: Array<{
    month: string;
    appsumo_sales: number;
    appsumo_revenue: number;
    lemonsqueezy_sales: number;
    lemonsqueezy_revenue: number;
  }>;
}

interface VendorAnalyticsProps {
  dateRange?: DateRange;
}

function SalesByVendor({ dateRange }: VendorAnalyticsProps) {
  const [data, setData] = useState<{ appsumo: number; lemonsqueezy: number } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const params = new URLSearchParams();
        if (dateRange?.from) params.append('from', dateRange.from.toISOString());
        if (dateRange?.to) params.append('to', dateRange.to.toISOString());
        
        const response = await fetch(`/api/admin/analytics/vendors?${params}`);
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error('Error fetching vendor data:', error);
      }
    };

    fetchData();
  }, [dateRange]);

  if (!data) return <div>Loading...</div>;

  const chartData = [
    { name: 'AppSumo', value: data.appsumo },
    { name: 'LemonSqueezy', value: data.lemonsqueezy },
  ];

  return (
    <DonutChart
      className="h-40"
      data={chartData}
      category="value"
      index="name"
      valueFormatter={(value) => value.toString()}
      colors={["cyan", "green"]}
    />
  );
}

export default function VendorAnalytics({ dateRange }: VendorAnalyticsProps) {
  const [data, setData] = useState<VendorData | null>(null);
  const [view, setView] = useState<'sales' | 'revenue'>('sales');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const params = new URLSearchParams();
        if (dateRange?.from) params.append('from', dateRange.from.toISOString());
        if (dateRange?.to) params.append('to', dateRange.to.toISOString());
        
        const response = await fetch(`/api/admin/analytics/vendors-all?${params}`);
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error('Error fetching vendor analytics:', error);
      }
    };

    fetchData();
  }, [dateRange]);

  if (!data) return <div>Loading...</div>;

  const appsumoTierData = [
    { name: 'Tier 1', value: data.appsumo.tiers.tier1 },
    { name: 'Tier 2', value: data.appsumo.tiers.tier2 },
    { name: 'Tier 3', value: data.appsumo.tiers.tier3 },
  ];

  const lemonSqueezyPlanData = [
    { name: 'Individual', value: data.lemonsqueezy.plans.individual },
    { name: 'Team', value: data.lemonsqueezy.plans.team },
    { name: 'Agency', value: data.lemonsqueezy.plans.agency },
    { name: 'Enterprise', value: data.lemonsqueezy.plans.enterprise },
  ];

  const chartData = view === 'sales' ? 
    data.dailyTrend.map(item => ({
      date: item.date,
      AppSumo: item.appsumo_sales,
      LemonSqueezy: item.lemonsqueezy_sales
    })) :
    data.dailyTrend.map(item => ({
      date: item.date,
      AppSumo: item.appsumo_revenue,
      LemonSqueezy: item.lemonsqueezy_revenue
    }));

  const monthlyChartData = view === 'sales' ?
    data.monthlyTrend.map(item => ({
      month: item.month,
      AppSumo: item.appsumo_sales,
      LemonSqueezy: item.lemonsqueezy_sales
    })) :
    data.monthlyTrend.map(item => ({
      month: item.month,
      AppSumo: item.appsumo_revenue,
      LemonSqueezy: item.lemonsqueezy_revenue
    }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4">
          <h3 className="font-semibold text-sm text-muted-foreground">AppSumo</h3>
          <p className="text-2xl font-bold mt-2">{data.appsumo.total.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground">
            Revenue: ${data.appsumo.revenue.toLocaleString()}
          </p>
        </Card>
        <Card className="p-4">
          <h3 className="font-semibold text-sm text-muted-foreground">LemonSqueezy</h3>
          <p className="text-2xl font-bold mt-2">{data.lemonsqueezy.total.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground">
            Revenue: ${data.lemonsqueezy.revenue.toLocaleString()}
          </p>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">AppSumo Tiers</h3>
          <DonutChart
            className="h-60"
            data={appsumoTierData}
            category="value"
            index="name"
            valueFormatter={(value) => value.toString()}
            colors={["blue", "cyan", "indigo"]}
          />
        </Card>
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">LemonSqueezy Plans</h3>
          <DonutChart
            className="h-60"
            data={lemonSqueezyPlanData}
            category="value"
            index="name"
            valueFormatter={(value) => value.toString()}
            colors={["green", "emerald", "teal", "lime"]}
          />
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">Vendor Trends</h3>
          <div className="flex gap-4">
            <Tabs value={view} onValueChange={(v) => setView(v as 'sales' | 'revenue')}>
              <TabsList>
                <TabsTrigger value="sales">Sales</TabsTrigger>
                <TabsTrigger value="revenue">Revenue</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h4 className="text-sm font-medium mb-4">Daily Trend</h4>
            <LineChart
              className="h-72"
              data={chartData}
              index="date"
              categories={["AppSumo", "LemonSqueezy"]}
              colors={["blue", "green"]}
              valueFormatter={view === 'revenue' ? 
                (value) => `$${value.toLocaleString()}` : 
                (value) => value.toString()
              }
              yAxisWidth={60}
            />
          </div>

          <div>
            <h4 className="text-sm font-medium mb-4">Monthly Trend</h4>
            <BarChart
              className="h-72"
              data={monthlyChartData}
              index="month"
              categories={["AppSumo", "LemonSqueezy"]}
              colors={["blue", "green"]}
              valueFormatter={view === 'revenue' ? 
                (value) => `$${value.toLocaleString()}` : 
                (value) => value.toString()
              }
              yAxisWidth={60}
            />
          </div>
        </div>
      </Card>
    </div>
  );
}

VendorAnalytics.SalesByVendor = SalesByVendor; 