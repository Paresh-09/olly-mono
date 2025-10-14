"use client";

import { useState } from "react";
import { Button } from "@repo/ui/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/ui/select";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import { Textarea } from "@repo/ui/components/ui/textarea";
import { Loader2, Zap } from "lucide-react";
import { toast } from "sonner";

interface TestFeatureProps {
  posts: any[];
}

export default function TestFeature({ posts }: TestFeatureProps) {
  const [open, setOpen] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState("");
  const [testUsername, setTestUsername] = useState("");
  const [testComment, setTestComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedPostId) {
      toast.error("Please select a post");
      return;
    }

    if (!testUsername) {
      toast.error("Please enter a test username");
      return;
    }

    if (!testComment) {
      toast.error("Please enter a test comment");
      return;
    }

    setIsSubmitting(true);

    try {
      // Create a simulated Instagram webhook payload directly for live_comments
      const response = await fetch("/api/instagram/webhook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // We can't forge the actual Instagram signature, but for testing purposes
          // we'll bypass the signature check by using a special header
          "x-test-webhook": "true",
        },
        body: JSON.stringify({
          entry: [
            {
              id: "PLACEHOLDER_INSTAGRAM_ID", // Will be replaced with the actual IG ID on the server
              changes: [
                {
                  field: "live_comments",
                  value: {
                    from: {
                      id: `test-user-id-${Date.now()}`,
                      username: testUsername,
                    },
                    media: {
                      id: selectedPostId,
                      media_product_type: "LIVE",
                    },
                    id: `test-comment-${Date.now()}`,
                    text: testComment,
                  },
                },
              ],
            },
          ],
        }),
      });

      if (response.ok) {
        toast.success("Test comment processed successfully");
        setOpen(false);
      } else {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Unknown error" }));
        toast.error(
          `Failed to process test comment: ${errorData.error || "Unknown error"}`,
        );
      }
    } catch (error) {
      console.error("Error executing test:", error);
      toast.error("Failed to execute test feature");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        variant="secondary"
        className="gap-2"
      >
        <Zap className="h-4 w-4" />
        Test Feature
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Test Live Comments DM Feature</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="post-select">Select Post</Label>
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

            <div className="space-y-2">
              <Label htmlFor="test-username">Test Username</Label>
              <Input
                id="test-username"
                placeholder="Enter a username for testing"
                value={testUsername}
                onChange={(e) => setTestUsername(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="test-comment">Test Comment</Label>
              <Textarea
                id="test-comment"
                placeholder="Enter a comment that would trigger your automation rules"
                value={testComment}
                onChange={(e) => setTestComment(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Test
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
