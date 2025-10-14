import React, { useState, useEffect } from "react";
import { Button } from "@repo/ui/components/ui/button";
import {
  ExternalLink,
  Eye,
  EyeOff,
  Copy,
  Check,
  Gift,
  Video,
  Info,
  ArrowRight,
  Zap,
  Settings,
} from "lucide-react";
import { Alert, AlertDescription } from "@repo/ui/components/ui/alert";
import Image from "next/image";
import { API_OPTIONS } from "@/data/api-vendor-options";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@repo/ui/components/ui/card";
import { StepProps } from "@/types/onboarding";

interface ApiKey {
  id: string;
  key: string;
  isActive: boolean;
}

export default function APISelection({
  onNext,
  onBack,
  isLoading: parentIsLoading,
}: StepProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [apiKey, setApiKey] = useState<ApiKey | null>(null);
  const [hasClaimedCredits, setHasClaimedCredits] = useState(false);
  const [isKeyVisible, setIsKeyVisible] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [showOtherProviders, setShowOtherProviders] = useState(false);


  useEffect(() => {
    fetchApiKey();
  }, []);

  const fetchApiKey = async () => {
    setIsFetching(true);
    try {
      const response = await fetch("/api/v2/key");
      if (!response.ok) {
        console.warn(`Failed to fetch API key: ${response.status}`);
        setApiKey(null);
        setHasClaimedCredits(false);
      } else {
        const data = await response.json();
        setApiKey(data.apiKey && typeof data.apiKey === 'object' ? data.apiKey : null);
        setHasClaimedCredits(data.hasClaimedFreeCredits || false);
      }
    } catch (error) {
      console.error("Error fetching API key:", error);
      setApiKey(null);
      setHasClaimedCredits(false);
    } finally {
      setIsFetching(false);
    }
  };

  const setLLMProvider = async (provider: string) => {
    try {
      await fetch("/api/user/onboarding/llm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider }),
      });
    } catch (error) {
      console.error("Error setting LLM provider:", error);
    }
  };

  const handleGenerateKeyAndClaimCredits = async () => {
    setIsLoading(true);
    try {
      const keyResponse = await fetch("/api/v2/key/generate", { method: "POST" });
      if (!keyResponse.ok) throw new Error(`Failed to generate API key: ${keyResponse.status}`);
      const keyData = await keyResponse.json();

      if (!keyData.apiKey) throw new Error("API key not found in response.");
      setApiKey(keyData.apiKey);

      await setLLMProvider("olly");

      const creditResponse = await fetch("/api/user/credits/onboarding/free", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credits: 50 }),
      });
      if (!creditResponse.ok) throw new Error(`Failed to claim credits: ${creditResponse.status}`);

      setHasClaimedCredits(true);

    } catch (error) {
      console.error("Error generating Olly key and claiming credits:", error);
      setApiKey(null);
      setHasClaimedCredits(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClaimExistingCredits = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/user/credits/onboarding/free", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credits: 50 }),
      });
      if (!response.ok) throw new Error(`Failed to claim credits: ${response.status}`);
      setHasClaimedCredits(true);
    } catch (error) {
      console.error("Error claiming free credits:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <div className="space-y-3">
      <div className="text-center mb-3">
        <h2 className="text-lg font-semibold mb-1">Connect AI Engine</h2>
        <p className="text-xs text-gray-500">Choose your preferred AI provider</p>
      </div>

      {isFetching ? (
        <div className="flex justify-center items-center h-16 bg-gray-50 rounded-lg">
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="ml-2 text-gray-500 text-xs">Loading...</span>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Olly API Card - More Compact */}
          <div className="border border-blue-200 bg-gradient-to-r from-blue-50/50 to-blue-50/30 rounded-lg p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                    <Zap className="w-3 h-3 text-white" />
                  </div>
                  <h3 className="text-sm font-medium text-blue-800">Olly API</h3>
                  <span className="bg-blue-100 text-blue-700 text-[10px] px-1.5 py-0.5 rounded-full font-medium">
                    Recommended
                  </span>
                </div>
                
                {!apiKey ? (
                  <div className="space-y-2">
                    <p className="text-xs text-gray-600">
                      50 free credits • No license needed
                    </p>
                    <button
                      onClick={handleGenerateKeyAndClaimCredits}
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-xs font-medium py-2 px-3 rounded flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      {isLoading ? (
                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Gift className="w-3 h-3" />
                      )}
                      {isLoading ? "Setting up..." : "Claim Free Credits"}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {/* Compact API Key Display */}
                    <div className="flex items-center gap-1">
                      <div className="flex-1 bg-white/80 rounded border border-blue-200 p-1.5 min-w-0">
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-gray-500 shrink-0">KEY:</span>
                          <div className="font-mono text-[10px] text-gray-700 truncate flex-1">
                            {isKeyVisible ? apiKey.key : "•".repeat(16)}
                          </div>
                          <button
                            onClick={() => setIsKeyVisible(!isKeyVisible)}
                            className="p-0.5 hover:bg-gray-100 rounded"
                          >
                            {isKeyVisible ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          </button>
                          <button
                            onClick={() => copyToClipboard(apiKey.key)}
                            className="p-0.5 hover:bg-gray-100 rounded"
                          >
                            {copiedKey ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      </div>
                      {!hasClaimedCredits && (
                        <button
                          onClick={handleClaimExistingCredits}
                          disabled={isLoading}
                          className="text-xs text-blue-600 hover:text-blue-800 border border-blue-200 hover:bg-blue-50 px-2 py-1 rounded flex items-center gap-1"
                        >
                          <Gift className="w-3 h-3" />
                          Credits
                        </button>
                      )}
                    </div>
                    
                    {/* Status Indicator with Image */}
                    <div className="flex items-center gap-2 text-xs">
                      <img
                        src="/onboarding/llm-provider-step.png"
                        alt="Olly API Key Location Guide"
                        className=" h-44 rounded border border-gray-200 object-cover"
                      />
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span className="text-green-700 font-medium">Auto-synced</span>
                        <span className="text-gray-500">• Ready to use</span>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Info Alert - More Compact */}
                <div className="bg-blue-50/80 border border-blue-100 rounded p-2 mt-2">
                  <div className="flex gap-1.5">
                    <Info className="w-3 h-3 text-blue-500 mt-0.5 shrink-0" />
                    <p className="text-[10px] text-blue-700 leading-relaxed">
                      {!apiKey 
                        ? "Free platform credits to explore Olly's AI features"
                        : "Extension uses this key automatically. You can also connect other providers below."
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Other Providers - Collapsible */}
          <div className="border border-gray-200 bg-white rounded-lg overflow-hidden">
            <button
              onClick={() => setShowOtherProviders(!showOtherProviders)}
              className="w-full p-2.5 bg-gray-50/50 border-b hover:bg-gray-50 flex items-center justify-between text-xs text-gray-600"
            >
              <div className="flex items-center gap-2">
                <Settings className="w-3.5 h-3.5" />
                <span>Other AI Providers (BYOK)</span>
              </div>
              <ArrowRight className={`w-3.5 h-3.5 transition-transform ${showOtherProviders ? 'rotate-90' : ''}`} />
            </button>
            
            {showOtherProviders && (
              <div className="p-2">
                <div className="grid grid-cols-3 gap-1.5">
                  {API_OPTIONS.map((option) => (
                    <div
                      key={option.name}
                      className="p-2 rounded border border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-medium text-gray-700 truncate">
                          {option.name}
                        </h4>
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <a
                          href={option.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[9px] text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-0.5"
                        >
                          Get API
                          <ExternalLink className="w-2 h-2" />
                        </a>
                        {option.setupVideo && (
                          <a
                            href={option.setupVideo}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[9px] text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-0.5"
                          >
                            Help
                            <Video className="w-2 h-2" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
