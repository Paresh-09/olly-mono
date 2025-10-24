'use client';

import React, { useState } from 'react';
import { Button } from "@repo/ui/components/ui/button";
import { Textarea } from "@repo/ui/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/components/ui/select";
import { Checkbox } from "@repo/ui/components/ui/checkbox";
import { Label } from "@repo/ui/components/ui/label";
import { AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@repo/ui/components/ui/alert";

const platforms = ['Instagram', 'Twitter', 'Facebook', 'LinkedIn', 'TikTok'];
const tones = ['Casual', 'Professional', 'Humorous', 'Inspirational', 'Informative'];
const lengths = ['Short', 'Medium', 'Long'];

interface PostGeneratorClientProps {
  userId: string;
}

export default function PostGeneratorClient({ userId }: PostGeneratorClientProps) {
  const [topic, setTopic] = useState('');
  const [platform, setPlatform] = useState(platforms[0]);
  const [writingTone, setWritingTone] = useState(tones[0]);
  const [length, setLength] = useState(lengths[0]);
  const [includeHashtags, setIncludeHashtags] = useState(false);
  const [loading, setLoading] = useState(false);
  const [post, setPost] = useState('');
  const [error, setError] = useState('');
  const [creditsRemaining, setCreditsRemaining] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setPost('');

    const formData = new FormData();
    formData.append('topic', topic);
    formData.append('platform', platform);
    formData.append('writingTone', writingTone);
    formData.append('length', length);
    formData.append('includeHashtags', includeHashtags.toString());
    formData.append('userId', userId);

    try {
      const response = await fetch('/api/v2/post-generator', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setPost(data.post);
      setCreditsRemaining(data.creditsRemaining);
    } catch (err) {
      setError('Failed to generate post. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="topic">Topic</Label>
          <Textarea
            id="topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="mt-1"
            placeholder="Enter your post topic here..."
            required
          />
        </div>

        <div>
          <Label htmlFor="platform">Platform</Label>
          <Select value={platform} onValueChange={setPlatform}>
            <SelectTrigger>
              <SelectValue placeholder="Select platform" />
            </SelectTrigger>
            <SelectContent>
              {platforms.map((p) => (
                <SelectItem key={p} value={p}>{p}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="writingTone">Writing Tone</Label>
          <Select value={writingTone} onValueChange={setWritingTone}>
            <SelectTrigger>
              <SelectValue placeholder="Select tone" />
            </SelectTrigger>
            <SelectContent>
              {tones.map((t) => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="length">Length</Label>
          <Select value={length} onValueChange={setLength}>
            <SelectTrigger>
              <SelectValue placeholder="Select length" />
            </SelectTrigger>
            <SelectContent>
              {lengths.map((l) => (
                <SelectItem key={l} value={l}>{l}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="includeHashtags"
            checked={includeHashtags}
            onCheckedChange={(checked) => setIncludeHashtags(checked as boolean)}
          />
          <Label htmlFor="includeHashtags">Include Hashtags</Label>
        </div>

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {loading ? 'Generating...' : 'Generate Post'}
        </Button>
      </form>

      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
          </Alert>
      )}

      {post && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-2">Generated Post:</h2>
          <div className="p-4 bg-gray-100 rounded whitespace-pre-wrap">{post}</div>
        </div>
      )}

      {creditsRemaining !== null && (
        <div className="mt-4 text-sm text-gray-600">
          Credits remaining: {creditsRemaining}
        </div>
      )}
    </div>
  );
}