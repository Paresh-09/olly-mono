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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/components/ui/tabs"
import { toast } from '@repo/ui/hooks/use-toast'
import AuthPopup from "../authentication"
import { useAuthLimit } from '@/hooks/use-auth-check'

interface InstagramContent {
  text: string
  type: "profile" | "caption"
  niche: string
  style: string
  creativityLevel: number
}

interface SavedProfile {
  name: string
  details: string
}

const INSTAGRAM_NICHES = [
  "Fashion",
  "Fitness",
  "Food",
  "Travel",
  "Beauty",
  "Lifestyle",
  "Photography",
  "Art",
  "Business",
  "Tech",
  "Wellness",
  "Parenting"
];

const CONTENT_STYLES = [
  "Casual",
  "Professional",
  "Inspirational",
  "Humorous",
  "Minimalist",
  "Storytelling",
  "Educational",
  "Trendy"
];

const LOCAL_STORAGE_KEY = 'user_instagram_content_data';

export const InstagramGenerator = () => {
  const [activeTab, setActiveTab] = useState<"profile" | "caption">("profile")
  const [savedContent, setSavedContent] = useState<InstagramContent[]>([])
  const [savedProfiles, setSavedProfiles] = useState<SavedProfile[]>([])
  const [selectedNiche, setSelectedNiche] = useState<string>("Lifestyle")
  const [selectedStyle, setSelectedStyle] = useState<string>("Casual")
  const [profileDetails, setProfileDetails] = useState("")
  const [captionTopic, setCaptionTopic] = useState("")
  const [creativityLevel, setCreativityLevel] = useState(50)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedContent, setGeneratedContent] = useState<string[]>([])

  const {
    isAuthenticated,
    showAuthPopup,
    setShowAuthPopup,
    checkUsageLimit,
    incrementUsage,
    handleSuccessfulAuth,
    remainingUses
  } = useAuthLimit({
    toolId: 'instagram-generator',
    dailyLimit: 3
  });

  // Load saved data from localStorage
  useEffect(() => {
    const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedData) {
      try {
        const { content, profiles } = JSON.parse(savedData);
        setSavedContent(content || []);
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
        content: savedContent,
        profiles: savedProfiles
      }));
    }
  }, [savedContent, savedProfiles, isAuthenticated]);

  const generateInstagramContent = async () => {
    if (!checkUsageLimit()) {
      return;
    }

    setIsGenerating(true);

    try {
      const formData = new FormData();
      formData.append('content', JSON.stringify({
        contentType: activeTab,
        niche: selectedNiche,
        style: selectedStyle,
        details: activeTab === "profile" ? profileDetails : captionTopic,
        creativityLevel
      }));
      formData.append('toolType', 'instagram-generator');

      const response = await fetch('/api/tools/generations', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (data.lines) {
        setGeneratedContent(data.lines);
        if (!isAuthenticated) {
          incrementUsage();
        }
      } else {
        toast({
          title: "Error",
          description: `Failed to generate Instagram ${activeTab === "profile" ? "profile description" : "caption"}`,
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

  const saveContent = (text: string) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to save content",
        variant: "destructive"
      });
      setShowAuthPopup(true);
      return;
    }

    setSavedContent([...savedContent, {
      text,
      type: activeTab,
      niche: selectedNiche,
      style: selectedStyle,
      creativityLevel
    }]);

    toast({
      title: "Success",
      description: `${activeTab === "profile" ? "Profile description" : "Caption"} saved to your collection`
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

    if (!profileDetails.trim()) {
      toast({
        title: "Error",
        description: "Please enter profile details",
        variant: "destructive"
      });
      return;
    }

    const profileName = `${selectedNiche} - ${selectedStyle}`;
    setSavedProfiles([...savedProfiles, {
      name: profileName,
      details: profileDetails
    }]);

    toast({
      title: "Success",
      description: "Profile saved for future use"
    });
  };

  const loadProfile = (profile: SavedProfile) => {
    setProfileDetails(profile.details);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: `${activeTab === "profile" ? "Profile description" : "Caption"} copied to clipboard`
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
            You have {remainingUses} free generations remaining today. Sign in for unlimited access and to save your favorite content.
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "profile" | "caption")} className="mb-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="profile">Profile Description</TabsTrigger>
          <TabsTrigger value="caption">Caption Generator</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select value={selectedNiche} onValueChange={setSelectedNiche}>
              <SelectTrigger>
                <SelectValue placeholder="Select niche" />
              </SelectTrigger>
              <SelectContent>
                {INSTAGRAM_NICHES.map(niche => (
                  <SelectItem key={niche} value={niche}>
                    {niche}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedStyle} onValueChange={setSelectedStyle}>
              <SelectTrigger>
                <SelectValue placeholder="Select style" />
              </SelectTrigger>
              <SelectContent>
                {CONTENT_STYLES.map(style => (
                  <SelectItem key={style} value={style}>
                    {style}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <Textarea
              placeholder="Describe your profile focus, interests, and what you want to highlight"
              value={profileDetails}
              onChange={(e) => setProfileDetails(e.target.value)}
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
        </TabsContent>

        <TabsContent value="caption" className="space-y-6 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select value={selectedNiche} onValueChange={setSelectedNiche}>
              <SelectTrigger>
                <SelectValue placeholder="Select niche" />
              </SelectTrigger>
              <SelectContent>
                {INSTAGRAM_NICHES.map(niche => (
                  <SelectItem key={niche} value={niche}>
                    {niche}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedStyle} onValueChange={setSelectedStyle}>
              <SelectTrigger>
                <SelectValue placeholder="Select style" />
              </SelectTrigger>
              <SelectContent>
                {CONTENT_STYLES.map(style => (
                  <SelectItem key={style} value={style}>
                    {style}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Input
            placeholder="What is your post about? (e.g., beach sunset, new product launch)"
            value={captionTopic}
            onChange={(e) => setCaptionTopic(e.target.value)}
          />
        </TabsContent>
      </Tabs>

      {/* Creativity Level */}
      <div className="space-y-2 mb-6">
        <label className="text-sm font-medium">
          Creativity Level: {creativityLevel}%
        </label>
        <Slider
          value={[creativityLevel]}
          onValueChange={([value]) => setCreativityLevel(value)}
          min={0}
          max={100}
          step={10}
        />
      </div>

      {/* Generate Button */}
      <Button
        onClick={generateInstagramContent}
        disabled={isGenerating || (!isAuthenticated && remainingUses <= 0)}
        className="w-full"
      >
        {isGenerating ? "Generating..." : `Generate ${activeTab === "profile" ? "Profile Description" : "Caption"}`}
      </Button>

      {/* Generated Content */}
      {generatedContent.length > 0 && (
        <div className="space-y-4 mt-6">
          <h3 className="text-lg font-medium">Generated {activeTab === "profile" ? "Profile Descriptions" : "Captions"}:</h3>
          <div className="space-y-2">
            {generatedContent.map((text, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                <p className="whitespace-pre-wrap">{text}</p>
                <div className="flex gap-2 ml-2 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(text)}
                  >
                    Copy
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => saveContent(text)}
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

      {/* Saved Content */}
      {isAuthenticated && savedContent.length > 0 && (
        <div className="space-y-4 mt-6">
          <h3 className="text-lg font-medium">Your Saved Content:</h3>
          <div className="space-y-2">
            {savedContent
              .filter(content => content.type === activeTab)
              .map((content, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                  <div>
                    <p className="whitespace-pre-wrap">{content.text}</p>
                    <div className="flex gap-2 mt-1">
                      <Badge variant="outline">{content.niche}</Badge>
                      <Badge variant="outline">{content.style}</Badge>
                      <Badge variant="outline">Creativity: {content.creativityLevel}%</Badge>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(content.text)}
                    className="ml-2 shrink-0"
                  >
                    Copy
                  </Button>
                </div>
              ))}
          </div>
        </div>
      )}

      <AuthPopup
        isOpen={showAuthPopup}
        onClose={() => setShowAuthPopup(false)}
        onSuccess={handleSuccessfulAuth}
      />
    </Card>
  )
} 