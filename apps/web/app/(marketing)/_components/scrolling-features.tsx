"use client";

import React, { useEffect, useState, useRef } from "react";
// Standard framer-motion imports (modern versions handle tree-shaking automatically)
import { motion, useScroll, useTransform } from "framer-motion";
// Import from shared icons barrel
import {
    Search,
    Users,
    Workflow,
    BarChart,
    Network,
    TrendingUp,
    DollarSign,
    Sparkles,
    Database,
    Orbit,
    MessageCircle,
    Bot,
    Hash,
    MessageSquare,
    Monitor,
    CalendarDays,
    MousePointer2Icon,
    LayoutPanelLeftIcon,
    SmileIcon,
    ChartAreaIcon,
    Layers2Icon
} from "./shared-icons";
import OllyComponent from './sample-olly';
import CommentPanel from './comment-panel';
import LazyVideo from './lazy-video';

export function ScrollingFeatures() {
    const [activeSection, setActiveSection] = useState(0);

    const handleSectionChange = (newSection: number) => {
        setActiveSection(newSection);
    };

    const sections = [
        {
            number: "01",
            title: "AI Assistant",
            subtitle: "Scale your engagement effortlessly",
            description: "Set your preferences once and let AI handle your social media engagement. Auto-comment on relevant posts while maintaining your unique voice.",
            component: <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg relative w-full h-full">
                <LazyVideo
                    src="/features/new/01.webm"
                    className="w-full h-full object-cover rounded-lg"
                    ariaLabel="AI Assistant demo video"
                />
            </div>,
            features: [
                {
                    name: "Smart Keyword Selection ",
                    description: "Select keywords and topics that match your expertise and interests for targeted engagement.",
                    icon: Bot,
                },
                {
                    name: "Intelligent Distribution",
                    description: " Set your preferred engagement frequency and distribution to maintain a natural presence.",
                    icon: Sparkles,
                },
                {
                    name: "Real-time Monitoring ",
                    description: " Track and analyze your auto-commenting performance with detailed insights.",
                    icon: MessageCircle,
                },
            ]
        },
        {
            number: "02",
            title: "Quick Comments",
            subtitle: "Big deal for Agencies.",
            description: "Working with multiple brands? you can now create AI Personalities to match customer commenting style.",
            component: <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg relative w-full h-full">
                <LazyVideo
                    src="/features/new/02.webm"
                    className="w-full h-full object-cover rounded-lg"
                    ariaLabel="Quick Comments demo video"
                />
            </div>,
            features: [
                {
                    name: "Custom AI Personalities",
                    description: " Create AI Personalities with custom prompts for generating comments as various experts (e.g., digital marketing, e-commerce).",
                    icon: MousePointer2Icon,
                },
                {
                    name: "Olly for Agencies",
                    description: " Seamlessly work with multiple brands, vendors and much more.",
                    icon: Users,
                },
                {
                    name: "Quick and Easy",
                    description: " Select a post, choose an AI Personality, and generate a tailored comment in seconds.",
                    icon: LayoutPanelLeftIcon,
                },
            ],
        },
        {
            number: "03",
            title: "Auto Commenting",
            subtitle: "AI-Powered Comments in your browser.",
            description: "Generate dynamic comments in seconds, and in your own voice!",
            component: <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg relative w-full h-full">
                <LazyVideo
                    src="/features/new/03.webm"
                    className="w-full h-full object-cover rounded-lg"
                    ariaLabel="Auto Commenting demo video"
                />
            </div>,
            features: [
                {
                    name: "Takes a few seconds",
                    description: " Just select the post you want to comment on and generate a comment in seconds.",
                    icon: Hash,
                },
                {
                    name: "Use your own voice",
                    description: " Customise your commenting style one time and Olly will use it to generate comments in your voice.",
                    icon: CalendarDays,
                },
                {
                    name: "Learn from past comments",
                    description: " Olly learns from your past comments and improves the quality of comments over time.",
                    icon: BarChart,
                },
            ]
        },
        {
            number: "04",
            title: "AI Tasks",
            subtitle: "Predict what will work and what won't.",
            description: "Leverage the power of AI to predict what will go viral and what won't. Olly can generate virality scores for your and community posts.",
            component: <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg relative w-full h-full">
                <LazyVideo
                    src="/features/new/04.webm"
                    className="w-full h-full object-cover rounded-lg"
                    ariaLabel="AI Tasks demo video"
                />
            </div>,
            features: [
                {
                    name: "Post what works",
                    description: " Understand why certain posts go viral and predict what will work and what won't in seconds.",
                    icon: Database,
                },
                {
                    name: "Quality and Quantity",
                    description: " Generate more quality in quantity.",
                    icon: Orbit,
                },
                {
                    name: "Learn with every post",
                    description: " Learn why certain posts go viral and which ones don't and why.",
                    icon: CalendarDays,
                },
            ]
        },
        {
            number: "05",
            title: "Custom Comment Panels",
            subtitle: "One click commenting",
            description: "Effortlessly engage on social platforms with customized comment panels, offering one-click commenting for a variety of styles and tones. Currently only supported for LinkedIn. On roadmap: X, Facebook, Instagram.",
            component: <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg relative w-full h-full">
                <LazyVideo
                    src="/features/new/05.webm"
                    className="w-full h-full object-cover rounded-lg"
                    ariaLabel="Custom Comment Panels demo video"
                />
            </div>,
            features: [
                {
                    name: "Custom Comment Panels ",
                    description: " View a set of pre-defined comment styles directly on social media sites for quick access.",
                    icon: Bot,
                },
                {
                    name: "One-Click Commenting",
                    description: " Generate and post comments with a single click, without needing to select text first.",
                    icon: Sparkles,
                },
                {
                    name: "Tailored Suggestions",
                    description: " Get AI-powered comment suggestions based on the content and your preferred style.",
                    icon: MessageCircle,
                },
            ]
        },
        {
            number: "06",
            title: "Bring your own LLM",
            subtitle: "Flexibly choose between local and popular AI Models of your choice.",
            description: "We support local models powered by Ollama, and vendors like OpenAI, Claude, Gemini, Straico, OpenRouter, and more.",
            component: <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg relative w-full h-full">
                <LazyVideo
                    src="/features/new/06.webm"
                    className="w-full h-full object-cover rounded-lg"
                    ariaLabel="Bring your own LLM demo video"
                />
            </div>,
            features: [
                {
                    name: "Free forever LLM",
                    description: " Integration You can integrate Olly with latest models like Llama 3.1, 3, 2, Gemma 2 and more via Ollama",
                    icon: DollarSign,
                },
                {
                    name: "Choose from Paid vendors ",
                    description: "Choose from GPT-3.5, 4o, o1, or Claude 3.5 Sonnet, or Gemini 1.5 or Straico or OpenRouter, works just like you would like it to.",
                    icon: SmileIcon,
                },
                {
                    name: "Extensive guides & videos",
                    description: " We have extensive guides and docs to help you through the integration and updates.",
                    icon: MessageCircle,
                },
            ]
        },
        {
            number: "07",
            title: "Custom Actions",
            subtitle: "Your style, your Prompt",
            description: "We support local models powered by Ollama, and vendors like OpenAI, Claude, Gemini, Straico, OpenRouter, and more.",
            component: <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg relative w-full h-full">
                <LazyVideo
                    src="/features/new/07.webm"
                    className="w-full h-full object-cover rounded-lg"
                    ariaLabel="Custom Actions demo video"
                />
            </div>,
            features: [
                {
                    name: "Take any action, anywhere.",
                    description: "You can now create your own actions by defining Prompts & Tasks for Olly and it will do your bidding.",
                    icon: ChartAreaIcon,
                },
                {
                    name: "Easily Customisable ",
                    description: " Once created, you can easily iterate over the action with various prompts to experiment what works best for you.",
                    icon: Layers2Icon,
                },
                {
                    name: "Default Actions Speed",
                    description: " is all in the World of Social Media, Olly enables you to set default custom actions so your tasks are a click away.",
                    icon: MessageCircle,
                },
            ]
        }
    ];

    return (
        <div className="text-black py-16 w-full">
            <div className="w-full px-4 md:px-8 lg:px-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full items-start">
                    {/* Left side - Navigation buttons */}
                    <div className="space-y-2">
                        <div className="bg-transparent rounded-lg p-6">
                            {sections.map((section, i) => (
                                <motion.div
                                    key={i}
                                    className={`rounded-lg cursor-pointer transition-all duration-300 mb-2 overflow-hidden ${activeSection === i
                                        ? 'bg-white shadow-lg border-2'
                                        : 'bg-transparent hover:bg-white/50'
                                        }`}
                                    style={{
                                        borderColor: activeSection === i ? "#0C9488" : "transparent"
                                    }}
                                    onClick={() => handleSectionChange(i)}
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.99 }}
                                >
                                    {/* Title Row - Always Visible */}
                                    <div className="flex items-center justify-between p-4">
                                        <div className="flex items-center space-x-4 flex-1">
                                            <div
                                                className="text-lg font-bold min-w-[2.5rem]"
                                                style={{
                                                    color: activeSection === i ? "#0C9488" : "#9CA3AF"
                                                }}
                                            >
                                                {section.number}
                                            </div>
                                            <h3 className="text-lg font-bold" style={{
                                                color: activeSection === i ? "#0C9488" : "#1F2937"
                                            }}>
                                                {section.subtitle}
                                            </h3>
                                        </div>
                                        <motion.div
                                            animate={{ rotate: activeSection === i ? 180 : 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center"
                                        >
                                            <svg
                                                className="w-3 h-3 text-gray-600"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </motion.div>
                                    </div>

                                    {/* Description - Expandable */}
                                    <motion.div
                                        initial={false}
                                        animate={{
                                            height: activeSection === i ? "auto" : 0,
                                            opacity: activeSection === i ? 1 : 0
                                        }}
                                        transition={{ duration: 0.3, ease: "easeInOut" }}
                                        className="overflow-hidden"
                                    >
                                        <div className="px-4 pb-4">
                                            <div className="h-px bg-gray-200 mb-3 ml-10"></div>
                                            <p className="text-gray-600 leading-6 ml-10">
                                                {section.description}
                                            </p>
                                        </div>
                                    </motion.div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Right side - Video display */}
                    <div className="lg:pl-8">
                        <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50 border border-gray-200">
                            {sections.map((section, i) => (
                                <motion.div
                                    key={i}
                                    className="absolute inset-0 w-full h-full"
                                    initial={{ opacity: 0 }}
                                    animate={{
                                        opacity: activeSection === i ? 1 : 0,
                                    }}
                                    transition={{ duration: 0.5, ease: "easeInOut" }}
                                >
                                    <div className="w-full h-full relative overflow-hidden rounded-2xl">
                                        {section.component}
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Active section features */}
                        <motion.div
                            className="mt-8"
                            key={activeSection}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        >
                            <dl className="space-y-6 text-base leading-7 text-gray-600">
                                {sections[activeSection].features.map((feature) => (
                                    <div key={feature.name} className="relative pl-9">
                                        <dt className="inline font-semibold text-gray-900">
                                            <feature.icon
                                                className="absolute left-1 top-1 h-5 w-5"
                                                style={{ color: "#0000EA" }}
                                                aria-hidden="true"
                                            />
                                            {feature.name}
                                        </dt>{" "}
                                        <dd className="inline">{feature.description}</dd>
                                    </div>
                                ))}
                            </dl>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}