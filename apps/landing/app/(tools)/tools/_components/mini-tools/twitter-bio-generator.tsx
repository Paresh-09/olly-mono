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

interface TwitterBio {
  text: string
  category: string
  style: string
  details?: string
  conciseLevel: number
}

interface SavedProfile {
  name: string
  details: string
}

const TWITTER_CATEGORIES = [
  "Personal",
  "Professional",
  "Creator",
  "Business",
  "Tech",
  "Finance",
  "Politics",
  "Entertainment",
  "Sports",
  "Health",
  "Education",
  "Journalism",
  "Marketing",
  "Art"
];

const BIO_STYLES = [
  "Witty",
  "Minimalist",
  "Informative",
  "Provocative",
  "Inspirational",
  "Humorous",
  "Serious",
  "Quirky"
];

const LOCAL_STORAGE_KEY = 'user_twitter_bio_data';

export const TwitterBioGenerator = () => {
  const [savedBios, setSavedBios] = useState<TwitterBio[]>([])
  const [savedProfiles, setSavedProfiles] = useState<SavedProfile[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("Personal")
  const [selectedStyle, setSelectedStyle] = useState<string>("Witty")
  const [profileDetails, setProfileDetails] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [conciseLevel, setConciseLevel] = useState(70)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedBios, setGeneratedBios] = useState<string[]>([])

  const {
    isAuthenticated,
    showAuthPopup,
    setShowAuthPopup,
    checkUsageLimit,
    incrementUsage,
    handleSuccessfulAuth,
    remainingUses
  } = useAuthLimit({
    toolId: 'twitter-bio-generator',
    dailyLimit: 3
  });

  // Load saved data from localStorage
  useEffect(() => {
    const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedData) {
      try {
        const { bios, profiles } = JSON.parse(savedData);
        setSavedBios(bios || []);
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
        bios: savedBios,
        profiles: savedProfiles
      }));
    }
  }, [savedBios, savedProfiles, isAuthenticated]);

  const generateTwitterBios = async () => {
    if (!checkUsageLimit()) {
      return;
    }

    setIsGenerating(true);

    try {
      const formData = new FormData();
      formData.append('content', JSON.stringify({
        category: selectedCategory,
        style: selectedStyle,
        profileDetails,
        displayName,
        conciseLevel
      }));
      formData.append('toolType', 'twitter-bio-generator');

      const response = await fetch('/api/tools/generations', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (data.lines) {
        setGeneratedBios(data.lines);
        if (!isAuthenticated) {
          incrementUsage();
        }
      } else {
        toast({
          title: "Error",
          description: "Failed to generate Twitter bios",
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

  const saveBio = (bio: string) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to save bios",
        variant: "destructive"
      });
      setShowAuthPopup(true);
      return;
    }

    setSavedBios([...savedBios, {
      text: bio,
      category: selectedCategory,
      style: selectedStyle,
      details: profileDetails,
      conciseLevel
    }]);

    toast({
      title: "Success",
      description: "Bio saved to your collection"
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

    const profileName = displayName || `${selectedCategory} Profile`;
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
        description: "Bio copied to clipboard"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy text",
        variant: "destructive"
      });
    }
  };

  const getCharacterCount = (text: string) => {
    return text.length;
  };

  return (
    <Card className="p-6">
      {!isAuthenticated && (
        <Alert className="mb-4">
          <AlertDescription>
            You have {remainingUses} free generations remaining today. Sign in for unlimited access and to save your favorite bios.
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
              {TWITTER_CATEGORIES.map(category => (
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
              {BIO_STYLES.map(style => (
                <SelectItem key={style} value={style}>
                  {style}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Profile Details */}
        <div className="space-y-4">
          <Input
            placeholder="Your display name (optional)"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
          
          <Textarea
            placeholder="Describe yourself, your interests, expertise, and what you want to highlight"
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

        {/* Conciseness Level */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Conciseness Level: {conciseLevel}%
          </label>
          <Slider
            value={[conciseLevel]}
            onValueChange={([value]) => setConciseLevel(value)}
            min={0}
            max={100}
            step={10}
          />
          <p className="text-xs text-muted-foreground">Higher values create shorter, more concise bios</p>
        </div>

        {/* Generate Button */}
        <Button 
          onClick={generateTwitterBios} 
          disabled={isGenerating || (!isAuthenticated && remainingUses <= 0)}
          className="w-full"
        >
          {isGenerating ? "Generating..." : "Generate Twitter/X Bios"}
        </Button>

        {/* Generated Bios */}
        {generatedBios.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Generated Bios:</h3>
            <div className="space-y-2">
              {generatedBios.map((bio, index) => (
                <div key={index} className="flex items-start justify-between p-3 bg-secondary rounded-lg">
                  <div className="mr-2">
                    <p className="whitespace-pre-wrap">{bio}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {getCharacterCount(bio)}/160 characters
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(bio)}
                    >
                      Copy
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => saveBio(bio)}
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

        {/* Saved Bios */}
        {isAuthenticated && savedBios.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Your Saved Bios:</h3>
            <div className="space-y-2">
              {savedBios.map((bio, index) => (
                <div key={index} className="flex items-start justify-between p-3 bg-secondary rounded-lg">
                  <div>
                    <p className="whitespace-pre-wrap">{bio.text}</p>
                    <div className="flex gap-2 mt-1 flex-wrap">
                      <Badge variant="outline">{bio.category}</Badge>
                      <Badge variant="outline">{bio.style}</Badge>
                      <Badge variant="outline">Conciseness: {bio.conciseLevel}%</Badge>
                      <p className="text-xs text-muted-foreground">
                        {getCharacterCount(bio.text)}/160 characters
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(bio.text)}
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