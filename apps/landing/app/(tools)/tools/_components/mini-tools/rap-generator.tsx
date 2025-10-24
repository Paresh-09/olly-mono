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

interface RapVerse {
  text: string
  style: string
  theme: string
  flowLevel: number
}

interface SavedTheme {
  name: string
  details: string
}

const RAP_STYLES = [
  "Old School",
  "Modern Trap",
  "Boom Bap",
  "Conscious",
  "Gangsta",
  "Melodic",
  "Drill",
  "Lo-fi",
];

const THEME_CATEGORIES = [
  "Success",
  "Struggle",
  "Love",
  "Street Life",
  "Party",
  "Social Issues",
  "Personal Growth",
  "Storytelling"
];

const LOCAL_STORAGE_KEY = 'user_rap_data';

export const RapGenerator = () => {
  const [savedVerses, setSavedVerses] = useState<RapVerse[]>([])
  const [savedThemes, setSavedThemes] = useState<SavedTheme[]>([])
  const [selectedStyle, setSelectedStyle] = useState<string>("Modern Trap")
  const [themeCategory, setThemeCategory] = useState<string>("Success")
  const [themeDetails, setThemeDetails] = useState("")
  const [keywords, setKeywords] = useState("")
  const [flowLevel, setFlowLevel] = useState(50)
  const [verseLength, setVerseLength] = useState(16) // lines
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedVerses, setGeneratedVerses] = useState<string[]>([])

  const {
    isAuthenticated,
    showAuthPopup,
    setShowAuthPopup,
    checkUsageLimit,
    incrementUsage,
    handleSuccessfulAuth,
    remainingUses
  } = useAuthLimit({
    toolId: 'rap-generator',
    dailyLimit: 3
  });

  // Load saved data from localStorage
  useEffect(() => {
    const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedData) {
      try {
        const { verses, themes } = JSON.parse(savedData);
        setSavedVerses(verses || []);
        setSavedThemes(themes || []);
      } catch (error) {
        console.error('Error loading saved data:', error);
      }
    }
  }, []);

  // Save data to localStorage when they change
  useEffect(() => {
    if (isAuthenticated) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({
        verses: savedVerses,
        themes: savedThemes
      }));
    }
  }, [savedVerses, savedThemes, isAuthenticated]);

  const generateRapVerses = async () => {
    if (!checkUsageLimit()) {
      return;
    }

    setIsGenerating(true);

    try {
      const formData = new FormData();
      formData.append('content', JSON.stringify({
        style: selectedStyle,
        themeCategory,
        themeDetails,
        keywords,
        flowLevel,
        verseLength
      }));
      formData.append('toolType', 'rap-generator');

      const response = await fetch('/api/tools/generations', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (data.verses) {
        setGeneratedVerses(data.verses);
        if (!isAuthenticated) {
          incrementUsage();
        }
      } else {
        toast({
          title: "Error",
          description: "Failed to generate rap verses",
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

  const saveVerse = (verse: string) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to save verses",
        variant: "destructive"
      });
      setShowAuthPopup(true);
      return;
    }

    setSavedVerses([...savedVerses, {
      text: verse,
      style: selectedStyle,
      theme: themeCategory,
      flowLevel
    }]);

    toast({
      title: "Success",
      description: "Verse saved to your collection"
    });
  };

  const saveTheme = () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to save themes",
        variant: "destructive"
      });
      setShowAuthPopup(true);
      return;
    }

    if (!themeDetails.trim()) {
      toast({
        title: "Error",
        description: "Please enter theme details",
        variant: "destructive"
      });
      return;
    }

    const themeName = `${themeCategory} - ${new Date().toLocaleDateString()}`;
    setSavedThemes([...savedThemes, {
      name: themeName,
      details: themeDetails
    }]);

    toast({
      title: "Success",
      description: "Theme saved for future use"
    });
  };

  const loadTheme = (theme: SavedTheme) => {
    setThemeDetails(theme.details);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: "Verse copied to clipboard"
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
            You have {remainingUses} free generations remaining today. Sign in for unlimited access and to save your verses.
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-6">
        {/* Style and Theme Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select value={selectedStyle} onValueChange={setSelectedStyle}>
            <SelectTrigger>
              <SelectValue placeholder="Select rap style" />
            </SelectTrigger>
            <SelectContent>
              {RAP_STYLES.map(style => (
                <SelectItem key={style} value={style}>
                  {style}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={themeCategory} onValueChange={setThemeCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Select theme" />
            </SelectTrigger>
            <SelectContent>
              {THEME_CATEGORIES.map(theme => (
                <SelectItem key={theme} value={theme}>
                  {theme}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Theme and Keywords */}
        <div className="space-y-4">
          <Textarea
            placeholder="Describe your theme or topic in detail (e.g., rising above challenges, achieving dreams)"
            value={themeDetails}
            onChange={(e) => setThemeDetails(e.target.value)}
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
              onClick={saveTheme}
              disabled={!isAuthenticated}
            >
              Save Theme
            </Button>
            {savedThemes.length > 0 && (
              <Select onValueChange={(value) => {
                const theme = savedThemes.find(t => t.name === value);
                if (theme) loadTheme(theme);
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Load saved theme" />
                </SelectTrigger>
                <SelectContent>
                  {savedThemes.map(theme => (
                    <SelectItem key={theme.name} value={theme.name}>
                      {theme.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        {/* Flow Level and Verse Length */}
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Flow Complexity: {flowLevel}%
            </label>
            <Slider
              value={[flowLevel]}
              onValueChange={([value]) => setFlowLevel(value)}
              min={0}
              max={100}
              step={10}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Verse Length: {verseLength} lines
            </label>
            <Slider
              value={[verseLength]}
              onValueChange={([value]) => setVerseLength(value)}
              min={4}
              max={32}
              step={4}
            />
          </div>
        </div>

        {/* Generate Button */}
        <Button
          onClick={generateRapVerses}
          disabled={isGenerating || (!isAuthenticated && remainingUses <= 0)}
          className="w-full"
        >
          {isGenerating ? "Generating..." : "Generate Rap Verse"}
        </Button>

        {/* Generated Verses */}
        {generatedVerses.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Generated Verses:</h3>
            <div className="p-3 bg-secondary rounded-lg">
              <pre className="whitespace-pre-wrap font-mono text-sm">
                {generatedVerses.join('\n')}
              </pre>
              <div className="flex justify-end gap-2 mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(generatedVerses.join('\n'))}
                >
                  Copy
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => saveVerse(generatedVerses.join('\n'))}
                  disabled={!isAuthenticated}
                >
                  Save
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Saved Verses */}
        {isAuthenticated && savedVerses.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Your Saved Verses:</h3>
            <div className="space-y-2">
              {savedVerses.map((verse, index) => (
                <div key={index} className="p-3 bg-secondary rounded-lg">
                  <pre className="whitespace-pre-wrap font-mono text-sm">{verse.text}</pre>
                  <div className="flex justify-between items-center mt-2">
                    <div className="flex gap-2">
                      <Badge variant="outline">{verse.style}</Badge>
                      <Badge variant="outline">{verse.theme}</Badge>
                      <Badge variant="outline">Flow: {verse.flowLevel}%</Badge>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(verse.text)}
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