"use client";
import { Card, CardContent } from "@repo/ui/components/ui/card";
import { Input } from "@repo/ui/components/ui/input";
import { Textarea } from "@repo/ui/components/ui/textarea";
import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Button } from "@repo/ui/components/ui/button";
import Link from "next/link";
import defaultProfileImage from "@/public/pf.png";
import AuthPopup from "../authentication";
import SocialPresenceCTA from "../instagram/social-presence-cta";
import { MessageCircle } from "lucide-react";

interface AuthCheckResponse {
  authenticated: boolean;
  user: {
    id: string;
    email: string;
    username: string;
  } | null;
}

const TiktokComment = () => {
  const [username, setUsername] = useState("Reply to @username's comment");
  const [note, setNote] = useState("Change Text & see the Magic! 😀");
  const [profileImage, setProfileImage] = useState<string | null>(
    defaultProfileImage.src
  );
  const [showAuthPopup, setShowAuthPopup] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const downloadLinkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    renderCommentDemo();
  }, [username, note, profileImage]);

  const handleDownload = async () => {
    try {
      const response = await fetch('/api/user/auth');
      const data: AuthCheckResponse = await response.json();
      
      if (!data.authenticated) {
        setShowAuthPopup(true);
        return;
      }

      const canvasDataURL = getCanvasDataURL();
      if (canvasDataURL && downloadLinkRef.current) {
        downloadLinkRef.current.href = canvasDataURL;
        downloadLinkRef.current.click();
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    }
  };

  const handleProfileImageUpload = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
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
    const newUsername = event.target.value;
    setUsername(`Reply to @${newUsername}'s comment`);
  };

  const handleNoteChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNote(event.target.value);
  };

  const getCanvasDataURL = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      return canvas.toDataURL("image/png");
    }
    return null;
  };

  const renderCommentDemo = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        // Clear the canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
  
        // Set the comment box position
        const boxWidth = 300;
        const boxHeight = 70;
        const x = 50;
        const y = canvas.height / 2 - boxHeight / 2;
  
        // Draw the comment box background
        ctx.fillStyle = "white";
        ctx.fillRect(x, y, boxWidth, boxHeight);
  
        // Draw the comment box border
        ctx.strokeStyle = "#111827";
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, boxWidth, boxHeight);
  
        // Draw the profile image inside the comment box
        if (profileImage) {
          const img = document.createElement("img");
          img.onload = () => {
            const size = 30;
            const circleX = x + 23;
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
  
        // Set the font and color for the username
        ctx.font = "10px Arial";
        ctx.fillStyle = "#374151";
  
        // Truncate the username if it exceeds the character limit
        const maxUsernameLength = 30;
        const truncatedUsername =
          username.length > maxUsernameLength
            ? username.slice(0, maxUsernameLength) + "..."
            : username;
  
        // Draw the username next to the profile image
        ctx.fillText(truncatedUsername, x + 50, y + 20);
  
        // Set the font and color for the note text
        ctx.font = "15px Arial";
        ctx.fillStyle = "#111827";
  
        // Wrap the note text if it exceeds the box width
        const words = note.split(" ");
        let line = "";
        let lineHeight = y + 40;
        const maxLineWidth = boxWidth - 60;
        for (let i = 0; i < words.length; i++) {
          const testLine = line + words[i] + " ";
          const metrics = ctx.measureText(testLine);
          const testWidth = metrics.width;
          if (testWidth > maxLineWidth && i > 0) {
            ctx.fillText(line, x + 50, lineHeight);
            line = words[i] + " ";
            lineHeight += 15;
          } else {
            line = testLine;
          }
        }
        ctx.fillText(line, x + 50, lineHeight);
      }
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 p-4 pt-10">
      <div className="w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-cyan-500 rounded-xl flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">TikTok Comment Generator</h1>
          </div>
          <p className="text-gray-600">Create Perfect Comment Stickers for TikTok</p>
        </div>

        <div className="grid xl:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {/* Left Panel - Controls */}
          <Card className="shadow-lg bg-white border-gray-200 h-fit">
            <CardContent className="p-6">
              {/* Username Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                <Input
                  type="text"
                  value={username.replace("Reply to @", "").replace("'s comment", "")}
                  onChange={handleUsernameChange}
                  placeholder="Enter username"
                  className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                />
              </div>

              {/* Comment Text */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Comment</label>
                <Textarea
                  value={note}
                  onChange={handleNoteChange}
                  placeholder="Enter your comment text"
                  className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                />
              </div>

              {/* Profile Image Upload */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Profile Image</label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleProfileImageUpload}
                  className="bg-white border-gray-300 text-gray-700"
                />
              </div>

              {/* Download Button */}
              <Button 
                onClick={handleDownload} 
                className="w-full bg-cyan-600 hover:bg-cyan-700 text-white"
              >
                Download Comment
              </Button>
            </CardContent>
          </Card>

          {/* Right Panel - Preview */}
          <div className="w-full xl:w-full relative mt-4 xl:mt-0">
            <div className="relative w-full aspect-square max-w-lg mx-auto">
              <Image
                src="/image-tiktok.png"
                alt="TikTok Image"
                layout="fill"
                objectFit="contain"
                priority
              />
              <canvas
                ref={canvasRef}
                width={500}
                height={500}
                className="absolute top-0 left-0 w-full h-full"
              />
            </div>
            <div className="mt-6">
              <SocialPresenceCTA
                title="Blow up your TikTok"
                subtitle="Grow your TikTok with AI"
                description="Join 10,000+ creators growing their TikTok presence with AI-powered engagement."
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

export default TiktokComment;