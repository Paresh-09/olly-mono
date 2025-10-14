import React, { useState, useEffect } from "react";
import { Button } from "@repo/ui/components/ui/button";
import { Smile, Image, Send } from "lucide-react";
import { TourProvider, useTour } from "@reactour/tour";

interface CommentOptionsPanelProps {
  onClose?: () => void;
  onCommentPosted?: () => void;
  isOpen?: boolean;
}

interface Comment {
  id: number;
  text: string;
  author: string;
  role: string;
  likes: number;
  replies: number;
  timestamp: string;
  isLiked?: boolean;
}

const CommentPanelInner: React.FC<CommentOptionsPanelProps> = ({
  onClose,
  onCommentPosted,
  isOpen = true, // Default to true for testing
}) => {
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<Comment[]>([
    {
      id: 1,
      author: "Prime Estate 360",
      role: "2 followers",
      text: "founders juggling too much is a classic pitfall, for sure. what's your take on niche markets?",
      likes: 282,
      replies: 17,
      timestamp: "1m",
      isLiked: false,
    },
  ]);
  const [isGeneratingComment, setIsGeneratingComment] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [elementsReady, setElementsReady] = useState(false);

  const { setIsOpen: setTourOpen, isOpen: isTourOpen } = useTour();

  // Simplified localStorage functions with better error handling
  const getLocalStorageItem = (key: string): string | null => {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        return window.localStorage.getItem(key);
      }
    } catch (error) {
      console.warn("localStorage access failed:", error);
    }
    return null;
  };

  const setLocalStorageItem = (key: string, value: string): void => {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.setItem(key, value);
      }
    } catch (error) {
      console.warn("localStorage write failed:", error);
    }
  };

  // Handle component mounting with better timing
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Separate effect to check for DOM elements after render
  useEffect(() => {
    if (!isMounted) return;

    const checkElements = () => {
      const requiredSelectors = [
        ".quick-replies",
        ".post-button",
        ".comments-section",
      ];
      const allElementsExist = requiredSelectors.every((selector) => {
        const element = document.querySelector(selector);
        return element !== null;
      });

      setElementsReady(allElementsExist);

      if (!allElementsExist) {
        // Keep checking until elements are ready
        setTimeout(checkElements, 100);
      }
    };

    // Start checking after a brief delay
    setTimeout(checkElements, 50);
  }, [isMounted]);

  // Initialize tour only when elements are ready
  useEffect(() => {
    if (!elementsReady || !isOpen) return;

    const hasTourBeenShown = getLocalStorageItem(
      "comment_panel_tour_completed",
    );
    if (!hasTourBeenShown) {
      console.log("Elements ready! Starting tour...");
      // Add delay to ensure tour can properly target elements
      setTimeout(() => {
        setTourOpen(true);
      }, 300);
    }
  }, [elementsReady, isOpen, setTourOpen]);

  const quickReplies = [
    {
      label: "Professional",
      text: "As a professional in this field, I believe effective time management and strategic delegation are crucial for founders. Regarding niche markets, they often provide better opportunities for focused growth and reduced competition.",
    },
    {
      label: "Supportive",
      text: "You raise an excellent point about founder challenges. From my experience, niche markets can actually be a blessing in disguise, allowing for more focused resource allocation and deeper customer relationships.",
    },
    {
      label: "Expert",
      text: "Based on market research, niche markets often show higher profit margins and customer loyalty. This can actually help founders focus their limited resources more effectively.",
    },
    {
      label: "Casual",
      text: "Been there! Niche markets are actually pretty cool - you get to know your customers super well and there's usually less competition to deal with. Win-win! 😊",
    },
  ];

  const handleQuickReply = (text: string) => {
    console.log("Quick reply selected");
    setIsGeneratingComment(true);
    setCommentText("");

    // Simulate AI generation
    setTimeout(() => {
      setCommentText(text);
      setIsGeneratingComment(false);
    }, 1000);
  };

  const handlePostComment = () => {
    if (commentText.trim()) {
      console.log("Posting comment");
      const newComment: Comment = {
        id: comments.length + 1,
        author: "You",
        role: "LinkedIn Member",
        text: commentText,
        likes: 0,
        replies: 0,
        timestamp: "Just now",
        isLiked: false,
      };

      setComments([newComment, ...comments]);
      setCommentText("");

      // If tour is not running, call onCommentPosted immediately
      if (!isTourOpen) {
        setTimeout(() => {
          if (onCommentPosted) {
            onCommentPosted();
          }
        }, 300);
      }
    }
  };

  const handleSkipTour = () => {
    console.log("Tour skipped manually");
    setTourOpen(false);
    setLocalStorageItem("comment_panel_tour_completed", "true");

    setTimeout(() => {
      if (onCommentPosted) {
        onCommentPosted();
      }
    }, 300);
  };

  // Don't render until mounted
  if (!isMounted) {
    return (
      <div className="w-full bg-white rounded-lg shadow-md border border-gray-100 p-4">
        <div className="animate-pulse">
          <div className="h-12 bg-gray-200 rounded-full mb-4"></div>
          <div className="flex gap-2 mb-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-8 w-20 bg-gray-200 rounded-full"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="w-full bg-white rounded-lg shadow-md border border-gray-100 p-4">
        {/* DEBUG: Show current state and element status */}
        {process.env.NODE_ENV === "development" && (
          <div className="mb-4 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
            <strong>Debug:</strong> Tour: {isTourOpen ? "Running" : "Stopped"}, 
            Mounted: {isMounted ? "Yes" : "No"}, Elements
            Ready: {elementsReady ? "Yes" : "No"}
            <br />
            <strong>Tour Conditions:</strong>
            <span className="ml-2">Elements: {elementsReady ? "✓" : "✗"}</span>
            <span className="ml-2">Open: {isOpen ? "✓" : "✗"}</span>
            <span className="ml-2">
              Not Completed:{" "}
              {!getLocalStorageItem("comment_panel_tour_completed") ? "✓" : "✗"}
            </span>
          </div>
        )}

        {/* Comment Input */}
        <div className="relative border border-gray-200 rounded-full mb-4 bg-white flex items-center shadow-sm comment-input">
          <div className="flex-1 px-4 py-2.5">
            {isGeneratingComment ? (
              <div className="flex items-center gap-2 text-gray-500">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
                Generating your comment...
              </div>
            ) : (
              <div className="text-gray-700 text-sm whitespace-pre-wrap">
                {commentText || "Select a tone to generate your comment..."}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 pr-2">
            <button className="text-gray-500 hover:text-gray-700">
              <Smile className="w-5 h-5" />
            </button>
            <button className="text-gray-500 hover:text-gray-700">
              <Image className="w-5 h-5" />
            </button>
            <Button
              size="sm"
              variant="ghost"
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 post-button"
              onClick={handlePostComment}
              disabled={!commentText.trim() || isGeneratingComment}
            >
              Post
            </Button>
          </div>
        </div>

        {/* Quick Replies */}
        <div className="flex flex-wrap gap-2 mb-4 quick-replies">
          {quickReplies.map((reply, index) => (
            <button
              key={index}
              onClick={() => handleQuickReply(reply.text)}
              className="px-4 py-1.5 rounded-full border border-blue-500 text-blue-500 text-sm hover:bg-blue-50 transition-colors disabled:opacity-50"
              disabled={isGeneratingComment}
            >
              {reply.label}
            </button>
          ))}
        </div>

        <div className="text-sm text-gray-600 mb-2">
          {comments[0]?.likes || 0} Likes, {comments.length} Comments, 0 Reposts
        </div>

        <div className="flex justify-between items-center">
          <div className="text-blue-500 font-medium text-sm">
            Reach Score: 4/10
          </div>
          <div className="text-sm text-blue-500">Powered by Olly.Social</div>
        </div>

        <div className="mt-4 border-t pt-4">
          <div className="flex items-center justify-between text-gray-600 text-sm font-medium mb-4">
            <span>Most relevant</span>
            <span>▼</span>
          </div>

          <div className="space-y-4 max-h-[300px] overflow-y-auto comments-section pr-1">
            {comments.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium shrink-0">
                  {comment.author[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="bg-gray-100 rounded-2xl p-3">
                    <div className="flex items-baseline gap-2">
                      <span className="font-semibold text-sm">
                        {comment.author}
                      </span>
                      <span className="text-gray-500 text-xs">
                        {comment.role}
                      </span>
                    </div>
                    <p className="text-sm text-start mt-1 break-words">
                      {comment.text}
                    </p>
                  </div>
                  <div className="flex gap-4 mt-1 text-xs text-gray-500">
                    <button className="hover:text-blue-600">Like</button>
                    <button className="hover:text-blue-600">Reply</button>
                    <span>{comment.timestamp}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Skip option - only show during tour */}
        {isTourOpen && (
          <div className="mt-4 text-center">
            <button
              onClick={handleSkipTour}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Having trouble? Click here to continue
            </button>
          </div>
        )}

        {/* ADDED: Manual tour controls for testing */}
        {process.env.NODE_ENV === "development" && (
          <div className="mt-4 p-3 bg-gray-50 rounded border">
            <div className="text-sm font-medium mb-2">Test Controls:</div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  console.log("Force starting tour...");
                  setTourOpen(true);
                }}
                className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Force Start Tour
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem("comment_panel_tour_completed");
                  setTourOpen(false);
                  setElementsReady(false);
                  setTimeout(() => window.location.reload(), 100);
                }}
                className="px-3 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Reset Tour & Reload
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

// Tour steps configuration
const tourSteps = [
  {
    selector: ".quick-replies",
    content: "Choose a tone for your AI-generated comment",
  },
  {
    selector: ".post-button",
    content: "Click Post to share your AI-generated comment",
  },
  {
    selector: ".comments-section",
    content: "Your comment will appear here at the top",
  },
];

// Main component with TourProvider
const CommentPanel: React.FC<CommentOptionsPanelProps> = (props) => {
  const handleTourComplete = () => {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.setItem("comment_panel_tour_completed", "true");
      }
    } catch (error) {
      console.warn("localStorage write failed:", error);
    }

    // Call onCommentPosted after tour completion
    setTimeout(() => {
      if (props.onCommentPosted) {
        props.onCommentPosted();
      }
    }, 300);
  };

  return (
    <TourProvider
      steps={tourSteps}
      beforeClose={handleTourComplete}
      styles={{
        popover: (base) => ({
          ...base,
          "--reactour-accent": "#3b82f6",
          borderRadius: "12px",
        }),
        maskArea: (base) => ({
          ...base,
          rx: 8,
        }),
        badge: (base) => ({
          ...base,
          left: "auto",
          right: "-0.8125em",
        }),
      }}
      showBadge={true}
      showPrevNextButtons={true}
      showCloseButton={true}
      disableInteraction={false}
      padding={10}
    >
      <CommentPanelInner {...props} />
    </TourProvider>
  );
};

export default CommentPanel;