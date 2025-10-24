import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/components/ui/card';

interface RevenueMetricsProps {
  data: {
    nonLemonsqueezyRevenue: number;
    appSumoRevenue: number;
    lemonsqueezy30DayRevenue: number;
    lemonsqueezyTotalRevenue: number;
    totalCombinedRevenue: number;
  };
}

const RevenueMetrics: React.FC<RevenueMetricsProps> = ({ data }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue Metrics</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-gray-500">Non-Lemonsqueezy Revenue</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{formatCurrency(data.nonLemonsqueezyRevenue)}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">AppSumo Revenue</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{formatCurrency(data.appSumoRevenue)}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Lemonsqueezy 30 Day Revenue</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{formatCurrency(data.lemonsqueezy30DayRevenue)}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Lemonsqueezy Total Revenue</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{formatCurrency(data.lemonsqueezyTotalRevenue)}</dd>
          </div>
          <div className="col-span-2">
            <dt className="text-sm font-medium text-gray-500">Total Combined Revenue</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{formatCurrency(data.totalCombinedRevenue)}</dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
};

export default RevenueMetrics;