import React, { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight, ThumbsUp, MessageSquare, Repeat2, Send, Save } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/components/ui/avatar";
import { Button } from "@repo/ui/components/ui/button";
import { Textarea } from "@repo/ui/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@repo/ui/components/ui/dialog";
import { toast } from "sonner";

// Define sample avatars for posts
const AVATARS = [
  {
    name: "Startup Founder",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=startup&backgroundColor=b6e3f4",
    initials: "SF",
    role: "Founder & CEO at TechStartup",
  },
  {
    name: "Geeta Belani",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=geeta&backgroundColor=d1d4f9",
    initials: "GB",
    role: "HR Manager at AISOLO TECHNOLOGIES",
  },
  {
    name: "Eric Button",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=eric&backgroundColor=c0aede",
    initials: "EB",
    role: "Co-founder at Enhanced Radar",
  },
];

interface Post {
  id: string;
  title: string;
  content: string;
}

interface LinkedInPostModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  posts: Post[];
  onSaveReply: (postId: string, reply: string) => void;
  existingReplies: { postId: string; reply: string }[];
  initialPostId?: string | null;
}

export default function LinkedInPostModal({
  open,
  onOpenChange,
  posts,
  onSaveReply,
  existingReplies,
  initialPostId = null,
}: LinkedInPostModalProps) {
  const [currentPostIndex, setCurrentPostIndex] = useState(0);
  const [reply, setReply] = useState("");
  const [hasChanges, setHasChanges] = useState(false);
  
  // Set initial post index when modal opens based on initialPostId
  useEffect(() => {
    if (open && initialPostId) {
      const index = posts.findIndex((post) => post.id === initialPostId);
      if (index !== -1) {
        setCurrentPostIndex(index);
      }
    }
  }, [open, initialPostId, posts]);
  
  // Initialize the current post
  const currentPost = posts[currentPostIndex];
  const currentAvatar = AVATARS[currentPostIndex % AVATARS.length];
  
  // Handle carousel navigation
  const goToNextPost = () => {
    if (currentPostIndex < posts.length - 1) {
      // Check for unsaved changes
      if (hasChanges) {
        if (window.confirm("You have unsaved changes. Save before continuing?")) {
          handleSaveReply();
        }
        setHasChanges(false);
      }
      
      setCurrentPostIndex(currentPostIndex + 1);
      
      // Find existing reply for the next post
      const nextPostReply = existingReplies.find(
        (item) => item.postId === posts[currentPostIndex + 1].id
      )?.reply || "";
      
      setReply(nextPostReply);
    }
  };
  
  const goToPreviousPost = () => {
    if (currentPostIndex > 0) {
      // Check for unsaved changes
      if (hasChanges) {
        if (window.confirm("You have unsaved changes. Save before continuing?")) {
          handleSaveReply();
        }
        setHasChanges(false);
      }
      
      setCurrentPostIndex(currentPostIndex - 1);
      
      // Find existing reply for the previous post
      const prevPostReply = existingReplies.find(
        (item) => item.postId === posts[currentPostIndex - 1].id
      )?.reply || "";
      
      setReply(prevPostReply);
    }
  };
  
  // Load existing reply when modal opens or current post changes
  useEffect(() => {
    if (currentPost) {
      const existingReply = existingReplies.find(
        (item) => item.postId === currentPost.id
      )?.reply || "";
      
      setReply(existingReply);
      setHasChanges(false);
    }
  }, [currentPost, existingReplies, currentPostIndex]);
  
  // Handle reply changes
  const handleReplyChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setReply(e.target.value);
    
    // Check if value differs from saved reply to track changes
    const currentSavedReply = existingReplies.find(
      (item) => item.postId === currentPost.id
    )?.reply || "";
    
    setHasChanges(e.target.value !== currentSavedReply);
  };
  
  // Handle saving the reply
  const handleSaveReply = () => {
    onSaveReply(currentPost.id, reply);
    toast.success(`Reply saved for "${currentPost.title}"`);
    setHasChanges(false);
  };
  
  // Check for unsaved changes when closing modal
  const handleCloseModal = () => {
    if (hasChanges) {
      if (window.confirm("You have unsaved changes. Save before closing?")) {
        handleSaveReply();
      }
    }
    onOpenChange(false);
  };

  // Format the post content for better readability
  const formatContent = (content: string) => {
    return content.split('\n').map((line, i) => (
      <p key={i} className={i > 0 ? "mt-2" : ""}>{line}</p>
    ));
  };

  return (
    <Dialog open={open} onOpenChange={handleCloseModal}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>Sample LinkedIn Post</DialogTitle>
          <Button variant="ghost" size="icon" onClick={handleCloseModal}>
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        
        {/* Post carousel navigation */}
        <div className="flex items-center justify-between mb-2 text-sm text-gray-500">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={goToPreviousPost} 
            disabled={currentPostIndex === 0}
            className="flex items-center gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <span>
            {currentPostIndex + 1} of {posts.length}
          </span>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={goToNextPost} 
            disabled={currentPostIndex === posts.length - 1}
            className="flex items-center gap-1"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* LinkedIn style post */}
        <div className="border rounded-md overflow-hidden bg-white">
          {/* Post header */}
          <div className="p-4 border-b">
            <div className="flex items-start gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={currentAvatar.image} alt={currentAvatar.name} />
                <AvatarFallback>{currentAvatar.initials}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">{currentAvatar.name}</h3>
                <p className="text-sm text-gray-500">{currentAvatar.role}</p>
                <p className="text-xs text-gray-400 mt-1">2d • <span>🌐</span></p>
              </div>
            </div>
          </div>
          
          {/* Post content */}
          <div className="p-4">
            <div className="text-sm">
              {formatContent(currentPost.content)}
            </div>
            
            {/* Post interactions */}
            <div className="flex items-center justify-between mt-6 pt-2 border-t text-gray-500 text-sm">
              <div className="flex items-center gap-1">
                <ThumbsUp className="h-4 w-4" />
                <span>126</span>
              </div>
              <div className="flex items-center gap-2">
                <span>24 comments</span>
                <span>•</span>
                <span>5 reposts</span>
              </div>
            </div>
            
            {/* Post actions */}
            <div className="flex justify-between mt-1 pt-1 border-t">
              <Button variant="ghost" size="sm" className="flex items-center gap-2 text-gray-500">
                <ThumbsUp className="h-4 w-4" />
                Like
              </Button>
              <Button variant="ghost" size="sm" className="flex items-center gap-2 text-gray-500">
                <MessageSquare className="h-4 w-4" />
                Comment
              </Button>
              <Button variant="ghost" size="sm" className="flex items-center gap-2 text-gray-500">
                <Repeat2 className="h-4 w-4" />
                Repost
              </Button>
              <Button variant="ghost" size="sm" className="flex items-center gap-2 text-gray-500">
                <Send className="h-4 w-4" />
                Send
              </Button>
            </div>
          </div>
          
          {/* Reply section */}
          <div className="p-4 bg-gray-50 border-t">
            <div className="flex gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=your-brand&backgroundColor=ffdfbf" />
                <AvatarFallback>YB</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Textarea
                  className="min-h-[100px] resize-none border rounded-md"
                  placeholder="Write your reply..."
                  value={reply}
                  onChange={handleReplyChange}
                />
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-gray-500">
                    Write a natural, engaging response as if you were commenting on this post.
                  </p>
                  {hasChanges && (
                    <span className="text-xs text-amber-600">
                      Unsaved changes
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter className="flex justify-between items-center mt-4">
          <DialogDescription>
            Sample post {currentPostIndex + 1}: {currentPost.title}
          </DialogDescription>
          <Button 
            onClick={handleSaveReply} 
            className={`gap-2 ${hasChanges ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
            disabled={!reply.trim()}
          >
            <Save className="h-4 w-4" />
            Save Reply
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 