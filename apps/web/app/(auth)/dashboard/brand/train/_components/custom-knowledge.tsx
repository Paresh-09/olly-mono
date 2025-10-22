"use client";
import React, { useState, useEffect } from 'react';
import { Input } from '@repo/ui/components/ui/input';
import { Textarea } from '@repo/ui/components/ui/textarea';
import { Button } from '@repo/ui/components/ui/button';
import { Label } from '@repo/ui/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@repo/ui/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/components/ui/tabs";
import { Progress } from "@repo/ui/components/ui/progress";
import { Skeleton } from "@repo/ui/components/ui/skeleton";
import { useForm } from 'react-hook-form';
import { Info, CheckCircle2, Star, AlertCircle, Coins, UploadCloud, FileText, File, Sparkles, Trash2, User, Building2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/ui/select";
import { Switch } from "@repo/ui/components/ui/switch";

interface LicenseKeyCustomKnowledge {
  // Core Brand Information
  brandName: string;
  brandPersonality: string;
  industry: string;
  targetAudience: string;
  productServices: string;
  uniqueSellingPoints: string;
  brandVoice: string;
  contentTopics: string;
  brandValues: string;
  missionStatement: string;

  // Personal Background
  personalBackground: string;
  values: string;
  lifestyle: string;

  // Professional Experience
  professionalBackground: string;
  expertise: string;
  industryInsights: string;

  // Additional Brand Strategy
  uniqueApproach: string;
  contentStrategy: string;

  // Brand Type Flag
  isPersonalBrand: boolean;
}

// Define the type for SAMPLE_DATA
type SampleDataType = {
  [K in 'personal' | 'professional' | 'brand']: {
    [P in keyof LicenseKeyCustomKnowledge]?: string;
  };
};


interface KnowledgeSummary {
  id: string;
  summary: string;
  createdAt: string;
}

interface LicenseKeyCustomKnowledgeFormProps {
  licenseKey: string;
  onSubmit: (data: LicenseKeyCustomKnowledge) => Promise<void>;
  initialData?: Partial<LicenseKeyCustomKnowledge>;
  onFormReady?: () => void;
}

const SAMPLE_DATA: SampleDataType = {
  personal: {
    personalBackground: "I'm a proud father of two kids with a loving wife. As a faith-driven entrepreneur (Christian), I advocate for intentional lifestyle design and prioritize family values.",
    values: "Faith, family, finances, fitness, and freedom (time and location independence) are my core pillars of life.",
    lifestyle: "I believe in balancing work and life through intentional design. I'm laid back, don't take myself too seriously, and focus on maintaining freedom of time and location."
  },
  professional: {
    professionalBackground: "Over the last decade, I helped scale several early-stage software startups and eCommerce companies launched from Y Combinator and TechStars. I've contributed content to over 200 online publications.",
    expertise: "Growth marketing, startup scaling, strategic partnerships, content strategy, operating systems, automation",
    industryInsights: "The software startup/eCommerce scene is shifting. With mass layoffs, high interest rates, and global inflation, there's a growing opportunity in micro startup portfolios.",
    industry: "Digital Marketing / SaaS"
  },
  brand: {
    brandName: "Growth Hacker CMO",
    brandPersonality: "Professional yet approachable, data-driven but human-centered",
    targetAudience: "Micro investors, bootstrapped founders, growth marketers, and content creators who need help with operating systems",
    productServices: "Fractional CMO services, digital product portfolio, operating system consulting, growth marketing automation",
    uniqueSellingPoints: "Decade of experience with YC and TechStars startups, proven track record of scaling early-stage companies",
    uniqueApproach: "Learn in public philosophy, sharing real experiences and lessons learned while building",
    brandVoice: "Down to earth, casual yet professional, authentic and experience-based",
    contentTopics: "AI automation, nocode tools, SaaS scaling, growth experiments, operating systems",
    contentStrategy: "Regular sharing of lessons learned from building operating systems, focus on practical automation solutions",
    brandValues: "Learning in public, transparency, intentional lifestyle design, faith-driven entrepreneurship",
    missionStatement: "To use technology to make a positive social impact while helping creators and founders leverage operating systems to build successful micro startup portfolios"
  }
};

const FIELD_OPTIONS = {
  industry: [
    "Digital Marketing / SaaS",
    "E-commerce",
    "Education / EdTech",
    "Finance / FinTech",
    "Healthcare / HealthTech",
    "Real Estate",
    "Technology / Software",
    "Other"
  ],
  brandPersonality: [
    "Professional yet approachable",
    "Innovative and forward-thinking",
    "Friendly and conversational",
    "Authoritative and expert",
    "Creative and inspiring",
    "Data-driven and analytical",
    "Other"
  ],
  brandVoice: [
    "Casual and authentic",
    "Professional and formal",
    "Educational and helpful",
    "Inspiring and motivational",
    "Technical and detailed",
    "Other"
  ],
  brandValues: [
    "Innovation and creativity",
    "Trust and transparency",
    "Customer success",
    "Work-life balance",
    "Continuous learning",
    "Community impact",
    "Sustainability",
    "Other"
  ],
  expertise: [
    "Growth Marketing",
    "Content Strategy",
    "Digital Marketing",
    "Brand Development",
    "Marketing Automation",
    "Social Media Marketing",
    "SEO/SEM",
    "Other"
  ]
};

const LicenseKeyCustomKnowledgeForm: React.FC<LicenseKeyCustomKnowledgeFormProps> = ({
  licenseKey,
  onSubmit,
  initialData = {},
  onFormReady
}) => {

  // Initialize with default values
  const defaultIsPersonalBrand =
    typeof initialData.isPersonalBrand === 'boolean' ? initialData.isPersonalBrand : false;

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<LicenseKeyCustomKnowledge>({
    defaultValues: {
      ...initialData,
      isPersonalBrand: defaultIsPersonalBrand
    }
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [summaries, setSummaries] = useState<KnowledgeSummary[]>([]);
  const [latestSummary, setLatestSummary] = useState<KnowledgeSummary | null>(null);
  const [activeTab, setActiveTab] = useState('simplified');
  const [progress, setProgress] = useState({
    personal: 0,
    professional: 0,
    brand: 0
  });
  const [completedSections, setCompletedSections] = useState<string[]>([]);
  const [creditError, setCreditError] = useState<{ message: string; remainingCredits: number } | null>(null);
  const [remainingCredits, setRemainingCredits] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedDocument, setUploadedDocument] = useState<string | null>(null);
  const [documentName, setDocumentName] = useState<string | null>(null);
  const [formInitialized, setFormInitialized] = useState(false);
  const [isDeletingSummary, setIsDeletingSummary] = useState<string | null>(null);
  const [isPersonalBrand, setIsPersonalBrand] = useState(defaultIsPersonalBrand);

  const watchAllFields = watch();

  // Handle personal brand toggle
  const handlePersonalBrandToggle = (checked: boolean) => {
    setIsPersonalBrand(checked);
    setValue('isPersonalBrand', checked);
  }

  // Initialize form with initial data
  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {

      // First reset the form with all initial values
      reset({
        ...initialData,
        isPersonalBrand: defaultIsPersonalBrand
      });

      // For each field, explicitly set its value to ensure the UI updates
      Object.entries(initialData).forEach(([key, value]) => {
        if (value) {
          setValue(key as keyof LicenseKeyCustomKnowledge, value as any);
        }
      });

      // Make sure select fields are properly set
      if (initialData.industry) setValue('industry', initialData.industry);
      if (initialData.brandPersonality) setValue('brandPersonality', initialData.brandPersonality);
      if (initialData.brandVoice) setValue('brandVoice', initialData.brandVoice);
      if (initialData.brandValues) setValue('brandValues', initialData.brandValues);
      if (initialData.expertise) setValue('expertise', initialData.expertise);

      // Set personal brand toggle if applicable
      if (initialData.isPersonalBrand) {
        setIsPersonalBrand(true);
      }

      setFormInitialized(true);
      // Notify parent component that form is ready
      onFormReady?.();
    }
  }, [initialData, reset, setValue, onFormReady]);

  useEffect(() => {
    fetchSummaryHistory();
  }, [licenseKey]);

  // Handle case where there's no initial data (new form) - form is ready immediately
  useEffect(() => {
    if (!initialData || Object.keys(initialData).length === 0) {
      onFormReady?.();
    }
  }, [initialData, onFormReady]);

  const handleSelectChange = (name: keyof LicenseKeyCustomKnowledge) => (value: string) => {
    setValue(name, value);
  };

  const fetchSummaryHistory = async () => {
    try {
      const response = await fetch(`/api/license-key/${licenseKey}/fetch-summaries`);
      if (!response.ok) throw new Error('Failed to fetch summary history');
      const data = await response.json();
      setSummaries(data);

      // Set latest summary if there is at least one summary
      if (data.length > 0) {
        setLatestSummary(data[0]);
      }
    } catch (error) {
      console.error('Error fetching summary history:', error);
    }
  };

  const deleteSummary = async (summaryId: string) => {
    try {
      setIsDeletingSummary(summaryId);
      const response = await fetch(`/api/license-key/${licenseKey}/delete-summary/${summaryId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete summary');

      // Remove the deleted summary from the list
      setSummaries(prev => prev.filter(summary => summary.id !== summaryId));

      // If the deleted summary was the latest, update the latest summary
      if (latestSummary?.id === summaryId) {
        const remainingSummaries = summaries.filter(summary => summary.id !== summaryId);
        setLatestSummary(remainingSummaries.length > 0 ? remainingSummaries[0] : null);
      }
    } catch (error) {
      console.error('Error deleting summary:', error);
      setSubmitError('Failed to delete summary. Please try again.');
    } finally {
      setIsDeletingSummary(null);
    }
  };

  const generateSummary = async (documentText?: string) => {
    try {
      setCreditError(null);
      setIsSubmitting(true);

      // Get the current form data
      const formData = watch();

      const payload = documentText
        ? { licenseKey, documentText, formData }
        : { licenseKey, formData };

      const response = await fetch(`/api/openai/cs-summary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 403 && data.error === "Insufficient credits") {
          setCreditError({
            message: "Not enough credits to generate summary",
            remainingCredits: data.remainingCredits || 0
          });
          return;
        }
        throw new Error(data.error || 'Failed to generate summary');
      }

      setLatestSummary(data);
      setRemainingCredits(data.remainingCredits);
      await fetchSummaryHistory();
      setActiveTab('summaries');
    } catch (error) {
      console.error('Error generating summary:', error);
      setSubmitError('Failed to generate summary. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDocumentUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      // Create a FormData instance to send the file
      const formData = new FormData();
      formData.append('file', file);

      // Call our API to extract text
      const response = await fetch('/api/documents/extract-text', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to extract text');
      }

      const data = await response.json();
      setUploadedDocument(data.text);
      setDocumentName(data.fileName || file.name);
    } catch (error) {
      console.error('Error extracting text from document:', error);
      setSubmitError('Failed to extract text from document. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handlePasteDocument = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUploadedDocument(text);
        setDocumentName('Pasted text');
      }
    } catch (error) {
      console.error('Failed to read clipboard contents:', error);
    }
  };

  const onSubmitForm = async (data: LicenseKeyCustomKnowledge) => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await onSubmit(data);
      // Show success message
      setShowSaveSuccess(true);
      // Hide success message after 3 seconds
      setTimeout(() => {
        setShowSaveSuccess(false);
      }, 3000);
    } catch (error) {
      setSubmitError('An error occurred while saving. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateProgress = React.useCallback(() => {
    const sections = {
      personal: ['personalBackground', 'values', 'lifestyle'],
      professional: ['professionalBackground', 'expertise', 'industryInsights', 'industry'],
      brand: ['brandName', 'brandPersonality', 'targetAudience', 'productServices', 'uniqueSellingPoints',
        'uniqueApproach', 'brandVoice', 'contentTopics', 'contentStrategy', 'brandValues', 'missionStatement']
    };

    const newProgress = {
      personal: 0,
      professional: 0,
      brand: 0
    };

    Object.entries(sections).forEach(([section, fields]) => {
      const filledFields = fields.filter(field => {
        const value = watchAllFields[field as keyof LicenseKeyCustomKnowledge];
        return typeof value === 'boolean' ? value !== undefined : value?.length > 0;
      });
      newProgress[section as keyof typeof newProgress] = (filledFields.length / fields.length) * 100;
    });

    setProgress(newProgress);

    // Update completed sections
    const newCompletedSections = Object.entries(newProgress)
      .filter(([_, value]) => value === 100)
      .map(([key]) => key);
    setCompletedSections(newCompletedSections);
  }, [watchAllFields]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      calculateProgress();
    }, 500);

    return () => clearTimeout(debounce);
  }, [watchAllFields, calculateProgress]);

  const renderSimplifiedForm = () => (
    <div className="space-y-8">
      <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-8">
        <div className="space-y-8">
          {/* Existing data notification */}
          {initialData && typeof initialData === 'object' && Object.keys(initialData).length > 0 && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
              <div className="flex items-center gap-3 text-emerald-700">
                <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                </div>
                <span className="font-medium">Existing {isPersonalBrand ? 'personal' : 'brand'} profile loaded</span>
              </div>
            </div>
          )}

          {/* Brand Type Selection */}
          <div className="bg-gradient-to-r from-gray-50 to-slate-50 p-6 rounded-2xl border border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-blue-600" />
                </div>
                <span className="text-lg font-semibold text-gray-900">What are you building a voice for?</span>
              </div>
              <div className="flex items-center gap-4">
                <div className={`flex items-center gap-2 transition-colors ${isPersonalBrand ? 'text-gray-500' : 'text-blue-600 font-medium'}`}>
                  <Building2 className="h-4 w-4" />
                  <span>Business/Brand</span>
                </div>
                <Switch
                  checked={isPersonalBrand}
                  onCheckedChange={handlePersonalBrandToggle}
                  {...register('isPersonalBrand')}
                />
                <div className={`flex items-center gap-2 transition-colors ${isPersonalBrand ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
                  <User className="h-4 w-4" />
                  <span>Personal Brand</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <Label htmlFor="brandName" className="text-sm font-semibold text-gray-700">
                {isPersonalBrand ? 'Name' : 'Brand Name'}
              </Label>
              <Input
                id="brandName"
                {...register('brandName')}
                className="h-12 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                placeholder={isPersonalBrand ? 'Your full name' : 'Your brand name'}
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="industry" className="text-sm font-semibold text-gray-700">Industry</Label>
              <Select
                onValueChange={handleSelectChange('industry')}
                value={watchAllFields.industry || ""}
              >
                <SelectTrigger className="h-12 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500/20">
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  {FIELD_OPTIONS.industry.map((option) => (
                    <SelectItem key={option} value={option} className="rounded-lg">{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input type="hidden" id="industry" {...register('industry')} />
            </div>

            <div className="space-y-3">
              <Label htmlFor="brandVoice" className="text-sm font-semibold text-gray-700">
                {isPersonalBrand ? 'Tone of Voice' : 'Brand Voice'}
              </Label>
              <Select
                onValueChange={handleSelectChange('brandVoice')}
                value={watchAllFields.brandVoice || ""}
              >
                <SelectTrigger className="h-12 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500/20">
                  <SelectValue placeholder="Select voice" />
                </SelectTrigger>
                <SelectContent>
                  {FIELD_OPTIONS.brandVoice.map((option) => (
                    <SelectItem key={option} value={option} className="rounded-lg">{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input type="hidden" id="brandVoice" {...register('brandVoice')} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label htmlFor="brandPersonality" className="text-sm font-semibold text-gray-700">
                {isPersonalBrand ? 'Personality' : 'Brand Personality'}
              </Label>
              <Select
                onValueChange={handleSelectChange('brandPersonality')}
                value={watchAllFields.brandPersonality || ""}
              >
                <SelectTrigger className="h-12 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500/20">
                  <SelectValue placeholder="Select personality" />
                </SelectTrigger>
                <SelectContent>
                  {FIELD_OPTIONS.brandPersonality.map((option) => (
                    <SelectItem key={option} value={option} className="rounded-lg">{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input type="hidden" id="brandPersonality" {...register('brandPersonality')} />
            </div>

            <div className="space-y-3">
              <Label htmlFor="targetAudience" className="text-sm font-semibold text-gray-700">Target Audience</Label>
              <Textarea
                id="targetAudience"
                {...register('targetAudience')}
                className="h-24 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 resize-none"
                placeholder="Describe your ideal audience..."
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label htmlFor="productServices" className="text-sm font-semibold text-gray-700">
                {isPersonalBrand ? 'Services/Skills' : 'Products or Services'}
              </Label>
              <Textarea
                id="productServices"
                {...register('productServices')}
                className="h-24 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 resize-none"
                placeholder={isPersonalBrand ? 'What services do you offer?' : 'What products or services do you provide?'}
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="uniqueSellingPoints" className="text-sm font-semibold text-gray-700">
                {isPersonalBrand ? 'Unique Strengths' : 'Unique Selling Points'}
              </Label>
              <Textarea
                id="uniqueSellingPoints"
                {...register('uniqueSellingPoints')}
                className="h-24 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 resize-none"
                placeholder="What makes you unique in your field?"
              />
            </div>
          </div>

          {isPersonalBrand && (
            <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#F6F9FC' }}>
                  <User className="h-4 w-4 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Personal Brand Details</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="personalBackground" className="text-sm font-semibold text-gray-700">Personal Background</Label>
                  <Textarea
                    id="personalBackground"
                    {...register('personalBackground')}
                    className="h-24 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 resize-none bg-white"
                    placeholder="Share details about your personal journey, interests, and background..."
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="professionalBackground" className="text-sm font-semibold text-gray-700">Professional Experience</Label>
                  <Textarea
                    id="professionalBackground"
                    {...register('professionalBackground')}
                    className="h-24 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 resize-none bg-white"
                    placeholder="Describe your career path, achievements, and professional expertise..."
                  />
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <Label htmlFor="missionStatement" className="text-sm font-semibold text-gray-700">
              {isPersonalBrand ? 'Personal Mission' : 'Mission Statement'}
            </Label>
            <Textarea
              id="missionStatement"
              {...register('missionStatement')}
              className="h-20 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 resize-none"
              placeholder={isPersonalBrand ? 'What drives you personally and professionally?' : 'What is your company\'s mission?'}
            />
          </div>

          {/* Document Upload Section */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#F6F9FC' }}>
                <FileText className="h-5 w-5 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Enrich Your {isPersonalBrand ? 'Personal' : 'Brand'} Voice</h3>
            </div>
            <p className="text-gray-700 mb-4 leading-relaxed">
              {isPersonalBrand
                ? "Upload your resume, LinkedIn profile, bio, or personal website content to enhance your voice profile. Our AI will extract key information to create an authentic voice that truly represents you."
                : "Upload brand guidelines, company website content, or marketing materials to automatically enhance your brand voice. Our AI will extract key information to create a more authentic voice for your brand."
              }
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex gap-2">
                <label
                  htmlFor="file-upload"
                  className="flex-1 flex items-center justify-center h-10 border border-gray-300 rounded-md cursor-pointer bg-white hover:bg-gray-50 transition-colors px-3"
                >
                  <UploadCloud className="w-4 h-4 mr-2 text-gray-500" />
                  <span className="text-sm">Upload {isPersonalBrand ? 'Profile Content' : 'Brand Content'}</span>
                  <input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={handleDocumentUpload}
                    disabled={isUploading}
                  />
                </label>
                <Button
                  onClick={handlePasteDocument}
                  variant="outline"
                  className="flex-1 h-10"
                  size="sm"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Paste Content
                </Button>
              </div>

              <div>
                {isUploading ? (
                  <div className="flex items-center justify-center h-10 bg-gray-50 rounded-md border px-3">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-700 mr-2"></div>
                    <span className="text-sm">Extracting content...</span>
                  </div>
                ) : uploadedDocument ? (
                  <div className="flex items-center justify-between h-10 bg-green-50 text-green-800 rounded-md border border-green-200 px-3">
                    <div className="flex items-center">
                      <File className="h-4 w-4 mr-2" />
                      <span className="text-sm font-medium truncate max-w-[150px]">{documentName}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => {
                        setUploadedDocument(null);
                        setDocumentName(null);
                      }}
                    >
                      <span className="sr-only">Clear</span>
                      <span className="text-sm">×</span>
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-10 bg-gray-50 rounded-md border border-dashed px-3">
                    <span className="text-sm text-gray-500">No content uploaded yet</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl p-6 border border-gray-200 mt-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all duration-200"
            >
              {isSubmitting ? 'Saving...' : initialData && Object.keys(initialData).length > 0 ? 'Update Profile' : 'Save Profile'}
            </Button>

            <div className="flex gap-3">
              {uploadedDocument ? (
                <Button
                  onClick={() => generateSummary(uploadedDocument)}
                  type="button"
                  disabled={isSubmitting}
                  className="h-12 gap-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold rounded-xl transition-all duration-200"
                >
                  <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: '#F6F9FC' }}>
                    <Sparkles className="h-3 w-3 text-blue-600" />
                  </div>
                  Generate with Uploaded Content
                </Button>
              ) : (
                <Button
                  onClick={() => generateSummary()}
                  type="button"
                  disabled={isSubmitting}
                  className="h-12 gap-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-semibold rounded-xl transition-all duration-200"
                >
                  <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: '#F6F9FC' }}>
                    <Star className="h-3 w-3 text-indigo-600" />
                  </div>
                  Generate Summary (5 credits)
                </Button>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );

  const renderSummaryItem = (summary: KnowledgeSummary, isLatest: boolean = false) => (
    <div key={summary.id} className={`rounded-2xl p-6 border transition-all duration-200 ${isLatest
      ? "bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200 shadow-md"
      : "bg-white border-gray-200 hover:shadow-lg"
      }`}>
      <div className="flex flex-col space-y-4">
        {isLatest && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
              <Star className="h-4 w-4 text-emerald-600" />
            </div>
            <span className="text-lg font-semibold text-emerald-800">Latest Summary</span>
          </div>
        )}
        <p className={`leading-relaxed text-lg ${isLatest ? "text-emerald-700" : "text-gray-700"}`}>
          {summary.summary}
        </p>
        <div className="flex justify-between items-center pt-2 border-t border-gray-100">
          <div className={`text-sm font-medium ${isLatest ? "text-emerald-600" : "text-gray-500"}`}>
            Generated on {new Date(summary.createdAt).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
          <Button
            onClick={() => deleteSummary(summary.id)}
            variant="ghost"
            size="sm"
            className="h-9 px-3 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200"
            disabled={isDeletingSummary === summary.id}
          >
            {isDeletingSummary === summary.id ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-700"></div>
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            <span className="ml-2">Delete</span>
          </Button>
        </div>
      </div>
    </div>
  );

  const renderSummariesTab = () => (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-gray-900">Brand Profile Summaries</h3>
          <p className="text-gray-600 leading-relaxed">AI-generated summaries of your brand profile for consistent messaging</p>
        </div>
        <div className="flex items-center gap-4">
          {remainingCredits !== null && (
            <div className="bg-blue-50 rounded-xl px-4 py-2 flex items-center gap-2">
              <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: '#F6F9FC' }}>
                <Coins className="h-3 w-3 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-blue-700">
                {remainingCredits} credits remaining
              </span>
            </div>
          )}
          <Button
            onClick={() => generateSummary()}
            className="gap-3 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-semibold rounded-xl transition-all duration-200"
            disabled={isSubmitting}
          >
            <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: '#F6F9FC' }}>
              <Star className="h-3 w-3 text-indigo-600" />
            </div>
            Generate New Summary (5 credits)
          </Button>
        </div>
      </div>

      {renderCreditError()}
      {renderCreditInfo()}

      {latestSummary && renderSummaryItem(latestSummary, true)}

      {summaries.length > 0 ? (
        <div className="space-y-6">
          <h4 className="text-xl font-semibold text-gray-900">Previous Summaries</h4>
          {summaries
            .filter(summary => !latestSummary || summary.id !== latestSummary.id)
            .map(summary => renderSummaryItem(summary))}
        </div>
      ) : (
        <div className="bg-blue-50 rounded-2xl p-8 border border-blue-200 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Info className="h-8 w-8 text-blue-500" />
          </div>
          <h4 className="text-lg font-semibold text-blue-900 mb-2">No summaries yet</h4>
          <p className="text-blue-700 leading-relaxed max-w-md mx-auto">
            Complete your profile and generate your first summary to see your brand story come to life!
          </p>
        </div>
      )}
    </div>
  );

  const renderCreditInfo = () => {
    if (remainingCredits !== null) {
      return (
        <Alert className="mb-4 bg-blue-50 border-blue-200">
          <Coins className="h-4 w-4 text-blue-500" />
          <AlertDescription className="text-blue-700">
            Remaining credits: {remainingCredits}
          </AlertDescription>
        </Alert>
      );
    }
    return null;
  };

  const renderCreditError = () => {
    if (creditError) {
      return (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Credit Error</AlertTitle>
          <AlertDescription>
            {creditError.message}. Remaining credits: {creditError.remainingCredits}
          </AlertDescription>
        </Alert>
      );
    }
    return null;
  };

  const renderSkeleton = () => (
    <div className="w-full space-y-8">
      {/* Tab skeleton */}
      <div className="w-full bg-gray-50 rounded-2xl p-1 h-12 flex gap-1">
        <Skeleton className="flex-1 h-10 rounded-xl" />
        <Skeleton className="flex-1 h-10 rounded-xl" />
      </div>

      {/* Brand type toggle skeleton */}
      <div className="bg-gradient-to-r from-gray-50 to-slate-50 p-6 rounded-2xl border border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-xl" />
            <Skeleton className="h-6 w-64" />
          </div>
          <div className="flex items-center gap-4">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="w-11 h-6 rounded-full" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
      </div>

      {/* Form fields skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-3">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-12 rounded-xl" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-12 rounded-xl" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-12 rounded-xl" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-12 rounded-xl" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-24 rounded-xl" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-24 rounded-xl" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-24 rounded-xl" />
        </div>
      </div>

      <div className="space-y-3">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-20 rounded-xl" />
      </div>

      {/* Document upload skeleton */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100">
        <div className="flex items-center gap-3 mb-4">
          <Skeleton className="w-10 h-10 rounded-xl" />
          <Skeleton className="h-6 w-48" />
        </div>
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-3/4 mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex gap-2">
            <Skeleton className="flex-1 h-10 rounded-md" />
            <Skeleton className="flex-1 h-10 rounded-md" />
          </div>
          <Skeleton className="h-10 rounded-md" />
        </div>
      </div>

      {/* Action buttons skeleton */}
      <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl p-6 border border-gray-200">
        <div className="flex flex-col lg:flex-row gap-4">
          <Skeleton className="flex-1 h-12 rounded-xl" />
          <Skeleton className="h-12 w-64 rounded-xl" />
        </div>
      </div>
    </div>
  );

  // Show skeleton while form is initializing
  if (!formInitialized && initialData && Object.keys(initialData).length > 0) {
    return renderSkeleton();
  }

  return (
    <div className="w-full">
      {showSaveSuccess && (
        <div className="mb-6">
          <Alert className="bg-emerald-50 border-emerald-200 rounded-2xl">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <AlertDescription className="text-emerald-700 font-medium">
              Changes saved successfully!
            </AlertDescription>
          </Alert>
        </div>
      )}

      {submitError && (
        <div className="mb-6">
          <Alert variant="destructive" className="rounded-2xl">
            <AlertDescription>{submitError}</AlertDescription>
          </Alert>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <TabsList className="w-full bg-gray-50 rounded-2xl p-1 h-12">
          <TabsTrigger
            value="simplified"
            className="flex-1 rounded-xl font-semibold data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            Brand Profile
          </TabsTrigger>
          <TabsTrigger
            value="summaries"
            className="flex-1 rounded-xl font-semibold data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            AI Summaries
          </TabsTrigger>
        </TabsList>

        <TabsContent value="simplified" className="space-y-6">
          {renderSimplifiedForm()}
        </TabsContent>

        <TabsContent value="summaries" className="space-y-6">
          {renderSummariesTab()}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LicenseKeyCustomKnowledgeForm;