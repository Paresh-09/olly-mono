"use client"
import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { FaYoutube, FaLinkedin, FaInstagram } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';

const creatorProfiles = {
    creators: [
        {
            name: "@goyashy",
            avatar: "/assets/avatar/3.webp",
            platform: "YouTube",
            followers: "10K FOLLOWERS ON YOUTUBE",
            platformIcon: "YouTube"
        },
        {
            name: "@PauldelaBaume",
            avatar: "/assets/avatar/1.webp",
            platform: "LinkedIn",
            followers: "21K FOLLOWERS ON LINKEDIN",
            platformIcon: "LinkedIn"
        },
        {
            name: "@yola_bastos",
            avatar: "/assets/avatar/2.webp",
            platform: "Instagram",
            followers: "14.6K FOLLOWERS ON INSTAGRAM",
            platformIcon: "Instagram"
        }
    ],
    smallBusinesses: [
        {
            name: "@techstartup_co",
            avatar: "/assets/avatar/4.webp",
            platform: "LinkedIn",
            followers: "45.2K FOLLOWERS ON LINKEDIN",
            platformIcon: "LinkedIn"
        },
        {
            name: "@localcafe_daily",
            avatar: "/assets/avatar/5.webp",
            platform: "Instagram",
            followers: "28.7K FOLLOWERS ON INSTAGRAM",
            platformIcon: "Instagram"
        },
        {
            name: "@designstudio_x",
            avatar: "/assets/avatar/6.webp",
            platform: "X",
            followers: "52.1K FOLLOWERS ON X",
            platformIcon: "X"
        }
    ],
    agencies: [
        {
            name: "@marketingpro_ag",
            avatar: "/assets/avatar/7.webp",
            platform: "LinkedIn",
            followers: "125K FOLLOWERS ON LINKEDIN",
            platformIcon: "LinkedIn"
        },
        {
            name: "@creativeagency",
            avatar: "/assets/avatar/8.webp",
            platform: "Instagram",
            followers: "89.3K FOLLOWERS ON INSTAGRAM",
            platformIcon: "Instagram"
        },
        {
            name: "@digitalexperts",
            avatar: "/assets/avatar/9.webp",
            platform: "X",
            followers: "97.5K FOLLOWERS ON X",
            platformIcon: "X"
        }
    ]
};

const contentByTab = {
    creators: {
        heading: "Supercharge Your Social Game",
        description: "Let AI be your creative sidekick! Instantly craft witty comments, generate scroll-stopping posts, and get smart insights to keep your followers hooked and your brand unforgettable.",
        features: [
            "AI-powered comments that sound just like you",
            "Smart content analysis & viral predictions",
            "Lightning-fast post ideas to keep you trending"
        ],
        bgColor: "bg-gradient-to-br from-teal-200 via-teal-300 to-teal-400"
    },
    smallBusinesses: {
        heading: "Grow Your Business, Effortlessly",
        description: "Unlock AI-driven engagement to boost your brand’s reach, attract new customers, and turn every interaction into an opportunity—all while saving time and energy.",
        features: [
            "Stand out with boosted profile visibility",
            "Personalized AI comments to spark conversations",
            "Instant replies that keep customers coming back"
        ],
        bgColor: "bg-gradient-to-br from-teal-200 via-teal-300 to-teal-400"
    },
    agencies: {
        heading: "Elevate Every Client’s Social Presence",
        description: "Juggle multiple accounts with ease! Use AI to deliver standout comments, deep-dive analytics, and seamless teamwork—so your agency shines and your clients win.",
        features: [
            "Effortless AI commenting across all clients",
            "Bulk analytics & easy-to-share reports",
            "Collaboration tools for unstoppable teams"
        ],
        bgColor: "bg-gradient-to-br from-teal-200 via-teal-300 to-teal-400"
    }
};

type TabKey = keyof typeof creatorProfiles;

