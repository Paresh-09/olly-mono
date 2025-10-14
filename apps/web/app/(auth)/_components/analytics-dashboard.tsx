"use client"

import React, { useEffect, useState } from 'react';
import UserMetrics from './user-metrics';
import DailySalesChart from './daily-sales';
import VendorBreakdown from './vendor-breakdown';
import SalesMetrics from './sales-metrics';
import RevenueMetrics from './revenue-metrics';
import RefundMetrics from './refund-metrics';

interface AnalyticsData {
    userMetrics: {
      totalUsers: number;
      lemonsqueezyActivatedUsers: number;
      appSumoUsers: number;
    };
    vendorBreakdown: {
      [key: string]: number;
    };
    statusBreakdown: {
      ACTIVE: number;
      INACTIVE: number;
    };
    salesMetrics: {
      newSalesToday: number;
      newAppSumoSalesToday: number;
      totalSales: number;
      appSumoTotalSales: number;
      lemonsqueezyTotalSales: number;
      lemonsqueezy30DaySales: number;
    };
    refundMetrics: {
      totalRefunds: number;
      newRefundsToday: number;
      totalRefundRevenue: number;
      refundRate: number;
      refundsByVendor: { [key: string]: number };
      refundsByDate: { [key: string]: number };
    };
    revenueMetrics: {
      nonLemonsqueezyRevenue: number;
      appSumoRevenue: number;
      lemonsqueezy30DayRevenue: number;
      lemonsqueezyTotalRevenue: number;
      totalCombinedRevenue: number;
    };
    dailySales: {
      [date: string]: {
        sales: number;
        revenue: number;
      };
    };
  }

const AnalyticsDashboard: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch('/api/analytics');
        if (!response.ok) {
          throw new Error('Failed to fetch analytics data');
        }
        const data = await response.json();
        setAnalyticsData(data);
      } catch (err) {
        setError('Error fetching analytics data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!analyticsData) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <SalesMetrics data={analyticsData.salesMetrics} />
        <RevenueMetrics data={analyticsData.revenueMetrics} />
        <RefundMetrics data={analyticsData.refundMetrics} />
        <DailySalesChart data={analyticsData.dailySales} />
      <UserMetrics data={analyticsData.userMetrics} />
      <VendorBreakdown data={analyticsData.vendorBreakdown} />
    </div>
  );
};

export default AnalyticsDashboard;