import { useState, useEffect } from 'react';
import { DateRange } from 'react-day-picker';
import { Card } from "@repo/ui/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/components/ui/tabs";
import { AreaChart, BarChart, DonutChart } from '@tremor/react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/components/ui/select";

interface UserData {
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  usersByVendor: {
    appsumo: number;
    lemonsqueezy: number;
    other: number;
  };
  usersByPlan: {
    individual: number;
    team: number;
    agency: number;
    enterprise: number;
  };
  dailySignups: {
    date: string;
    total: number;
    appsumo: number;
    lemonsqueezy: number;
    other: number;
  }[];
  activeLicenses: {
    total: number;
    appsumo: number;
    lemonsqueezy: number;
    other: number;
  };
}

interface UserMetricsProps {
  dateRange?: DateRange;
}

export default function UserMetrics({ dateRange }: UserMetricsProps) {
  const [data, setData] = useState<UserData | null>(null);
  const [selectedVendor, setSelectedVendor] = useState<'all' | 'appsumo' | 'lemonsqueezy' | 'other'>('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const params = new URLSearchParams();
        if (dateRange?.from) params.append('from', dateRange.from.toISOString());
        if (dateRange?.to) params.append('to', dateRange.to.toISOString());
        
        const response = await fetch(`/api/admin/analytics/users-all?${params}`);
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error('Error fetching user metrics:', error);
      }
    };

    fetchData();
  }, [dateRange]);

  if (!data) return <div>Loading...</div>;

  const vendorData = [
    { name: 'AppSumo', value: data.usersByVendor.appsumo },
    { name: 'LemonSqueezy', value: data.usersByVendor.lemonsqueezy },
    { name: 'Other', value: data.usersByVendor.other },
  ];

  const planData = [
    { name: 'Individual', value: data.usersByPlan.individual },
    { name: 'Team', value: data.usersByPlan.team },
    { name: 'Agency', value: data.usersByPlan.agency },
    { name: 'Enterprise', value: data.usersByPlan.enterprise },
  ];

  const filteredDailySignups = data.dailySignups?.map(day => ({
    date: day.date,
    signups: selectedVendor === 'all' ? day.total : day[selectedVendor]
  })) || [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4">
          <h3 className="font-semibold text-sm text-muted-foreground">Total Users</h3>
          <p className="text-2xl font-bold mt-2">{data.totalUsers.toLocaleString()}</p>
        </Card>
        <Card className="p-4">
          <h3 className="font-semibold text-sm text-muted-foreground">Paid Users</h3>
          <p className="text-2xl font-bold mt-2">{data.activeLicenses.total.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground">
            {((data.activeLicenses.total / data.totalUsers) * 100).toFixed(1)}% conversion
          </p>
        </Card>
        <Card className="p-4">
          <h3 className="font-semibold text-sm text-muted-foreground">New Users</h3>
          <p className="text-2xl font-bold mt-2">{data.newUsers.toLocaleString()}</p>
        </Card>
        <Card className="p-4">
          <h3 className="font-semibold text-sm text-muted-foreground">Active Users</h3>
          <p className="text-2xl font-bold mt-2">{data.activeUsers.toLocaleString()}</p>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Users by Vendor</h3>
          <DonutChart
            className="h-60"
            data={vendorData}
            category="value"
            index="name"
            valueFormatter={(value: number) => value.toString()}
            colors={["blue", "green", "gray"]}
          />
          <div className="mt-4">
            <p className="text-sm text-muted-foreground">Active Licenses:</p>
            <p className="text-sm">AppSumo: {data.activeLicenses.appsumo.toLocaleString()}</p>
            <p className="text-sm">LemonSqueezy: {data.activeLicenses.lemonsqueezy.toLocaleString()}</p>
            <p className="text-sm">Other: {data.activeLicenses.other.toLocaleString()}</p>
          </div>
        </Card>
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Users by Plan</h3>
          <DonutChart
            className="h-60"
            data={planData}
            category="value"
            index="name"
            valueFormatter={(value: number) => value.toString()}
            colors={["emerald", "teal", "cyan", "blue"]}
          />
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">Daily Signups</h3>
          <Select value={selectedVendor} onValueChange={(value: any) => setSelectedVendor(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select vendor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Vendors</SelectItem>
              <SelectItem value="appsumo">AppSumo</SelectItem>
              <SelectItem value="lemonsqueezy">LemonSqueezy</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {filteredDailySignups.length > 0 ? (
          <AreaChart
            className="h-96"
            data={filteredDailySignups}
            index="date"
            categories={["signups"]}
            colors={["blue"]}
            valueFormatter={(value: number) => value.toString()}
            yAxisWidth={60}
            showLegend={false}
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
              const data = payload[0];
              if (!data || !data.value) return null;
              return (
                <div className="p-2 bg-white border rounded shadow-lg">
                  <p className="font-semibold">{data.payload.date}</p>
                  <p style={{ color: 'blue' }}>
                    Signups: {data.value.toLocaleString()}
                  </p>
                </div>
              );
            }}
          />
        ) : (
          <div className="h-96 flex items-center justify-center">
            <p className="text-muted-foreground">No signup data available</p>
          </div>
        )}
      </Card>
    </div>
  );
}

function ActiveUsers({ dateRange }: UserMetricsProps) {
  const [data, setData] = useState<{ active: number; total: number } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const params = new URLSearchParams();
        if (dateRange?.from) params.append('from', dateRange.from.toISOString());
        if (dateRange?.to) params.append('to', dateRange.to.toISOString());
        
        const response = await fetch(`/api/admin/analytics/users-active?${params}`);
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error('Error fetching active users:', error);
      }
    };

    fetchData();
  }, [dateRange]);

  if (!data) return <div>Loading...</div>;

  return (
    <div className="mt-2">
      <p className="text-2xl font-bold">{data.active.toLocaleString()}</p>
      <p className="text-sm text-muted-foreground">
        of {data.total.toLocaleString()} total users
      </p>
    </div>
  );
}

UserMetrics.ActiveUsers = ActiveUsers; 