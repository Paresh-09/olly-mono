'use client';

import React from 'react';
import { Button } from '@repo/ui/components/ui/button';
import { Card } from '@repo/ui/components/ui/card';
import { ArrowRight, MessageSquare, Sparkles, Bot, FileText, Check } from 'lucide-react';
import Link from 'next/link';

const BrandPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-4">
        <div className="flex flex-col space-y-16">


          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            {/* Primary Card */}
            <div className="lg:col-span-7">
              <div className="bg-white rounded-3xl p-8 lg:p-12 shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-500 group">
                <div className="space-y-8">

                  <div className="space-y-6">
                    <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
                      Train Your Brand Voice
                    </h2>
                    <p className="text-lg text-gray-600 leading-relaxed font-light">
                      Build an AI model that understands your brand's unique personality, values, and communication style to ensure every message resonates with your audience.
                    </p>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-[#CBFBF1] rounded-xl flex items-center justify-center mt-1">
                        <Check className="w-5 h-5 text-[#0C9488]" />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-1">Define Brand Personality</h4>
                        <p className="text-gray-600 font-light">Create detailed profiles of your target audience and brand characteristics</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-[#CBFBF1] rounded-xl flex items-center justify-center mt-1">
                        <Check className="w-5 h-5 text-[#0C9488]" />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-1">Upload Brand Guidelines</h4>
                        <p className="text-gray-600 font-light">Import existing documents, style guides, and content samples</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-[#CBFBF1] rounded-xl flex items-center justify-center mt-1">
                        <Check className="w-5 h-5 text-[#0C9488]" />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-1">Generate Consistent Messaging</h4>
                        <p className="text-gray-600 font-light">Create content that perfectly matches your brand's voice and tone</p>
                      </div>
                    </div>
                  </div>

                  <Link href="/dashboard/brand/train">
                    <Button className="w-full h-14 mt-10 bg-[#0C9488] hover:bg-[#02C1C5] text-white font-semibold text-lg rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group">
                      Get Started Now
                      <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Feature Cards */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 group">
                <div className="flex items-start gap-5">
                  <div className="flex-shrink-0 w-14 h-14 bg-[#CBFBF1] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Bot className="h-7 w-7 text-[#0C9488]" />
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-xl font-bold text-gray-900">AI-Powered Responses</h3>
                    <p className="text-gray-600 leading-relaxed font-light">Generate responses that perfectly match your brand's unique voice and communication style.</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 group">
                <div className="flex items-start gap-5">
                  <div className="flex-shrink-0 w-14 h-14 bg-[#CBFBF1] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <MessageSquare className="h-7 w-7 text-[#0C9488]" />
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-xl font-bold text-gray-900">Consistent Communication</h3>
                    <p className="text-gray-600 leading-relaxed font-light">Maintain perfect brand consistency across all channels and touchpoints.</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 group">
                <div className="flex items-start gap-5">
                  <div className="flex-shrink-0 w-14 h-14 bg-[#CBFBF1] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <FileText className="h-7 w-7 text-[#0C9488]" />
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-xl font-bold text-gray-900">Import Your Content</h3>
                    <p className="text-gray-600 leading-relaxed font-light">Upload existing content and guidelines to train your brand's unique voice.</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl p-6 border border-blue-100 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-3">
                    <h3 className="text-xl font-bold text-gray-900">Need Guidance?</h3>
                    <p className="text-gray-600 font-light">Explore our comprehensive guide on creating effective brand voices.</p>
                  </div>
                  <Link href="https://docs.olly.social/docs/features/brand-voice" target="_blank">
                    <Button variant="outline" className="flex-shrink-0 bg-white hover:bg-gray-50 border-gray-200 font-semibold">
                      View Guide
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandPage;