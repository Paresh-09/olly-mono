"use client";

import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@repo/ui/components/ui/card";
import { Input } from "@repo/ui/components/ui/input";
import { Textarea } from "@repo/ui/components/ui/textarea";
import { Button } from "@repo/ui/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@repo/ui/components/ui/radio-group";
import { Label } from "@repo/ui/components/ui/label";
import { Plus, MessageCircle } from "lucide-react";
import Image from "next/image";
import defaultProfileImage from "@/public/pf.png";
import AuthPopup from "../authentication";
import SocialPresenceCTA from "./social-presence-cta";
import JSZip from "jszip";
import { Instagram, Sparkles, Gift, Star, Zap, Users } from "lucide-react";
import { useRouter } from "next/navigation";

interface AuthCheckResponse {
  authenticated: boolean;
  user: {
    id: string;
    email: string;
    username: string;
  } | null;
}

// InfluencerOfferPopup component
const InfluencerOfferPopup = ({ isOpen, onAccept, onDecline, onDontShowAgain }: { isOpen: boolean; onAccept: () => void; onDecline: () => void; onDontShowAgain: () => void }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4 pointer-events-auto">
      <div className="bg-white rounded-2xl shadow-lg max-w-md w-full relative overflow-hidden animate-in zoom-in-95 duration-200 pointer-events-auto max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 text-center border-b border-gray-100">
          <div className="flex justify-center items-center gap-2 mb-3">
            <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 p-2 rounded-full">
              <Instagram className="w-5 h-5 text-white" />
            </div>
            <div className="ml-5">
              <h2 className="text-lg font-medium text-gray-900">
                Join Our Influencer Community
              </h2>
              <p className="text-gray-500 text-sm">Share, collaborate, and unlock lifetime benefits</p>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="p-6 text-center">
          <div className="mb-6">
            <p className="text-gray-600 text-sm leading-relaxed">
              Join our exclusive influencer community and connect with creators worldwide. Share our product with your audience and enjoy <span className="font-bold ">free lifetime access</span> to premium features. Collaborate, grow, and make an impact together!
            </p>
          </div>

          {/* Buttons */}
          <div className="space-y-2">
            <Button
              className="w-full py-2.5 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 hover:from-purple-600 hover:via-pink-600 hover:to-orange-500 text-white text-sm font-medium"
              onClick={onAccept}
            >
              Join the Community
            </Button>

            <Button
              variant="ghost"
              className="w-full text-xs py-1.5 text-gray-400 hover:text-gray-600"
              onClick={onDontShowAgain}
            >
              Don't show again
            </Button>
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={onDecline}
          className="absolute top-3 right-3 w-6 h-6 bg-gray-50 hover:bg-gray-100 rounded-full flex items-center justify-center text-gray-500 transition-colors duration-150"
        >
          ×
        </button>
      </div>
    </div>
  );
};

