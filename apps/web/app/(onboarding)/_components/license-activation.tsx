import React, { useState, useEffect } from 'react';
import { StepProps } from '@/types/onboarding';
import { Button } from '@repo/ui/components/ui/button';
import { Copy, CheckCircle, Check, Star, AlertCircle, ArrowRight, Zap, Bot, MessageSquare, Sparkles, Shield, Crown } from 'lucide-react';
import { Alert, AlertDescription } from '@repo/ui/components/ui/alert';
import { LicenseResponse } from '@/types/licenses';
import Image from 'next/image';
import { Badge } from "@repo/ui/components/ui/badge";
import { Separator } from '@repo/ui/components/ui/separator';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@repo/ui/components/ui/card";

const PRICE_INCREASE_DATE = new Date('2025-02-12T14:30:00.000Z');

function getTimeRemaining(endDate: Date) {
  const total = endDate.getTime() - new Date().getTime();
  const hours = Math.floor((total / (1000 * 60 * 60)));
  const minutes = Math.floor((total / 1000 / 60) % 60);
    
  return {
    total,
    hours,
    minutes
  };
}

export default function LicenseActivationStep({ onNext, onBack }: StepProps) {
  const [licenseData, setLicenseData] = useState<LicenseResponse | null>(null);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<{ hours: number; minutes: number } | null>(null);

  useEffect(() => {
    fetchLicenseData();
    
    // Initialize timer
    const remaining = getTimeRemaining(PRICE_INCREASE_DATE);
    if (remaining.total > 0) {
      setTimeRemaining({ hours: remaining.hours, minutes: remaining.minutes });
    }
  }, []);

  const fetchLicenseData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/user/licenses');

      if (!response.ok) {
        throw new Error(`Failed to fetch license: ${response.statusText}`);
      }
      
      const data = await response.json();

      // The API returns { licenses: [...] }
      if (data.licenses && Array.isArray(data.licenses)) {
        const activeLicense = data.licenses.find((license: { isActive: boolean; key: string }) => license.isActive === true);
        if (activeLicense) {
          setLicenseData({
            hasPremium: true,
            key: activeLicense.key
          });
        } else {
          setLicenseData({
            hasPremium: false,
            key: null
          });
        }
      } else {
        // Handle the response in the original format (for backward compatibility)
        setLicenseData(data);
      }
    } catch (error) {
      console.error('Error fetching license:', error);
      setError('Failed to load license information. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (licenseData?.key) {
      try {
        await navigator.clipboard.writeText(licenseData.key);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error('Failed to copy license key:', error);
        setError('Failed to copy license key to clipboard');
      }
    }
  };

  const handleBuyClick = async () => {
    setCheckoutLoading(true);
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          discountCode: 'I2MDM5MG',
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }
      
      const data = await response.json();
      if (data.checkoutUrl) {
        window.open(data.checkoutUrl, '_blank');
      } else {
        throw new Error(data.error || 'Failed to create checkout session');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      setError('Failed to start checkout process. Please try again.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const renderTimer = () => {
    if (!timeRemaining || licenseData?.hasPremium) return null;
    
    return (
      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50 px-2 py-1 text-xs">
        Price increases in {timeRemaining.hours}h {String(timeRemaining.minutes).padStart(2, '0')}m
      </Badge>
    );
  };

  if (error) {
    return (
      <Alert variant="destructive" className="text-sm mb-4">
        <AlertCircle className="h-3.5 w-3.5" />
        <AlertDescription className="ml-2">{error}</AlertDescription>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => fetchLicenseData()}
          className="mt-2 text-xs h-7"
        >
          Retry
        </Button>
      </Alert>
    );
  }

  // Check if user has an active premium license
  const hasActiveLicense = licenseData?.hasPremium === true && licenseData?.key;

  return (
    <div className="space-y-3 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-primary" />
          <h2 className="text-lg font-medium">License Activation</h2>
          {hasActiveLicense && (
            <div className="flex items-center px-1.5 py-0.5 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
              <Crown className="w-3 h-3 text-white mr-1" />
              <span className="text-[10px] font-medium text-white">Premium</span>
            </div>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="animate-pulse space-y-2">
          <div className="h-6 bg-primary/10 rounded w-full"></div>
          <div className="h-4 bg-primary/10 rounded w-1/2"></div>
        </div>
      ) : hasActiveLicense ? (
        <div className="space-y-3">
          {/* Success Alert */}
          <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg p-2">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <div>
                <span className="text-sm font-medium">Premium License Active!</span>
                <p className="text-xs text-green-700 mt-0.5">License synced with extension automatically.</p>
              </div>
            </div>
          </div>
          
          {/* Compact Layout with Image and Benefits */}
          <div className="flex gap-3">
            {/* Image - Smaller */}
            <div className="shrink-0">
              <img
                src="/onboarding/one-click.png"
                alt="One-click activation"
                className="w-24 h-16 rounded border border-primary/20 object-cover"
              />
            </div>
            
            {/* Benefits - Condensed */}
            <div className="flex-1 border border-primary/20 bg-gradient-to-br from-blue-50/50 via-indigo-50/30 to-purple-50/50 rounded-lg p-2">
              <h3 className="text-sm font-medium mb-2">Premium Benefits</h3>
              <div className="grid grid-cols-2 gap-1.5 text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="h-4 w-4 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bot className="h-2.5 w-2.5 text-primary" />
                  </div>
                  <span>Auto Commenter</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-4 w-4 rounded-full bg-primary/10 flex items-center justify-center">
                    <Zap className="h-2.5 w-2.5 text-primary" />
                  </div>
                  <span>Unlimited Usage</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-4 w-4 rounded-full bg-primary/10 flex items-center justify-center">
                    <MessageSquare className="h-2.5 w-2.5 text-primary" />
                  </div>
                  <span>Brand Voice</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-4 w-4 rounded-full bg-primary/10 flex items-center justify-center">
                    <Sparkles className="h-2.5 w-2.5 text-primary" />
                  </div>
                  <span>Any LLM Provider</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Continue Button */}
        
        </div>
      ) : (
        <div className="space-y-3">
          {/* Plans - Side by Side, More Compact */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Premium Plan - Compact */}
            <div className="border border-primary/20 bg-white rounded-lg p-3 relative">
              <div className="absolute top-2 right-2">
                <span className="bg-primary text-white text-[10px] px-1.5 py-0.5 rounded font-medium">RECOMMENDED</span>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Crown className="w-4 h-4 text-primary" />
                  <h3 className="text-base font-medium text-primary">Premium</h3>
                  {renderTimer()}
                </div>
                
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl font-bold">$49.99</span>
                  <span className="text-xs text-muted-foreground line-through">$99</span>
                  <span className="bg-green-50 text-green-700 border border-green-200 text-[10px] px-1 py-0.5 rounded">Save 49.5%</span>
                </div>
                
                <p className="text-xs text-muted-foreground">One-time payment, lifetime access</p>
                
                {/* Compact Benefits List */}
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center">
                      <Bot className="h-2.5 w-2.5 text-primary" />
                    </div>
                    <div>
                      <span className="font-medium">Auto Commenter</span>
                      <p className="text-muted-foreground text-[10px]">AI responds to comments</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center">
                      <Zap className="h-2.5 w-2.5 text-primary" />
                    </div>
                    <div>
                      <span className="font-medium">Unlimited Usage</span>
                      <p className="text-muted-foreground text-[10px]">No daily limits</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center">
                      <MessageSquare className="h-2.5 w-2.5 text-primary" />
                    </div>
                    <div>
                      <span className="font-medium">Custom Brand Voice</span>
                      <p className="text-muted-foreground text-[10px]">Consistent tone</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center">
                      <Sparkles className="h-2.5 w-2.5 text-primary" />
                    </div>
                    <div>
                      <span className="font-medium">Any LLM Provider</span>
                      <p className="text-muted-foreground text-[10px]">OpenAI, Claude, etc.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center">
                      <Shield className="h-2.5 w-2.5 text-primary" />
                    </div>
                    <div>
                      <span className="font-medium">Priority Support</span>
                      <p className="text-muted-foreground text-[10px]">Get help when needed</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-1.5 pt-2">
                  <button
                    onClick={handleBuyClick}
                    disabled={checkoutLoading}
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded py-2 text-sm font-medium disabled:opacity-50"
                  >
                    {checkoutLoading ? 'Processing...' : 'Upgrade to Premium'}
                  </button>
                  <p className="text-center text-[10px] text-muted-foreground">7-day money-back guarantee</p>
                </div>
              </div>
            </div>
            
            {/* Free Plan - Compact */}
            <div className="border border-muted bg-gradient-to-br from-gray-50 to-slate-50 rounded-lg p-3">
              <div className="space-y-2">
                <h3 className="text-base font-medium">Free</h3>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl font-bold">$0</span>
                </div>
                <p className="text-xs text-muted-foreground">Limited functionality</p>
                
                {/* Compact Free Features */}
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center gap-2">
                    <Check className="h-3 w-3 text-muted-foreground" />
                    <span>20 comments per day limit</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-3 w-3 text-muted-foreground" />
                    <span>Basic AI features only</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-3 w-3 text-muted-foreground" />
                    <span>Default voice settings</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-3 w-3 text-muted-foreground" />
                    <span>Standard support</span>
                  </div>
                </div>
                
                <div className="pt-2">
                  <button className="w-full border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded py-2 text-sm font-medium">
                    Continue with Free Plan
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Next Steps - Compact */}
      <div className="border-t border-border pt-2">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <ArrowRight className="w-3 h-3" />
          <span className="font-medium">Next:</span>
          <span>Configure AI • Start using Olly</span>
        </div>
      </div>
    </div>
  );
}