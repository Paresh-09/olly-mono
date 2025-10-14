"use client"

import React, { useState, useEffect } from 'react';
import { Button } from "@repo/ui/components/ui/button";
import { ChevronDown, ChevronUp, Loader, ThumbsUp, Calendar, Users, Star, ChevronRight } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@repo/ui/components/ui/table';
import { Badge } from '@repo/ui/components/ui/badge';
import { toast } from "@repo/ui/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@repo/ui/components/ui/collapsible";
import { FeatureRequestForm } from './feature-request-form';

interface RoadmapItem {
  id: string;
  feature: string;
  status: 'PENDING' | 'COMPLETED' | 'IN_PROGRESS' | 'PLANNED' | 'ALPHA' | 'BETA';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
  votes: number;
  implementationDate?: string;
}

const STATUS_STYLES = {
  "COMPLETED": "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900",
  "IN_PROGRESS": "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-900",
  "PLANNED": "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-900",
  "ALPHA": "bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-900",
  "BETA": "bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-900",
  "PENDING": "bg-gray-50 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400 border-gray-200 dark:border-gray-900"
};

const PRIORITY_STYLES = {
  "HIGH": "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100",
  "MEDIUM": "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100",
  "LOW": "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100"
};

export default function ProductRoadmap() {
  const [showCompleted, setShowCompleted] = useState(false);
  const [items, setItems] = useState<RoadmapItem[]>([]);
  const [upvotedFeatures, setUpvotedFeatures] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [upvotingFeatures, setUpvotingFeatures] = useState<string[]>([]);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  useEffect(() => {
    fetchItems();
    const storedUpvotes = localStorage.getItem('upvotedFeatures');
    if (storedUpvotes) {
      setUpvotedFeatures(JSON.parse(storedUpvotes));
    }
  }, []);

  const fetchItems = async () => {
    try {
      const response = await fetch('/api/admin/roadmap');
      if (!response.ok) {
        throw new Error('Failed to fetch roadmap items');
      }
      const data = await response.json();
      setItems(data.filter((item: RoadmapItem) => item.status !== 'PENDING'));
    } catch (error) {
      toast({
        title: "Failed to fetch roadmap items",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpvote = async (id: string) => {
    if (upvotedFeatures.includes(id) || upvotingFeatures.includes(id)) {
      return;
    }

    setUpvotingFeatures(prev => [...prev, id]);

    try {
      const response = await fetch('/api/roadmap/upvote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ itemId: id }),
      });

      if (!response.ok) {
        throw new Error('Failed to upvote feature');
      }

      setItems(prevItems => 
        prevItems.map(item => 
          item.id === id ? { ...item, votes: item.votes + 1 } : item
        ).sort((a, b) => b.votes - a.votes)
      );

      const newUpvotedFeatures = [...upvotedFeatures, id];
      setUpvotedFeatures(newUpvotedFeatures);
      localStorage.setItem('upvotedFeatures', JSON.stringify(newUpvotedFeatures));
    } catch (error) {
      toast({
        title: "Failed to upvote feature",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setUpvotingFeatures(prev => prev.filter(featureId => featureId !== id));
    }
  };

  const completedItems = items.filter(item => item.status === 'COMPLETED');
  const activeItems = items.filter(item => item.status !== 'COMPLETED');

  const toggleExpand = (id: string) => {
    setExpandedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader className="animate-spin h-8 w-8 text-blue-500" />
      </div>
    );
  }

  return (
    <div className="container max-w-full px-4 py-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-16">
          <div>
            <h1 className="font-cal text-4xl mb-3">Product Roadmap</h1>
            <p className="text-muted-foreground text-lg">
              Help shape the future of Olly AI
            </p>
          </div>
          <FeatureRequestForm />
        </div>

        <div className="grid grid-cols-3 gap-8 mb-12 text-center">
          <div>
            <div className="text-2xl font-cal mb-1">{items.length}</div>
            <div className="text-muted-foreground text-sm">Features Planned</div>
          </div>
          <div>
            <div className="text-2xl font-cal mb-1">{completedItems.length}</div>
            <div className="text-muted-foreground text-sm">Features Completed</div>
          </div>
          <div>
            <div className="text-2xl font-cal mb-1">{items.reduce((acc, item) => acc + item.votes, 0)}</div>
            <div className="text-muted-foreground text-sm">Total Votes</div>
          </div>
        </div>

        <Tabs defaultValue="active" className="space-y-4">
          <TabsList className="w-full grid grid-cols-2 mb-8">
            <TabsTrigger value="active" className="font-cal">Active Development</TabsTrigger>
            <TabsTrigger value="completed" className="font-cal">Completed Features</TabsTrigger>
          </TabsList>

          <TabsContent value="active">
            <div className="space-y-2">
              {activeItems.map((item) => (
                <Collapsible
                  key={item.id}
                  open={expandedItems.includes(item.id)}
                  onOpenChange={() => toggleExpand(item.id)}
                >
                  <Card className="overflow-hidden border-0 bg-background/40">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <CollapsibleTrigger className="flex items-center gap-2 hover:opacity-80">
                            <ChevronRight 
                              className={`h-4 w-4 text-muted-foreground transition-transform ${
                                expandedItems.includes(item.id) ? 'transform rotate-90' : ''
                              }`}
                            />
                            <h3 className="font-cal text-base">{item.feature}</h3>
                          </CollapsibleTrigger>
                          <div className="flex gap-2">
                            <Badge variant="outline" className={STATUS_STYLES[item.status]}>
                              {item.status.replace('_', ' ')}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-muted-foreground">
                            {item.votes} votes
                          </span>
                          <Button 
                            onClick={() => handleUpvote(item.id)} 
                            variant="ghost"
                            size="sm"
                            disabled={upvotedFeatures.includes(item.id)}
                            className={upvotedFeatures.includes(item.id) ? 'text-primary' : ''}
                          >
                            <ThumbsUp size={16} />
                          </Button>
                        </div>
                      </div>
                      <CollapsibleContent className="pt-4 pl-6">
                        <p className="text-sm text-muted-foreground">
                          {item.description}
                        </p>
                      </CollapsibleContent>
                    </CardContent>
                  </Card>
                </Collapsible>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="completed">
            <div className="space-y-2">
              {completedItems.map((item) => (
                <Collapsible
                  key={item.id}
                  open={expandedItems.includes(item.id)}
                  onOpenChange={() => toggleExpand(item.id)}
                >
                  <Card className="bg-gray-50 dark:bg-gray-900">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CollapsibleTrigger className="flex items-center gap-2 hover:opacity-80">
                            <ChevronRight 
                              className={`h-4 w-4 transition-transform ${
                                expandedItems.includes(item.id) ? 'transform rotate-90' : ''
                              }`}
                            />
                            <h3 className="text-base font-medium">{item.feature}</h3>
                          </CollapsibleTrigger>
                          <Badge variant="outline" className={PRIORITY_STYLES[item.priority]}>
                            {item.priority}
                          </Badge>
                        </div>
                        {item.implementationDate && (
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Calendar className="h-4 w-4" />
                            {new Date(item.implementationDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                      <CollapsibleContent className="pt-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {item.description}
                        </p>
                      </CollapsibleContent>
                    </CardContent>
                  </Card>
                </Collapsible>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}