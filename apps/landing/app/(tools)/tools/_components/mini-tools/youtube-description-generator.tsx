"use client";

import { useState, useEffect } from 'react'
import { Card } from '@repo/ui/components/ui/card'
import { Input } from '@repo/ui/components/ui/input'
import { Button } from '@repo/ui/components/ui/button'
import { Badge } from '@repo/ui/components/ui/badge'
import { Alert, AlertDescription } from "@repo/ui/components/ui/alert"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/ui/select"
import { Textarea } from "@repo/ui/components/ui/textarea"
import { Slider } from "@repo/ui/components/ui/slider"
import { toast } from '@repo/ui/hooks/use-toast'
import AuthPopup from "../authentication"
import { useAuthLimit } from '@/hooks/use-auth-check'

interface YouTubeDescription {
  text: string
  category: string
  style: string
  details?: string
  formalityLevel: number
}

interface SavedChannel {
  name: string
  details: string
}

const YOUTUBE_CATEGORIES = [
  "Gaming",
  "Technology",
  "Education",
  "Entertainment",
  "Music",
  "Vlog",
  "Cooking",
  "Fitness",
  "Beauty",
  "Travel",
  "DIY & Crafts",
  "Business",
  "Reviews",
  "Comedy",
  "News & Politics"
];

const DESCRIPTION_STYLES = [
  "Professional",
  "Casual",
  "Informative",
  "Entertaining",
  "Inspirational",
  "Tutorial-focused",
  "Community-oriented",
  "Brand-focused"
];

const LOCAL_STORAGE_KEY = 'user_youtube_description_data';

