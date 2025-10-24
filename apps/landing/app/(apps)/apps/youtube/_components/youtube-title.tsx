"use client"

import React, { useState, useEffect } from 'react';
import { Button } from '@repo/ui/components/ui/button';
import { Input } from '@repo/ui/components/ui/input';
import { v4 as uuidv4 } from 'uuid';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@repo/ui/components/ui/card';
import { Label } from '@repo/ui/components/ui/label';

const MAX_TOPIC_LENGTH = 1000;
const MAX_TITLE_LENGTH = 100;

const YouTubeTitleGenerator: React.FC = () => {
  const [topic, setTopic] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [userId, setUserId] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const storedUserId = localStorage.getItem('youtubeGeneratorUserId');
    if (storedUserId) {
      setUserId(storedUserId);
    } else {
      const newUserId = uuidv4();
      setUserId(newUserId);
      localStorage.setItem('youtubeGeneratorUserId', newUserId);
    }
  }, []);

  const generateTitle = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/openai/youtube', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: topic, type: 'title', userId }),
      });
      const data = await response.json();
      if (data.error) {
        alert(data.error);
      } else {
        setTitle(data.title.slice(0, MAX_TITLE_LENGTH));
      }
    } catch (error) {
      console.error('Error generating title:', error);
      alert('Failed to generate title. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTopicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTopic(e.target.value.slice(0, MAX_TOPIC_LENGTH));
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Generate Your YouTube Title</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="topic">Video Topic ({topic.length}/{MAX_TOPIC_LENGTH})</Label>
            <Input 
              id="topic"
              placeholder="Enter video topic" 
              value={topic} 
              onChange={handleTopicChange} 
              maxLength={MAX_TOPIC_LENGTH}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={generateTitle} disabled={isLoading} className="w-full">
            {isLoading ? 'Generating...' : 'Generate Title'}
          </Button>
        </CardFooter>
      </Card>
      
      {title && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Title</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">{title}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default YouTubeTitleGenerator;