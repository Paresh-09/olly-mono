import { useState, useEffect } from 'react';
import { DateRange } from 'react-day-picker';
import { Card } from "@repo/ui/components/ui/card";
import { AreaChart } from '@tremor/react';

interface ApiUsageData {
  total: number;
  dailyUsage: {
    date: string;
    count: number;
  }[];
  byPlatform: {
    platform: string;
    count: number;
  }[];
  last10Days: {
    total: number;
    daily: {
      date: string;
      count: number;
    }[];
  };
}

interface ApiUsageMetricsProps {
  dateRange?: DateRange;
}

export default function ApiUsageMetrics({ dateRange }: ApiUsageMetricsProps) {
  const [data, setData] = useState<ApiUsageData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const params = new URLSearchParams();
        if (dateRange?.from) params.append('from', dateRange.from.toISOString());
        if (dateRange?.to) params.append('to', dateRange.to.toISOString());
        
        const response = await fetch(`/api/admin/analytics/api-usage?${params}`);
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error('Error fetching API usage:', error);
      }
    };

    fetchData();
  }, [dateRange]);

  if (!data) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4">
          <h3 className="font-semibold text-sm text-muted-foreground">Total API Usage</h3>
          <p className="text-2xl font-bold mt-2">{data.total.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground">
            Last 10 Days: {data.last10Days.total.toLocaleString()}
          </p>
        </Card>
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
      </div>

      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">API Usage Over Time</h3>
        </div>
        <AreaChart
          className="h-96"
          data={data.dailyUsage}
          index="date"
          categories={["count"]}
          colors={["purple"]}
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