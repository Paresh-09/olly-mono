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

interface InsultData {
  text: string
  style: string
  context: string
  witLevel: number
}

interface SavedContext {
  name: string
  details: string
}

const INSULT_STYLES = [
  "Shakespeare",
  "Sarcastic",
  "Silly",
  "Nerdy",
  "Historical",
  "Professional",
  "Medieval",
  "Sci-Fi",
];

const CONTEXT_CATEGORIES = [
  "Gaming",
  "Sports",
  "Work",
  "School",
  "Social Media",
  "Dating",
  "Friendly Banter",
  "Comedy Show"
];

const LOCAL_STORAGE_KEY = 'user_insult_data';

export const InsultGenerator = () => {
  const [savedInsults, setSavedInsults] = useState<InsultData[]>([])
  const [savedContexts, setSavedContexts] = useState<SavedContext[]>([])
  const [selectedStyle, setSelectedStyle] = useState<string>("Sarcastic")
  const [contextCategory, setContextCategory] = useState<string>("Gaming")
  const [contextDetails, setContextDetails] = useState("")
  const [targetName, setTargetName] = useState("")
  const [witLevel, setWitLevel] = useState(50)
  const [cleanLevel, setCleanLevel] = useState(80)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedInsults, setGeneratedInsults] = useState<string[]>([])

  const {
    isAuthenticated,
    showAuthPopup,
    setShowAuthPopup,
    checkUsageLimit,
    incrementUsage,
    handleSuccessfulAuth,
    remainingUses
  } = useAuthLimit({
    toolId: 'insult-generator',
    dailyLimit: 3
  });

  // Load saved data from localStorage
  useEffect(() => {
    const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedData) {
      try {
        const { insults, contexts } = JSON.parse(savedData);
        setSavedInsults(insults || []);
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
        insults: savedInsults,
        contexts: savedContexts
      }));
    }
  }, [savedInsults, savedContexts, isAuthenticated]);

  const generateInsults = async () => {
    if (!checkUsageLimit()) {
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
        witLevel,
        cleanLevel
      }));
      formData.append('toolType', 'insult-generator');

      const response = await fetch('/api/tools/generations', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (data.insults) {
        setGeneratedInsults(data.insults);
        if (!isAuthenticated) {
          incrementUsage();
        }
      } else {
        toast({
          title: "Error",
          description: "Failed to generate insults",
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

  const saveInsult = (insult: string) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to save insults",
        variant: "destructive"
      });
      setShowAuthPopup(true);
      return;
    }

    setSavedInsults([...savedInsults, {
      text: insult,
      style: selectedStyle,
      context: contextCategory,
      witLevel
    }]);

    toast({
      title: "Success",
      description: "Insult saved to your collection"
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
        description: "Insult copied to clipboard"
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
            You have {remainingUses} free generations remaining today. Sign in for unlimited access and to save your insults.
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-6">
        {/* Style and Context Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select value={selectedStyle} onValueChange={setSelectedStyle}>
            <SelectTrigger>
              <SelectValue placeholder="Select insult style" />
            </SelectTrigger>
            <SelectContent>
              {INSULT_STYLES.map(style => (
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

        {/* Context and Target */}
        <div className="space-y-4">
          <Textarea
            placeholder="Describe the context or situation (e.g., friendly gaming banter, comedy roast)"
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

        {/* Wit and Clean Levels */}
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Wit Level: {witLevel}%
            </label>
            <Slider
              value={[witLevel]}
              onValueChange={([value]) => setWitLevel(value)}
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
          onClick={generateInsults}
          disabled={isGenerating || (!isAuthenticated && remainingUses <= 0)}
          className="w-full"
        >
          {isGenerating ? "Generating..." : "Generate Insult"}
        </Button>

        {/* Generated Insults */}
        {generatedInsults.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Generated Insults:</h3>
            {generatedInsults.map((insult, index) => (
              <div key={index} className="p-3 bg-secondary rounded-lg">
                <p className="font-medium">{insult}</p>
                <div className="flex justify-end gap-2 mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(insult)}
                  >
                    Copy
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => saveInsult(insult)}
                    disabled={!isAuthenticated}
                  >
                    Save
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Saved Insults */}
        {isAuthenticated && savedInsults.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Your Saved Insults:</h3>
            <div className="space-y-2">
              {savedInsults.map((insult, index) => (
                <div key={index} className="p-3 bg-secondary rounded-lg">
                  <p className="font-medium">{insult.text}</p>
                  <div className="flex justify-between items-center mt-2">
                    <div className="flex gap-2">
                      <Badge variant="outline">{insult.style}</Badge>
                      <Badge variant="outline">{insult.context}</Badge>
                      <Badge variant="outline">Wit: {insult.witLevel}%</Badge>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(insult.text)}
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