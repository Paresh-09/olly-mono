"use client"

import { useState, useEffect } from 'react'
import { Card } from '@repo/ui/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/ui/components/ui/tabs'
import { Loader2, Lock } from 'lucide-react'
import { addDays, subDays, isAfter, isBefore, isEqual } from 'date-fns'
import type { DateRange } from "react-day-picker"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend
} from 'recharts'
import { DateRangePicker } from '@repo/ui/components/ui/date-range-picker'
import { RoleDistributionChart } from './role-distribution-chart'
import { Alert, AlertDescription, AlertTitle } from '@repo/ui/components/ui/alert'

const COLORS = ['#2563eb', '#7c3aed', '#db2777', '#ea580c', '#84cc16', '#14b8a6', '#06b6d4', '#8b5cf6']

type DailySummary = {
  count: number
  roles: Record<string, number>
  platforms: Record<string, number>
}

type AnalyticsData = {
  dailySummaries: Record<string, DailySummary>
  roleSummary: Record<string, number>
  platformSummary: Record<string, number>
  engagementGoalSummary: Record<string, number>
  contentFrequencySummary: Record<string, number>
  commentFrequencySummary: Record<string, number>
  companySizeSummary: Record<string, number>
  aiExperienceSummary: Record<string, number>
  totalUsers: number
  skippedUsers: number
}

export default function AnalyticsDashboard() {
  const defaultDateRange: DateRange = {
    from: subDays(new Date(), 30),
    to: new Date(),
  }

  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState<DateRange>(defaultDateRange)
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/admin/onboarding')

      if (response.status === 401) {
        setError('You are not authorized to view analytics data. Please contact an administrator.');
        setLoading(false);
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch analytics data');
      }

      const analyticsData: AnalyticsData = await response.json()
      setData(analyticsData)
    } catch (error) {
      console.error('Error fetching analytics data:', error)
      setError('An error occurred while fetching analytics data');
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const isDateInRange = (dateStr: string, range: DateRange) => {
    const date = new Date(dateStr)
    const from = range.from || defaultDateRange.from
    const to = range.to || defaultDateRange.to

    if (!from || !to) return true

    return (
      (isAfter(date, from) || isEqual(date, from)) && 
      (isBefore(date, to) || isEqual(date, to))
    )
  }

  const filterDataByDateRange = () => {
    if (!data) return null

    const from = dateRange.from || defaultDateRange.from
    const to = dateRange.to || defaultDateRange.to

    if (!from || !to) return data

    const filteredDailySummaries = Object.entries(data.dailySummaries)
      .filter(([date]) => isDateInRange(date, { from, to }))
      .reduce<Record<string, DailySummary>>((acc, [date, value]) => ({
        ...acc,
        [date]: value
      }), {})

    return {
      ...data,
      dailySummaries: filteredDailySummaries
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4">
        <Alert variant="destructive">
          <Lock className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!data) {
    return <div>Failed to load analytics data</div>
  }

  const filteredData = filterDataByDateRange() || data

  const dailyData = Object.entries(filteredData.dailySummaries)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, { count }]) => ({
      date,
      users: count,
    }))

  const roleData = Object.entries(data.roleSummary)
    .map(([role, count]) => ({
      name: role,
      value: count,
    }))
    .sort((a, b) => b.value - a.value)

  const platformData = Object.entries(data.platformSummary)
    .map(([platform, count]) => ({
      platform,
      users: count,
    }))
    .sort((a, b) => b.users - a.users)

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range || defaultDateRange)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
        <DateRangePicker
          date={{ from: dateRange.from, to: dateRange.to }}
          onDateChange={(range) => handleDateRangeChange(range)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <h3 className="font-semibold mb-2">Total Users</h3>
          <p className="text-2xl">{data.totalUsers}</p>
        </Card>
        <Card className="p-4">
          <h3 className="font-semibold mb-2">Completed Onboarding</h3>
          <p className="text-2xl">{data.totalUsers - data.skippedUsers}</p>
        </Card>
        <Card className="p-4">
          <h3 className="font-semibold mb-2">Skipped Onboarding</h3>
          <p className="text-2xl">{data.skippedUsers}</p>
        </Card>
      </div>

      <Tabs defaultValue="daily" className="space-y-4">
        <TabsList>
          <TabsTrigger value="daily">Daily Signups</TabsTrigger>
          <TabsTrigger value="roles">Roles</TabsTrigger>
          <TabsTrigger value="platforms">Platforms</TabsTrigger>
        </TabsList>

        <TabsContent value="daily">
          <Card className="p-4">
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="users" 
                  stroke="#2563eb" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>

        <TabsContent value="roles">
          <Card className="p-4">
            <RoleDistributionChart
              data={Object.entries(data.roleSummary)
                .map(([role, count]) => ({
                  name: role,
                  value: count,
                }))
                .sort((a, b) => b.value - a.value)
              } 
            />
          </Card>
        </TabsContent>

        <TabsContent value="platforms">
          <Card className="p-4">
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={platformData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="platform" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="users" fill="#2563eb" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Additional summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4">
          <h3 className="font-semibold mb-4">Engagement Goals</h3>
          <div className="space-y-2">
            {Object.entries(data.engagementGoalSummary)
              .sort((a, b) => b[1] - a[1])
              .map(([goal, count]) => (
                <div key={goal} className="flex justify-between">
                  <span>{goal}</span>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
          </div>
        </Card>
        <Card className="p-4">
          <h3 className="font-semibold mb-4">AI Experience</h3>
          <div className="space-y-2">
            {Object.entries(data.aiExperienceSummary)
              .sort((a, b) => b[1] - a[1])
              .map(([experience, count]) => (
                <div key={experience} className="flex justify-between">
                  <span>{experience}</span>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
          </div>
        </Card>
      </div>
    </div>
  );
}