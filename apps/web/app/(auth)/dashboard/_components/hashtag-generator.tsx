'use client';

import React, { useState } from 'react';
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { Textarea } from "@repo/ui/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/components/ui/select";
import { Label } from "@repo/ui/components/ui/label";
import { AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@repo/ui/components/ui/alert";

const platforms = ['Instagram', 'Twitter', 'Facebook', 'LinkedIn', 'TikTok'];

interface HashtagGeneratorClientProps {
  userId: string;
}

export default function HashtagGeneratorClient({ userId }: HashtagGeneratorClientProps) {
  const [description, setDescription] = useState('');
  const [platform, setPlatform] = useState(platforms[0]);
  const [numberOfHashtags, setNumberOfHashtags] = useState('5');
  const [loading, setLoading] = useState(false);
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [creditsRemaining, setCreditsRemaining] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setHashtags([]);

    const formData = new FormData();
    formData.append('description', description);
    formData.append('platform', platform);
    formData.append('numberOfHashtags', numberOfHashtags);
    formData.append('userId', userId);

    try {
      const response = await fetch('/api/v2/hashtag-generator', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setHashtags(data.hashtags);
      setCreditsRemaining(data.creditsRemaining);
    } catch (err) {
      setError('Failed to generate hashtags. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1"
            placeholder="Describe your content here..."
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
          <Label htmlFor="numberOfHashtags">Number of Hashtags</Label>
          <Input
            type="number"
            id="numberOfHashtags"
            value={numberOfHashtags}
            onChange={(e) => setNumberOfHashtags(e.target.value)}
            min="1"
            max="30"
            required
          />
        </div>

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {loading ? 'Generating...' : 'Generate Hashtags'}
        </Button>
      </form>

      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {hashtags.length > 0 && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-2">Generated Hashtags:</h2>
          <div className="flex flex-wrap gap-2">
            {hashtags.map((tag, index) => (
              <span key={index} className="bg-gray-100 px-2 py-1 rounded">{tag}</span>
            ))}
          </div>
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