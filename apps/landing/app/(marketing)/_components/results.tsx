import { motion } from 'framer-motion';
import Image from 'next/image';
import { Users, Eye, TrendingUp, BarChart3, Activity, Target } from 'lucide-react';
import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Mock data for charts
const chartData = {
  profileViews: [
    { month: 'Jan', views: 1200 },
    { month: 'Feb', views: 1850 },
    { month: 'Mar', views: 2300 },
    { month: 'Apr', views: 2650 },
    { month: 'May', views: 3800 },
    { month: 'Jun', views: 4200 }
  ],
  followers: [
    { month: 'Jan', followers: 850 },
    { month: 'Feb', followers: 950 },
    { month: 'Mar', followers: 1100 },
    { month: 'Apr', views: 1250 },
    { month: 'May', views: 1350 },
    { month: 'Jun', views: 1480 }
  ]
};

const stats = [
  {
    title: 'Profile Views',
    value: '250%',
    period: 'Growth in 6 months',
    description: 'Exponential visibility boost',
    icon: Eye
  },
  {
    title: 'Follower Growth',
    value: '74%',
    period: 'Increase this year',
    description: 'Sustainable audience growth',
    icon: Users
  },
  {
    title: 'Engagement Rate',
    value: '12.8%',
    period: 'Above industry avg',
    description: 'Higher quality interactions',
    icon: Activity
  },
  {
    title: 'Conversion Rate',
    value: '8.4%',
    period: 'Click-through rate',
    description: 'More leads and sales',
    icon: Target
  }
];

// Custom tooltip component
type CustomTooltipProps = {
  active?: boolean;
  payload?: Array<{ dataKey: string; value: number }>;
  label?: string | number;
};

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
        <p className="font-medium text-gray-900">{`${label}`}</p>
        <p className="text-teal-600">
          {`${payload[0].dataKey === 'views' ? 'Views' : 'Followers'}: ${payload[0].value.toLocaleString()}`}
        </p>
      </div>
    );
  }
  return null;
};

export const Results = () => {
  return (
    <section className="py-16 md:py-24 bg-transparent from-slate-50 via-white to-teal-50">
      <div className="container max-w-7xl mx-auto px-4">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-cal mb-6 text-gray-900">
            Exceptional{' '}
            <span className="text-teal-600 relative">
              Growth
              <svg
                className="absolute -bottom-2 left-0 w-full h-2"
                viewBox="0 0 200 12"
              >
                <path
                  d="M2 6c50-3 100-3 150 0"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  className="text-teal-400"
                />
              </svg>
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Real metrics from thousands of users. Your transformation starts here.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300"
              >
                {/* Icon */}
                <div className="w-12 h-12 rounded-2xl bg-teal-500 p-3 mb-4">
                  <Icon className="w-6 h-6 text-white" />
                </div>

                {/* Content */}
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">{stat.title}</h3>
                  <div className="text-3xl font-cal font-bold text-gray-900 mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-600 mb-2">{stat.period}</div>
                  <p className="text-sm text-gray-500">{stat.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Interactive Chart Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-gray-100 max-w-6xl mx-auto"
        >
          {/* Chart Container */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Profile Views Chart */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="text-xl font-semibold text-gray-900 flex items-center">
                  <div className="w-4 h-4 rounded-full bg-teal-500 mr-3"></div>
                  Profile Views
                </h4>
                <div className="text-2xl font-cal font-bold text-teal-600">+250%</div>
              </div>

              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData.profileViews} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#64748b' }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#64748b' }}
                      tickFormatter={(value) => `${(value / 1000).toFixed(1)}K`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar
                      dataKey="views"
                      fill="#14b8a6"
                      radius={[8, 8, 0, 0]}
                      animationDuration={1500}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="flex justify-between text-sm text-gray-500">
                <span>Jan: 1.2K views</span>
                <span>Jun: 4.2K views</span>
              </div>
            </div>

            {/* Followers Chart */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="text-xl font-semibold text-gray-900 flex items-center">
                  <div className="w-4 h-4 rounded-full bg-teal-500 mr-3"></div>
                  Followers
                </h4>
                <div className="text-2xl font-cal font-bold text-teal-600">+74%</div>
              </div>

              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData.followers} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#64748b' }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#64748b' }}
                      tickFormatter={(value) => `${(value / 1000).toFixed(1)}K`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar
                      dataKey="followers"
                      fill="#14b8a6"
                      radius={[8, 8, 0, 0]}
                      animationDuration={1500}
                      animationBegin={300}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="flex justify-between text-sm text-gray-500">
                <span>Jan: 850 followers</span>
                <span>Jun: 1.48K followers</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Disclaimer */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-400 bg-white rounded-full px-6 py-3 inline-block border border-gray-200">
            *Results based on actual user data. Individual results may vary based on content quality and consistency.
          </p>
        </div>
      </div>
    </section>
  );
};