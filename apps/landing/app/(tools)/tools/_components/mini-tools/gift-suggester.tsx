"use client";

import { useState, useEffect, useCallback } from 'react'
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
import { Checkbox } from "@repo/ui/components/ui/checkbox"
import { toast } from '@repo/ui/hooks/use-toast'
import AuthPopup from "../authentication"
import { useAuthLimit } from '@/hooks/use-auth-check'
import { GIFT_TYPES, INTEREST_CATEGORIES, OCCASIONS, PRICE_RANGES, RELATIONSHIPS, SHOPPING_PREFERENCES } from '@/data/gift-data';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/ui/components/ui/tabs';
import { Separator } from '@repo/ui/components/ui/separator';

interface GiftData {
  name: string
  price: number
  description: string
  category: string
  link?: string
  reason: string
}

interface SavedRecipient {
  name: string
  details: {
    age: number
    relationship: string
    interests: string[]
    dislikes: string[]
    occasion: string
  }
}

const LOCAL_STORAGE_KEY = 'user_gift_data';

export const GiftSuggester = () => {
  // All existing state declarations
  const [recipientName, setRecipientName] = useState("")
  const [recipientAge, setRecipientAge] = useState<number>(25)
  const [occasion, setOccasion] = useState<string>("Birthday")
  const [relationship, setRelationship] = useState<string>("Friend")
  const [minBudget, setMinBudget] = useState<number>(20)
  const [maxBudget, setMaxBudget] = useState<number>(100)
  const [interests, setInterests] = useState<string[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [customInterests, setCustomInterests] = useState("")
  const [dislikes, setDislikes] = useState("")
  const [shoppingPreferences, setShoppingPreferences] = useState<string[]>([])
  const [activeCategory, setActiveCategory] = useState<string>("All")
  const [giftType, setGiftType] = useState<string[]>([])

  // Results State
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedGifts, setGeneratedGifts] = useState<GiftData[]>([])
  const [savedGifts, setSavedGifts] = useState<GiftData[]>([])
  const [savedRecipients, setSavedRecipients] = useState<SavedRecipient[]>([])

  const { isAuthenticated, showAuthPopup, setShowAuthPopup, checkUsageLimit,
    incrementUsage, handleSuccessfulAuth, remainingUses } = useAuthLimit({
      toolId: 'gift-suggester',
      dailyLimit: 5
    });

  // Load saved data on mount
  useEffect(() => {
    const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedData) {
      try {
        const { gifts, recipients } = JSON.parse(savedData);
        // Only set if we have data and it's different from current state
        if (Array.isArray(gifts)) setSavedGifts(gifts);
        if (Array.isArray(recipients)) setSavedRecipients(recipients);
      } catch (error) {
        console.error('Error loading saved data:', error);
      }
    }
  }, []); // Only run once on mount

  // Memoized function to update max budget if min budget exceeds it
  const updateMinBudget = useCallback((value: number) => {
    setMinBudget(value);
    // Only update maxBudget if min exceeds it, don't change it otherwise
    if (value > maxBudget) {
      setMaxBudget(value);
    }
  }, [maxBudget]);

  // Add debouncing to the save effect with proper cleanup
  useEffect(() => {
    if (!isAuthenticated) return;

    const saveTimeout = setTimeout(() => {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({
          gifts: savedGifts,
          recipients: savedRecipients
        }));
      } catch (error) {
        console.error('Error saving data to localStorage:', error);
      }
    }, 1000); // Delay saves by 1 second

    return () => clearTimeout(saveTimeout);
  }, [savedGifts, savedRecipients, isAuthenticated]);

  // Validate and extract interests
  const getValidInterests = useCallback(() => {
    const customInterestsList = customInterests
      .split(',')
      .map(i => i.trim())
      .filter(i => i);
    return [...interests, ...customInterestsList];
  }, [interests, customInterests]);

  const generateGiftSuggestions = async () => {
    if (!checkUsageLimit()) {
      return;
    }

    const allInterests = getValidInterests();

    if (!recipientName.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide recipient name",
        variant: "destructive"
      });
      return;
    }

    if (allInterests.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please provide at least one interest",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);

    try {
      const formData = new FormData();
      formData.append('content', JSON.stringify({
        recipientName,
        recipientAge,
        occasion,
        relationship,
        minBudget,
        maxBudget,
        interests: allInterests,
        dislikes: dislikes.split(',').map(d => d.trim()).filter(d => d),
        giftTypes: giftType,
        shoppingPreferences
      }));
      formData.append('toolType', 'gift-suggester');

      const response = await fetch('/api/tools/generations', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }

      const data = await response.json();

      if (data.gifts && Array.isArray(data.gifts)) {
        setGeneratedGifts(data.gifts);
        incrementUsage();
      } else {
        throw new Error('Invalid response format from API');
      }
    } catch (error) {
      console.error('Error generating gifts:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Save gift function
  const saveGift = (gift: GiftData) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to save gifts",
        variant: "destructive"
      });
      setShowAuthPopup(true);
      return;
    }

    setSavedGifts(prev => {
      // Check if gift already exists
      if (prev.some(g => g.name === gift.name && g.price === gift.price)) {
        toast({
          title: "Already Saved",
          description: "This gift is already in your saved collection"
        });
        return prev;
      }

      toast({
        title: "Success",
        description: "Gift saved to your collection"
      });
      return [...prev, gift];
    });
  };

  // Save recipient function
  const saveRecipient = () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to save recipient details",
        variant: "destructive"
      });
      setShowAuthPopup(true);
      return;
    }

    if (!recipientName.trim()) {
      toast({
        title: "Error",
        description: "Please enter recipient name",
        variant: "destructive"
      });
      return;
    }

    setSavedRecipients(prev => {
      // Check if recipient already exists
      if (prev.some(r => r.name === recipientName)) {
        toast({
          title: "Already Saved",
          description: "This recipient is already saved"
        });
        return prev;
      }

      const newRecipient: SavedRecipient = {
        name: recipientName,
        details: {
          age: recipientAge,
          relationship,
          interests: getValidInterests(),
          dislikes: dislikes.split(',').map(d => d.trim()).filter(d => d),
          occasion
        }
      };

      toast({
        title: "Success",
        description: "Recipient saved for future use"
      });
      return [...prev, newRecipient];
    });
  };


  // Helper function for age groups
  const getAgeGroup = (age: number): string => {
    if (age <= 2) return "Baby";
    if (age <= 12) return "Child";
    if (age <= 19) return "Teen";
    if (age <= 29) return "Young";
    if (age <= 49) return "Adult";
    if (age <= 69) return "Middle Age";
    return "Senior";
  };

  // Basic Info Section Component
  const BasicInfoSection = () => (
    <div className="space-y-6 p-4 bg-card rounded-lg border">
      <div>
        <h2 className="text-xl font-semibold mb-4">Who are we shopping for?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="recipient-name" className="text-sm font-medium">Recipient&apos;s Name</label>
            <Input
              id="recipient-name"
              placeholder="Enter name"
              defaultValue={recipientName}
              onBlur={(e) => setRecipientName(e.target.value || "")}
              className="text-lg h-12"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="recipient-age" className="text-sm font-medium">Age</label>
            <div className="flex items-center gap-4">
              <Input
                id="recipient-age"
                type="number"
                defaultValue={recipientAge}
                onBlur={(e) => {
                  const value = parseInt(e.target.value) || 0;
                  setRecipientAge(Math.max(0, Math.min(120, value)));
                }}
                min={0}
                max={120}
                className="text-lg h-12"
              />
              <Badge variant="secondary" className="text-lg py-2">
                {getAgeGroup(recipientAge)}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label id="occasion-label" className="text-sm font-medium">Occasion</label>
          <Select value={occasion} onValueChange={setOccasion} defaultValue="Birthday">
            <SelectTrigger className="h-12" aria-labelledby="occasion-label">
              <SelectValue>{occasion}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <div className="grid grid-cols-1 gap-1 p-2">
                {OCCASIONS.map(occ => (
                  <SelectItem key={occ} value={occ}>
                    {occ}
                  </SelectItem>
                ))}
              </div>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label id="relationship-label" className="text-sm font-medium">Relationship</label>
          <Select value={relationship} onValueChange={setRelationship} defaultValue="Friend">
            <SelectTrigger className="h-12" aria-labelledby="relationship-label">
              <SelectValue>{relationship}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <div className="grid grid-cols-1 gap-1 p-2">
                {RELATIONSHIPS.map(rel => (
                  <SelectItem key={rel} value={rel}>
                    {rel}
                  </SelectItem>
                ))}
              </div>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );

  // Budget Section Component
  const BudgetSection = () => (
    <div className="space-y-6 p-4 bg-card rounded-lg border">
      <h2 className="text-xl font-semibold">Budget Range</h2>

      <div className="grid grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <label htmlFor="min-budget-slider" className="text-sm font-medium">Minimum Budget</label>
            <span className="text-lg font-semibold">${minBudget}</span>
          </div>
          <Slider
            id="min-budget-slider"
            value={[minBudget]}
            onValueChange={([value]) => updateMinBudget(value)}
            min={0}
            max={1000}
            step={10}
            aria-label="Minimum budget"
          />
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <label htmlFor="max-budget-slider" className="text-sm font-medium">Maximum Budget</label>
            <span className="text-lg font-semibold">${maxBudget}</span>
          </div>
          <Slider
            id="max-budget-slider"
            value={[maxBudget]}
            onValueChange={([value]) => {
              // Ensure max is always >= min
              setMaxBudget(Math.max(value, minBudget));
            }}
            min={minBudget}
            max={1000}
            step={10}
            aria-label="Maximum budget"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4">
        {PRICE_RANGES.map(range => {
          // Parse range values safely
          let min = 0;
          let max = 1000;
          try {
            const parts = range.replace(/\$|,/g, '').split('-').map(n => n.trim());
            min = parseInt(parts[0]) || 0;
            max = parts.length > 1 ? (parseInt(parts[1]) || 1000) : 1000;
          } catch (e) {
            console.error(`Error parsing price range: ${range}`, e);
          }

          return (
            <Button
              key={range}
              variant="outline"
              size="sm"
              className={`w-full ${range === `$${minBudget} - $${maxBudget}` ? 'border-primary' : ''}`}
              onClick={() => {
                updateMinBudget(min);
                setMaxBudget(max);
              }}
              aria-label={`Set budget to ${range}`}
            >
              {range}
            </Button>
          );
        })}
      </div>
    </div>
  );

  // Interests Section Component
  const InterestsSection = () => (
    <div className="space-y-6 p-4 bg-card rounded-lg border">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Interests & Preferences</h2>
        <Badge variant="secondary">
          {interests.length + (customInterests ? customInterests.split(',').filter(i => i.trim()).length : 0)} Selected
        </Badge>
      </div>

      <Tabs defaultValue="categories" className="w-full">
        <TabsList>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="custom">Custom</TabsTrigger>
        </TabsList>

        <TabsContent value="categories">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {INTEREST_CATEGORIES.map((category) => (
              <Card key={category.category} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">{category.category}</h3>
                  <Checkbox
                    id={`category-${category.category}`}
                    checked={selectedCategories.includes(category.category)}
                    onCheckedChange={(checked) => {
                      const newCategories = checked
                        ? [...selectedCategories, category.category]
                        : selectedCategories.filter(c => c !== category.category);
                      setSelectedCategories(newCategories);

                      const updatedInterests = checked
                        ? Array.from(new Set([...interests, ...category.subcategories]))
                        : interests.filter(i => !category.subcategories.includes(i));
                      setInterests(updatedInterests);
                    }}
                    aria-label={`Select all ${category.category} interests`}
                  />
                </div>
                <Separator className="my-2" />
                <div className="space-y-2">
                  {category.subcategories.map((sub) => (
                    <div key={sub} className="flex items-center space-x-2">
                      <Checkbox
                        id={`interest-${sub}`}
                        checked={interests.includes(sub)}
                        onCheckedChange={(checked) => {
                          const newInterests = checked
                            ? [...interests, sub]
                            : interests.filter(i => i !== sub);
                          setInterests(newInterests);
                        }}
                        aria-label={`Interest: ${sub}`}
                      />
                      <label htmlFor={`interest-${sub}`} className="text-sm">{sub}</label>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="custom">
          <div className="space-y-4">
            <div>
              <label htmlFor="custom-interests" className="text-sm font-medium">Custom Interests</label>
              <Textarea
                id="custom-interests"
                placeholder="Add custom interests (comma-separated)"
                value={customInterests}
                onChange={(e) => setCustomInterests(e.target.value)}
                className="min-h-[100px] mt-2"
              />
            </div>
            <div>
              <label htmlFor="dislikes" className="text-sm font-medium">Dislikes & Restrictions</label>
              <Textarea
                id="dislikes"
                placeholder="Enter dislikes or restrictions (comma-separated)"
                value={dislikes}
                onChange={(e) => setDislikes(e.target.value)}
                className="min-h-[100px] mt-2"
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );

  // Shopping Preferences Section
  const PreferencesSection = () => (
    <div className="space-y-6 p-4 bg-card rounded-lg border">
      <h2 className="text-xl font-semibold">Shopping Preferences</h2>
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium mb-2">Gift Types</h3>
          <div className="flex flex-wrap gap-2">
            {GIFT_TYPES.map(type => (
              <Badge
                key={type}
                variant={giftType.includes(type) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => {
                  setGiftType(current =>
                    current.includes(type)
                      ? current.filter(t => t !== type)
                      : [...current, type]
                  );
                }}
                role="checkbox"
                aria-checked={giftType.includes(type)}
                aria-label={`Gift type: ${type}`}
              >
                {type}
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium mb-2">Shopping Venues</h3>
          <div className="flex flex-wrap gap-2">
            {SHOPPING_PREFERENCES.map(pref => (
              <Badge
                key={pref}
                variant={shoppingPreferences.includes(pref) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => {
                  setShoppingPreferences(current =>
                    current.includes(pref)
                      ? current.filter(p => p !== pref)
                      : [...current, pref]
                  );
                }}
                role="checkbox"
                aria-checked={shoppingPreferences.includes(pref)}
                aria-label={`Shopping venue: ${pref}`}
              >
                {pref}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Generated Suggestions Section
  const SuggestionsSection = () => (
    <div className="space-y-6">
      {generatedGifts.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Gift Suggestions</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                try {
                  const headers = "Name,Price,Category,Description\n";
                  const csvContent = headers + generatedGifts
                    .map(gift => `"${gift.name.replace(/"/g, '""')}",${gift.price},"${gift.category.replace(/"/g, '""')}","${gift.description.replace(/"/g, '""')}"`)
                    .join('\n');
                  const blob = new Blob([csvContent], { type: 'text/csv' });
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `${recipientName.trim() ? recipientName : 'gift'}-suggestions.csv`;
                  a.click();
                  window.URL.revokeObjectURL(url); // Clean up
                } catch (error) {
                  console.error('Error exporting CSV:', error);
                  toast({
                    title: "Export Failed",
                    description: "Failed to export gift suggestions",
                    variant: "destructive"
                  });
                }
              }}
              aria-label="Export suggestions to CSV"
            >
              Export to CSV
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {generatedGifts.map((gift, index) => (
              <Card key={index} className="p-4">
                <div className="flex justify-between items-start">
                  <h3 className="font-medium text-lg">{gift.name}</h3>
                  <Badge variant="secondary">${gift.price}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {gift.description}
                </p>
                <div className="mt-4 space-y-2">
                  <Badge variant="outline" className="block w-fit">
                    {gift.category}
                  </Badge>
                  <p className="text-sm">
                    <span className="font-medium">Why this gift:</span> {gift.reason}
                  </p>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  {gift.link && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(gift.link, '_blank', 'noopener,noreferrer')}
                      aria-label={`View ${gift.name} online`}
                    >
                      View Item
                    </Button>
                  )}
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => saveGift(gift)}
                    disabled={!isAuthenticated}
                    aria-label={`Save ${gift.name} to your list`}
                  >
                    Save Idea
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // Saved Items Section
  const SavedItemsSection = () => (
    isAuthenticated && (savedGifts.length > 0 || savedRecipients.length > 0) && (
      <div className="space-y-6">
        <Tabs defaultValue="gifts" className="w-full">
          <TabsList>
            <TabsTrigger value="gifts">Saved Gifts ({savedGifts.length})</TabsTrigger>
            <TabsTrigger value="recipients">Saved Recipients ({savedRecipients.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="gifts">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {savedGifts.map((gift, index) => (
                <Card key={index} className="p-4">
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium">{gift.name}</h4>
                    <Badge variant="secondary">${gift.price}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{gift.description}</p>
                  <div className="flex justify-between items-center mt-4">
                    <Badge variant="outline">{gift.category}</Badge>
                    {gift.link && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(gift.link, '_blank', 'noopener,noreferrer')}
                        aria-label={`View ${gift.name} online`}
                      >
                        View
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="recipients">
            <div className="grid gap-4 md:grid-cols-2">
              {savedRecipients.map((recipient, index) => (
                <Card key={index} className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{recipient.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {recipient.details.relationship}, Age: {recipient.details.age}
                        <br />
                        Occasion: {recipient.details.occasion}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setRecipientName(recipient.name);
                        setRecipientAge(recipient.details.age);
                        setRelationship(recipient.details.relationship);
                        setInterests(recipient.details.interests);
                        setDislikes(recipient.details.dislikes.join(', '));
                        setOccasion(recipient.details.occasion);
                      }}
                      aria-label={`Load ${recipient.name}'s details`}
                    >
                      Load
                    </Button>
                  </div>
                  <div className="mt-4">
                    <label className="text-sm font-medium">Interests:</label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {recipient.details.interests.map((interest, i) => (
                        <Badge key={i} variant="secondary">
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    )
  );

  // Main Return
  return (
    <Card className="p-6">
      {!isAuthenticated && (
        <Alert className="mb-4">
          <AlertDescription>
            You have {remainingUses} free suggestions remaining today. Sign in for unlimited access and to save your gift ideas.
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-6">
        <BasicInfoSection />
        <BudgetSection />
        <InterestsSection />
        <PreferencesSection />

        <div className="flex flex-col gap-4">
          <Button
            onClick={generateGiftSuggestions}
            disabled={isGenerating || (!isAuthenticated && remainingUses <= 0)}
            className="w-full py-6 text-lg"
            aria-label="Generate gift suggestions"
          >
            {isGenerating ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin" aria-hidden="true">⏳</div>
                Generating personalized suggestions...
              </div>
            ) : (
              "Get Gift Suggestions"
            )}
          </Button>

          {recipientName && (
            <Button
              variant="outline"
              onClick={saveRecipient}
              disabled={!isAuthenticated}
              className="flex gap-2"
              aria-label={`Save ${recipientName}'s details for future use`}
            >
              <span>Save {recipientName}&apos;s Details</span>
              {!isAuthenticated && <Badge variant="secondary">Sign in required</Badge>}
            </Button>
          )}
        </div>

        <Separator className="my-8" />

        <SuggestionsSection />
        <SavedItemsSection />
      </div>

      <AuthPopup
        isOpen={showAuthPopup}
        onClose={() => setShowAuthPopup(false)}
        onSuccess={handleSuccessfulAuth}
      />
    </Card>
  );
};