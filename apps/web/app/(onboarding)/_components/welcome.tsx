import React, { useState } from "react";
import { StepProps } from "@/types/onboarding";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import {
  Chrome,
  ExternalLink,
  CheckCircle,
  ArrowRight,
  Info,
  Book,
  Video,
} from "lucide-react";
import { Button } from "@repo/ui/components/ui/button";
import { Badge } from "@repo/ui/components/ui/badge";

const EXTENSION_URL =
  "https://chrome.google.com/webstore/detail/olly-social-media-sidekic/ofjpapfmglfjdhmadpegoeifocomaeje";
const DOCS_URL = "https://docs.olly.social";
const VIDEO_GUIDE_URL = "https://youtu.be/teXldNMxAfE";

export default function WelcomeStep({ onNext }: StepProps) {
  const searchParams = useSearchParams();
  const isConnected = searchParams.get("isConnected") === "true";
  const isStepOne = searchParams.get("step") === "1";
  const showConnectedMessage = isConnected && isStepOne;

  const handleInstallExtension = () => {
    window.open(EXTENSION_URL, "_blank");
  };
  const handleOpenDocs = () => {
    window.open(DOCS_URL, "_blank");
  };
  const handleOpenVideoGuide = () => {
    window.open(VIDEO_GUIDE_URL, "_blank");
  };

  return (
    <div className="space-y-4 max-w-lg mx-auto px-2 py-6">
      {/* Header */}
      <div className="flex flex-col items-center gap-2 mb-2">
        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
          <Image src="/icon-2.png" width={48} height={48} className="w-12 h-12" alt="Olly Logo"  priority />
        </div>
        <h2 className="text-lg font-semibold mt-2">Welcome to Olly!</h2>
        <p className="text-xs text-gray-500 text-center max-w-xs">
          Your AI sidekick for smarter social media engagement.
        </p>
      </div>

      {/* Card Section */}
      <div className="border border-blue-200 bg-gradient-to-r from-blue-50/50 to-blue-50/30 rounded-lg p-4 space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
            <Chrome className="w-3 h-3 text-white" />
          </div>
          <h3 className="text-sm font-medium text-blue-800">Olly Chrome Extension</h3>
          <Badge variant="destructive" className="text-[10px] font-medium">REQUIRED</Badge>
        </div>

        {showConnectedMessage ? (
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-sm font-medium text-green-700">Extension Connected Successfully!</span>
            </div>
            <Button variant="default" onClick={onNext} className="gap-2 w-full max-w-xs">
              Continue Setup
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row items-center gap-2 w-full">
              <Button
                variant="default"
                onClick={handleInstallExtension}
                className="gap-2 flex-1"
              >
                <Chrome className="w-4 h-4" />
                Install Extension
                <ExternalLink className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="outline"
                className="gap-2 flex-1"
                onClick={onNext}
              >
                <CheckCircle className="w-4 h-4 text-green-500" />
                I've Already Installed It
              </Button>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 pt-1">
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 h-8 text-xs text-muted-foreground hover:text-primary"
                onClick={handleOpenVideoGuide}
              >
                <Video className="w-3 h-3" />
                Watch Guide
                <ExternalLink className="w-2.5 h-2.5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 h-8 text-xs text-muted-foreground hover:text-primary"
                onClick={handleOpenDocs}
              >
                <Book className="w-3 h-3" />
                Read Docs
                <ExternalLink className="w-2.5 h-2.5" />
              </Button>
            </div>
            <div className="bg-blue-50/80 border border-blue-100 rounded p-2 mt-2">
              <div className="flex gap-1.5 items-center">
                <Info className="w-3 h-3 text-blue-500 mt-0.5 shrink-0" />
                <p className="text-[10px] text-blue-700 leading-relaxed">
                  Install the Olly Chrome Extension to enable AI-powered engagement on your social platforms. Required for setup.
                </p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Coming up next */}
      <div className="flex items-center justify-center gap-2 mt-2 bg-gray-50 border border-gray-100 rounded p-2">
        <ArrowRight className="w-4 h-4 text-muted-foreground" />
        <span className="text-xs text-muted-foreground font-medium">Coming up next:</span>
        <span className="text-xs text-muted-foreground ml-1">Profile Setup → License → AI Config</span>
      </div>
    </div>
  );
}