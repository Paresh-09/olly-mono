"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { TourProvider, useTour } from "@reactour/tour";
import {
  TrendingUp,
  RefreshCw,
  CornerDownLeft,
  ThumbsDown,
  ThumbsUp,
  Cloud,
  Book,
  Sparkles,
  X,
  Copy,
  ChevronLeft,
  ChevronRight,
  Move,
} from "lucide-react";

interface OllyComponentProps {
  onTourComplete?: () => void;
  isPreview?: boolean;
  initialText?: string;
}

const OllyComponentInner: React.FC<OllyComponentProps> = ({
  onTourComplete,
  isPreview = false,
  initialText = "Artificial Intelligence is transforming how we work and live.",
}) => {
  // Core state
  const [isVisible, setIsVisible] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({
    top: "50%",
    transform: "translateY(-50%)",
  });
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [responseText, setResponseText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<boolean | null>(null);

  // Tour state
  const [hasCompletedTour, setHasCompletedTour] = useState(false);
  const [showTourCompleteConfetti, setShowTourCompleteConfetti] =
    useState(false);

  // New enhanced UX states
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);
  const [showPulseAnimation, setShowPulseAnimation] = useState(false);
  const [selectedAction, setSelectedAction] = useState<number | null>(null);
  const [userHasInteracted, setUserHasInteracted] = useState(false);
  const [hasShownDelightAnimation, setHasShownDelightAnimation] =
    useState(false);

  // Technical states
  const [isMounted, setIsMounted] = useState(false);

  // Refs
  const ollyButtonRef = useRef<HTMLDivElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const lastSelectionRef = useRef<string>("");
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const confettiRef = useRef<HTMLDivElement>(null);

  // Tour hook
  const { setIsOpen: setTourOpen, isOpen: isTourOpen, currentStep, setCurrentStep } = useTour();

  /**
   * Safe localStorage utilities with proper error handling
   */
  const getLocalStorageItem = useCallback((key: string): string | null => {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        return window.localStorage.getItem(key);
      }
    } catch (error) {
      console.warn("localStorage access failed:", error);
    }
    return null;
  }, []);

  const setLocalStorageItem = useCallback(
    (key: string, value: string): void => {
      try {
        if (typeof window !== "undefined" && window.localStorage) {
          window.localStorage.setItem(key, value);
        }
      } catch (error) {
        console.warn("localStorage write failed:", error);
      }
    },
    [],
  );

  // Add a function to check localStorage on component load
  const checkTourCompletionStatus = useCallback(() => {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        const status = window.localStorage.getItem(
          "olly_component_tour_completed",
        );
        return status === "true";
      }
    } catch (error) {
      console.warn("localStorage check failed:", error);
    }
    return false;
  }, []);

  // Handle component mounting
  useEffect(() => {
    setIsMounted(true);
    return () => {
      // Clean up any lingering timeouts on unmount
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, []);

  // Initialize tour and component state
  useEffect(() => {
    if (!isMounted) return;

    if (isPreview) {
      // Preview mode: show component and start tour
      setIsVisible(true);
      setTimeout(() => {
        setTourOpen(true);
      }, 200);

      // Set initial text selection for preview
      lastSelectionRef.current = initialText;
    } else {
      // Normal mode: check if tour has been completed
      const tourCompleted = checkTourCompletionStatus();
      console.log("Is tour already completed?", tourCompleted);

      if (!tourCompleted) {
        console.log("Starting Olly tour for first-time user");
        setIsVisible(true);
        lastSelectionRef.current = initialText;

        // Subtle animation to draw attention
        setShowPulseAnimation(true);
        setTimeout(() => {
          setShowPulseAnimation(false);
          setTourOpen(true);
        }, 1000);
      } else {
        console.log("Tour already completed, not showing tour");
        // Make sure tour is explicitly false
        setTourOpen(false);
      }
    }
  }, [isPreview, isMounted, initialText, checkTourCompletionStatus, setTourOpen]);

  // Text selection handler
  useEffect(() => {
    if (!isMounted) return;

    const handleMouseUp = (event: MouseEvent) => {
      const selection = window.getSelection();
      if (selection && selection.toString().trim()) {
        const selectedText = selection.toString().trim();
        lastSelectionRef.current = selectedText;

        // Only show delight animation once per session
        if (!hasShownDelightAnimation && !isPreview && !isTourOpen) {
          setHasShownDelightAnimation(true);
          setShowPulseAnimation(true);
          setTimeout(() => setShowPulseAnimation(false), 1000);
        }

        setIsVisible(true);
        setIsFadingOut(false);
        setUserHasInteracted(true);

        if (hideTimeoutRef.current) {
          clearTimeout(hideTimeoutRef.current);
        }

        // Auto-advance tour only if on first step and text is selected
        if (currentStep === 0 && isTourOpen) {
          setTimeout(() => setCurrentStep(1), 800);
        }
      } else if (!isDrawerOpen) {
        // Hide component after delay if drawer isn't open
        hideTimeoutRef.current = setTimeout(() => {
          setIsFadingOut(true);
          setTimeout(() => {
            setIsVisible(false);
            setIsFadingOut(false);
            setIsDrawerOpen(false);
            setResponseText("");
            setFeedback(null);
            setSelectedAction(null);
          }, 700);
        }, 3000); // Increased for better UX
      }
    };

    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, [
    isDrawerOpen,
    currentStep,
    isTourOpen,
    isMounted,
    isPreview,
    hasShownDelightAnimation,
    setCurrentStep,
  ]);

  // Handle dragging logic
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.target instanceof Element && e.target.id === "olly-drawer-toggle")
      return;
    if (e.target instanceof Element && e.target.closest(".olly-drag-handle")) {
      setIsDragging(true);
      e.preventDefault(); // Prevent text selection during drag
    }
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isDragging) {
        const newTop = Math.max(
          60,
          Math.min(e.clientY, window.innerHeight - 60),
        );
        setPosition({ top: `${newTop}px`, transform: "none" });
      }
    },
    [isDragging],
  );

  const handleMouseUpDrag = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Setup drag event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUpDrag);
      // Add a class to the body to indicate dragging (for cursor)
      document.body.classList.add("olly-dragging");
    } else {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUpDrag);
      document.body.classList.remove("olly-dragging");
    }
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUpDrag);
      document.body.classList.remove("olly-dragging");
    };
  }, [isDragging, handleMouseMove, handleMouseUpDrag]);

  const handleFeedback = useCallback(
    async (isPositive: boolean) => {
      // Prevent multiple feedback submissions
      if (feedback !== null) {
        // Feedback already submitted, don't allow multiple submissions
        return;
      }

      // Set feedback state
      setFeedback(isPositive);

      // Set a single feedback message (instead of appending)
      const feedbackMessage = isPositive
        ? "Thanks for the positive feedback! 🎉"
        : "Thanks for helping us improve! 🙌";

      // Replace response with feedback message rather than appending
      setResponseText(feedbackMessage);

      try {
        // Send feedback to server
        const response = await fetch("/api/olly-component-feedback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            feedbackType: isPositive ? "Positive" : "Negative",
            feedback: isPositive ? "Thumbs Up" : "Thumbs Down",
            skipped: false,
            source: "OllyPopup",
            context: {
              responseText,
              selectedText: lastSelectionRef.current,
            },
          }),
        });

        if (!response.ok) throw new Error("Failed to send feedback");

        // Always complete tour when feedback is given, regardless of tour step
        // This ensures the tour completes even if somehow we're still on step 4
        setTimeout(() => {
          // Set localStorage value directly, not inside a timeout
          setLocalStorageItem("olly_component_tour_completed", "true");


          // End the tour immediately
          setTourOpen(false);
          setHasCompletedTour(true);
          setShowTourCompleteConfetti(true);
          if (isDrawerOpen) {
            setIsDrawerOpen(false);
          }
          // Hide confetti after animation
          setTimeout(() => {
            setShowTourCompleteConfetti(false);

            // Notify parent component
            if (onTourComplete) {
              onTourComplete();
            }
          }, 3000);
        }, 800);
      } catch (error) {
        console.error("Error sending feedback:", error);
      }
    },
    [responseText, feedback, setLocalStorageItem, onTourComplete, setTourOpen, isDrawerOpen],
  );

  // Renamed from handleOptionClick to handleActionClick for clarity
  const handleActionClick = useCallback(
    (index: number) => {
      setIsLoading(true);
      setResponseText("");
      setFeedback(null);
      setSelectedAction(index);

      // Different responses based on the selected action
      const responses = [
        `💬 Comment suggestion for "${lastSelectionRef.current.substring(0, 30)}..."\n\nThis is a fascinating insight! I'd add that AI assistants like Olly are designed to enhance human creativity, not replace it. The future of work will likely involve human-AI collaboration.`,
        `📝 Summary of your selected text:\n\nThis text discusses how artificial intelligence is creating significant changes in both professional environments and personal life, highlighting the transformative nature of AI technology.`,
        `📊 Virality Score: 78/100\n\nYour content has strong viral potential! It discusses a trending topic (AI) and has an engaging hook. To improve: add a personal story or surprising statistic to increase emotional impact.`,
        `🔄 Similar post suggestion:\n\n"Machine Learning is revolutionizing our approach to problem-solving. From personalized recommendations to predictive analytics, we're just beginning to unlock its potential in everyday applications."`,
        `↩️ Reply suggestion:\n\nGreat point about AI transformation! I've seen this firsthand in my industry, where AI tools have streamlined processes that used to take days into minutes. Have you experienced similar efficiency gains?`,
      ];

      setTimeout(() => {
        setIsLoading(false);
        setResponseText(responses[index]);

        // Auto-advance tour if on actions step and tour is running
        if (currentStep === 2 && isTourOpen) {
          setTimeout(() => setCurrentStep(3), 800);
        }
      }, 1500);
    },
    [lastSelectionRef, currentStep, isTourOpen, setCurrentStep],
  );

  // Handle main icon click
  const handleIconClick = useCallback(() => {
    if (!isTourOpen) {
      setIsDrawerOpen(true);
      if (!responseText) {
        handleActionClick(0);
      }
    }
  }, [isTourOpen, responseText, handleActionClick]);

  // Toggle drawer open/closed
  const toggleDrawer = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      setIsDrawerOpen((prev) => !prev);

      // Clear hide timeout when opening drawer
      if (!isDrawerOpen) {
        if (hideTimeoutRef.current) {
          clearTimeout(hideTimeoutRef.current);
        }

        // Auto-advance tour if on drawer step and tour is running
        if (currentStep === 1 && isTourOpen) {
          setTimeout(() => setCurrentStep(2), 800);
        }
      }
    },
    [isDrawerOpen, currentStep, isTourOpen, setCurrentStep],
  );

  // Copy response to clipboard
  const handleCopyToClipboard = useCallback(() => {
    navigator.clipboard.writeText(responseText);
    setCopiedToClipboard(true);

    // Reset copied state after 2 seconds
    setTimeout(() => {
      setCopiedToClipboard(false);
    }, 2000);
  }, [responseText]);

  // Action options with enhanced icons and descriptions
  const options = [
    {
      title: "Comment on a Post",
      icon: <Cloud className="w-5 h-5" />,
      description: "Get AI-suggested comments based on your selected text",
    },
    {
      title: "Summarize Text",
      icon: <Book className="w-5 h-5" />,
      description: "Create a concise summary of the selected content",
    },
    {
      title: "Check Virality Score",
      icon: <TrendingUp className="w-5 h-5" />,
      description: "Analyze how likely your content is to be shared",
    },
    {
      title: "Generate Similar Content",
      icon: <RefreshCw className="w-5 h-5" />,
      description: "Create new content inspired by your selection",
    },
    {
      title: "Suggest Reply",
      icon: <CornerDownLeft className="w-5 h-5" />,
      description: "Get ideas for replying to the selected comment",
    },
  ];

  // Don't render anything until component is mounted
  if (!isMounted) {
    return null;
  }

  // Don't render if not visible and not fading out
  if (!isVisible && !isFadingOut && !isPreview) return null;

  return (
    <>
      {/* Main Olly Button */}
      <div
        ref={ollyButtonRef}
        className={`fixed flex items-center bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 rounded-full shadow-xl cursor-pointer z-[9999] transition-all duration-700 ease-out p-1.5 olly-button hover:shadow-2xl ${
          showPulseAnimation ? "animate-pulse" : ""
        } ${
          isFadingOut ? "opacity-0 scale-95" : "opacity-100 scale-100"
        } ${!isVisible && !isPreview ? "hidden" : ""}`}
        style={{ right: "20px", ...position }}
        onMouseDown={handleMouseDown}
      >
        {/* Drag handle */}
        <div
          className="absolute -left-1 top-1/2 transform -translate-y-1/2 -translate-x-full opacity-0 hover:opacity-100 transition-opacity duration-300 olly-drag-handle"
          title="Drag to reposition"
        >
          <Move className="w-4 h-4 text-gray-600 bg-white rounded-full p-0.5 shadow-md" />
        </div>

        {/* Olly Icon */}
        <div
          onClick={handleIconClick}
          className="transition-transform duration-200 hover:scale-110 relative text-to-select"
        >
          <Image
            src="/icon-2.png"
            alt="Olly AI Assistant"
            width={36}
            height={36}
            className={`rounded-full ring-2 ring-white/30 ${userHasInteracted ? "" : "animate-bounce"}`}
          />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-300 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
          </span>
        </div>

        {/* Drawer Toggle */}
        <div
          id="olly-drawer-toggle"
          className="text-white text-base ml-1.5 mr-1.5 cursor-pointer w-8 h-8 flex items-center justify-center transition-all duration-300 hover:bg-white/20 rounded-full"
          onClick={toggleDrawer}
          title={isDrawerOpen ? "Close menu" : "Open menu to see AI actions"}
        >
          {isDrawerOpen ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </div>
      </div>

      {/* Action Drawer */}
      {isDrawerOpen && (
        <div
          ref={drawerRef}
          className={`fixed bg-white rounded-xl shadow-2xl z-[9998] flex flex-col items-center font-sans transition-all duration-500 ease-out p-3 overflow-hidden border border-gray-100 ${
            isFadingOut
              ? "opacity-0 scale-95 translate-x-4"
              : "opacity-100 scale-100 translate-x-0"
          }`}
          style={{
            right: "80px",
            ...position,
            width: `${options.length * 52 + (options.length - 1) * 8 + 24}px`,
          }}
        >
          {/* Action Buttons */}
          <div className="flex items-center mb-3 olly-actions">
            {options.map((option, index) => (
              <button
                key={index}
                className={`w-13 h-13 rounded-xl border-none text-gray-700 text-lg cursor-pointer mr-2 last:mr-0 transition-all duration-300 ease-out hover:shadow-md hover:scale-105 active:scale-95 flex items-center justify-center group relative
                  ${
                    selectedAction === index
                      ? "bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600 ring-2 ring-blue-300"
                      : "bg-gradient-to-br from-gray-50 to-gray-100 hover:from-blue-50 hover:to-blue-100 hover:text-blue-600"
                  }`}
                onClick={() => handleActionClick(index)}
                title={option.title}
              >
                <div className="transition-transform duration-200 group-hover:scale-110 p-3">
                  {option.icon}
                </div>

                {/* Tooltip */}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50 pointer-events-none">
                  {option.title}
                </div>
              </button>
            ))}
          </div>

          {/* Response Area */}
          <div className="w-full p-4 bg-gradient-to-br from-gray-50 to-gray-100 border-t border-gray-200 rounded-b-xl olly-response">
            {isLoading ? (
              <div className="flex flex-col items-center space-y-3 py-3">
                <div className="flex space-x-2">
                  <div
                    className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"
                    style={{ animationDelay: "0s" }}
                  ></div>
                  <div
                    className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                  <div
                    className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"
                    style={{ animationDelay: "0.4s" }}
                  ></div>
                </div>
                <p className="m-0 text-gray-700">Generating AI response...</p>
              </div>
            ) : responseText ? (
              <>
                <div className="m-0 mb-3 text-gray-700 leading-relaxed whitespace-pre-line">
                  {responseText}
                </div>
                <div className="flex justify-between mb-3 gap-2">
                  <button
                    className={`px-4 py-2 border-none rounded-lg bg-gradient-to-r text-white cursor-pointer text-sm font-medium transition-all duration-200 hover:shadow-md active:scale-95 flex items-center gap-1.5
                      ${
                        copiedToClipboard
                          ? "from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                          : "from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                      }`}
                    onClick={handleCopyToClipboard}
                  >
                    {copiedToClipboard ? "Copied!" : "Copy"}
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    className="px-4 py-2 border-none rounded-lg bg-gradient-to-r from-gray-500 to-gray-600 text-white cursor-pointer text-sm font-medium transition-all duration-200 hover:from-gray-600 hover:to-gray-700 hover:shadow-md active:scale-95 flex items-center gap-1.5"
                    onClick={() => setResponseText("")}
                  >
                    Close <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Feedback Buttons */}
                <div className="flex justify-center items-center mt-3 olly-feedback gap-3">
                  <button
                    className={`p-3 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 relative ${
                      feedback === true
                        ? "bg-green-100 ring-2 ring-green-300 shadow-md"
                        : "bg-gray-100 hover:bg-green-50 hover:shadow-md"
                    }`}
                    onClick={() => handleFeedback(true)}
                    title="Great response! 👍"
                  >
                    <ThumbsUp
                      className={`w-5 h-5 transition-colors duration-200 ${
                        feedback === true
                          ? "text-green-600"
                          : "text-gray-600 hover:text-green-600"
                      }`}
                    />

                    {/* Tooltip */}
                    <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                      Helpful response
                    </span>
                  </button>
                  <button
                    className={`p-3 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 relative ${
                      feedback === false
                        ? "bg-red-100 ring-2 ring-red-300 shadow-md"
                        : "bg-gray-100 hover:bg-red-50 hover:shadow-md"
                    }`}
                    onClick={() => handleFeedback(false)}
                    title="Needs improvement 👎"
                  >
                    <ThumbsDown
                      className={`w-5 h-5 transition-colors duration-200 ${
                        feedback === false
                          ? "text-red-600"
                          : "text-gray-600 hover:text-red-600"
                      }`}
                    />

                    {/* Tooltip */}
                    <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                      Needs improvement
                    </span>
                  </button>
                </div>
              </>
            ) : (
              // Empty state with hint
              <div className="text-center py-3 text-gray-500 text-sm italic">
                Select an action above to generate a response
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tour Complete Confetti Animation */}
      {showTourCompleteConfetti && (
        <div
          ref={confettiRef}
          className="fixed inset-0 pointer-events-none z-[10000]"
          style={{
            background:
              "radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, rgba(255,255,255,0) 70%)",
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center bg-white bg-opacity-90 px-6 py-4 rounded-xl shadow-lg">
              <div className="text-2xl mb-2">🎉</div>
              <div className="font-bold text-blue-600 mb-1">Tour Complete!</div>
              <div className="text-sm text-gray-600">
                You're all set to use Olly
              </div>
            </div>
          </div>

          {/* Confetti particles */}
          {Array.from({ length: 50 }).map((_, i) => {
            const size = Math.random() * 10 + 5;
            const left = Math.random() * 100;
            const animationDelay = Math.random() * 2;
            const color = [
              "#3B82F6", // blue-500
              "#60A5FA", // blue-400
              "#93C5FD", // blue-300
              "#DBEAFE", // blue-100
              "#FCD34D", // amber-300
              "#FBBF24", // amber-400
              "#F59E0B", // amber-500
              "#10B981", // emerald-500
            ][Math.floor(Math.random() * 8)];

            return (
              <div
                key={i}
                className="absolute top-0 animate-confetti"
                style={{
                  left: `${left}%`,
                  width: `${size}px`,
                  height: `${size}px`,
                  backgroundColor: color,
                  borderRadius: Math.random() > 0.5 ? "50%" : "0",
                  animationDelay: `${animationDelay}s`,
                  animationDuration: `${Math.random() * 3 + 2}s`,
                }}
              />
            );
          })}
        </div>
      )}

      {/* Add this outside your component return but inside the file */}
      <style jsx global>{`
        @keyframes confetti {
          0% {
            transform: translateY(-10px) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        .animate-confetti {
          animation: confetti 3s ease-in-out forwards;
        }
        .olly-dragging {
          cursor: move !important;
        }
        /* First-time user subtle highlight */
        @keyframes pulse-border {
          0%,
          100% {
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4);
          }
          50% {
            box-shadow: 0 0 0 10px rgba(59, 130, 246, 0);
          }
        }
        .animate-pulse-border {
          animation: pulse-border 2s infinite;
        }
      `}</style>

      {/* Demo Text Selection Area (only for preview) */}
      {isPreview && (
        <div className="mt-4 p-6 border border-gray-200 rounded-lg bg-white">
          <p className="text-to-select text-gray-800 leading-relaxed">
            Artificial Intelligence is transforming how we work and live. With
            recent advances in machine learning and natural language processing,
            AI assistants like Olly can help enhance productivity, generate
            creative content, and provide valuable insights from your data.
            <strong> Try selecting this text to see Olly in action!</strong>
          </p>
        </div>
      )}
    </>
  );
};

// Tour steps configuration
const tourSteps = [
  {
    selector: ".text-to-select",
    content: "✨ Start by selecting this text to see Olly appear! Try it now.",
  },
  {
    selector: ".olly-button",
    content: "🎯 Perfect! Olly appears when you select text. Notice how it follows your selections. Click the arrow button to open Olly's menu.",
  },
  {
    selector: ".olly-actions",
    content: "🚀 These AI-powered actions help enhance your content. Hover over each icon to see what it does, then click one to try it!",
  },
  {
    selector: ".olly-response",
    content: "📝 This is where Olly shows your personalized AI responses. You can copy them or close them when done.",
  },
  {
    selector: ".olly-feedback",
    content: "👍👎 Your feedback helps improve Olly's responses. Let us know how we did! This completes your tour of Olly.",
  },
];

// Main component with TourProvider
const OllyComponent: React.FC<OllyComponentProps> = (props) => {
  const handleTourComplete = () => {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.setItem("olly_component_tour_completed", "true");
      }
    } catch (error) {
      console.warn("localStorage write failed:", error);
    }

    // Notify parent component of tour completion
    setTimeout(() => {
      if (props.onTourComplete) {
        props.onTourComplete();
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
          fontSize: "14px",
          fontFamily: "system-ui, sans-serif",
          padding: "20px",
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
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
        close: (base) => ({
          ...base,
          right: "10px",
          top: "10px",
        }),
      }}
      showBadge={true}
      showPrevNextButtons={true}
      showCloseButton={true}
      disableInteraction={false}
      padding={10}
      maskClassName="tour-mask"
      className="tour-provider"
    >
      <OllyComponentInner {...props} />
    </TourProvider>
  );
};

// Add keyframe animations for CSS that needs to be in global scope
const GlobalStyles = () => (
  <style jsx global>{`
    @keyframes float {
      0%,
      100% {
        transform: translateY(0px);
      }
      50% {
        transform: translateY(-10px);
      }
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    @keyframes slideIn {
      from {
        transform: translateX(20px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    /* Add subtle animation for Olly */
    .olly-button {
      transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    /* Improve action button hover states */
    .olly-actions button:hover {
      transform: translateY(-2px) scale(1.05);
      box-shadow:
        0 10px 15px -3px rgba(0, 0, 0, 0.1),
        0 4px 6px -2px rgba(0, 0, 0, 0.05);
    }

    /* Smooth drawer transition */
    .olly-drawer {
      transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    /* Tour mask styling */
    .tour-mask {
      background-color: rgba(0, 0, 0, 0.4);
    }
  `}</style>
);

export default OllyComponent;