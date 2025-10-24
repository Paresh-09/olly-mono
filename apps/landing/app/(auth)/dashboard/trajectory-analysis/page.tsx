'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui/components/ui/card';
import { Button } from '@repo/ui/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/ui/components/ui/tabs';
import { ResponsiveLine } from '@nivo/line';
import { Sparkles, ArrowLeft, Calendar, TrendingUp, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { toast } from '@repo/ui/hooks/use-toast';

interface DataPoint {
  date: string;
  value: number;
}

interface TrajectoryAnalysis {
  id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  moodData: DataPoint[];
  energyData: DataPoint[];
  productivityData: DataPoint[];
  insightsText: string;
  recommendationsText: string;
}

export default function TrajectoryAnalysisPage() {
  const [analysis, setAnalysis] = useState<TrajectoryAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('mood');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAnalysis();
  }, []);

  const fetchAnalysis = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/trajectory-analysis');
      
      if (!response.ok) {
        throw new Error('Failed to fetch trajectory analysis');
      }
      
      const data = await response.json();
      setAnalysis(data.analysis);
    } catch (error) {
      console.error('Error fetching trajectory analysis:', error);
      toast({
        title: 'Error',
        description: 'Failed to load trajectory analysis. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      const response = await fetch('/api/trajectory-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to refresh trajectory analysis');
      }

      await fetchAnalysis();
      
      toast({
        title: 'Analysis Refreshed',
        description: 'Your trajectory analysis has been updated.',
      });
    } catch (error) {
      console.error('Error refreshing trajectory analysis:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to refresh trajectory analysis',
        variant: 'destructive',
      });
    } finally {
      setRefreshing(false);
    }
  };

  const parseJsonData = (jsonString: string): DataPoint[] => {
    try {
      return JSON.parse(jsonString);
    } catch (error) {
      console.error('Error parsing JSON data:', error);
      return [];
    }
  };

  const formatChartData = (data: DataPoint[], label: string) => {
    if (!data || !Array.isArray(data)) {
      console.error(`Invalid data for ${label}:`, data);
      return [];
    }
    
    return [
      {
        id: label,
        data: data.map(item => ({
          x: format(new Date(item.date), 'MMM dd'),
          y: item.value
        }))
      }
    ];
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 max-w-4xl">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="container mx-auto py-8 max-w-4xl">
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <TrendingUp className="h-12 w-12 mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-2">No Analysis Available</h2>
          <p className="text-muted-foreground mb-6">
            You haven't generated a trajectory analysis yet, or you don't have enough vlog entries.
          </p>
          <div className="flex gap-4">
            <Button asChild variant="outline">
              <Link href="/dashboard/daily-vlog">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Daily Vlog
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const getChartData = () => {
    if (!analysis) return [];
    
    switch (activeTab) {
      case 'mood':
        return formatChartData(analysis.moodData, 'Mood');
      case 'energy':
        return formatChartData(analysis.energyData, 'Energy');
      case 'productivity':
        return formatChartData(analysis.productivityData, 'Productivity');
      default:
        return formatChartData(analysis.moodData, 'Mood');
    }
  };

  const getChartColor = () => {
    switch (activeTab) {
      case 'mood':
        return ['#4f46e5'];
      case 'energy':
        return ['#f59e0b'];
      case 'productivity':
        return ['#10b981'];
      default:
        return ['#4f46e5'];
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard/daily-vlog">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
          <h1 className="text-xl font-bold">Trajectory Analysis</h1>
        </div>
        <Button 
          onClick={handleRefresh} 
          variant="outline" 
          size="sm"
          disabled={refreshing}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center">
            <TrendingUp className="mr-2 h-5 w-5" />
            30-Day Trends
          </CardTitle>
          <CardDescription>
            Analysis generated on {format(new Date(analysis.createdAt), 'MMMM d, yyyy')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="mood">Mood</TabsTrigger>
              <TabsTrigger value="energy">Energy</TabsTrigger>
              <TabsTrigger value="productivity">Productivity</TabsTrigger>
            </TabsList>
            <div className="h-[300px]">
              <ResponsiveLine
                data={getChartData()}
                margin={{ top: 20, right: 20, bottom: 50, left: 50 }}
                xScale={{ type: 'point' }}
                yScale={{
                  type: 'linear',
                  min: 0,
                  max: 10,
                  stacked: false,
                }}
                curve="monotoneX"
                axisTop={null}
                axisRight={null}
                axisBottom={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: -45,
                  legend: 'Date',
                  legendOffset: 40,
                  legendPosition: 'middle'
                }}
                axisLeft={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: 0,
                  legend: 'Score (0-10)',
                  legendOffset: -40,
                  legendPosition: 'middle'
                }}
                colors={getChartColor()}
                pointSize={10}
                pointColor={{ theme: 'background' }}
                pointBorderWidth={2}
                pointBorderColor={{ from: 'serieColor' }}
                pointLabelYOffset={-12}
                useMesh={true}
                enableGridX={false}
                enableSlices="x"
                animate={true}
              />
            </div>
          </Tabs>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center">
              <Sparkles className="mr-2 h-5 w-5" />
              AI Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm dark:prose-invert">
              <div dangerouslySetInnerHTML={{ __html: analysis.insightsText }} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5" />
              Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm dark:prose-invert">
              <div dangerouslySetInnerHTML={{ __html: analysis.recommendationsText }} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 