"use client";

import { useState, useEffect } from "react";
import { Button } from "@repo/ui/components/ui/button";
import { Card, CardContent } from "@repo/ui/components/ui/card";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import { Switch } from "@repo/ui/components/ui/switch";
import { Textarea } from "@repo/ui/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/ui/select";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import TestFeature from "./test-feature";

interface InstagramAccount {
  id: string;
  username: string;
  name: string;
  profilePicture: string;
  followersCount: number;
  mediaCount: number;
}

interface Post {
  id: string;
  permalink: string;
  caption: string;
  media_url: string;
  thumbnail_url?: string;
  timestamp: string;
}

interface DMRule {
  id: string;
  triggerKeyword: string;
  message: string;
  isActive: boolean;
  delay: number; // delay in minutes before sending DM
}

interface DMAutomationProps {
  account: InstagramAccount;
}

export default function DMAutomation({ account }: DMAutomationProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPostId, setSelectedPostId] = useState<string>("");
  const [dmRules, setDMRules] = useState<DMRule[]>([]);
  const [newKeyword, setNewKeyword] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [newDelay, setNewDelay] = useState(5); // default 5 minutes

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch posts
        const postsResponse = await fetch("/api/automations/instagram/posts");
        const postsData = await postsResponse.json();

        if (postsData.posts) {
          setPosts(postsData.posts);

          // Fetch DM automation configuration
          const configResponse = await fetch(
            "/api/automations/instagram/dm-automation",
          );
          const configData = await configResponse.json();

          if (configData.config) {
            setIsEnabled(configData.config.isEnabled);
            setSelectedPostId(configData.config.postId || "");
            setDMRules(configData.config.dmRules || []);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load Instagram data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAddDMRule = () => {
    if (!newKeyword.trim()) {
      toast.error("Please enter a trigger keyword");
      return;
    }

    if (!newMessage.trim()) {
      toast.error("Please enter a DM message");
      return;
    }

    const newRule: DMRule = {
      id: Date.now().toString(),
      triggerKeyword: newKeyword.trim(),
      message: newMessage.trim(),
      isActive: true,
      delay: newDelay,
    };

    setDMRules([...dmRules, newRule]);
    setNewKeyword("");
    setNewMessage("");
    setNewDelay(5);
  };

  const handleDeleteDMRule = (id: string) => {
    setDMRules(dmRules.filter((rule) => rule.id !== id));
  };

  const handleToggleRule = (id: string) => {
    setDMRules(
      dmRules.map((rule) =>
        rule.id === id ? { ...rule, isActive: !rule.isActive } : rule,
      ),
    );
  };

  const handleSaveConfig = async () => {
    if (!selectedPostId) {
      toast.error("Please select a post to monitor");
      return;
    }

    if (dmRules.length === 0) {
      toast.error("Please add at least one DM rule");
      return;
    }

    // Convert our DMRule objects to the format expected by the webhook handler
    const formattedRules = dmRules.map((rule) => ({
      keyword: rule.triggerKeyword, // For backwards compatibility
      triggerKeyword: rule.triggerKeyword, // New field
      message: rule.message,
      isActive: rule.isActive,
      delay: rule.delay,
    }));

    setIsSaving(true);
    try {
      const response = await fetch("/api/automations/instagram/dm-automation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isEnabled,
          postId: selectedPostId,
          dmRules: formattedRules, // Prisma Json field will handle this as a raw JSON value
        }),
      });

      if (response.ok) {
        toast.success("DM automation configuration saved");
      } else {
        const errorData = await response.json().catch(() => null);
        toast.error(errorData?.message || "Failed to save configuration");
      }
    } catch (error) {
      console.error("Error saving config:", error);
      toast.error("Failed to save configuration");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Switch
            id="dm-automation-enabled"
            checked={isEnabled}
            onCheckedChange={setIsEnabled}
          />
          <Label htmlFor="dm-automation-enabled">
            {isEnabled ? "DM Automation Enabled" : "DM Automation Disabled"}
          </Label>
        </div>

        {/* Add the Test Feature button here */}
        <TestFeature posts={posts} />
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="post-select">Select Post to Monitor</Label>
          <Select value={selectedPostId} onValueChange={setSelectedPostId}>
            <SelectTrigger id="post-select">
              <SelectValue placeholder="Select a post" />
            </SelectTrigger>
            <SelectContent>
              {posts.map((post) => (
                <SelectItem key={post.id} value={post.id}>
                  {post.caption
                    ? post.caption.substring(0, 50) + "..."
                    : "Post from " +
                      new Date(post.timestamp).toLocaleDateString()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedPostId && (
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              {posts.find((p) => p.id === selectedPostId)?.media_url && (
                <img
                  src={
                    posts.find((p) => p.id === selectedPostId)?.thumbnail_url ||
                    posts.find((p) => p.id === selectedPostId)?.media_url
                  }
                  alt="Selected post"
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-4">
                <p className="text-sm">
                  {posts.find((p) => p.id === selectedPostId)?.caption ||
                    "No caption"}
                </p>
                <a
                  href={posts.find((p) => p.id === selectedPostId)?.permalink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-500 mt-2 inline-block"
                >
                  View on Instagram
                </a>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">DM Rules</h3>

        <div className="grid gap-4">
          {dmRules.map((rule) => (
            <Card key={rule.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        Trigger: "{rule.triggerKeyword}"
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-muted">
                        {rule.delay} min delay
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {rule.message}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={rule.isActive}
                      onCheckedChange={() => handleToggleRule(rule.id)}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteDMRule(rule.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardContent className="p-4 space-y-4">
            <h4 className="font-medium">Add New DM Rule</h4>

            <div className="space-y-2">
              <Label htmlFor="trigger-keyword">Trigger Keyword</Label>
              <Input
                id="trigger-keyword"
                placeholder="Enter keyword that triggers the DM"
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="delay">Delay (minutes)</Label>
              <Select
                value={newDelay.toString()}
                onValueChange={(value) => setNewDelay(parseInt(value))}
              >
                <SelectTrigger id="delay">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 minute</SelectItem>
                  <SelectItem value="5">5 minutes</SelectItem>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dm-message">DM Message</Label>
              <Textarea
                id="dm-message"
                placeholder="Enter the message to send via DM"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                You can use {"{name}"} to include the user's name in your
                message.
              </p>
            </div>

            <Button onClick={handleAddDMRule} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add DM Rule
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSaveConfig} disabled={isSaving}>
          {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Save Configuration
        </Button>
      </div>
    </div>
  );
}
