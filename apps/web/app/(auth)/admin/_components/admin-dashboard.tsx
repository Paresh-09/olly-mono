"use client";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/components/ui/tabs";
import UserLicenseManagement from "./user-license-management";
import RedeemCodeManagement from "./redeem-code-management";
import UserAnalytics from "./user-analytics";
import UserJourneyAnalytics from "./user-journey-analytics";
import PremiumUserJourney from "./premium-user-journey";
import UserUsageAnalytics from "./user-usage-analytics";
import LicenseUsageManagement from "./license-usage-management";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("users");

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="users">User & License Management</TabsTrigger>
          <TabsTrigger value="redeemCodes">Redeem Codes</TabsTrigger>
          <TabsTrigger value="license-usage">License Usage</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="journey-analytics">
            User Journey Analytics
          </TabsTrigger>
          <TabsTrigger value="premium-journey">
            Premium User Journey
          </TabsTrigger>
          <TabsTrigger value="usage-analytics">
            User Usage Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-6">
          <UserLicenseManagement />
        </TabsContent>

        <TabsContent value="redeemCodes" className="mt-6">
          <RedeemCodeManagement />
        </TabsContent>

        <TabsContent value="license-usage" className="mt-6">
          <LicenseUsageManagement />
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <UserAnalytics />
        </TabsContent>

        <TabsContent value="journey-analytics" className="mt-6">
          <UserJourneyAnalytics />
        </TabsContent>

        <TabsContent value="premium-journey" className="mt-6">
          <PremiumUserJourney />
        </TabsContent>

        <TabsContent value="usage-analytics" className="mt-6">
          <UserUsageAnalytics />
        </TabsContent>
      </Tabs>
    </div>
  );
}
