"use client"

import React, { useState, useEffect } from 'react';
import { Button } from "@repo/ui/components/ui/button";
import { ChevronDown, ChevronUp, Loader, ThumbsUp } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@repo/ui/components/ui/table';
import { Badge } from '@repo/ui/components/ui/badge';
import { toast } from "@repo/ui/hooks/use-toast";

interface RoadmapItem {
  id: string;
  feature: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'PLANNED';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
  votes: number;
  implementationDate?: string;
}

const STATUS_STYLES = {
  "COMPLETED": "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100",
  "IN_PROGRESS": "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100",
  "PLANNED": "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
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
      setItems(data);
    } catch (error) {
      console.error('Error fetching roadmap items:', error);
      toast({
        title: "Failed to fetch roadmap items",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestFeature = () => {
    window.open(`mailto:support@explainx.ai?subject=Request a New Feature`);
  };

  const handleUpvote = async (id: string) => {
    if (upvotedFeatures.includes(id) || upvotingFeatures.includes(id)) {
      return;
    }

    setUpvotingFeatures(prev => [...prev, id]);

    try {
      const feature = items.find(item => item.id === id)?.feature;
      if (!feature) return;

      const response = await fetch('/api/feature-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ feedbackType: 'Feature Upvote', feedback: feature }),
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
      console.error('Error upvoting feature:', error);
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader className="animate-spin h-8 w-8 text-blue-500" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Product Roadmap</h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Track our progress and upcoming features. Vote for features you'd like to see implemented next.
          </p>
        </div>

        <div className="space-y-8">
          {/* Active Items Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
            <div className="p-6">
              <h2 className="text-2xl font-semibold mb-4">Active Development</h2>
              <div className="space-y-4">
                {activeItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-lg font-medium">{item.feature}</h3>
                          <Badge variant="outline" className={STATUS_STYLES[item.status]}>
                            {item.status.replace('_', ' ')}
                          </Badge>
                          <Badge variant="outline" className={PRIORITY_STYLES[item.priority]}>
                            {item.priority} Priority
                          </Badge>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400">{item.description}</p>
                      </div>
                      <div className="ml-4 flex flex-col items-end gap-2">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {item.votes} votes
                        </div>
                        <Button
                          onClick={() => handleUpvote(item.id)}
                          variant="outline"
                          size="sm"
                          className={`${upvotedFeatures.includes(item.id) ? 'bg-gray-100 cursor-not-allowed dark:bg-gray-700' : 'hover:bg-blue-50 dark:hover:bg-blue-900'}`}
                          disabled={upvotedFeatures.includes(item.id) || upvotingFeatures.includes(item.id)}
                        >
                          {upvotingFeatures.includes(item.id) ? (
                            <Loader className="animate-spin h-4 w-4 mr-1" />
                          ) : (
                            <ThumbsUp size={16} className="mr-1" />
                          )}
                          {upvotedFeatures.includes(item.id) ? 'Voted' : 'Upvote'}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Completed Items Section */}
          <div>
            <Button
              onClick={() => setShowCompleted(!showCompleted)}
              variant="outline"
              className="w-full flex items-center justify-center py-3 mb-4"
            >
              {showCompleted ? <ChevronUp size={16} className="mr-2" /> : <ChevronDown size={16} className="mr-2" />}
              {showCompleted ? "Hide Completed Features" : "Show Completed Features"}
            </Button>

            {showCompleted && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-semibold mb-4">Completed Features</h2>
                <div className="space-y-4">
                  {completedItems.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900"
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-lg font-medium">{item.feature}</h3>
                            <Badge variant="outline" className={PRIORITY_STYLES[item.priority]}>
                              {item.priority} Priority
                            </Badge>
                          </div>
                          <p className="text-gray-600 dark:text-gray-400">{item.description}</p>
                          {item.implementationDate && (
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Implemented on {new Date(item.implementationDate).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Don't see what you're looking for?
          </p>
          <Button onClick={handleRequestFeature} variant="default" size="lg">
            Request a New Feature
          </Button>
        </div>
      </div>
    </div>
  );
}