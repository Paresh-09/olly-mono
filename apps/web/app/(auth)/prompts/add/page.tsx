"use client"

import axios from "axios";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@repo/ui/components/ui/input";
import { Button } from "@repo/ui/components/ui/button";
import { Label } from "@repo/ui/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/components/ui/select";
import { Textarea } from "@repo/ui/components/ui/textarea";
import { useToast } from "@repo/ui/hooks/use-toast";import { Switch } from "@repo/ui/components/ui/switch";

const promptCategories = [
  "Social Media",
  "LinkedIn",
  "Twitter",
  "Content Calendar",
  "Engagement",
  "Growth",
  "SEO",
  "Copywriting",
  "Email Marketing",
  "Other",
  "Personal Branding",
  "TikTok",
  "YouTube",
  "Instagram",
  "Facebook",
];

const AddPromptPage = () => {
  const [text, setText] = useState("");
  const [promptTitle, setPromptTitle] = useState("");
  const [category, setCategory] = useState("");
  const [isPremium, setIsPremium] = useState(false);
  const [creditCost, setCreditCost] = useState(5); // Default cost
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await axios.post("/api/prompts", {
        text,
        category,
        promptTitle,
        isPremium,
        creditCost: isPremium ? creditCost : 0,
      });
      toast({
        title: "Success",
        description: "Prompt added successfully",
      });
      router.push("/prompts");
    } catch (error: any) {
      console.error("Error adding prompt:", error);
      toast({
        title: "Error",
        description: `Failed to add prompt: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-semibold mb-4">Add Prompt</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <Label htmlFor="promptTitle">Prompt Title</Label>
          <Input
            id="promptTitle"
            value={promptTitle}
            onChange={(e) => setPromptTitle(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <Label htmlFor="text">Prompt</Label>
          <Textarea
            id="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <Label htmlFor="category">Category</Label>
          <Select value={category} onValueChange={(value) => setCategory(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {promptCategories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="mb-4 flex items-center space-x-2">
          <Switch
            checked={isPremium}
            onCheckedChange={(checked) => {
              console.log('Switch changed:', checked);
              setIsPremium(checked);
            }}
            id="premium-mode"
          />
          <Label htmlFor="premium-mode">Premium Prompt</Label>
        </div>
        {isPremium && (
          <div className="mb-4">
            <Label htmlFor="creditCost">Credit Cost</Label>
            <Input
              id="creditCost"
              type="number"
              min="1"
              value={creditCost}
              onChange={(e) => setCreditCost(parseInt(e.target.value))}
              required
            />
          </div>
        )}
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Adding..." : "Add Prompt"}
        </Button>
      </form>
    </div>
  );
};

export default AddPromptPage;