export const YouTubeDescriptionGenerator = () => {
  const [savedDescriptions, setSavedDescriptions] = useState<YouTubeDescription[]>([])
  const [savedChannels, setSavedChannels] = useState<SavedChannel[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("Entertainment")
  const [selectedStyle, setSelectedStyle] = useState<string>("Professional")
  const [channelDetails, setChannelDetails] = useState("")
  const [channelName, setChannelName] = useState("")
  const [formalityLevel, setFormalityLevel] = useState(50)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedDescriptions, setGeneratedDescriptions] = useState<string[]>([])

  const {
    isAuthenticated,
    showAuthPopup,
    setShowAuthPopup,
    checkUsageLimit,
    incrementUsage,
    handleSuccessfulAuth,
    remainingUses
  } = useAuthLimit({
    toolId: 'youtube-description-generator',
    dailyLimit: 3
  });

  // Load saved data from localStorage
  useEffect(() => {
    const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedData) {
      try {
        const { descriptions, channels } = JSON.parse(savedData);
        setSavedDescriptions(descriptions || []);
        setSavedChannels(channels || []);
      } catch (error) {
        console.error('Error loading saved data:', error);
      }
    }
  }, []);

  // Save data to localStorage when they change
  useEffect(() => {
    if (isAuthenticated) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({
        descriptions: savedDescriptions,
        channels: savedChannels
      }));
    }
  }, [savedDescriptions, savedChannels, isAuthenticated]);

  const generateYouTubeDescriptions = async () => {
    if (!checkUsageLimit()) {
      return;
    }

    setIsGenerating(true);

    try {
      const formData = new FormData();
      formData.append('content', JSON.stringify({
        category: selectedCategory,
        style: selectedStyle,
        channelDetails,
        channelName,
        formalityLevel
      }));
      formData.append('toolType', 'youtube-description-generator');

      const response = await fetch('/api/tools/generations', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (data.lines) {
        setGeneratedDescriptions(data.lines);
        if (!isAuthenticated) {
          incrementUsage();
        }
      } else {
        toast({
          title: "Error",
          description: "Failed to generate YouTube descriptions",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const saveDescription = (description: string) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to save descriptions",
        variant: "destructive"
      });
      setShowAuthPopup(true);
      return;
    }

    setSavedDescriptions([...savedDescriptions, {
      text: description,
      category: selectedCategory,
      style: selectedStyle,
      details: channelDetails,
      formalityLevel
    }]);

    toast({
      title: "Success",
      description: "Description saved to your collection"
    });
  };

  const saveChannel = () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to save channel details",
        variant: "destructive"
      });
      setShowAuthPopup(true);
      return;
    }

    if (!channelDetails.trim()) {
      toast({
        title: "Error",
        description: "Please enter channel details",
        variant: "destructive"
      });
      return;
    }

    const channelProfileName = channelName || `${selectedCategory} Channel`;
    setSavedChannels([...savedChannels, {
      name: channelProfileName,
      details: channelDetails
    }]);

    toast({
      title: "Success",
      description: "Channel details saved for future use"
    });
  };

  const loadChannel = (channel: SavedChannel) => {
    setChannelDetails(channel.details);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: "Description copied to clipboard"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy text",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="p-6">
      {!isAuthenticated && (
        <Alert className="mb-4">
          <AlertDescription>
            You have {remainingUses} free generations remaining today. Sign in for unlimited access and to save your favorite descriptions.
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-6">
        {/* Category and Style Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {YOUTUBE_CATEGORIES.map(category => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedStyle} onValueChange={setSelectedStyle}>
            <SelectTrigger>
              <SelectValue placeholder="Select style" />
            </SelectTrigger>
            <SelectContent>
              {DESCRIPTION_STYLES.map(style => (
                <SelectItem key={style} value={style}>
                  {style}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Channel Details */}
        <div className="space-y-4">
          <Input
            placeholder="Your channel name"
            value={channelName}
            onChange={(e) => setChannelName(e.target.value)}
          />

          <Textarea
            placeholder="Describe your channel content, target audience, and goals"
            value={channelDetails}
            onChange={(e) => setChannelDetails(e.target.value)}
            rows={3}
          />

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={saveChannel}
              disabled={!isAuthenticated}
            >
              Save Channel
            </Button>
            {savedChannels.length > 0 && (
              <Select onValueChange={(value) => {
                const channel = savedChannels.find(c => c.name === value);
                if (channel) loadChannel(channel);
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Load saved channel" />
                </SelectTrigger>
                <SelectContent>
                  {savedChannels.map(channel => (
                    <SelectItem key={channel.name} value={channel.name}>
                      {channel.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        {/* Formality Level */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Formality Level: {formalityLevel}%
          </label>
          <Slider
            value={[formalityLevel]}
            onValueChange={([value]) => setFormalityLevel(value)}
            min={0}
            max={100}
            step={10}
          />
        </div>

        {/* Generate Button */}
        <Button
          onClick={generateYouTubeDescriptions}
          disabled={isGenerating || (!isAuthenticated && remainingUses <= 0)}
          className="w-full"
        >
          {isGenerating ? "Generating..." : "Generate YouTube Descriptions"}
        </Button>

        {/* Generated Descriptions */}
        {generatedDescriptions.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Generated Descriptions:</h3>
            <div className="space-y-2">
              {generatedDescriptions.map((description, index) => (
                <div key={index} className="flex items-start justify-between p-3 bg-secondary rounded-lg">
                  <p className="whitespace-pre-wrap mr-2">{description}</p>
                  <div className="flex gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(description)}
                    >
                      Copy
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => saveDescription(description)}
                      disabled={!isAuthenticated}
                    >
                      Save
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Saved Descriptions */}
        {isAuthenticated && savedDescriptions.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Your Saved Descriptions:</h3>
            <div className="space-y-2">
              {savedDescriptions.map((description, index) => (
                <div key={index} className="flex items-start justify-between p-3 bg-secondary rounded-lg">
                  <div>
                    <p className="whitespace-pre-wrap">{description.text}</p>
                    <div className="flex gap-2 mt-1 flex-wrap">
                      <Badge variant="outline">{description.category}</Badge>
                      <Badge variant="outline">{description.style}</Badge>
                      <Badge variant="outline">Formality: {description.formalityLevel}%</Badge>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(description.text)}
                    className="ml-2 shrink-0"
                  >
                    Copy
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <AuthPopup
        isOpen={showAuthPopup}
        onClose={() => setShowAuthPopup(false)}
        onSuccess={handleSuccessfulAuth}
      />
    </Card>
  )
} 