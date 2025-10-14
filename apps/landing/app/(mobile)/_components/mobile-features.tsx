// app/components/features.tsx
import React from 'react';
import Image from 'next/image';
import { Star, Shield, Sparkles, Rocket, MessageCircle, Settings } from 'lucide-react';

interface FeatureProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  subFeatures?: string[];
}

const Feature = ({ icon, title, description, subFeatures }: FeatureProps) => {
  return (
    <div className="w-full md:w-1/2 lg:w-1/3 p-4">
      <div className="relative h-full p-6 bg-gray-50 rounded-2xl border border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="text-emerald-600">
            {icon}
          </div>
          <h3 className="font-cal text-xl font-semibold text-gray-900">{title}</h3>
        </div>
        <p className="text-gray-600 mb-4">{description}</p>
        {subFeatures && (
          <ul className="space-y-2">
            {subFeatures.map((feature, index) => (
              <li key={index} className="flex items-start gap-2">
                <div className="mt-1 w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-sm text-gray-600">{feature}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

const MobileFeatures = () => {
  const features = [
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Privacy First",
      description: "Your data stays on your device. We never store your API keys or social accounts.",
      subFeatures: [
        "One-time payment, no subscriptions",
        "All processing happens on device",
        "Secure and private by design"
      ]
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: "AI Personalities",
      description: "Create and customize AI personalities to match your unique commenting style.",
      subFeatures: [
        "Multiple brand personalities",
        "Custom expert voices",
        "Tailored commenting styles"
      ]
    },
    {
      icon: <Rocket className="w-6 h-6" />,
      title: "Viral Insights",
      description: "Predict content performance with AI-powered virality scoring.",
      subFeatures: [
        "Post performance predictions",
        "Engagement optimization",
        "Learning from trends"
      ]
    },
    {
      icon: <MessageCircle className="w-6 h-6" />,
      title: "Smart Comments",
      description: "Generate engaging comments in seconds that match your voice.",
      subFeatures: [
        "Quick comment generation",
        "Voice-matched responses",
        "Context-aware replies"
      ]
    },
    {
      icon: <Star className="w-6 h-6" />,
      title: "Premium AI Models",
      description: "Choose from leading AI models for the best commenting experience.",
      subFeatures: [
        "Multiple AI model options",
        "Local and cloud processing",
        "Regular model updates"
      ]
    },
    {
      icon: <Settings className="w-6 h-6" />,
      title: "Custom Actions",
      description: "Create personalized actions for your unique engagement needs.",
      subFeatures: [
        "Customizable workflows",
        "Quick action presets",
        "Flexible automation"
      ]
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-cal text-4xl md:text-5xl font-semibold text-gray-900 mb-4">
            What Makes Olly Unique?
          </h2>
          <p className="text-xl text-gray-600">
            Powerful features to amplify your social presence
          </p>
        </div>
        
        <div className="flex flex-wrap -m-4">
          {features.map((feature, index) => (
            <Feature
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              subFeatures={feature.subFeatures}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default MobileFeatures;