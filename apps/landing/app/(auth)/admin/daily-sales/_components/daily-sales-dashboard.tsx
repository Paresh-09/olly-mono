'use client';

import { useState } from 'react';
import { DateRange } from 'react-day-picker';
import { Card } from "@repo/ui/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/components/ui/tabs";
import RevenueMetrics from './revenue-metrics';
import SalesBreakdown from './sales-breakdown';
import VendorAnalytics from './vendor-analytics';
import RefundAnalytics from './refund-analytics';
import UserMetrics from './user-metrics';
import ApiUsageMetrics from './api-usage-metrics';
import UsageTrackingMetrics from './usage-tracking-metrics';
import CreditMetrics from './credit-metrics';
import DateRangePicker from './date-range-picker';

export default function DailySalesDashboard() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Sales Analytics Dashboard</h1>
        <DateRangePicker date={dateRange} setDate={setDateRange} />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="vendors">Vendors</TabsTrigger>
          <TabsTrigger value="refunds">Refunds</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="api">API Usage</TabsTrigger>
          <TabsTrigger value="usage">Usage Tracking</TabsTrigger>
          <TabsTrigger value="credits">Credits</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-4 gap-4">
            <Card className="p-4">
              <h3 className="font-semibold text-sm text-muted-foreground">Total Revenue</h3>
              <RevenueMetrics.TotalRevenue dateRange={dateRange} />
            </Card>
            <Card className="p-4">
              <h3 className="font-semibold text-sm text-muted-foreground">Total Sales</h3>
              <SalesBreakdown.TotalSales dateRange={dateRange} />
            </Card>
            <Card className="p-4">
              <h3 className="font-semibold text-sm text-muted-foreground">Active Users</h3>
              <UserMetrics.ActiveUsers dateRange={dateRange} />
            </Card>
            <Card className="p-4">
              <h3 className="font-semibold text-sm text-muted-foreground">Refund Rate</h3>
              <RefundAnalytics.RefundRate dateRange={dateRange} />
            </Card>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4">
              <h3 className="font-semibold mb-4">Revenue Trend</h3>
              <RevenueMetrics.RevenueTrend dateRange={dateRange} />
            </Card>
            <Card className="p-4">
              <h3 className="font-semibold mb-4">Sales by Vendor</h3>
              <VendorAnalytics.SalesByVendor dateRange={dateRange} />
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <RevenueMetrics dateRange={dateRange} />
        </TabsContent>

        <TabsContent value="vendors" className="space-y-4">
          <VendorAnalytics dateRange={dateRange} />
        </TabsContent>

        <TabsContent value="refunds" className="space-y-4">
          <RefundAnalytics dateRange={dateRange} />
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <UserMetrics dateRange={dateRange} />
        </TabsContent>

        <TabsContent value="api" className="space-y-4">
          <ApiUsageMetrics dateRange={dateRange} />
        </TabsContent>

        <TabsContent value="usage" className="space-y-4">
          <UsageTrackingMetrics dateRange={dateRange} />
        </TabsContent>

        <TabsContent value="credits" className="space-y-4">
          <CreditMetrics dateRange={dateRange} />
        </TabsContent>
      </Tabs>
    </div>
  );
} 