const InstagramComment: React.FC = () => {
  const [activeTab, setActiveTab] = useState('comment');
  const [username, setUsername] = useState<string>("username");
  const [note, setNote] = useState<string>("Change Text & see the Magic! 😀");
  const [profileImage, setProfileImage] = useState<string>(defaultProfileImage.src);
  const [color, setColor] = useState('white');
  const [showAuthPopup, setShowAuthPopup] = useState<boolean>(false);
  const [bulkComments, setBulkComments] = useState<Array<{ username: string; note: string }>>([]);
  const [isBulkMode, setIsBulkMode] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const downloadLinkRef = useRef<HTMLAnchorElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 300, height: 300 });
  const [showInfluencerPopup, setShowInfluencerPopup] = useState<boolean>(false);
  const [pendingDownload, setPendingDownload] = useState<null | (() => void)>(null);
  const router = useRouter();

  // Helper to check if we should show the popup
  const shouldShowPopup = () => {
    if (typeof window === 'undefined') return false;
    const dontShow = localStorage.getItem('ig_popup_dont_show');
    if (dontShow === '1') return false;
    const count = parseInt(localStorage.getItem('ig_download_count') || '0', 10) + 1;
    // Show on first download and every 5th download
    return count === 1 || count % 5 === 0;
  };

  useEffect(() => {
    // Check if user has already submitted the creator form
    if (typeof window !== "undefined") {
      try {
        const w = window as any;
        if (w.chrome && w.chrome.storage && w.chrome.storage.local) {
          w.chrome.storage.local.get(["ig_creator_submitted"], (result: any) => {
            if (result.ig_creator_submitted === "1") {
              localStorage.setItem("ig_popup_dont_show", "1");
            }
          });
        } else {
          if (localStorage.getItem("ig_creator_submitted") === "1") {
            localStorage.setItem("ig_popup_dont_show", "1");
          }
        }
      } catch (error) {
        console.warn("Chrome storage access failed, falling back to localStorage");
      }
    }

    try {
      renderCommentDemo();
    } catch (error) {
      console.warn("Canvas rendering failed:", error);
    }

    // Add resize handler for responsive canvas
    const handleResize = () => {
      try {
        updateCanvasSize();
      } catch (error) {
        console.warn("Canvas resize failed:", error);
      }
    };

    window.addEventListener("resize", handleResize);
    updateCanvasSize();
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [username, note, profileImage, color]);

  const updateCanvasSize = () => {
    try {
      // Adjust canvas size based on viewport
      if (window.innerWidth < 640) {
        setCanvasSize({ width: 250, height: 250 });
      } else if (window.innerWidth < 768) {
        setCanvasSize({ width: 300, height: 300 });
      } else {
        setCanvasSize({ width: 300, height: 300 });
      }

      // Force re-render of the canvas with new dimensions
      setTimeout(() => {
        try {
          renderCommentDemo();
        } catch (error) {
          console.warn("Canvas re-render failed:", error);
        }
      }, 0);
    } catch (error) {
      console.warn("Canvas size update failed:", error);
    }
  };

  const proceedWithDownload = async () => {
    try {
      const response = await fetch("/api/user/auth");
      const data: AuthCheckResponse = await response.json();
      if (!data.authenticated) {
        setShowAuthPopup(true);
        return;
      }
      if (isBulkMode && bulkComments.length > 0) {
        const zip = new JSZip();
        for (let i = 0; i < bulkComments.length; i++) {
          const comment = bulkComments[i];
          setUsername(comment.username);
          setNote(comment.note);
          await new Promise((resolve) => setTimeout(resolve, 100));
          const canvasDataURL = getCanvasDataURL();
          if (canvasDataURL) {
            const base64Data = canvasDataURL.split(",")[1];
            zip.file(`comment_${i + 1}.png`, base64Data, { base64: true });
          }
        }
        const content = await zip.generateAsync({ type: "blob" });
        const url = URL.createObjectURL(content);
        if (downloadLinkRef.current) {
          try {
            downloadLinkRef.current.href = url;
            downloadLinkRef.current.download = "instagram_comments.zip";
            downloadLinkRef.current.click();
          } catch (error) {
            console.warn("Bulk download click failed:", error);
            // Fallback: create a new download link
            const link = document.createElement('a');
            link.href = url;
            link.download = "instagram_comments.zip";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }
        }
      } else {
        const canvasDataURL = getCanvasDataURL();
        if (canvasDataURL && downloadLinkRef.current) {
          try {
            downloadLinkRef.current.href = canvasDataURL;
            downloadLinkRef.current.download = "comment.png";
            downloadLinkRef.current.click();
          } catch (error) {
            console.warn("Single download click failed:", error);
            // Fallback: create a new download link
            const link = document.createElement('a');
            link.href = canvasDataURL;
            link.download = "comment.png";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }
        }
      }
      // Increment download count in localStorage
      if (typeof window !== 'undefined') {
        const count = parseInt(localStorage.getItem('ig_download_count') || '0', 10) + 1;
        localStorage.setItem('ig_download_count', count.toString());
      }
    } catch (error) {
      console.error("Error checking auth status:", error);
    }
  };

  const handleDownload = () => {
    try {
      proceedWithDownload(); // Start download immediately
      // Show popup if needed
      if (shouldShowPopup()) {
        setShowInfluencerPopup(true);
      }
    } catch (error) {
      console.warn("Download process failed:", error);
      // Fallback: just proceed with download without popup
      proceedWithDownload();
    }
  };

  const handleProfileImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        const result = e.target?.result;
        if (typeof result === "string") {
          setProfileImage(result);
        }
      };
      reader.readAsDataURL(file);
    } else {
      setProfileImage(defaultProfileImage.src);
    }
  };

  const handleUsernameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(event.target.value);
  };

  const handleNoteChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNote(event.target.value);
  };

  const getCanvasDataURL = (): string | null => {
    const canvas = canvasRef.current;
    if (canvas) {
      return canvas.toDataURL("image/png");
    }
    return null;
  };

  const renderCommentDemo = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Update canvas dimensions to match current state
    if (canvas.width !== canvasSize.width) {
      canvas.width = canvasSize.width;
    }
    if (canvas.height !== canvasSize.height) {
      canvas.height = canvasSize.height;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Scale box size according to canvas dimensions
    const boxWidthFactor = 0.6; // 60% of canvas width
    const boxHeightFactor = 0.14; // 14% of canvas height

    const boxWidth = canvas.width * boxWidthFactor;
    const boxHeight = canvas.height * boxHeightFactor;
    const x = canvas.width * 0.1; // 10% from left edge
    const y = canvas.height / 2 - boxHeight / 2;

    // Draw the comment box background
    ctx.fillStyle = color === 'white' ? '#ffffff' : '#000000';
    ctx.fillRect(x, y, boxWidth, boxHeight);

    // Draw the comment box border
    ctx.strokeStyle = '#d1d5db';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, boxWidth, boxHeight);

    // Draw the profile image inside the comment box
    if (profileImage) {
      const img = document.createElement("img");
      img.onload = () => {
        if (!ctx) return;

        // Scale profile image size with canvas
        const size = Math.max(20, canvas.width * 0.06); // At least 20px, or 6% of canvas width
        const circleX = x + size * 0.75;
        const circleY = y + boxHeight / 2;

        ctx.save();
        ctx.beginPath();
        ctx.arc(circleX, circleY, size / 2, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(img, circleX - size / 2, circleY - size / 2, size, size);
        ctx.restore();
      };
      img.src = profileImage;
    }

    // Scale font size based on canvas width
    const usernameFontSize = Math.max(8, canvas.width * 0.02); // At least 8px
    const noteFontSize = Math.max(12, canvas.width * 0.03); // At least 12px

    // Set the font and color for the username
    ctx.font = `${usernameFontSize}px Arial`;
    ctx.fillStyle = '#6b7280';

    // Calculate username position based on profile image size
    const profileImageSize = Math.max(20, canvas.width * 0.06);
    const usernameX = x + profileImageSize * 1.5;

    // Truncate the username if it exceeds the character limit
    const replyText = `Reply to @${username}'s comment`;
    const maxUsernameLength = 30;
    const truncatedUsername = replyText.length > maxUsernameLength
      ? replyText.slice(0, maxUsernameLength) + "..."
      : replyText;

    // Draw the username next to the profile image
    ctx.fillText(truncatedUsername, usernameX, y + boxHeight * 0.3);

    // Set the font and color for the note text
    ctx.font = `${noteFontSize}px Arial`;
    ctx.fillStyle = color === 'white' ? '#000000' : '#ffffff';

    // Wrap the note text if it exceeds the box width
    const words = note.split(" ");
    let line = "";
    let lineHeight = y + boxHeight * 0.6;
    const maxLineWidth = boxWidth - profileImageSize * 2;

    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i] + " ";
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxLineWidth && i > 0) {
        ctx.fillText(line, usernameX, lineHeight);
        line = words[i] + " ";
        lineHeight += noteFontSize * 1.2;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, usernameX, lineHeight);
  };

  const addBulkComment = () => {
    setBulkComments([...bulkComments, { username, note }]);
    setUsername("username");
    setNote("Change Text & see the Magic! 😀");
  };

  const removeBulkComment = (index: number) => {
    const newComments = [...bulkComments];
    newComments.splice(index, 1);
    setBulkComments(newComments);
  };

  const clearBulkComments = () => {
    setBulkComments([]);
  };

  const handleReset = () => {
    setUsername("username");
    setNote("Change Text & see the Magic! 😀");
    setProfileImage(defaultProfileImage.src);
    setColor('white');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-purple-100 p-4 pt-10">
      {/* Influencer Offer Popup */}
      <InfluencerOfferPopup
        isOpen={showInfluencerPopup}
        onAccept={() => {
          window.open("/creators", "_blank", "noopener,noreferrer");
          setShowInfluencerPopup(false);
        }}
        onDecline={() => {
          setShowInfluencerPopup(false);
        }}
        onDontShowAgain={() => {
          if (typeof window !== 'undefined') {
            localStorage.setItem('ig_popup_dont_show', '1');
          }
          setShowInfluencerPopup(false);
        }}
      />
      <div className="w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-tr from-purple-500 via-pink-500 to-orange-400 rounded-xl flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">Instagram Comment Generator</h1>
          </div>
          <p className="text-gray-600">Create Perfect Comment Stickers for Reels</p>
        </div>

        <div className="grid xl:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {/* Left Panel - Controls */}
          <Card className="shadow-lg">
            <CardContent className="p-6">
              {/* Mode Selection */}
              <div className="mb-6">
                <RadioGroup
                  defaultValue="single"
                  className="flex gap-4"
                  onValueChange={(value) => setIsBulkMode(value === "bulk")}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="single" id="single" />
                    <Label htmlFor="single">Single Comment</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="bulk" id="bulk" />
                    <Label htmlFor="bulk">Bulk Comments</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Avatar Upload */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Avatar</label>
                <div className="relative">
                  <div
                    className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-pink-400 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {profileImage && profileImage !== defaultProfileImage.src ? (
                      <img src={profileImage} alt="Avatar" className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <Plus className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  {profileImage && profileImage !== defaultProfileImage.src && (
                    <button
                      onClick={() => {
                        setProfileImage(defaultProfileImage.src);
                        if (fileInputRef.current) {
                          fileInputRef.current.value = '';
                        }
                      }}
                      className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold hover:bg-red-600 transition-colors"
                    >
                      ×
                    </button>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleProfileImageUpload}
                  className="hidden"
                />
              </div>

              {/* Username */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                <div className="relative">
                  <Input
                    value={username}
                    onChange={handleUsernameChange}
                    className="pr-16"
                    placeholder="Enter username"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">
                    {username.length} / 30
                  </span>
                </div>
              </div>

              {/* Comment Text */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Text</label>
                <Textarea
                  value={note}
                  onChange={handleNoteChange}
                  placeholder="Enter your comment text"
                  rows={4}
                  className="resize-none"
                />
              </div>

              {/* Color Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                <div className="relative">
                  <select
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none pr-8"
                  >
                    <option value="white">White</option>
                    <option value="black">Black</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Bulk Comments Section */}
              {isBulkMode && (
                <div className="mb-6 space-y-4">
                  <Button className="w-full" onClick={addBulkComment}>
                    Add to Bulk Comments
                  </Button>
                  {bulkComments.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="font-bold text-gray-700">
                        Bulk Comments ({bulkComments.length})
                      </h3>
                      <div className="max-h-40 overflow-y-auto space-y-2 p-2 border rounded">
                        {bulkComments.map((comment, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-2 bg-gray-100 rounded"
                          >
                            <div className="flex-1 overflow-hidden">
                              <p className="text-sm font-medium truncate">
                                {comment.username}
                              </p>
                              <p className="text-sm text-gray-600 truncate">
                                {comment.note}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeBulkComment(index)}
                            >
                              ×
                            </Button>
                          </div>
                        ))}
                      </div>
                      <Button
                        variant="destructive"
                        className="w-full"
                        onClick={clearBulkComments}
                      >
                        Clear All Comments
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button variant="outline" onClick={handleReset} className="flex-1">
                  Reset
                </Button>
                <Button
                  onClick={handleDownload}
                  className="flex-1 bg-pink-500 hover:bg-pink-600"
                >
                  {isBulkMode ? "Download All Comments" : "Download"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Right Panel - Preview */}
          <div className="w-full xl:w-full relative mt-4 xl:mt-0">
            <div className="relative w-full aspect-square max-w-lg mx-auto">
              <Image
                src="/image-tiktok.png"
                alt="Instagram Image"
                layout="fill"
                objectFit="contain"
                priority
              />
              <canvas
                ref={canvasRef}
                width={canvasSize.width}
                height={canvasSize.height}
                className="absolute top-0 left-0 w-full h-full"
              />
            </div>
            <div className="mt-6">
              <SocialPresenceCTA
                title="We've solved the big Instagram engagement problem"
                subtitle="20K+ Creators Trust this AI Extension"
                description="Get real, legit Instagram engagement for your posts."
                icon="message"
                gradient="blue"
                ctaText="Get Free Extension"
                href="/onboarding"
              />
            </div>
          </div>
        </div>
      </div>

      <a
        ref={downloadLinkRef}
        download="comment.png"
        style={{ display: "none" }}
      />

      <AuthPopup
        isOpen={showAuthPopup}
        onClose={() => setShowAuthPopup(false)}
        onSuccess={() => {
          const canvasDataURL = getCanvasDataURL();
          if (canvasDataURL && downloadLinkRef.current) {
            downloadLinkRef.current.href = canvasDataURL;
            downloadLinkRef.current.click();
          }
        }}
      />
    </div>
  );
};

export default InstagramComment;
