import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface VendorBreakdownProps {
  data: {
    [key: string]: number;
  };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const VendorBreakdown: React.FC<VendorBreakdownProps> = ({ data }) => {
  const chartData = Object.entries(data).map(([name, value]) => ({ name, value }));

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Vendor Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
        <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {Object.entries(data).map(([vendor, count]) => (
            <div key={vendor}>
              <dt className="text-sm font-medium text-gray-500">{vendor}</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">{count}</dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  );
};

export default VendorBreakdown;