import React, { useState } from "react";
import { StepProps } from "@/types/onboarding";
import { Button } from "@repo/ui/components/ui/button";
import { MessageCircle, Bot, User, ArrowRight, Info } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@repo/ui/components/ui/tabs";
import CommentOptionsPanel from "./comment-panel";
import OllyComponent from "./sub-components/olly-component";
import { Separator } from "@repo/ui/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@repo/ui/components/ui/tooltip";

export default function TextSelectionStep({ onNext, onBack }: StepProps) {
  const [activeTab, setActiveTab] = useState("comment-panel");
  const [showCommentPanel, setShowCommentPanel] = useState(false);
  const [hasUnderstood, setHasUnderstood] = useState(false);
  const [completedFeatures, setCompletedFeatures] = useState<string[]>([]);
  const [fadeKey, setFadeKey] = useState(0);

  const post = {
    id: 1,
    author: "Yash Thakker",
    role: "Founder, Olly.Social",
    avatar: "/images/blog/yt.jpg",
    content:
      "Artificial Intelligence is transforming how we work and live. What are your thoughts on AI's impact on society?",
    likes: 24,
    comments: 8,
  };

  const handleCommentClick = () => {
    setShowCommentPanel(true);
  };

  const handleCommentPosted = () => {
    setHasUnderstood(true);
    setCompletedFeatures((prev) => [...prev, "comment-panel"]);
  };

  const handleOllyTourComplete = () => {
    setHasUnderstood(true);
    setCompletedFeatures((prev) => [...prev, "text-selection"]);
  };

  const renderPost = () => (
    <div className="bg-white p-4 rounded-lg border text-left text-sm relative group">
      <div className="flex items-center mb-2">
        {post.avatar ? (
          <img
            src={post.avatar}
            alt={`${post.author} Avatar`}
            className="w-8 h-8 rounded-full mr-2"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mr-2">
            <User className="w-4 h-4 text-gray-500" />
          </div>
        )}
        <div>
          <div className="font-semibold text-sm">{post.author}</div>
          <div className="text-xs text-gray-500">{post.role}</div>
        </div>
      </div>

      <p className="text-sm leading-relaxed mb-2 text-to-select">
        {post.content}
      </p>

      <div className="flex items-center text-gray-500 text-xs">
        <span className="mr-3">👍 {post.likes}</span>
        <button
          onClick={handleCommentClick}
          className={`cursor-pointer hover:text-gray-700 transition-colors ${activeTab === "comment-panel" ? "relative animate-pulse" : ""}`}
        >
          💬 {post.comments} comments
          {activeTab === "comment-panel" && !showCommentPanel && (
            <div className="absolute -right-4 top-1/2 -translate-y-1/2">
              <div className="animate-bounce-x">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <ArrowRight className="h-4 w-4 text-blue-500" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Click to start the tour!</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <h2 className="text-base font-medium">2 Ways to Use Olly</h2>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Info className="h-4 w-4 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Choose your preferred way to interact with Olly</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <Tabs
        defaultValue="comment-panel"
        className="w-full"
        value={activeTab}
        onValueChange={val => { setActiveTab(val); setFadeKey(prev => prev + 1); }}
      >
        <TabsList className="grid grid-cols-2 mb-2">
          <TabsTrigger value="comment-panel" className="text-xs">
            <MessageCircle className="h-3.5 w-3.5 mr-1.5" />
            Comment Panel
            {completedFeatures.includes("comment-panel") && (
              <span className="ml-1.5 text-green-500">✓</span>
            )}
          </TabsTrigger>
          <TabsTrigger value="text-selection" className="text-xs">
            <Bot className="h-3.5 w-3.5 mr-1.5" />
            Text Selection
            {completedFeatures.includes("text-selection") && (
              <span className="ml-1.5 text-green-500">✓</span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="comment-panel" className="mt-0 space-y-3">
          <video
            key={`comment-panel-${fadeKey}`}
            src="/videos/comment-panel.mp4"
            className="rounded-lg border fade-in"
            style={{ maxWidth: '100%', height: 'auto' }}
            autoPlay
            loop
            muted
            playsInline
          />
        </TabsContent>

        <TabsContent value="text-selection" className="mt-0 space-y-3">
          <video
            key={`text-selection-${fadeKey}`}
            src="/videos/text-selection.mp4"
            className="rounded-lg border fade-in"
            style={{ maxWidth: '100%', height: 'auto' }}
            autoPlay
            loop
            muted
            playsInline
          />
        </TabsContent>
      </Tabs>

      

      <Separator className="my-1" />

      {/* Next steps section */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <ArrowRight className="w-4 h-4 text-muted-foreground" />
          <p className="text-sm text-muted-foreground font-medium">
            Coming up next:
          </p>
          <span className="text-xs text-muted-foreground ml-1">
            Activate license • Configure AI
          </span>
        </div>
      </div>
    </div>
  );
}

