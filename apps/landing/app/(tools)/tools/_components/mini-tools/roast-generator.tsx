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

interface RoastData {
  text: string
  style: string
  context: string
  intensity: number
}

interface SavedContext {
  name: string
  details: string
}

const ROAST_STYLES = [
  "Celebrity Style",
  "Comedy Club",
  "Office Humor",
  "Sports Banter",
  "Friendly Teasing",
  "Nerdy",
  "Historical",
  "Pop Culture",
];

const CONTEXT_CATEGORIES = [
  "Friend Group",
  "Work Event",
  "Birthday Party",
  "Comedy Show",
  "Game Night",
  "Social Media",
  "Sports Event",
  "Family Gathering"
];

const LOCAL_STORAGE_KEY = 'user_roast_data';

export const RoastGenerator = () => {
  const [savedRoasts, setSavedRoasts] = useState<RoastData[]>([])
  const [savedContexts, setSavedContexts] = useState<SavedContext[]>([])
  const [selectedStyle, setSelectedStyle] = useState<string>("Friendly Teasing")
  const [contextCategory, setContextCategory] = useState<string>("Friend Group")
  const [contextDetails, setContextDetails] = useState("")
  const [targetName, setTargetName] = useState("")
  const [intensity, setIntensity] = useState(30)
  const [cleanLevel, setCleanLevel] = useState(90)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedRoasts, setGeneratedRoasts] = useState<string[]>([])

  const {
    isAuthenticated,
    showAuthPopup,
    setShowAuthPopup,
    checkUsageLimit,
    incrementUsage,
    handleSuccessfulAuth,
    remainingUses
  } = useAuthLimit({
    toolId: 'roast-generator',
    dailyLimit: 5
  });

  // Load saved data from localStorage
  useEffect(() => {
    const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedData) {
      try {
        const { roasts, contexts } = JSON.parse(savedData);
        setSavedRoasts(roasts || []);
        setSavedContexts(contexts || []);
      } catch (error) {
        console.error('Error loading saved data:', error);
      }
    }
  }, []);

  // Save data to localStorage when they change
  useEffect(() => {
    if (isAuthenticated) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({
        roasts: savedRoasts,
        contexts: savedContexts
      }));
    }
  }, [savedRoasts, savedContexts, isAuthenticated]);

  const generateRoasts = async () => {
    if (!checkUsageLimit()) {
      return;
    }

    if (!contextDetails.trim()) {
      toast({
        title: "Error",
        description: "Please provide context details for better results",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);

    try {
      const formData = new FormData();
      formData.append('content', JSON.stringify({
        style: selectedStyle,
        contextCategory,
        contextDetails,
        targetName,
        intensity,
        cleanLevel
      }));
      formData.append('toolType', 'roast-generator');

      const response = await fetch('/api/tools/generations', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (data.roasts) {
        setGeneratedRoasts(data.roasts);
        if (!isAuthenticated) {
          incrementUsage();
        }
      } else {
        toast({
          title: "Error",
          description: "Failed to generate roasts",
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

  const saveRoast = (roast: string) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to save roasts",
        variant: "destructive"
      });
      setShowAuthPopup(true);
      return;
    }

    setSavedRoasts([...savedRoasts, {
      text: roast,
      style: selectedStyle,
      context: contextCategory,
      intensity
    }]);

    toast({
      title: "Success",
      description: "Roast saved to your collection"
    });
  };

  const saveContext = () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to save contexts",
        variant: "destructive"
      });
      setShowAuthPopup(true);
      return;
    }

    if (!contextDetails.trim()) {
      toast({
        title: "Error",
        description: "Please enter context details",
        variant: "destructive"
      });
      return;
    }

    const contextName = `${contextCategory} - ${new Date().toLocaleDateString()}`;
    setSavedContexts([...savedContexts, {
      name: contextName,
      details: contextDetails
    }]);

    toast({
      title: "Success",
      description: "Context saved for future use"
    });
  };

  const loadContext = (context: SavedContext) => {
    setContextDetails(context.details);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: "Roast copied to clipboard"
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
            You have {remainingUses} free generations remaining today. Sign in for unlimited access and to save your roasts.
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-6">
        {/* Style and Context Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select value={selectedStyle} onValueChange={setSelectedStyle}>
            <SelectTrigger>
              <SelectValue placeholder="Select roast style" />
            </SelectTrigger>
            <SelectContent>
              {ROAST_STYLES.map(style => (
                <SelectItem key={style} value={style}>
                  {style}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={contextCategory} onValueChange={setContextCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Select context" />
            </SelectTrigger>
            <SelectContent>
              {CONTEXT_CATEGORIES.map(context => (
                <SelectItem key={context} value={context}>
                  {context}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Context Details and Target */}
        <div className="space-y-4">
          <Textarea
            placeholder="Describe the context and relationship (e.g., close friend, known for 5 years, always late to events)"
            value={contextDetails}
            onChange={(e) => setContextDetails(e.target.value)}
            rows={3}
          />

          <Input
            placeholder="Target name (optional)"
            value={targetName}
            onChange={(e) => setTargetName(e.target.value)}
          />

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={saveContext}
              disabled={!isAuthenticated}
            >
              Save Context
            </Button>
            {savedContexts.length > 0 && (
              <Select onValueChange={(value) => {
                const context = savedContexts.find(t => t.name === value);
                if (context) loadContext(context);
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Load saved context" />
                </SelectTrigger>
                <SelectContent>
                  {savedContexts.map(context => (
                    <SelectItem key={context.name} value={context.name}>
                      {context.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        {/* Intensity and Clean Levels */}
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Intensity Level: {intensity}%
            </label>
            <Slider
              value={[intensity]}
              onValueChange={([value]) => setIntensity(value)}
              min={0}
              max={100}
              step={10}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Clean Level: {cleanLevel}%
            </label>
            <Slider
              value={[cleanLevel]}
              onValueChange={([value]) => setCleanLevel(value)}
              min={0}
              max={100}
              step={10}
            />
          </div>
        </div>

        {/* Generate Button */}
        <Button
          onClick={generateRoasts}
          disabled={isGenerating || (!isAuthenticated && remainingUses <= 0)}
          className="w-full"
        >
          {isGenerating ? "Generating..." : "Generate Roasts"}
        </Button>

        {/* Generated Roasts */}
        {generatedRoasts.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Generated Roasts:</h3>
            {generatedRoasts.map((roast, index) => (
              <div key={index} className="p-3 bg-secondary rounded-lg">
                <p className="font-medium">{roast}</p>
                <div className="flex justify-end gap-2 mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(roast)}
                  >
                    Copy
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => saveRoast(roast)}
                    disabled={!isAuthenticated}
                  >
                    Save
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Saved Roasts */}
        {isAuthenticated && savedRoasts.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Your Saved Roasts:</h3>
            <div className="space-y-2">
              {savedRoasts.map((roast, index) => (
                <div key={index} className="p-3 bg-secondary rounded-lg">
                  <p className="font-medium">{roast.text}</p>
                  <div className="flex justify-between items-center mt-2">
                    <div className="flex gap-2">
                      <Badge variant="outline">{roast.style}</Badge>
                      <Badge variant="outline">{roast.context}</Badge>
                      <Badge variant="outline">Intensity: {roast.intensity}%</Badge>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(roast.text)}
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