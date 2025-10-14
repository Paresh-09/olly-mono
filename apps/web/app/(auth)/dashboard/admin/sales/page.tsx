import React from 'react';
import { validateRequest } from "@/lib/auth";
import { redirect } from 'next/navigation';
import AnalyticsDashboard from '@/app/(auth)/_components/analytics-dashboard';

export default async function AdminDashboardPage() {
  const { user } = await validateRequest();

  if (!user || !user.isAdmin) {
    redirect('/');
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Analytics Dashboard</h1>
      <AnalyticsDashboard />
    </div>
  );
}