export default function MidContentSection() {
    const [activeTab, setActiveTab] = useState<TabKey>('creators');
    const dashboardUrl = process.env.NEXT_PUBLIC_DASHBOARD_URL || process.env.DASHBOARD_URL || "http://localhost:3000";

    const currentContent = contentByTab[activeTab];

    const getPlatformBadgeColor = (platform: any) => {
        switch (platform) {
            case 'X':
                return 'bg-black text-white';
            case 'LinkedIn':
                return 'bg-blue-600 text-white';
            case 'Instagram':
                return 'bg-gradient-to-r from-purple-500 to-pink-500 text-white';
            case 'YouTube':
                return 'bg-red-600 text-white';
            default:
                return 'bg-gray-600 text-white';
        }
    };

    const getPlatformIcon = (platform: string) => {
        switch (platform) {
            case 'YouTube':
                return <FaYoutube className="w-4 h-4" />;
            case 'LinkedIn':
                return <FaLinkedin className="w-4 h-4" />;
            case 'Instagram':
                return <FaInstagram className="w-4 h-4" />;
            case 'X':
                return <FaXTwitter className="w-4 h-4" />;
            default:
                return null;
        }
    };

    return (
        <div className={`${currentContent.bgColor} py-16 sm:py-24 rounded-3xl mx-4 sm:mx-8 my-12 transition-all duration-500 ease-in-out`}>
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

                    {/* Left Content */}
                    <div className="space-y-8">
                        {/* Tab Navigation */}
                        <div className="w-full">
                            {/* Horizontal scroll on small screens, 3-column grid on sm+ */}
                            {/* Horizontal scroll on small screens, 3-column grid on sm+ */}
                            <div className="overflow-x-auto -mx-6 px-6 sm:mx-0 sm:px-0">
                                <div className="grid grid-flow-col auto-cols-max sm:grid-flow-row sm:grid-cols-3 gap-3">
                                    {Object.keys(creatorProfiles).map((tab) => (
                                        <button
                                            key={tab}
                                            onClick={() => setActiveTab(tab as TabKey)}
                                            className={`min-w-[160px] sm:min-w-0 px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-200 capitalize ${activeTab === tab
                                                ? 'bg-gray-800 text-white shadow-lg'
                                                : 'bg-white/80 text-gray-700 hover:bg-white hover:shadow-md'
                                                }`}
                                        >
                                            {tab === 'smallBusinesses' ? 'Small businesses' : tab}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Main Heading */}
                        <div className="space-y-4">
                            <h2 className="text-2xl sm:text-3xl  font-bold text-gray-900 leading-tight">
                                {currentContent.heading}
                                <br />
                            </h2>

                            <p className="text-base sm:text-lg text-gray-700 leading-relaxed max-w-lg">
                                {currentContent.description}
                            </p>


                        </div>

                        {/* Feature List */}
                        <div className="space-y-4">
                            {currentContent.features.map((feature, index) => (
                                <div key={index} className="flex items-start gap-3">
                                    <div className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mt-0.5">
                                        <Check className="w-4 h-4 text-white" />
                                    </div>
                                    <p className="text-gray-800 text-base font-medium">{feature}</p>
                                </div>
                            ))}
                        </div>
                        {/* Updated CTA button style and added onClick handler to navigate to signup */}
                        <button
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors duration-200 h-9 px-4 py-2 text-white"
                            style={{ backgroundColor: '#0C9488' }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0a7a70'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0C9488'}
                            onClick={() => window.location.href = `${dashboardUrl}/signup`}
                        >
                            Get Started Now
                        </button>
                    </div>

                    {/* Right Content - Profile Cards */}
                    <div className="flex gap-4 overflow-x-auto scrollbar-hide sm:grid sm:grid-cols-2 lg:grid lg:grid-cols-1 xl:grid xl:grid-cols-3 sm:gap-6">
                        {creatorProfiles[activeTab].map((profile, index) => (
                            <div
                                key={profile.name}
                                className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 min-w-[200px] sm:min-w-0 flex-shrink-0"
                            >
                                <div className="flex flex-col items-center text-center space-y-4">
                                    {/* Avatar with Platform Badge */}
                                    <div className="relative">
                                        <img
                                            src={profile.avatar}
                                            alt={profile.name}
                                            className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-lg"
                                        />
                                        <div className={`absolute -bottom-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${getPlatformBadgeColor(profile.platform)}`}>
                                            {getPlatformIcon(profile.platformIcon)}
                                        </div>
                                    </div>

                                    {/* Profile Info */}
                                    <div className="space-y-2">
                                        <h3 className="font-bold text-gray-900 text-base">
                                            {profile.name}
                                        </h3>
                                        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                                            {profile.followers}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}