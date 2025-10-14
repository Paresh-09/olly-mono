"use client";

import React, { useState, ChangeEvent, FormEvent } from 'react';
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { Textarea } from "@repo/ui/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/components/ui/select";
import { Card, CardContent } from "@repo/ui/components/ui/card";
import { Loader2, Building2, Users, MessageSquare, CalendarDays } from 'lucide-react';
import Link from 'next/link';

interface FormData {
  name: string;
  email: string;
  company: string;
  phone: string;
  teamSize: string;
  message: string;
}

interface SelectChangeEvent {
  target: {
    name: string;
    value: string;
  }
}

// Main Sales Contact Form Component
const SalesContactForm: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    company: '',
    phone: '',
    teamSize: '',
    message: ''
  });

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/contact-sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to send message");
      setIsSubmitted(true);
    } catch (error) {
      console.error("Error:", error);
      alert("Error sending message. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent): void => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (isSubmitted) {
    return (
      <div className="py-20 sm:py-32">
        <div className="mx-auto max-w-5xl px-6 lg:px-8">
          <div className="bg-white/50 backdrop-blur-sm border border-gray-200 rounded-3xl p-8 lg:p-12 shadow-lg">
            <div className="text-center mb-12">
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <CalendarDays className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Thank You!</h2>
              <p className="text-xl text-gray-600 mb-2">
                Your request has been received successfully.
              </p>
              <p className="text-gray-600">
                Schedule a meeting with our sales team to discuss your needs in detail and see how we can help you achieve your goals.
              </p>
            </div>

            {/* Calendly inline widget */}
            <div className="rounded-2xl overflow-hidden shadow-inner bg-gray-50">
              <div
                className="calendly-inline-widget"
                data-url={`https://calendly.com/shri-olly/agency?name=${encodeURIComponent(formData.name)}&email=${encodeURIComponent(formData.email)}&a1=${encodeURIComponent(formData.company)}&a2=${encodeURIComponent(formData.teamSize)}`}
                style={{ minWidth: '320px', height: '700px' }}
              />
              <script type="text/javascript" src="https://assets.calendly.com/assets/external/widget.js" async></script>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-20 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-indigo-50 text-indigo-600 text-sm font-medium mb-6">
            💼 Talk to Sales
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
            Transform Your Social Media Strategy
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Discover how Olly can revolutionize your social media engagement, boost your reach, and drive meaningful conversations with your audience.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="text-center group">
            <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-indigo-100 transition-colors duration-200">
              <Building2 className="w-8 h-8 text-indigo-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900">Enterprise Solutions</h3>
            <p className="text-gray-600 leading-relaxed">Custom solutions designed for large-scale social media operations and enterprise-level requirements</p>
          </div>

          <div className="text-center group">
            <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-indigo-100 transition-colors duration-200">
              <Users className="w-8 h-8 text-indigo-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900">Team Collaboration</h3>
            <p className="text-gray-600 leading-relaxed">Advanced multi-user access, team management features, and collaborative workflows for your entire organization</p>
          </div>

          <div className="text-center group">
            <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-indigo-100 transition-colors duration-200">
              <MessageSquare className="w-8 h-8 text-indigo-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900">Dedicated Support</h3>
            <p className="text-gray-600 leading-relaxed">Priority support, personalized onboarding, and dedicated account management to ensure your success</p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/50 backdrop-blur-sm border border-gray-200 rounded-3xl p-8 lg:p-12 shadow-lg">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Ready to Get Started?
              </h2>
              <p className="text-gray-600">
                Fill out the form below and our sales team will get back to you within 24 hours.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Your Name *</label>
                  <Input
                    name="name"
                    placeholder="Enter your full name"
                    onChange={handleChange}
                    required
                    className="h-12 rounded-xl border-gray-200 focus:border-indigo-300 focus:ring-indigo-200"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Work Email *</label>
                  <Input
                    name="email"
                    type="email"
                    placeholder="you@company.com"
                    onChange={handleChange}
                    required
                    className="h-12 rounded-xl border-gray-200 focus:border-indigo-300 focus:ring-indigo-200"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Company Name *</label>
                  <Input
                    name="company"
                    placeholder="Your company name"
                    onChange={handleChange}
                    required
                    className="h-12 rounded-xl border-gray-200 focus:border-indigo-300 focus:ring-indigo-200"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Phone Number *</label>
                  <Input
                    name="phone"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    onChange={handleChange}
                    required
                    className="h-12 rounded-xl border-gray-200 focus:border-indigo-300 focus:ring-indigo-200"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Team Size *</label>
                <Select
                  name="teamSize"
                  onValueChange={(value: string) => handleChange({
                    target: { name: 'teamSize', value }
                  } as SelectChangeEvent)}
                >
                  <SelectTrigger className="h-12 rounded-xl border-gray-200 focus:border-indigo-300 focus:ring-indigo-200">
                    <SelectValue placeholder="Select your team size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-10">1-10 employees</SelectItem>
                    <SelectItem value="11-50">11-50 employees</SelectItem>
                    <SelectItem value="51-200">51-200 employees</SelectItem>
                    <SelectItem value="201+">201+ employees</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Tell us about your needs *</label>
                <Textarea
                  name="message"
                  placeholder="What are your goals? How can we help you achieve them? Any specific requirements or questions?"
                  onChange={handleChange}
                  required
                  className="h-32 rounded-xl border-gray-200 focus:border-indigo-300 focus:ring-indigo-200 resize-none"
                />
              </div>

              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-14 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                      Sending Your Request...
                    </>
                  ) : (
                    <>
                      Contact Sales Team
                      <span className="ml-2">→</span>
                    </>
                  )}
                </Button>
              </div>

              <p className="text-center text-sm text-gray-500 mt-4">
                We'll get back to you within 24 hours. No spam, ever.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

// CompactSalesContact component redesigned as a modern CTA
const CompactSalesContact: React.FC = () => {
  return (
    <div className="py-16 sm:py-20">
      <div className="mx-auto max-w-4xl px-6 lg:px-8">
        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-3xl p-12 lg:p-16 text-center border border-indigo-100">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-pink-500/5"></div>

          <div className="relative">
            <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-8">
              <Building2 className="h-8 w-8 text-indigo-600" />
            </div>

            <h3 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6 tracking-tight">
              Get 10x More Leads, Followers and Visibility
            </h3>

            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              Unlock enterprise features, priority support, and dedicated account management to supercharge your social media presence
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/contact-sales">
                <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold px-8 py-4 h-14 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105">
                  Contact Sales Team
                  <span className="ml-2">→</span>
                </Button>
              </Link>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>Free consultation • No commitment</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


export { SalesContactForm, CompactSalesContact };