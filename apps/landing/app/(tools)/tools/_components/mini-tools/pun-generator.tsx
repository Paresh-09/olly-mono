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

interface PunData {
  text: string
  style: string
  topic: string
  complexity: number
}

interface SavedTopic {
  name: string
  details: string
}

const PUN_STYLES = [
  "Dad Jokes",
  "Word Play",
  "Double Meaning",
  "Rhyming",
  "Pop Culture",
  "Food Puns",
  "Animal Puns",
  "Science Puns",
];

const TOPIC_CATEGORIES = [
  "Food & Cooking",
  "Animals",
  "Technology",
  "Sports",
  "Movies",
  "Music",
  "Science",
  "Business"
];

const LOCAL_STORAGE_KEY = 'user_pun_data';

export const PunGenerator = () => {
  const [savedPuns, setSavedPuns] = useState<PunData[]>([])
  const [savedTopics, setSavedTopics] = useState<SavedTopic[]>([])
  const [selectedStyle, setSelectedStyle] = useState<string>("Dad Jokes")
  const [topicCategory, setTopicCategory] = useState<string>("Food & Cooking")
  const [topicDetails, setTopicDetails] = useState("")
  const [keywords, setKeywords] = useState("")
  const [complexity, setComplexity] = useState(50)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedPuns, setGeneratedPuns] = useState<string[]>([])

  const {
    isAuthenticated,
    showAuthPopup,
    setShowAuthPopup,
    checkUsageLimit,
    incrementUsage,
    handleSuccessfulAuth,
    remainingUses
  } = useAuthLimit({
    toolId: 'pun-generator',
    dailyLimit: 5
  });

  // Load saved data from localStorage
  useEffect(() => {
    const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedData) {
      try {
        const { puns, topics } = JSON.parse(savedData);
        setSavedPuns(puns || []);
        setSavedTopics(topics || []);
      } catch (error) {
        console.error('Error loading saved data:', error);
      }
    }
  }, []);

  // Save data to localStorage when they change
  useEffect(() => {
    if (isAuthenticated) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({
        puns: savedPuns,
        topics: savedTopics
      }));
    }
  }, [savedPuns, savedTopics, isAuthenticated]);

  const generatePuns = async () => {
    if (!checkUsageLimit()) {
      return;
    }

    setIsGenerating(true);

    try {
      const formData = new FormData();
      formData.append('content', JSON.stringify({
        style: selectedStyle,
        topicCategory,
        topicDetails,
        keywords,
        complexity
      }));
      formData.append('toolType', 'pun-generator');

      const response = await fetch('/api/tools/generations', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (data.puns) {
        setGeneratedPuns(data.puns);
        if (!isAuthenticated) {
          incrementUsage();
        }
      } else {
        toast({
          title: "Error",
          description: "Failed to generate puns",
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

  const savePun = (pun: string) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to save puns",
        variant: "destructive"
      });
      setShowAuthPopup(true);
      return;
    }

    setSavedPuns([...savedPuns, {
      text: pun,
      style: selectedStyle,
      topic: topicCategory,
      complexity
    }]);

    toast({
      title: "Success",
      description: "Pun saved to your collection"
    });
  };

  const saveTopic = () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to save topics",
        variant: "destructive"
      });
      setShowAuthPopup(true);
      return;
    }

    if (!topicDetails.trim()) {
      toast({
        title: "Error",
        description: "Please enter topic details",
        variant: "destructive"
      });
      return;
    }

    const topicName = `${topicCategory} - ${new Date().toLocaleDateString()}`;
    setSavedTopics([...savedTopics, {
      name: topicName,
      details: topicDetails
    }]);

    toast({
      title: "Success",
      description: "Topic saved for future use"
    });
  };

  const loadTopic = (topic: SavedTopic) => {
    setTopicDetails(topic.details);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: "Pun copied to clipboard"
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
            You have {remainingUses} free generations remaining today. Sign in for unlimited access and to save your puns.
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-6">
        {/* Style and Topic Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select value={selectedStyle} onValueChange={setSelectedStyle}>
            <SelectTrigger>
              <SelectValue placeholder="Select pun style" />
            </SelectTrigger>
            <SelectContent>
              {PUN_STYLES.map(style => (
                <SelectItem key={style} value={style}>
                  {style}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={topicCategory} onValueChange={setTopicCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Select topic" />
            </SelectTrigger>
            <SelectContent>
              {TOPIC_CATEGORIES.map(topic => (
                <SelectItem key={topic} value={topic}>
                  {topic}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Topic Details and Keywords */}
        <div className="space-y-4">
          <Textarea
            placeholder="Describe your topic in detail (e.g., coffee shop experience, cat behavior)"
            value={topicDetails}
            onChange={(e) => setTopicDetails(e.target.value)}
            rows={3}
          />

          <Input
            placeholder="Key words or phrases to include (comma separated)"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
          />

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={saveTopic}
              disabled={!isAuthenticated}
            >
              Save Topic
            </Button>
            {savedTopics.length > 0 && (
              <Select onValueChange={(value) => {
                const topic = savedTopics.find(t => t.name === value);
                if (topic) loadTopic(topic);
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Load saved topic" />
                </SelectTrigger>
                <SelectContent>
                  {savedTopics.map(topic => (
                    <SelectItem key={topic.name} value={topic.name}>
                      {topic.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        {/* Complexity Level */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Complexity Level: {complexity}%
          </label>
          <Slider
            value={[complexity]}
            onValueChange={([value]) => setComplexity(value)}
            min={0}
            max={100}
            step={10}
          />
        </div>

        {/* Generate Button */}
        <Button
          onClick={generatePuns}
          disabled={isGenerating || (!isAuthenticated && remainingUses <= 0)}
          className="w-full"
        >
          {isGenerating ? "Generating..." : "Generate Puns"}
        </Button>

        {/* Generated Puns */}
        {generatedPuns.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Generated Puns:</h3>
            {generatedPuns.map((pun, index) => (
              <div key={index} className="p-3 bg-secondary rounded-lg">
                <p className="font-medium">{pun}</p>
                <div className="flex justify-end gap-2 mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(pun)}
                  >
                    Copy
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => savePun(pun)}
                    disabled={!isAuthenticated}
                  >
                    Save
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Saved Puns */}
        {isAuthenticated && savedPuns.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Your Saved Puns:</h3>
            <div className="space-y-2">
              {savedPuns.map((pun, index) => (
                <div key={index} className="p-3 bg-secondary rounded-lg">
                  <p className="font-medium">{pun.text}</p>
                  <div className="flex justify-between items-center mt-2">
                    <div className="flex gap-2">
                      <Badge variant="outline">{pun.style}</Badge>
                      <Badge variant="outline">{pun.topic}</Badge>
                      <Badge variant="outline">Complexity: {pun.complexity}%</Badge>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(pun.text)}
                    >
                      Copy
                    </Button>
                  </div>
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
  );
};