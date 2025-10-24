import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/components/ui/card';

interface UserMetricsProps {
  data: {
    totalUsers: number;
    lemonsqueezyActivatedUsers: number;
    appSumoUsers: number;
  };
}

const UserMetrics: React.FC<UserMetricsProps> = ({ data }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>User Metrics</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <dt className="text-sm font-medium text-gray-500">Total Users</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{data.totalUsers}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Lemonsqueezy Activated</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{data.lemonsqueezyActivatedUsers}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">AppSumo Users</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{data.appSumoUsers}</dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
};

export default UserMetrics;