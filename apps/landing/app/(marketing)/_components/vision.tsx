import { motion } from 'framer-motion';
import Image from 'next/image';
import { Bot, Brain, Rocket } from 'lucide-react';

const milestones = [
  {
    date: "Jan 2024",
    title: "AI Extension",
    status: 'completed'
  },
  {
    date: "Oct 2024",
    title: "AI Assistant",
    status: 'upcoming'
  },
  {
    date: "2025",
    title: "Autonomous Agent",
    highlight: true,
    status: 'upcoming'
  }
];

const features = [
  {
    icon: Bot,
    title: "AI-Powered Automation",
    description: "Intelligent scheduling and posting across social platforms"
  },
  {
    icon: Brain,
    title: "Smart Engagement",
    description: "Context-aware commenting and meaningful interactions"
  },
  {
    icon: Rocket,
    title: "Full Autonomy",
    description: "Complete social media management with minimal intervention"
  }
];

export const Vision = () => {
  return (
    <section className="py-12 md:py-20 font-cal">
      <div className="container max-w-5xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-cal mb-3">Small Team, <span className="text-teal-600">Big Vision.</span></h2>
          <p className="text-lg text-gray-600">
            Building a <span className="font-semibold text-teal-600">fully autonomous AI agent</span> for social media.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-8 items-center mb-12">
          <div className="flex items-center gap-4">
            <Image
              src="/images/blog/yt.jpg"
              alt="Yash Thakker"
              width={80}
              height={80}
              className="rounded-full"
            />
            <div>
              <h3 className="font-cal text-lg">Yash Thakker</h3>
              <p className="text-gray-600">Founder, Olly.Social</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 justify-center">
            {milestones.map((milestone) => (
              <motion.div
                key={milestone.date}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`px-3 py-1.5 rounded-full ${
                  milestone.status === 'completed' 
                    ? 'bg-green-100 text-green-800' 
                    : milestone.highlight 
                      ? 'bg-teal-100 text-teal-800'
                      : 'bg-gray-100 text-gray-800'
                } text-sm`}
              >
                {milestone.date} - {milestone.title}
              </motion.div>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div key={feature.title} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <feature.icon className="w-6 h-6 text-teal-500 mb-3" />
              <h3 className="font-cal text-lg mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};