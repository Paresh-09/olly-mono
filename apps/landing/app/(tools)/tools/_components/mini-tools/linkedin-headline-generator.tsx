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

interface LinkedInHeadline {
  text: string
  industry: string
  experience?: string
  style: string
  impactLevel: number
}

interface SavedProfile {
  name: string
  details: string
}

const INDUSTRY_CATEGORIES = [
  "Technology",
  "Marketing",
  "Finance",
  "Healthcare",
  "Education",
  "Engineering",
  "Design",
  "Sales",
  "Human Resources",
  "Consulting"
];

const HEADLINE_STYLES = [
  "Professional",
  "Creative",
  "Results-Driven",
  "Visionary",
  "Technical",
  "Leadership",
  "Innovative",
  "Collaborative"
];

const LOCAL_STORAGE_KEY = 'user_linkedin_headline_data';

export const LinkedInHeadlineGenerator = () => {
  const [savedHeadlines, setSavedHeadlines] = useState<LinkedInHeadline[]>([])
  const [savedProfiles, setSavedProfiles] = useState<SavedProfile[]>([])
  const [selectedIndustry, setSelectedIndustry] = useState<string>("Technology")
  const [selectedStyle, setSelectedStyle] = useState<string>("Professional")
  const [experienceDetails, setExperienceDetails] = useState("")
  const [jobTitle, setJobTitle] = useState("")
  const [impactLevel, setImpactLevel] = useState(50)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedHeadlines, setGeneratedHeadlines] = useState<string[]>([])

  const {
    isAuthenticated,
    showAuthPopup,
    setShowAuthPopup,
    checkUsageLimit,
    incrementUsage,
    handleSuccessfulAuth,
    remainingUses
  } = useAuthLimit({
    toolId: 'linkedin-headline-generator',
    dailyLimit: 3
  });

  // Load saved data from localStorage
  useEffect(() => {
    const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedData) {
      try {
        const { headlines, profiles } = JSON.parse(savedData);
        setSavedHeadlines(headlines || []);
        setSavedProfiles(profiles || []);
      } catch (error) {
        console.error('Error loading saved data:', error);
      }
    }
  }, []);

  // Save data to localStorage when they change
  useEffect(() => {
    if (isAuthenticated) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({
        headlines: savedHeadlines,
        profiles: savedProfiles
      }));
    }
  }, [savedHeadlines, savedProfiles, isAuthenticated]);

  const generateLinkedInHeadlines = async () => {
    if (!checkUsageLimit()) {
      return;
    }

    setIsGenerating(true);

    try {
      const formData = new FormData();
      formData.append('content', JSON.stringify({
        industry: selectedIndustry,
        style: selectedStyle,
        experienceDetails,
        jobTitle,
        impactLevel
      }));
      formData.append('toolType', 'linkedin-headline-generator');

      const response = await fetch('/api/tools/generations', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (data.lines) {
        setGeneratedHeadlines(data.lines);
        if (!isAuthenticated) {
          incrementUsage();
        }
      } else {
        toast({
          title: "Error",
          description: "Failed to generate LinkedIn headlines",
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

  const saveHeadline = (headline: string) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to save headlines",
        variant: "destructive"
      });
      setShowAuthPopup(true);
      return;
    }

    setSavedHeadlines([...savedHeadlines, {
      text: headline,
      industry: selectedIndustry,
      experience: experienceDetails,
      style: selectedStyle,
      impactLevel: impactLevel
    }]);

    toast({
      title: "Success",
      description: "Headline saved to your collection"
    });
  };

  const saveProfile = () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to save profiles",
        variant: "destructive"
      });
      setShowAuthPopup(true);
      return;
    }

    if (!experienceDetails.trim()) {
      toast({
        title: "Error",
        description: "Please enter experience details",
        variant: "destructive"
      });
      return;
    }

    const profileName = `${jobTitle || 'Profile'} - ${selectedIndustry}`;
    setSavedProfiles([...savedProfiles, {
      name: profileName,
      details: experienceDetails
    }]);

    toast({
      title: "Success",
      description: "Profile saved for future use"
    });
  };

  const loadProfile = (profile: SavedProfile) => {
    setExperienceDetails(profile.details);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: "Headline copied to clipboard"
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
            You have {remainingUses} free generations remaining today. Sign in for unlimited access and to save your favorite headlines.
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-6">
        {/* Industry and Style Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
            <SelectTrigger>
              <SelectValue placeholder="Select industry" />
            </SelectTrigger>
            <SelectContent>
              {INDUSTRY_CATEGORIES.map(industry => (
                <SelectItem key={industry} value={industry}>
                  {industry}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedStyle} onValueChange={setSelectedStyle}>
            <SelectTrigger>
              <SelectValue placeholder="Select headline style" />
            </SelectTrigger>
            <SelectContent>
              {HEADLINE_STYLES.map(style => (
                <SelectItem key={style} value={style}>
                  {style}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Job Title and Experience */}
        <div className="space-y-4">
          <Input
            placeholder="Your job title or role"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
          />

          <Textarea
            placeholder="Describe your experience, skills, and achievements"
            value={experienceDetails}
            onChange={(e) => setExperienceDetails(e.target.value)}
            rows={3}
          />

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={saveProfile}
              disabled={!isAuthenticated}
            >
              Save Profile
            </Button>
            {savedProfiles.length > 0 && (
              <Select onValueChange={(value) => {
                const profile = savedProfiles.find(p => p.name === value);
                if (profile) loadProfile(profile);
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Load saved profile" />
                </SelectTrigger>
                <SelectContent>
                  {savedProfiles.map(profile => (
                    <SelectItem key={profile.name} value={profile.name}>
                      {profile.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        {/* Impact Level */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Impact Level: {impactLevel}%
          </label>
          <Slider
            value={[impactLevel]}
            onValueChange={([value]) => setImpactLevel(value)}
            min={0}
            max={100}
            step={10}
          />
        </div>

        {/* Generate Button */}
        <Button
          onClick={generateLinkedInHeadlines}
          disabled={isGenerating || (!isAuthenticated && remainingUses <= 0)}
          className="w-full"
        >
          {isGenerating ? "Generating..." : "Generate LinkedIn Headlines"}
        </Button>

        {/* Generated Headlines */}
        {generatedHeadlines.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Generated Headlines:</h3>
            <div className="space-y-2">
              {generatedHeadlines.map((headline, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                  <p>{headline}</p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(headline)}
                    >
                      Copy
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => saveHeadline(headline)}
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

        {/* Saved Headlines */}
        {isAuthenticated && savedHeadlines.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Your Saved Headlines:</h3>
            <div className="space-y-2">
              {savedHeadlines.map((headline, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                  <div>
                    <p>{headline.text}</p>
                    <div className="flex gap-2 mt-1">
                      <Badge variant="outline">{headline.industry}</Badge>
                      <Badge variant="outline">{headline.style}</Badge>
                      <Badge variant="outline">Impact: {headline.impactLevel}%</Badge>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(headline.text)}
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