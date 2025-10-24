'use client'

import React, { useState, useEffect } from 'react';
import { Button } from '@repo/ui/components/ui/button';
import { Input } from '@repo/ui/components/ui/input';
import { v4 as uuidv4 } from 'uuid';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@repo/ui/components/ui/card';
import { Label } from '@repo/ui/components/ui/label';

const MAX_TOPIC_LENGTH = 1000;

const YouTubeTagsGenerator: React.FC = () => {
  const [topic, setTopic] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);
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

  const generateTags = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/openai/youtube', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: topic, type: 'tags', userId }),
      });
      const data = await response.json();
      if (data.error) {
        alert(data.error);
      } else {
        setTags(data.tags);
      }
    } catch (error) {
      console.error('Error generating tags:', error);
      alert('Failed to generate tags. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyTags = () => {
    const tagString = tags.join(', ');
    navigator.clipboard.writeText(tagString);
    alert('Tags copied to clipboard!');
  };

  const handleTopicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTopic(e.target.value.slice(0, MAX_TOPIC_LENGTH));
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Generate Your YouTube Tags</CardTitle>
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
          <Button onClick={generateTags} disabled={isLoading} className="w-full">
            {isLoading ? 'Generating...' : 'Generate Tags'}
          </Button>
        </CardFooter>
      </Card>
      
      {tags.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Tags</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, index) => (
                <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {tag}
                </span>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={copyTags} className="w-full">Copy Tags</Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};

export default YouTubeTagsGenerator;