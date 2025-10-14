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

interface RizzLine {
  text: string
  category: string
  context?: string
  rating: number
}

interface SavedContext {
  name: string
  details: string
}

const DEFAULT_CATEGORIES = [
  "Casual",
  "Romantic",
  "Funny",
  "Clever",
  "Cheesy",
  "Wholesome",
  "Nerdy",
  "Professional"
];

const SITUATION_TYPES = [
  "Dating App",
  "Social Media",
  "In Person",
  "Text Message",
  "Work Environment",
  "Social Event"
];

const LOCAL_STORAGE_KEY = 'user_rizz_data';

export const RizzGenerator = () => {
  const [savedLines, setSavedLines] = useState<RizzLine[]>([])
  const [savedContexts, setSavedContexts] = useState<SavedContext[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("Casual")
  const [situationType, setSituationType] = useState<string>("Dating App")
  const [contextDetails, setContextDetails] = useState("")
  const [targetName, setTargetName] = useState("")
  const [smoothnessLevel, setSmoothnessLevel] = useState(50)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedLines, setGeneratedLines] = useState<string[]>([])

  const {
    isAuthenticated,
    showAuthPopup,
    setShowAuthPopup,
    checkUsageLimit,
    incrementUsage,
    handleSuccessfulAuth,
    remainingUses
  } = useAuthLimit({
    toolId: 'rizz-generator',
    dailyLimit: 3
  });

  // Load saved data from localStorage
  useEffect(() => {
    const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedData) {
      try {
        const { lines, contexts } = JSON.parse(savedData);
        setSavedLines(lines || []);
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
        lines: savedLines,
        contexts: savedContexts
      }));
    }
  }, [savedLines, savedContexts, isAuthenticated]);

const generateRizzLines = async () => {
    if (!checkUsageLimit()) {
      return;
    }

    setIsGenerating(true);

    try {
      const formData = new FormData();
      formData.append('content', JSON.stringify({
        category: selectedCategory,
        situationType,
        contextDetails,
        targetName,
        smoothnessLevel
      }));
      formData.append('toolType', 'rizz-generator');

      const response = await fetch('/api/tools/generations', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (data.lines) {
        setGeneratedLines(data.lines);
        if (!isAuthenticated) {
          incrementUsage();
        }
      } else {
        toast({
          title: "Error",
          description: "Failed to generate rizz lines",
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

  const saveLine = (line: string) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to save rizz lines",
        variant: "destructive"
      });
      setShowAuthPopup(true);
      return;
    }

    setSavedLines([...savedLines, {
      text: line,
      category: selectedCategory,
      context: contextDetails,
      rating: smoothnessLevel
    }]);

    toast({
      title: "Success",
      description: "Rizz line saved to your collection"
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

    const contextName = `${situationType} - ${new Date().toLocaleDateString()}`;
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
        description: "Rizz line copied to clipboard"
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
            You have {remainingUses} free generations remaining today. Sign in for unlimited access and to save your favorite lines.
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-6">
        {/* Category and Situation Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {DEFAULT_CATEGORIES.map(category => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={situationType} onValueChange={setSituationType}>
            <SelectTrigger>
              <SelectValue placeholder="Select situation" />
            </SelectTrigger>
            <SelectContent>
              {SITUATION_TYPES.map(type => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Context and Target Info */}
        <div className="space-y-4">
          <Input
            placeholder="Their name (optional)"
            value={targetName}
            onChange={(e) => setTargetName(e.target.value)}
          />
          
          <Textarea
            placeholder="Describe the context or situation (e.g., matched on Tinder, both like hiking)"
            value={contextDetails}
            onChange={(e) => setContextDetails(e.target.value)}
            rows={3}
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
                const context = savedContexts.find(c => c.name === value);
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

        {/* Smoothness Level */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Smoothness Level: {smoothnessLevel}%
          </label>
          <Slider
            value={[smoothnessLevel]}
            onValueChange={([value]) => setSmoothnessLevel(value)}
            min={0}
            max={100}
            step={10}
          />
        </div>

        {/* Generate Button */}
        <Button 
          onClick={generateRizzLines} 
          disabled={isGenerating || (!isAuthenticated && remainingUses <= 0)}
          className="w-full"
        >
          {isGenerating ? "Generating..." : "Generate Rizz Lines"}
        </Button>

        {/* Generated Lines */}
        {generatedLines.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Generated Lines:</h3>
            <div className="space-y-2">
              {generatedLines.map((line, index) => (
                <div key={index} className="p-3 bg-secondary rounded-lg space-y-3">
                  <p className="text-sm leading-relaxed">{line}</p>
                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(line)}
                    >
                      Copy
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => saveLine(line)}
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

        {/* Saved Lines */}
        {isAuthenticated && savedLines.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Your Saved Lines:</h3>
            <div className="space-y-2">
              {savedLines.map((line, index) => (
                <div key={index} className="p-3 bg-secondary rounded-lg space-y-3">
                  <div>
                    <p className="text-sm leading-relaxed mb-2">{line.text}</p>
                    <div className="flex gap-2 flex-wrap">
                      <Badge variant="outline">{line.category}</Badge>
                      <Badge variant="outline">Smoothness: {line.rating}%</Badge>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(line.text)}
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
  )
}