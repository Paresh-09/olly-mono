'use client';

import React, { useState } from 'react';
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { Textarea } from "@repo/ui/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/components/ui/select";
import { Checkbox } from "@repo/ui/components/ui/checkbox";
import { Label } from "@repo/ui/components/ui/label";
import { AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@repo/ui/components/ui/alert";

const platforms = ['Instagram', 'Twitter', 'Facebook', 'LinkedIn', 'TikTok'];
const tones = ['Casual', 'Professional', 'Humorous', 'Inspirational', 'Informative'];
const lengths = ['Short', 'Medium', 'Long'];

interface CaptionGeneratorClientProps {
  userId: string;
}

export default function CaptionGeneratorClient({ userId }: CaptionGeneratorClientProps) {
  const [description, setDescription] = useState('');
  const [platform, setPlatform] = useState(platforms[0]);
  const [writingTone, setWritingTone] = useState(tones[0]);
  const [length, setLength] = useState(lengths[0]);
  const [addHashtags, setAddHashtags] = useState(false);
  const [addEmoji, setAddEmoji] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [caption, setCaption] = useState('');
  const [error, setError] = useState('');
  const [creditsRemaining, setCreditsRemaining] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description && !image) {
      setError('Please provide either a description or an image.');
      return;
    }
    setLoading(true);
    setError('');
    setCaption('');

    const formData = new FormData();
    formData.append('description', description);
    formData.append('platform', platform);
    formData.append('writingTone', writingTone);
    formData.append('length', length);
    formData.append('addHashtags', addHashtags.toString());
    formData.append('addEmoji', addEmoji.toString());
    formData.append('userId', userId);
    if (image) formData.append('image', image);

    try {
      const response = await fetch('/api/v2/caption-generator', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setCaption(data.caption);
      setCreditsRemaining(data.creditsRemaining);
    } catch (err) {
      setError('Failed to generate caption. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="description">Description (or upload an image below)</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1"
            placeholder="Describe your content here..."
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

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="addHashtags"
              checked={addHashtags}
              onCheckedChange={(checked) => setAddHashtags(checked as boolean)}
            />
            <Label htmlFor="addHashtags">Add Hashtags</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="addEmoji"
              checked={addEmoji}
              onCheckedChange={(checked) => setAddEmoji(checked as boolean)}
            />
            <Label htmlFor="addEmoji">Add Emoji</Label>
          </div>
        </div>

        <div>
          <Label htmlFor="image">Upload Image</Label>
          <Input
            type="file"
            id="image"
            onChange={(e) => setImage(e.target.files?.[0] || null)}
            accept="image/*"
          />
        </div>

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {loading ? 'Generating...' : 'Generate Caption'}
        </Button>
      </form>

      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {caption && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-2">Generated Caption:</h2>
          <p className="p-4 bg-gray-100 rounded">{caption}</p>
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