"use client"

import React, { useState, useEffect } from 'react';
import { Button } from '@repo/ui/components/ui/button';
import { Input } from '@repo/ui/components/ui/input';
import { Textarea } from '@repo/ui/components/ui/textarea';
import { v4 as uuidv4 } from 'uuid';

export default function YouTubeCombinedGenerator() {
  const [description, setDescription] = useState('');
  const [generatedTitle, setGeneratedTitle] = useState('');
  const [generatedDescription, setGeneratedDescription] = useState('');
  const [generatedTags, setGeneratedTags] = useState<string[]>([]);
  const [userId, setUserId] = useState('');

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

  const generateAll = async () => {
    try {
      const response = await fetch('/api/openai/youtube', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description, type: 'all', userId }),
      });
      const data = await response.json();
      if (data.error) {
        alert(data.error);
      } else {
        setGeneratedTitle(data.title);
        setGeneratedDescription(data.description);
        setGeneratedTags(data.tags);
      }
    } catch (error) {
      console.error('Error generating content:', error);
      alert('Failed to generate content. Please try again.');
    }
  };

  const copyTags = () => {
    const tagString = generatedTags.join(', ');
    navigator.clipboard.writeText(tagString);
    alert('Tags copied to clipboard!');
  };

  return (
    <div className="space-y-4">
      <Textarea 
        placeholder="Enter video description" 
        value={description} 
        onChange={(e) => setDescription(e.target.value)} 
      />
      <Button onClick={generateAll}>Generate All</Button>
      <Input 
        placeholder="Generated title will appear here" 
        value={generatedTitle} 
        readOnly 
      />
      <Textarea 
        placeholder="Generated description will appear here" 
        value={generatedDescription} 
        readOnly 
      />
      <div className="flex flex-wrap gap-2">
        {generatedTags.map((tag, index) => (
          <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
            {tag}
          </span>
        ))}
      </div>
      {generatedTags.length > 0 && (
        <Button onClick={copyTags}>Copy Tags</Button>
      )}
    </div>
  );
}