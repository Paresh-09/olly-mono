"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@repo/ui/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/components/ui/select";
import { Loader2, Sparkles, Info, ArrowRight } from "lucide-react";
import { OnboardingData } from '@/types/onboarding';
import { Alert, AlertDescription } from '@repo/ui/components/ui/alert';
import { Separator } from '@repo/ui/components/ui/separator';

interface OnboardingFormProps {
  onSubmit: (data: OnboardingData) => Promise<void>;
  onNext: () => void;
  onSkip: () => void;
  disabled?: boolean;
  initialData?: OnboardingData | null;
}

interface FormErrors extends Partial<Record<keyof OnboardingData, string>> {
  submit?: string;
}

export default function OnboardingForm({ onSubmit, onNext, onSkip, disabled = false, initialData }: OnboardingFormProps) {
  const [formData, setFormData] = useState<OnboardingData>({
    role: '',
    roleOther: '',
    industry: '',
    primaryPlatform: '',
    primaryPlatformOther: '',
    businessType: '',
    engagementGoal: '',
    contentFrequency: '',
    commentFrequency: '',
    companySize: '',
    aiExperience: '',
    painPoints: [],
    customPainPoint: '',
    biggestChallenge: '',
    referralSource: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const roleOptions = [
    { value: "founder", label: "Founder / CEO" },
    { value: "marketer", label: "Marketing Professional" },
    { value: "content", label: "Content Creator" },
    { value: "social_media", label: "Social Media Manager" },
    { value: "influencer", label: "Influencer" },
    { value: "business", label: "Business Owner" },
    { value: "other", label: "Other" },
  ];

  const industryOptions = [
    { value: "tech", label: "Technology & SaaS" },
    { value: "ecommerce", label: "E-commerce" },
    { value: "finance", label: "Finance & FinTech" },
    { value: "health", label: "Health & Wellness" },
    { value: "education", label: "Education" },
    { value: "travel", label: "Travel & Hospitality" },
    { value: "retail", label: "Retail" },
    { value: "real_estate", label: "Real Estate" },
    { value: "entertainment", label: "Entertainment & Media" },
    { value: "food", label: "Food & Beverage" },
    { value: "non_profit", label: "Non-Profit" },
    { value: "other", label: "Other" },
  ];

  const primaryPlatformOptions = [
    { value: "linkedin", label: "LinkedIn" },
    { value: "twitter", label: "Twitter" },
    { value: "instagram", label: "Instagram" },
    { value: "facebook", label: "Facebook" },
    { value: "tiktok", label: "TikTok" },
    { value: "youtube", label: "YouTube" },
    { value: "reddit", label: "Reddit" },
    { value: "pinterest", label: "Pinterest" },
    { value: "other", label: "Other" },
  ];

  const businessTypeOptions = [
    { value: "b2b", label: "B2B" },
    { value: "b2c", label: "B2C" },
    { value: "both", label: "Both B2B and B2C" },
    { value: "personal", label: "Personal Brand" },
  ];

  const companySizeOptions = [
    { value: "solo", label: "Solo" },
    { value: "2-10", label: "2-10 employees" },
    { value: "11-50", label: "11-50 employees" },
    { value: "51-200", label: "51-200 employees" },
    { value: "201-500", label: "201-500 employees" },
    { value: "500+", label: "500+ employees" },
  ];

  const referralOptions = [
    { value: "google", label: "Google Search" },
    { value: "twitter", label: "Twitter" },
    { value: "linkedin", label: "LinkedIn" },
    { value: "facebook", label: "Facebook" },
    { value: "friend", label: "Friend or Colleague" },
    { value: "appsumo", label: "AppSumo" },
    { value: "email", label: "Email Newsletter" },
    { value: "blog", label: "Blog Post" },
    { value: "other", label: "Other" },
  ];

  const handleChange = (name: keyof OnboardingData, value: any) => {
    if (disabled) return;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof OnboardingData, string>> = {};

    // Validate required fields
    if (!formData.role) newErrors.role = "Please select your role";
    if (!formData.industry) newErrors.industry = "Please select your industry";
    if (!formData.primaryPlatform) newErrors.primaryPlatform = "Please select your primary platform";
    if (!formData.businessType) newErrors.businessType = "Please select your business type";
    if (!formData.companySize) newErrors.companySize = "Please select your company size";
    // Referral source is optional

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (disabled) return;

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onNext();
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrors(prev => ({ ...prev, submit: 'Failed to submit form. Please try again.' }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    onSkip();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <h3 className="text-base font-medium">Tell us about yourself</h3>
        </div>
        <Button 
          variant="ghost"
          size="sm"
          onClick={handleSkip}
          disabled={disabled || isSubmitting}
          className="text-xs text-muted-foreground"
        >
          Skip for now
        </Button>
      </div>

      <Alert variant="default" className="bg-primary/5 border-primary/20">
        <Info className="h-4 w-4 text-primary" />
        <AlertDescription className="text-sm">
          We use this information to personalize your experience and tailor Olly's AI suggestions to your specific needs.
        </AlertDescription>
      </Alert>

      <Separator />

      <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-1 block text-muted-foreground">Your Role</label>
            <Select
              value={formData.role}
              onValueChange={(value) => handleChange("role", value)}
              disabled={disabled || isSubmitting}
            >
              <SelectTrigger className={errors.role ? "border-red-500" : ""}>
                <SelectValue placeholder="Select your role" />
              </SelectTrigger>
              <SelectContent>
                {roleOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.role && <p className="text-xs text-red-500 mt-1">{errors.role}</p>}
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block text-muted-foreground">Industry</label>
            <Select
              value={formData.industry}
              onValueChange={(value) => handleChange("industry", value)}
              disabled={disabled || isSubmitting}
            >
              <SelectTrigger className={errors.industry ? "border-red-500" : ""}>
                <SelectValue placeholder="Select your industry" />
              </SelectTrigger>
              <SelectContent>
                {industryOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.industry && <p className="text-xs text-red-500 mt-1">{errors.industry}</p>}
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block text-muted-foreground">Primary Social Platform</label>
            <Select
              value={formData.primaryPlatform}
              onValueChange={(value) => handleChange("primaryPlatform", value)}
              disabled={disabled || isSubmitting}
            >
              <SelectTrigger className={errors.primaryPlatform ? "border-red-500" : ""}>
                <SelectValue placeholder="Select your platform" />
              </SelectTrigger>
              <SelectContent>
                {primaryPlatformOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.primaryPlatform && <p className="text-xs text-red-500 mt-1">{errors.primaryPlatform}</p>}
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block text-muted-foreground">Business Type</label>
            <Select
              value={formData.businessType}
              onValueChange={(value) => handleChange("businessType", value)}
              disabled={disabled || isSubmitting}
            >
              <SelectTrigger className={errors.businessType ? "border-red-500" : ""}>
                <SelectValue placeholder="Select your business type" />
              </SelectTrigger>
              <SelectContent>
                {businessTypeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.businessType && <p className="text-xs text-red-500 mt-1">{errors.businessType}</p>}
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block text-muted-foreground">Company Size</label>
            <Select
              value={formData.companySize}
              onValueChange={(value) => handleChange("companySize", value)}
              disabled={disabled || isSubmitting}
            >
              <SelectTrigger className={errors.companySize ? "border-red-500" : ""}>
                <SelectValue placeholder="Select your company size" />
              </SelectTrigger>
              <SelectContent>
                {companySizeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.companySize && <p className="text-xs text-red-500 mt-1">{errors.companySize}</p>}
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block text-muted-foreground">How did you hear about us?</label>
            <Select
              value={formData.referralSource}
              onValueChange={(value) => handleChange("referralSource", value)}
              disabled={disabled || isSubmitting}
            >
              <SelectTrigger className={errors.referralSource ? "border-red-500" : ""}>
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                {referralOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.referralSource && <p className="text-xs text-red-500 mt-1">{errors.referralSource}</p>}
          </div>
        </div>

        {errors.submit && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
            {errors.submit}
          </div>
        )}

        <Separator className="my-2" />

        {/* Next steps section */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <ArrowRight className="w-4 h-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground font-medium">Coming up next:</p>
            <span className="text-xs text-muted-foreground ml-1">Activate license • Configure AI • Start using Olly</span>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={disabled || isSubmitting}
            className="gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>Continue</>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
