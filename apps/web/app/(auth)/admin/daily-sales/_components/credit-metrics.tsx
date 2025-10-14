import { useState, useEffect } from 'react';
import { DateRange } from 'react-day-picker';
import { Card } from "@repo/ui/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/components/ui/tabs";
import { AreaChart, BarChart, DonutChart } from '@tremor/react';

interface CreditData {
  users: {
    userId: string;
    username: string;
    totalSpent: number;
    totalEarned: number;
    byType: Record<string, number>;
    byDate: Record<string, number>;
  }[];
}

interface CreditMetricsProps {
  dateRange?: DateRange;
}

export default function CreditMetrics({ dateRange }: CreditMetricsProps) {
  const [data, setData] = useState<CreditData | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<'spent' | 'earned'>('spent');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const params = new URLSearchParams();
        if (dateRange?.from) params.append('from', dateRange.from.toISOString());
        if (dateRange?.to) params.append('to', dateRange.to.toISOString());
        
        const response = await fetch(`/api/admin/analytics/credit-consumption?${params}`);
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error('Error fetching credit metrics:', error);
      }
    };

    fetchData();
  }, [dateRange]);

  if (!data) return <div>Loading...</div>;

  // Get top users by total credits spent/earned within date range
  const topUsers = data.users
    .sort((a, b) => b[selectedMetric === 'spent' ? 'totalSpent' : 'totalEarned'] - 
                    a[selectedMetric === 'spent' ? 'totalSpent' : 'totalEarned'])
    .slice(0, 5);

  // Calculate totals
  const totalSpent = data.users.reduce((sum, user) => sum + user.totalSpent, 0);
  const totalEarned = data.users.reduce((sum, user) => sum + user.totalEarned, 0);

  // Prepare data for charts
  const dailyData = data.users.reduce((acc, user) => {
    Object.entries(user.byDate).forEach(([date, amount]) => {
      const existingDay = acc.find(d => d.date === date);
      if (existingDay) {
        if (typeof amount === 'number') {
          if (amount < 0) {
            existingDay.spent += Math.abs(amount);
          } else {
            existingDay.earned += amount;
          }
        }
      } else {
        acc.push({
          date,
          spent: typeof amount === 'number' && amount < 0 ? Math.abs(amount) : 0,
          earned: typeof amount === 'number' && amount > 0 ? amount : 0
        });
      }
    });
    return acc;
  }, [] as { date: string; spent: number; earned: number }[])
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4">
          <h3 className="font-semibold text-sm text-muted-foreground">Total Credits Spent</h3>
          <p className="text-2xl font-bold mt-2">{totalSpent.toLocaleString()}</p>
        </Card>
        <Card className="p-4">
          <h3 className="font-semibold text-sm text-muted-foreground">Total Credits Earned</h3>
          <p className="text-2xl font-bold mt-2">{totalEarned.toLocaleString()}</p>
        </Card>
        <Card className="p-4">
          <h3 className="font-semibold text-sm text-muted-foreground">Active Users</h3>
          <p className="text-2xl font-bold mt-2">{data.users.length.toLocaleString()}</p>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">Credit Usage Over Time</h3>
        </div>
        <AreaChart
          className="h-96"
          data={dailyData}
          index="date"
          categories={["spent", "earned"]}
          colors={["red", "green"]}
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
                    {entry.name === 'spent' ? 'Spent: ' : 'Earned: '}
                    {entry.value.toLocaleString()}
                  </p>
                ))}
              </div>
            );
          }}
        />
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold">Top Users</h3>
            <Tabs value={selectedMetric} onValueChange={(v) => setSelectedMetric(v as 'spent' | 'earned')}>
              <TabsList>
                <TabsTrigger value="spent">Spent</TabsTrigger>
                <TabsTrigger value="earned">Earned</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <BarChart
            className="h-72"
            data={topUsers}
            index="username"
            categories={[selectedMetric === 'spent' ? 'totalSpent' : 'totalEarned']}
            colors={[selectedMetric === 'spent' ? 'red' : 'green']}
            valueFormatter={(value) => value.toLocaleString()}
            yAxisWidth={60}
            showLegend={false}
            showGridLines={true}
            showAnimation={true}
          />
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-6">Credit Distribution</h3>
          <DonutChart
            className="h-72"
            data={topUsers}
            index="username"
            category={selectedMetric === 'spent' ? 'totalSpent' : 'totalEarned'}
            valueFormatter={(value) => value.toLocaleString()}
            colors={["blue", "cyan", "indigo", "violet", "fuchsia"]}
          />
        </Card>
      </div>
    </div>
  );
} 