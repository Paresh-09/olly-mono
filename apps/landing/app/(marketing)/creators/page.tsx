'use client'
import React, { useState } from 'react';
import { Star, Instagram, Sparkles, Gift, Zap, Users, Send, ExternalLink, TrendingUp, Award, DollarSign, Heart, Plus } from 'lucide-react';
import { Input } from '@repo/ui/components/ui/input';
import { Button } from '@repo/ui/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/components/ui/select';
import { useRouter } from 'next/navigation';


const PromotePage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    socialLinks: [''],
    category: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    'Lifestyle & Fashion',
    'Tech & Gaming',
    'Beauty & Wellness',
    'Food & Travel',
    'Business & Entrepreneurship',
    'Fitness & Health',
    'Art & Creativity',
    'Education & Learning',
    'Entertainment',
    'Other'
  ];

  const handleSubmit = async () => {
    // Basic validation
    if (!formData.email || !formData.socialLinks[0] || !formData.category) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/promote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        // Set submission flag in Chrome storage and localStorage
        if (typeof window !== "undefined") {
          const w = window as any;
          if (w.chrome && w.chrome.storage && w.chrome.storage.local) {
            w.chrome.storage.local.set({ ig_popup_dont_show: "1" });
          }
          localStorage.setItem("ig_popup_dont_show", "1");
        }

        // Redirect to success page
        router.push('/creators/success');
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || 'Submission failed. Please try again.');
      }
    } catch (err) {
      alert('Submission failed. Please try again.');
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen py-10">
      <div className="max-w-3xl mx-auto px-4 flex flex-col items-center">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="bg-gray-200 p-4 rounded-full shadow-md">
              <Instagram className="w-10 h-10 text-pink-500" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
            Build Influencer Communities With Us
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Join our mission to create thriving influencer communities. <span className="font-bold text-pink-500">Share our platform</span> with your network and get <span className="font-bold text-pink-500">lifetime access</span> to all our premium tools. Help us grow, connect with like-minded creators, and unlock exclusive benefits for being part of our community!
          </p>
        </div>
        {/* Form at center */}
        <div className="w-full max-w-lg mb-12">
          <div className="bg-white rounded-2xl border border-gray-200 shadow p-8 flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gray-100 p-2 rounded-lg">
                <Send className="w-6 h-6 text-pink-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Apply Now</h2>
            </div>
            <form className="space-y-4" onSubmit={e => { e.preventDefault(); handleSubmit(); }}>
              <Input
                type="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                required
              />
              <div>
                <label className="flex text-sm font-medium text-gray-700 mb-1 items-center gap-2">
                  Social Media Link(s)
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="ml-2 text-pink-500"
                    onClick={() => {
                      if (formData.socialLinks.length < 6) {
                        setFormData({
                          ...formData,
                          socialLinks: [...formData.socialLinks, ""],
                        });
                      }
                    }}
                    disabled={formData.socialLinks.length >= 6}
                    aria-label="Add another social link"
                  >
                    <Plus className="w-5 h-5" />
                  </Button>
                </label>
                <div className="space-y-2">
                  {formData.socialLinks.map((link, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Input
                        type="url"
                        placeholder={
                          idx === 0
                            ? "https://instagram.com/yourhandle (or any social link)"
                            : "https://social.com/yourprofile"
                        }
                        value={link}
                        onChange={e => {
                          const newLinks = [...formData.socialLinks];
                          newLinks[idx] = e.target.value;
                          setFormData({ ...formData, socialLinks: newLinks });
                        }}
                        required={idx === 0}
                      />
                      {formData.socialLinks.length > 1 && (
                        <button
                          type="button"
                          className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 transition"
                          onClick={() => {
                            setFormData({
                              ...formData,
                              socialLinks: formData.socialLinks.filter((_, i) => i !== idx),
                            });
                          }}
                          aria-label="Remove this link"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Add your Instagram or any social media profile. You can add up to 6 links.
                </p>
              </div>
              <Select
                value={formData.category}
                onValueChange={value => setFormData({ ...formData, category: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="submit"
                className="w-full text-base py-3 flex items-center justify-center gap-2 bg-pink-500 hover:bg-pink-600 text-white font-semibold rounded-lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Submitting Application...
                  </>
                ) : (
                  <>Submit Application</>
                )}
              </Button>
            </form>
            <div className="mt-6 text-center text-xs text-gray-400">
              <Heart className="w-4 h-4 text-pink-500 inline mr-1" />
              We review all applications within 24 hours
            </div>
          </div>
        </div>
        {/* Benefits & Stats below form */}
        <div className="w-full max-w-3xl flex flex-col gap-8 items-center">
          {/* Main benefits card */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow p-8 w-full">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-yellow-100 p-2 rounded-lg">
                <Gift className="w-6 h-6 text-yellow-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">What You Get</h2>
            </div>
            <div className="grid grid-cols-1 gap-6">
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="bg-gray-100 p-2 rounded-lg flex-shrink-0">
                  <Star className="w-5 h-5 text-pink-500" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 mb-1">Lifetime Premium Access</h3>
                  <p className="text-sm text-gray-600">Unlock all premium features forever - worth $299/year</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="bg-purple-100 p-2 rounded-lg flex-shrink-0">
                  <Zap className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 mb-1">Early Access</h3>
                  <p className="text-sm text-gray-600">Beta features, priority support, and exclusive community</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PromotePage;