"use client";
import React from 'react';
import { Check, Instagram, Facebook, Linkedin, Music, Twitter } from 'lucide-react';

const supportedPlatforms = [
    {
        name: "Instagram",
        growth: "245% PROFILE GROWTH",
        platformIcon: Instagram,
    },
    {
        name: "Facebook",
        growth: "198% ENGAGEMENT UP",
        platformIcon: Facebook,
    },
    {
        name: "LinkedIn",
        growth: "289% REACH INCREASE",
        platformIcon: Linkedin,
    },
    {
        name: "TikTok",
        growth: "412% FOLLOWER BOOST",
        platformIcon: Music,
    },
    {
        name: "X (Twitter)",
        growth: "176% VISIBILITY BOOST",
        platformIcon: Twitter,
    }
];

const features = [
    "Real-time growth tracking across all platforms",
    "AI-powered content optimization & viral predictions",
    "Advanced analytics dashboard with detailed insights"
];

export default function PlatformGrowthSection() {
    const getPlatformBadgeColor = (name: string) => {
        switch (name) {
            case 'Instagram':
                return 'bg-gradient-to-r from-purple-500 to-pink-500 text-white';
            case 'Facebook':
                return 'bg-blue-600 text-white';
            case 'LinkedIn':
                return 'bg-blue-700 text-white';
            case 'TikTok':
                return 'bg-gradient-to-r from-pink-500 to-red-500 text-white';
            case 'X (Twitter)':
                return 'bg-black text-white';
            default:
                return 'bg-gray-600 text-white';
        }
    };

    return (
        <div className="bg-gradient-to-br from-teal-200 via-teal-300 to-teal-400 py-16 sm:py-24 rounded-3xl mx-4 sm:mx-8 my-12">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

                    {/* Left Content */}
                    <div className="space-y-8">
                        {/* Main Heading */}
                        <div className="space-y-4">
                            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 leading-tight">
                                Explosive Growth Across All Major Platforms
                            </h2>

                            <p className="text-base sm:text-lg text-gray-800 leading-relaxed max-w-lg">
                                Watch your social media presence explode with our AI-powered optimization. Track real-time analytics, growth insights, and viral predictions across Instagram, Facebook, LinkedIn, TikTok, and X.
                            </p>
                        </div>

                        {/* Feature List */}
                        <div className="space-y-4">
                            {features.map((feature, index) => (
                                <div key={index} className="flex items-start gap-3">
                                    <div className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mt-0.5">
                                        <Check className="w-4 h-4 text-white" />
                                    </div>
                                    <p className="text-gray-900 text-base font-medium">{feature}</p>
                                </div>
                            ))}
                        </div>

                        {/* CTA with Pricing */}
                        <div className="space-y-3">
                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-bold text-gray-900">Plans start at $49.99</span>
                                <span className="text-gray-800">/ user</span>
                            </div>
                            <button
                                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors duration-200 h-9 px-4 py-2 text-white"
                                style={{ backgroundColor: '#0C9488' }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0a7a70'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0C9488'}
                                onClick={() => window.location.href = '/signup'}
                            >
                                Start Growing Today
                            </button>
                        </div>
                    </div>

                    {/* Right Content - Platform Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                        {supportedPlatforms.map((platform, index) => {
                            const IconComponent = platform.platformIcon;
                            return (
                                <div
                                    key={platform.name}
                                    className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
                                >
                                    <div className="flex flex-col items-center text-center space-y-3">
                                        {/* Platform Icon */}
                                        <div className={`w-14 h-14 rounded-full flex items-center justify-center ${getPlatformBadgeColor(platform.name)} shadow-lg`}>
                                            <IconComponent className="w-7 h-7" />
                                        </div>

                                        {/* Platform Info */}
                                        <div className="space-y-1">
                                            <h3 className="font-bold text-gray-900 text-sm">
                                                {platform.name}
                                            </h3>
                                            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                                                {platform.growth}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}