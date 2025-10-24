'use client';

import { useState, useEffect } from 'react';
import { Platform } from '@prisma/client';
import { Button } from '@repo/ui/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@repo/ui/components/ui/dialog';
import { Input } from '@repo/ui/components/ui/input';
import { Label } from '@repo/ui/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui/components/ui/select';
import { Textarea } from '@repo/ui/components/ui/textarea';
import { toast } from '@repo/ui/hooks/use-toast';
import ShareSpacePost from './_components/ShareSpacePost';

export default function ShareSpaceContent() {
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);

  const [formData, setFormData] = useState({
    url: '',
    platform: 'LINKEDIN' as Platform,
    creditBudget: 0,
    creditsPerShare: 0,
    deadline: '',
  });

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async (pageNum = 1) => {
    try {
      const response = await fetch(
        `/api/share-space?page=${pageNum}&limit=10&hideExpired=true`
      );
      const data = await response.json();

      if (pageNum === 1) {
        setPosts(data.posts);
      } else {
        setPosts(prev => [...prev, ...data.posts]);
      }
      setHasMore(data.posts.length === 10);
    } catch (error) {
      console.error('Error loading posts:', error);
      toast({
        title: "Error",
        description: "Failed to load posts. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate credit settings
    const totalPotentialRewards = formData.creditsPerShare * 10; // Assuming max 10 views
    if (totalPotentialRewards > formData.creditBudget) {
      toast({
        title: "Error",
        description: "Credit budget is too low for potential rewards. Please increase budget or decrease rewards.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/share-space', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create post');
      }

      const newPost = await response.json();
      setPosts(prev => [newPost, ...prev]);
      setShowAddDialog(false);
      setFormData({
        url: '',
        platform: 'LINKEDIN',
        creditBudget: 0,
        creditsPerShare: 0,
        deadline: '',
      });
      toast({
        title: 'Success',
        description: 'Post shared successfully!',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to share post',
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold">Recent Posts</h2>
          <p className="text-sm text-gray-500">
            Click links to earn credits
          </p>
        </div>

        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">Share New Post</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Share a New Post</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="url">Post URL</Label>
                <Input
                  id="url"
                  type="url"
                  value={formData.url}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, url: e.target.value }))
                  }
                  required
                />
              </div>

              <div>
                <Label htmlFor="platform">Platform</Label>
                <Select
                  value={formData.platform}
                  onValueChange={value =>
                    setFormData(prev => ({ ...prev, platform: value as Platform }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select platform" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LINKEDIN">LinkedIn</SelectItem>
                    <SelectItem value="TWITTER">Twitter</SelectItem>
                    <SelectItem value="INSTAGRAM">Instagram</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-medium">Credit Settings</h3>
                
                <div>
                  <Label htmlFor="deadline">Post Deadline</Label>
                  <Input
                    id="deadline"
                    type="datetime-local"
                    value={formData.deadline}
                    onChange={e =>
                      setFormData(prev => ({ ...prev, deadline: e.target.value }))
                    }
                    min={new Date().toISOString().slice(0, 16)}
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">When this post will expire</p>
                </div>

                <div>
                  <Label htmlFor="creditBudget">Credit Budget</Label>
                  <Input
                    id="creditBudget"
                    type="number"
                    min="0"
                    value={formData.creditBudget}
                    onChange={e =>
                      setFormData(prev => ({ ...prev, creditBudget: parseInt(e.target.value) || 0 }))
                    }
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">Total credits to allocate</p>
                </div>

                <div>
                  <Label htmlFor="creditsPerShare">Credits per View</Label>
                  <Input
                    id="creditsPerShare"
                    type="number"
                    min="0"
                    value={formData.creditsPerShare}
                    onChange={e =>
                      setFormData(prev => ({ ...prev, creditsPerShare: parseInt(e.target.value) || 0 }))
                    }
                    required
                  />
                </div>
              </div>

              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Sharing...' : 'Share Post'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-1 divide-y divide-gray-100">
        {isLoading ? (
          // Loading skeletons
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-8 bg-gray-100 animate-pulse rounded" />
          ))
        ) : posts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No posts found. Be the first to share!
          </div>
        ) : (
          <>
            {posts.map(post => (
              <ShareSpacePost key={post.id} post={post} />
            ))}

            {hasMore && (
              <div className="flex justify-center mt-6">
                <Button
                  variant="outline"
                  onClick={() => loadPosts(page + 1)}
                  disabled={isLoading}
                >
                  {isLoading ? 'Loading...' : 'Load More'}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
} 