import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface RefundMetricsProps {
  data: {
    totalRefunds: number;
    newRefundsToday: number;
    totalRefundRevenue: number;
    refundRate: number;
    refundsByVendor: { [key: string]: number };
    refundsByDate: { [key: string]: number };
  };
}

const RefundMetrics: React.FC<RefundMetricsProps> = ({ data }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const refundsByVendorData = Object.entries(data.refundsByVendor).map(([vendor, count]) => ({
    vendor,
    count,
  }));

  const refundsByDateData = Object.entries(data.refundsByDate)
    .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
    .slice(-30) // Last 30 days
    .map(([date, count]) => ({
      date,
      count,
    }));

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Refund Metrics</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <dt className="text-sm font-medium text-gray-500">Total Refunds</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{data.totalRefunds}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">New Refunds Today</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{data.newRefundsToday}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Total Refund Revenue</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{formatCurrency(data.totalRefundRevenue)}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Refund Rate</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{data.refundRate.toFixed(2)}%</dd>
          </div>
        </dl>

        <div className="mt-8">
          <h3 className="text-lg font-medium text-gray-900">Refunds by Vendor</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={refundsByVendorData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="vendor" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-8">
          <h3 className="text-lg font-medium text-gray-900">Refunds Over Time (Last 30 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={refundsByDateData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default RefundMetrics;