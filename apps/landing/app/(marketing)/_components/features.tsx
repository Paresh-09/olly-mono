"use client";
import clsx from "clsx";
import {
  AirVent,
  AlignCenterHorizontalIcon,
  BarChart2Icon,
  Database,
  DollarSign,
  EyeIcon,
  GlobeIcon,
  LayoutPanelLeftIcon,
  LineChart,
  LucideIcon,
  MousePointer2Icon,
  MousePointerClickIcon,
  Music2,
  Orbit,
  SmileIcon,
  Sparkles,
  SparklesIcon,
  UsersIcon,
  Voicemail,
  Hash,
} from "lucide-react";
import Image from "next/image";

export function Features() {
  return (
    <div className="bg-gradient-to-br from-gray-50 via-white to-gray-50 py-16 sm:py-24 rounded-3xl mx-4 sm:mx-8 my-12" id="features">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-teal-50 text-teal-700 text-sm font-medium">
            🔒 Privacy first, always
          </div>

          {/* Main Heading */}
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
            Social Media,{' '}
            <span className="text-teal-600">on Steroids.</span>
          </h2>

          {/* Description */}
          <p className="text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
            We do not store your data on our servers. All data is stored locally
            on your computer. We have no access to your API key, social media accounts
            or emails.
          </p>
        </div>
      </div>
    </div>
  );
}

