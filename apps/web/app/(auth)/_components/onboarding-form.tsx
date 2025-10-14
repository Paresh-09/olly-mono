import React, { useState } from 'react';
import { Card, CardContent } from "@repo/ui/components/ui/card";
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/components/ui/select";
import { Checkbox } from '@repo/ui/components/ui/checkbox';
import { Textarea } from '@repo/ui/components/ui/textarea';
import { UserCircle, Building2, Target, MessageCircle, Brain } from 'lucide-react';

export interface OnboardingData {
  role: string;
  roleOther?: string;
  businessType?: string;
  primaryPlatform: string;
  primaryPlatformOther?: string;
  engagementGoal: string;
  contentFrequency: string;
  commentFrequency: string;
  companySize: string;
  aiExperience?: string;
  painPoints: string[];
  customPainPoint?: string;
  biggestChallenge?: string;
}

interface OnboardingFormProps {
  onSubmit: (data: OnboardingData) => Promise<void>;
  disabled?: boolean;
}

interface FormErrors extends Partial<Record<keyof OnboardingData, string>> {
  submit?: string;
}

export default function OnboardingForm({ onSubmit, disabled = false }: OnboardingFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<OnboardingData>({
    role: '',
    primaryPlatform: '',
    engagementGoal: '',
    contentFrequency: '',
    commentFrequency: '',
    companySize: '',
    aiExperience: '',
    painPoints: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const roleOptions = [
    { value: "content_creator", label: "Content Creator" },
    { value: "influencer", label: "Influencer" },
    { value: "social_media_manager", label: "Social Media Manager" },
    { value: "marketing_manager", label: "Marketing Manager" },
    { value: "agency_owner", label: "Agency Owner" },
    { value: "business_owner", label: "Business Owner" },
    { value: "startup_founder", label: "Startup Founder" },
    { value: "community_manager", label: "Community Manager" },
    { value: "other", label: "Other" },
  ];

  const businessTypes = [
    { value: "ecommerce", label: "E-commerce" },
    { value: "saas", label: "SaaS" },
    { value: "consulting", label: "Consulting" },
    { value: "retail", label: "Retail" },
    { value: "professional_services", label: "Professional Services" },
    { value: "healthcare", label: "Healthcare" },
    { value: "education", label: "Education" },
    { value: "technology", label: "Technology" },
    { value: "other", label: "Other" },
  ];

  const platforms = [
    { value: "linkedin", label: "LinkedIn" },
    { value: "twitter", label: "Twitter/X" },
    { value: "facebook", label: "Facebook" },
    { value: "instagram", label: "Instagram" },
    { value: "reddit", label: "Reddit" },
    { value: "other", label: "Other" },
  ];

  const frequencies = [
    { value: "daily", label: "Daily" },
    { value: "weekly", label: "Several times a week" },
    { value: "monthly", label: "A few times a month" },
    { value: "rarely", label: "Rarely" },
  ];

  const goals = [
    { value: "comments", label: "Increase comments" },
    { value: "virality", label: "Boost post virality" },
    { value: "followers", label: "Grow followers" },
    { value: "leads", label: "Generate leads" },
    { value: "branding", label: "Improve brand awareness" },
  ];

  const painPointOptions = [
    { id: 'time_consuming', label: 'Content creation takes too much time' },
    { id: 'consistency', label: 'Maintaining consistent posting schedule' },
    { id: 'engagement', label: 'Not getting enough engagement' },
    { id: 'ideas', label: 'Running out of content ideas' },
    { id: 'quality', label: 'Creating high-quality content' },
    { id: 'strategy', label: 'Developing effective content strategy' },
    { id: 'analytics', label: 'Understanding performance metrics' },
    { id: 'audience', label: 'Finding and growing target audience' },
    { id: 'competition', label: 'Standing out from competition' },
    { id: 'roi', label: 'Measuring ROI from social media' },
    { id: 'resources', label: 'Limited resources/budget' },
    { id: 'algorithm', label: 'Understanding platform algorithms' },
  ];

  const steps = [
    {
      icon: <UserCircle className="w-6 h-6" />,
      title: "About You",
      subtitle: "Tell us about your role",
      validateFields: ['role', 'companySize'] // Added companySize
    },
    {
      icon: <Building2 className="w-6 h-6" />,
      title: "Your Platform",
      subtitle: "Where do you create content?",
      validateFields: ['primaryPlatform', 'contentFrequency']
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: "Goals",
      subtitle: "What are you trying to achieve?",
      validateFields: ['engagementGoal']
    },
    {
      icon: <MessageCircle className="w-6 h-6" />,
      title: "Challenges",
      subtitle: "What's holding you back?",
      validateFields: ['painPoints']
    },
    {
      icon: <Brain className="w-6 h-6" />,
      title: "Experience",
      subtitle: "Your familiarity with AI",
      validateFields: ['aiExperience']
    }
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (disabled) return;
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSelectChange = (name: keyof OnboardingData, value: string) => {
    if (disabled) return;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handlePainPointChange = (id: string, checked: boolean) => {
    if (disabled) return;
    setFormData(prev => ({
      ...prev,
      painPoints: checked 
        ? [...prev.painPoints, id]
        : prev.painPoints.filter(point => point !== id)
    }));
    setErrors(prev => ({ ...prev, painPoints: '' }));
  };

  const validateStep = (stepIndex: number): boolean => {
    const fields = steps[stepIndex - 1].validateFields;
    const newErrors: Partial<Record<keyof OnboardingData, string>> = {};
  
    fields.forEach(field => {
      if (!formData[field as keyof OnboardingData]) {
        newErrors[field as keyof OnboardingData] = `${field.replace(/([A-Z])/g, ' $1').toLowerCase()} is required`;
      }
      if (field === 'painPoints' && formData.painPoints.length === 0) {
        newErrors.painPoints = 'Please select at least one challenge';
      }
    });
  
    // Add business type validation for business owners and startup founders
    if (currentStep === 1 && 
        (formData.role === 'business_owner' || formData.role === 'startup_founder') && 
        !formData.businessType) {
      newErrors.businessType = 'Business type is required';
    }
  
    // Add company size validation
    if (currentStep === 1 && !formData.companySize) {
      newErrors.companySize = 'Company size is required';
    }
  
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (disabled) return;
    if (validateStep(currentStep)) {
      setCurrentStep(current => current + 1);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (disabled) return;
    
    if (!validateStep(currentStep)) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrors(prev => ({ ...prev, submit: 'Failed to submit form. Please try again.' }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormDisabled = disabled || isSubmitting;

  return (
    <div className="max-w-3xl mx-auto px-4">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center w-1/5">
              <div 
                className={`flex items-center justify-center w-12 h-12 rounded-full mb-2 transition-colors
                  ${currentStep > index + 1 ? 'bg-green-100 text-green-600' : 
                    currentStep === index + 1 ? 'bg-blue-100 text-blue-600' : 
                    'bg-gray-100 text-gray-400'}`}
              >
                {step.icon}
              </div>
              <div className={`text-center ${currentStep === index + 1 ? 'text-blue-600' : 'text-gray-500'}`}>
                <div className="text-sm font-medium hidden md:block">{step.title}</div>
                <div className="text-xs hidden md:block">{step.subtitle}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <form onSubmit={e => e.preventDefault()} className="space-y-6">
            {/* Step 1: About You */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <label className="text-lg font-medium text-gray-900 mb-4 block">
                    What best describes your role?
                  </label>
                  <Select 
                    onValueChange={(value) => handleSelectChange('role', value)}
                    value={formData.role}
                    disabled={isFormDisabled}
                  >
                    <SelectTrigger className={`h-12 ${errors.role ? 'border-red-500' : ''}`}>
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roleOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.role && (
                    <p className="text-red-500 text-sm mt-1">{errors.role}</p>
                  )}
                </div>

                {(formData.role === 'business_owner' || formData.role === 'startup_founder') && (
                  <div>
                    <label className="text-lg font-medium text-gray-900 mb-4 block">
                      What type of business are you in?
                    </label>
                    <Select
                      onValueChange={(value) => handleSelectChange('businessType', value)}
                      value={formData.businessType}
                      disabled={isFormDisabled}
                    >
                      <SelectTrigger className={`h-12 ${errors.businessType ? 'border-red-500' : ''}`}>
                        <SelectValue placeholder="Select business type" />
                      </SelectTrigger>
                      <SelectContent>
                        {businessTypes.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.businessType && (
                      <p className="text-red-500 text-sm mt-1">{errors.businessType}</p>
                    )}
                  </div>
                )}

                <div>
                  <label className="text-lg font-medium text-gray-900 mb-4 block">
                    How big is your company/team?
                  </label>
                  <Select
                    onValueChange={(value) => handleSelectChange('companySize', value)}
                    value={formData.companySize}
                    disabled={isFormDisabled}
                  >
                    <SelectTrigger className={`h-12 ${errors.companySize ? 'border-red-500' : ''}`}>
                      <SelectValue placeholder="Select company size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="solo">Solo</SelectItem>
                      <SelectItem value="2-10">2-10 employees</SelectItem>
                      <SelectItem value="11-50">11-50 employees</SelectItem>
                      <SelectItem value="51-200">51-200 employees</SelectItem>
                      <SelectItem value="201-1000">201-1000 employees</SelectItem>
                      <SelectItem value="1000+">1000+ employees</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.companySize && (
                    <p className="text-red-500 text-sm mt-1">{errors.companySize}</p>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Platform */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <label className="text-lg font-medium text-gray-900 mb-4 block">
                    Which platform do you primarily focus on?
                  </label>
                  <Select
                    onValueChange={(value) => handleSelectChange('primaryPlatform', value)}
                    value={formData.primaryPlatform}
                    disabled={isFormDisabled}
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select your main platform" />
                    </SelectTrigger>
                    <SelectContent>
                      {platforms.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formData.primaryPlatform === 'other' && (
                    <Input
                      type="text"
                      name="primaryPlatformOther"
                      placeholder="Please specify"
                      onChange={handleChange}
                      className="mt-2"
                      value={formData.primaryPlatformOther || ''}
                    />
                  )}
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-lg font-medium text-gray-900 mb-4 block">
                      How often do you post?
                    </label>
                    <Select
                      onValueChange={(value) => handleSelectChange('contentFrequency', value)}
                      value={formData.contentFrequency}
                      disabled={isFormDisabled}
                    >
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Select posting frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        {frequencies.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-lg font-medium text-gray-900 mb-4 block">
                      How often do you engage?
                    </label>
                    <Select
                      onValueChange={(value) => handleSelectChange('commentFrequency', value)}
                      value={formData.commentFrequency}
                      disabled={isFormDisabled}
                    >
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Select engagement frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        {frequencies.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

          {/* Step 3: Goals */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <label className="text-lg font-medium text-gray-900 mb-4 block">
                  What&apos;s your main goal?
                </label>
                <Select
                  onValueChange={(value) => handleSelectChange('engagementGoal', value)}
                  value={formData.engagementGoal}
                  disabled={isFormDisabled}
                >
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select your main goal" />
                  </SelectTrigger>
                  <SelectContent>
                    {goals.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.engagementGoal && (
                  <p className="text-red-500 text-sm mt-1">{errors.engagementGoal}</p>
                )}
              </div>

              <div>
                <label className="text-lg font-medium text-gray-900 mb-4 block">
                  What would success look like in 6 months?
                </label>
                <Textarea
                  name="biggestChallenge"
                  placeholder="Describe your ideal outcome..."
                  className="min-h-[100px] text-base"
                  value={formData.biggestChallenge || ''}
                  onChange={handleChange}
                  disabled={isFormDisabled}
                />
              </div>
            </div>
          )}

        {currentStep === 4 && (
          <div className="space-y-6">
            <div>
              <label className="text-lg font-medium text-gray-900 mb-4 block">
                What challenges are you facing?
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {painPointOptions.map((option) => (
                  <div 
                    key={option.id} 
                    className={`p-4 rounded-lg border transition-colors cursor-pointer
                      ${formData.painPoints.includes(option.id) 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id={option.id}
                        checked={formData.painPoints.includes(option.id)}
                        onCheckedChange={(checked) => 
                          handlePainPointChange(option.id, checked as boolean)
                        }
                        disabled={isFormDisabled}
                        className="mt-0.5"
                      />
                      <label 
                        htmlFor={option.id} 
                        className="text-sm font-medium cursor-pointer flex-1"
                      >
                        {option.label}
                      </label>
                    </div>
                  </div>
                ))}
              </div>
              {errors.painPoints && (
                <p className="text-red-500 text-sm mt-2">{errors.painPoints}</p>
              )}
            </div>

            <div>
              <label className="text-lg font-medium text-gray-900 mb-4 block">
                Any other challenges? (Optional)
              </label>
              <Textarea
                name="customPainPoint"
                placeholder="Tell us about other challenges you're facing..."
                className="min-h-[100px] text-base"
                value={formData.customPainPoint || ''}
                onChange={handleChange}
                disabled={isFormDisabled}
              />
            </div>
          </div>
        )}

            {/* Step 5: Experience */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <div>
                  <label className="text-lg font-medium text-gray-900 mb-4 block">
                    How experienced are you with AI tools?
                  </label>
                  <Select
                    onValueChange={(value) => handleSelectChange('aiExperience', value)}
                    value={formData.aiExperience}
                    disabled={isFormDisabled}
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select your AI experience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="expert">Expert</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="none">No experience</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.aiExperience && (
                    <p className="text-red-500 text-sm mt-1">{errors.aiExperience}</p>
                  )}
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6">
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep(current => current - 1)}
                  className="px-6"
                >
                  Back
                </Button>
              )}
              
              <Button
                type="button"
                className={`px-6 ${currentStep === 1 ? 'w-full' : 'ml-auto'}`}
                disabled={isSubmitting || isFormDisabled}
                onClick={() => {
                  if (currentStep < 5) {
                    handleNextStep();
                  } else {
                    handleSubmit();
                  }
                }}
              >
                {isSubmitting ? (
                  "Submitting..."
                ) : currentStep === 5 ? (
                  "Complete Setup 🚀"
                ) : (
                  "Continue"
                )}
              </Button>
            </div>

            {errors.submit && (
              <p className="text-red-500 text-sm text-center mt-4">{errors.submit}</p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
