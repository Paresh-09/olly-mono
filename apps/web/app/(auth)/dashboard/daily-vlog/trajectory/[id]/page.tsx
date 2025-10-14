'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/ui/components/ui/tabs';
import { Separator } from '@repo/ui/components/ui/separator';
import { Button } from '@repo/ui/components/ui/button';
import { toast } from '@repo/ui/hooks/use-toast';
import { format } from 'date-fns';
import { LineChart, BarChart, TrendingUp, Brain, Activity, Users, Lightbulb, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { ResponsiveLine } from '@nivo/line';

interface TrajectoryAnalysis {
  id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  startDate: string;
  endDate: string;
  entryCount: number;
  analysis: string;
  recommendations: string;
  graphData: string;
  status: string;
}

interface GraphData {
  mood: { date: string; value: number }[];
  energy: { date: string; value: number }[];
  productivity: { date: string; value: number }[];
  social: { date: string; value: number }[];
}

interface Analysis {
  summary: string;
  moodTrend: string;
  activities: string;
  challenges: string;
  achievements: string;
  social: string;
  workLifeBalance: string;
  health: string;
}

interface Recommendations {
  summary: string;
  mentalHealth: string[];
  physicalHealth: string[];
  workProductivity: string[];
  socialConnections: string[];
  personalGrowth: string[];
  habits: {
    build: string[];
    break: string[];
  };
}

export default function TrajectoryPage() {
  const params = useParams();
  const id = params.id as string;
  
  const [analysis, setAnalysis] = useState<TrajectoryAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [parsedAnalysis, setParsedAnalysis] = useState<Analysis | null>(null);
  const [parsedRecommendations, setParsedRecommendations] = useState<Recommendations | null>(null);
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  
  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/daily-vlog/trajectory?id=${id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch trajectory analysis');
        }
        
        const data = await response.json();
        setAnalysis(data);
        
        // Parse the JSON strings
        if (data.status === 'COMPLETED') {
          try {
            setParsedAnalysis(JSON.parse(data.analysis));
            setParsedRecommendations(JSON.parse(data.recommendations));
            setGraphData(JSON.parse(data.graphData));
          } catch (parseError) {
            console.error('Error parsing analysis data:', parseError);
          }
        }
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
    
    fetchAnalysis();
    
    // Poll for updates if the analysis is still processing
    const intervalId = setInterval(async () => {
      if (analysis?.status === 'PROCESSING') {
        fetchAnalysis();
      } else {
        clearInterval(intervalId);
      }
    }, 10000); // Poll every 10 seconds
    
    return () => clearInterval(intervalId);
  }, [id, analysis?.status]);
  
  // Format the data for the charts
  const prepareChartData = (data: GraphData | null) => {
    if (!data) return [];
    
    return [
      {
        id: 'Mood',
        data: data.mood.map(item => ({ x: item.date, y: item.value }))
      },
      {
        id: 'Energy',
        data: data.energy.map(item => ({ x: item.date, y: item.value }))
      },
      {
        id: 'Productivity',
        data: data.productivity.map(item => ({ x: item.date, y: item.value }))
      },
      {
        id: 'Social',
        data: data.social.map(item => ({ x: item.date, y: item.value }))
      }
    ];
  };
  
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Loading Analysis</h2>
        <p className="text-muted-foreground">Please wait while we load your trajectory analysis...</p>
      </div>
    );
  }
  
  if (!analysis) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="mb-4 p-4 rounded-full bg-destructive/10">
          <TrendingUp className="h-12 w-12 text-destructive" />
        </div>
        <h2 className="text-2xl font-semibold mb-2">Analysis Not Found</h2>
        <p className="text-muted-foreground mb-6">The trajectory analysis you're looking for doesn't exist or has been deleted.</p>
        <Button asChild>
          <Link href="/dashboard/daily-vlog">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Daily Vlog
          </Link>
        </Button>
      </div>
    );
  }
  
  if (analysis.status === 'PROCESSING') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Generating Your Analysis</h2>
        <p className="text-muted-foreground mb-1">This may take a few minutes to complete.</p>
        <p className="text-muted-foreground mb-6">We're analyzing {analysis.entryCount} vlog entries from the past 30 days.</p>
        <Button asChild variant="outline">
          <Link href="/dashboard/daily-vlog">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Daily Vlog
          </Link>
        </Button>
      </div>
    );
  }
  
  if (analysis.status === 'FAILED') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="mb-4 p-4 rounded-full bg-destructive/10">
          <TrendingUp className="h-12 w-12 text-destructive" />
        </div>
        <h2 className="text-2xl font-semibold mb-2">Analysis Failed</h2>
        <p className="text-muted-foreground mb-6">We encountered an error while generating your trajectory analysis. Please try again.</p>
        <Button asChild>
          <Link href="/dashboard/daily-vlog">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Daily Vlog
          </Link>
        </Button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Life Trajectory Analysis</h1>
          <p className="text-muted-foreground">
            Based on {analysis.entryCount} vlog entries from {format(new Date(analysis.startDate), 'MMM d, yyyy')} to {format(new Date(analysis.endDate), 'MMM d, yyyy')}
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/dashboard/daily-vlog">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Daily Vlog
          </Link>
        </Button>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Insights
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            Recommendations
          </TabsTrigger>
          <TabsTrigger value="graphs" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Graphs
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
              <CardDescription>Overall analysis of your life trajectory</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-lg">{parsedAnalysis?.summary}</p>
              
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">Key Insights</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Mood: {parsedAnalysis?.moodTrend.split('.')[0]}.</li>
                    <li>Activities: {parsedAnalysis?.activities.split('.')[0]}.</li>
                    <li>Social: {parsedAnalysis?.social.split('.')[0]}.</li>
                    <li>Health: {parsedAnalysis?.health.split('.')[0]}.</li>
                  </ul>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">Top Recommendations</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {parsedRecommendations?.mentalHealth.slice(0, 1).map((rec, i) => (
                      <li key={`mental-${i}`}>{rec}</li>
                    ))}
                    {parsedRecommendations?.physicalHealth.slice(0, 1).map((rec, i) => (
                      <li key={`physical-${i}`}>{rec}</li>
                    ))}
                    {parsedRecommendations?.workProductivity.slice(0, 1).map((rec, i) => (
                      <li key={`work-${i}`}>{rec}</li>
                    ))}
                    {parsedRecommendations?.socialConnections.slice(0, 1).map((rec, i) => (
                      <li key={`social-${i}`}>{rec}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {graphData && (
            <Card>
              <CardHeader>
                <CardTitle>Life Trends</CardTitle>
                <CardDescription>Visualization of your mood, energy, productivity, and social interactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveLine
                    data={prepareChartData(graphData)}
                    margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
                    xScale={{ type: 'point' }}
                    yScale={{ type: 'linear', min: 0, max: 10, stacked: false }}
                    axisTop={null}
                    axisRight={null}
                    axisBottom={{
                      tickSize: 5,
                      tickPadding: 5,
                      tickRotation: -45,
                      legend: 'Date',
                      legendOffset: 36,
                      legendPosition: 'middle'
                    }}
                    axisLeft={{
                      tickSize: 5,
                      tickPadding: 5,
                      tickRotation: 0,
                      legend: 'Score (1-10)',
                      legendOffset: -40,
                      legendPosition: 'middle'
                    }}
                    colors={{ scheme: 'category10' }}
                    pointSize={10}
                    pointColor={{ theme: 'background' }}
                    pointBorderWidth={2}
                    pointBorderColor={{ from: 'serieColor' }}
                    pointLabelYOffset={-12}
                    useMesh={true}
                    legends={[
                      {
                        anchor: 'bottom-right',
                        direction: 'column',
                        justify: false,
                        translateX: 100,
                        translateY: 0,
                        itemsSpacing: 0,
                        itemDirection: 'left-to-right',
                        itemWidth: 80,
                        itemHeight: 20,
                        itemOpacity: 0.75,
                        symbolSize: 12,
                        symbolShape: 'circle',
                        symbolBorderColor: 'rgba(0, 0, 0, .5)',
                        effects: [
                          {
                            on: 'hover',
                            style: {
                              itemBackground: 'rgba(0, 0, 0, .03)',
                              itemOpacity: 1
                            }
                          }
                        ]
                      }
                    ]}
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="insights" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Detailed Insights</CardTitle>
              <CardDescription>In-depth analysis of different aspects of your life</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-2">Mood & Emotions</h3>
                <p>{parsedAnalysis?.moodTrend}</p>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-xl font-semibold mb-2">Activities & Interests</h3>
                <p>{parsedAnalysis?.activities}</p>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-xl font-semibold mb-2">Challenges & Stressors</h3>
                <p>{parsedAnalysis?.challenges}</p>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-xl font-semibold mb-2">Achievements & Positive Moments</h3>
                <p>{parsedAnalysis?.achievements}</p>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-xl font-semibold mb-2">Social Interactions & Relationships</h3>
                <p>{parsedAnalysis?.social}</p>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-xl font-semibold mb-2">Work/Life Balance</h3>
                <p>{parsedAnalysis?.workLifeBalance}</p>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-xl font-semibold mb-2">Health & Wellness</h3>
                <p>{parsedAnalysis?.health}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="recommendations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personalized Recommendations</CardTitle>
              <CardDescription>Actionable advice to improve your well-being and happiness</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-2">Summary</h3>
                <p>{parsedRecommendations?.summary}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Brain className="h-5 w-5" /> Mental Health
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc pl-5 space-y-2">
                      {parsedRecommendations?.mentalHealth.map((rec, i) => (
                        <li key={`mental-${i}`}>{rec}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Activity className="h-5 w-5" /> Physical Health
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc pl-5 space-y-2">
                      {parsedRecommendations?.physicalHealth.map((rec, i) => (
                        <li key={`physical-${i}`}>{rec}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" /> Work & Productivity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc pl-5 space-y-2">
                      {parsedRecommendations?.workProductivity.map((rec, i) => (
                        <li key={`work-${i}`}>{rec}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Users className="h-5 w-5" /> Social Connections
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc pl-5 space-y-2">
                      {parsedRecommendations?.socialConnections.map((rec, i) => (
                        <li key={`social-${i}`}>{rec}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Lightbulb className="h-5 w-5" /> Personal Growth
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc pl-5 space-y-2">
                      {parsedRecommendations?.personalGrowth.map((rec, i) => (
                        <li key={`personal-${i}`}>{rec}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Habits</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-1">Habits to Build</h4>
                        <ul className="list-disc pl-5 space-y-1">
                          {parsedRecommendations?.habits.build.map((habit, i) => (
                            <li key={`build-${i}`}>{habit}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold mb-1">Habits to Break</h4>
                        <ul className="list-disc pl-5 space-y-1">
                          {parsedRecommendations?.habits.break.map((habit, i) => (
                            <li key={`break-${i}`}>{habit}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="graphs" className="space-y-6">
          {graphData ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Mood & Energy Trends</CardTitle>
                  <CardDescription>Visualization of your emotional and energy levels over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveLine
                      data={[
                        {
                          id: 'Mood',
                          data: graphData.mood.map(item => ({ x: item.date, y: item.value }))
                        },
                        {
                          id: 'Energy',
                          data: graphData.energy.map(item => ({ x: item.date, y: item.value }))
                        }
                      ]}
                      margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
                      xScale={{ type: 'point' }}
                      yScale={{ type: 'linear', min: 0, max: 10, stacked: false }}
                      axisTop={null}
                      axisRight={null}
                      axisBottom={{
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: -45,
                        legend: 'Date',
                        legendOffset: 36,
                        legendPosition: 'middle'
                      }}
                      axisLeft={{
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: 0,
                        legend: 'Score (1-10)',
                        legendOffset: -40,
                        legendPosition: 'middle'
                      }}
                      colors={{ scheme: 'category10' }}
                      pointSize={10}
                      pointColor={{ theme: 'background' }}
                      pointBorderWidth={2}
                      pointBorderColor={{ from: 'serieColor' }}
                      pointLabelYOffset={-12}
                      useMesh={true}
                      legends={[
                        {
                          anchor: 'bottom-right',
                          direction: 'column',
                          justify: false,
                          translateX: 100,
                          translateY: 0,
                          itemsSpacing: 0,
                          itemDirection: 'left-to-right',
                          itemWidth: 80,
                          itemHeight: 20,
                          itemOpacity: 0.75,
                          symbolSize: 12,
                          symbolShape: 'circle',
                          symbolBorderColor: 'rgba(0, 0, 0, .5)',
                          effects: [
                            {
                              on: 'hover',
                              style: {
                                itemBackground: 'rgba(0, 0, 0, .03)',
                                itemOpacity: 1
                              }
                            }
                          ]
                        }
                      ]}
                    />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Productivity & Social Trends</CardTitle>
                  <CardDescription>Visualization of your productivity and social interaction levels over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveLine
                      data={[
                        {
                          id: 'Productivity',
                          data: graphData.productivity.map(item => ({ x: item.date, y: item.value }))
                        },
                        {
                          id: 'Social',
                          data: graphData.social.map(item => ({ x: item.date, y: item.value }))
                        }
                      ]}
                      margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
                      xScale={{ type: 'point' }}
                      yScale={{ type: 'linear', min: 0, max: 10, stacked: false }}
                      axisTop={null}
                      axisRight={null}
                      axisBottom={{
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: -45,
                        legend: 'Date',
                        legendOffset: 36,
                        legendPosition: 'middle'
                      }}
                      axisLeft={{
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: 0,
                        legend: 'Score (1-10)',
                        legendOffset: -40,
                        legendPosition: 'middle'
                      }}
                      colors={{ scheme: 'category10' }}
                      pointSize={10}
                      pointColor={{ theme: 'background' }}
                      pointBorderWidth={2}
                      pointBorderColor={{ from: 'serieColor' }}
                      pointLabelYOffset={-12}
                      useMesh={true}
                      legends={[
                        {
                          anchor: 'bottom-right',
                          direction: 'column',
                          justify: false,
                          translateX: 100,
                          translateY: 0,
                          itemsSpacing: 0,
                          itemDirection: 'left-to-right',
                          itemWidth: 80,
                          itemHeight: 20,
                          itemOpacity: 0.75,
                          symbolSize: 12,
                          symbolShape: 'circle',
                          symbolBorderColor: 'rgba(0, 0, 0, .5)',
                          effects: [
                            {
                              on: 'hover',
                              style: {
                                itemBackground: 'rgba(0, 0, 0, .03)',
                                itemOpacity: 1
                              }
                            }
                          ]
                        }
                      ]}
                    />
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>No Graph Data Available</CardTitle>
              </CardHeader>
              <CardContent>
                <p>We couldn't generate graph data for your trajectory analysis. This might be due to insufficient data points or an error in processing.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
} 