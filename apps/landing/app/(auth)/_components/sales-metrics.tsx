import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/components/ui/card';

interface SalesMetricsProps {
  data: {
    newSalesToday: number;
    newAppSumoSalesToday: number;
    totalSales: number;
    appSumoTotalSales: number;
    lemonsqueezyTotalSales: number;
    lemonsqueezy30DaySales: number;
  };
}

const SalesMetrics: React.FC<SalesMetricsProps> = ({ data }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sales Metrics</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-gray-500">New Sales Today</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{data.newSalesToday}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">New AppSumo Sales Today</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{data.newAppSumoSalesToday}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Total Sales</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{data.totalSales}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">AppSumo Total Sales</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{data.appSumoTotalSales}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Lemonsqueezy Total Sales</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{data.lemonsqueezyTotalSales}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Lemonsqueezy 30 Day Sales</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{data.lemonsqueezy30DaySales}</dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
};

export default SalesMetrics;