export function FeaturesWithImage(props: {
  imageSide: "left" | "right";
  title: string;
  subtitle: string;
  description: string;
  image: string;
  features: {
    name: string;
    description: string;
    icon: LucideIcon;
  }[];
  ctaText?: string;
}) {
  const isVideo = props.image.endsWith('.mp4');
  const dashboardUrl = process.env.NEXT_PUBLIC_DASHBOARD_URL || process.env.DASHBOARD_URL || "http://localhost:3000";

  return (
    <div className="py-12 sm:py-20">
      <div className="w-full">
        <div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            {/* Content Section */}
            <div
              className={clsx(
                "p-8 sm:p-12 lg:p-16 flex items-center",
                props.imageSide === "left" ? "lg:order-2" : "lg:order-1"
              )}
            >
              <div className="w-full space-y-6">
                {/* Badge */}
                <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-teal-50 text-teal-700 text-sm font-medium">
                  {props.title}
                </div>

                {/* Heading */}
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
                  {props.subtitle}
                </h3>

                {/* Description */}
                <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
                  {props.description}
                </p>

                {/* Features List */}
                <div className="space-y-4">
                  {props.features.map((feature) => (
                    <div key={feature.name} className="flex items-start gap-3 group">
                      <div className="flex-shrink-0 w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center group-hover:bg-teal-200 transition-colors duration-200">
                        <feature.icon className="w-4 h-4 text-teal-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 text-sm sm:text-base">
                          {feature.name}
                        </h4>
                        <p className="text-gray-600 text-sm sm:text-base mt-1">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                {props.ctaText && (
                  <div className="pt-4">
                    <button
                      className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 transition-colors duration-200"
                      onClick={() => window.location.href = `${dashboardUrl}/dashboard`}
                    >
                      {props.ctaText}
                      <span className="text-lg">→</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Image/Video Section */}
            <div
              className={clsx(
                "relative flex items-center justify-center",
                props.imageSide === "left" ? "lg:order-1" : "lg:order-2"
              )}
            >
              <div className="relative w-full h-full">
                {isVideo ? (
                  <video
                    className="w-full h-full object-contain"
                    autoPlay
                    loop
                    muted
                    playsInline
                  >
                    <source src={props.image} type="video/mp4" />
                  </video>
                ) : (
                  <Image
                    src={props.image}
                    alt="Feature illustration"
                    className="w-full h-full object-contain"
                    width={600}
                    height={400}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const featuresAutomations = [
  {
    name: "Free forever LLM Integration",
    description:
      "You can integrate Olly with latest models like Llama 3.1, 3, 2, Gemma 2 and more via Ollama",
    icon: DollarSign,
  },
  {
    name: "Choose from Paid vendors",
    description:
      "Choose from GPT-3.5, 4o, o1, or Claude 3.5 Sonnet, or Gemini 1.5 or Straico or OpenRouter, works just like you would like it to.",
    icon: SmileIcon,
  },
  {
    name: "Extensive guides & videos",
    description:
      "We have extensive guides and docs to help you through the integration and updates.",
    icon: AirVent,
  },
];

export function FeaturesAutomation() {
  return (
    <FeaturesWithImage
      imageSide="right"
      title="Support for local and popular AI Models 🛠️"
      subtitle="Flexibly choose between local and popular AI Models of your choice."
      description="We support local models powered by Ollama, and vendors like OpenAI, Claude, Gemini, Straico, OpenRouter, and more."
      image="/features/new/llms.mp4"
      features={featuresAutomations}
      ctaText="Start with your preferred model"
    />
  );
}

const featuresStats = [
  {
    name: "Post what works",
    description:
      "Understand why certain posts go viral and predict what will work and what won't in seconds.",
    icon: Sparkles,
  },
  {
    name: "Quality and Quantity",
    description:
      "Generate more quality in quantity.",
    icon: Database,
  },
  {
    name: "Learn with every post",
    description:
      "Learn why certain posts go viral and which ones don't and why.",
    icon: Orbit,
  },
];

export function FeaturesStats() {
  return (
    <FeaturesWithImage
      imageSide="right"
      title="Go Viral 🔥"
      subtitle="Predict what will work and what won't."
      description="Leverage the power of AI to predict what will go viral and what won't. Olly can generate virality scores for your and community posts."
      image="/features/new/virality.mp4"
      features={featuresStats}
      ctaText="Predict your next viral post"
    />
  );
}

const featuresUnsubscribe = [
  {
    name: "Takes a few seconds",
    description:
      "Just select the post you want to comment on and generate a comment in seconds.",
    icon: MousePointer2Icon,
  },
  {
    name: "Use your own voice",
    description:
      "Customise your commenting style one time and Olly will use it to generate comments in your voice.",
    icon: Music2,
  },
  {
    name: "Learn from past comments",
    description:
      "Olly learns from your past comments and improves the quality of comments over time.",
    icon: BarChart2Icon,
  },
];

export function FeaturesUnsubscribe() {
  return (
    <FeaturesWithImage
      imageSide="left"
      title="AI Commenter"
      subtitle="AI-Powered Comments in your browser."
      description="Generate dynamic comments in seconds, and in your own voice!"
      image="/features/new/ai-assistant.mp4"
      features={featuresUnsubscribe}
      ctaText="Try AI commenting now"
    />
  );
}

const featuresCustomPanels = [
  {
    name: "Custom Comment Panels",
    description:
      "View a set of pre-defined comment styles directly on social media sites for quick access.",
    icon: LayoutPanelLeftIcon,
  },
  {
    name: "One-Click Commenting",
    description:
      "Generate and post comments with a single click, without needing to select text first.",
    icon: MousePointerClickIcon,
  },
  {
    name: "Tailored Suggestions",
    description:
      "Get AI-powered comment suggestions based on the content and your preferred style.",
    icon: SparklesIcon,
  },
];

export function FeaturesCustomPanels() {
  return (
    <FeaturesWithImage
      imageSide="left"
      title="Custom Comment Panels 💬"
      subtitle="One click commenting"
      description="Effortlessly engage on social platforms with customized comment panels, offering one-click commenting for a variety of styles and tones. Currently only supported for LinkedIn. On roadmap: X, Facebook, Instagram"
      image="/features/new/comment-panels.mp4"
      features={featuresCustomPanels}
      ctaText="Set up your comment panels"
    />
  );
}

const featuresAiPersonalities = [
  {
    name: "Custom AI Personalities",
    description:
      "Create AI Personalities with custom prompts for generating comments as various experts (e.g., digital marketing, e-commerce).",
    icon: UsersIcon,
  },
  {
    name: "Olly for Agencies",
    description:
      "Seamlessly work with multiple brands, vendors and much more.",
    icon: GlobeIcon,
  },
  {
    name: "Quick and Easy",
    description:
      "Select a post, choose an AI Personality, and generate a tailored comment in seconds.",
    icon: MousePointer2Icon,
  },
];

export function FeaturesAiPersonalities() {
  return (
    <FeaturesWithImage
      imageSide="right"
      title="AI Personalities ✨"
      subtitle="Big deal for Agencies."
      description="Working with multiple brands? you can now create AI Personalities to match customer commenting style."
      image="/features/new/custom-personalities.mp4"
      features={featuresAiPersonalities}
      ctaText="Create your first AI personality"
    />
  );
}


const featuresCustomActions = [
  {
    name: "Take any action, anywhere.",
    description:
      "You can now create your own actions by defining Prompts & Tasks for Olly and it will do your bidding.",
    icon: AlignCenterHorizontalIcon,
  },
  {
    name: "Easily Customisable",
    description:
      "Once created, you can easily iterate over the action with various prompts to experiment what works best for you.",
    icon: SmileIcon,
  },
  {
    name: "Default Actions",
    description:
      "Speed is all in the World of Social Media, Olly enables you to set default custom actions so your tasks are a click away.",
    icon: AirVent,
  },
];

export function FeaturesCustomActions() {
  return (
    <FeaturesWithImage
      imageSide="left"
      title="Custom Actions 🏡"
      subtitle="Your style, your Prompt"
      description="We support local models powered by Ollama, and vendors like OpenAI, Claude, Gemini, Straico, OpenRouter, and more."
      image="/features/new/custom-actions.mp4"
      features={featuresCustomActions}
      ctaText="Build your custom action"
    />
  );
}

const featuresAutoCommenting = [
  {
    name: "Smart Keyword Selection",
    description:
      "Select keywords and topics that match your expertise and interests for targeted engagement.",
    icon: Hash,
  },
  {
    name: "Intelligent Distribution",
    description:
      "Set your preferred engagement frequency and distribution to maintain a natural presence.",
    icon: BarChart2Icon,
  },
  {
    name: "Real-time Monitoring",
    description:
      "Track and analyze your auto-commenting performance with detailed insights.",
    icon: EyeIcon,
  },
];

export function FeaturesAutoCommenting() {
  return (
    <FeaturesWithImage
      imageSide="left"
      title="Auto Commenting 🤖"
      subtitle="Scale your engagement effortlessly"
      description="Set your preferences once and let AI handle your social media engagement. Auto-comment on relevant posts while maintaining your unique voice."
      image="/features/new/auto-commenter.mp4"
      features={featuresAutoCommenting}
      ctaText="Configure auto-commenting"
    />
  );
}