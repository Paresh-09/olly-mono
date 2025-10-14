'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Zap, Target, BarChart, Star, Building, Lightbulb } from 'lucide-react';

const personas = [
  {
    role: 'Sales Manager',
    metric: '2x',
    text: 'more successful',
    detail: 'close more deals',
    icon: <BarChart className="w-12 h-12 text-teal-500" />,
  },
  {
    role: 'Solopreneur',
    metric: '5x',
    text: 'more successful',
    detail: 'grow with fewer resources',
    icon: <Zap className="w-12 h-12 text-teal-500" />,
  },
  {
    role: 'Social Media Manager',
    metric: '10x',
    text: 'more effective',
    detail: 'build a meaningful audience',
    icon: <Target className="w-12 h-12 text-teal-500" />,
  },
  {
    role: 'Content Creator',
    metric: '5x',
    text: 'more productive',
    detail: 'make viral worthy content',
    icon: <Star className="w-12 h-12 text-teal-500" />,
  },
  {
    role: 'Marketing Lead',
    metric: '3x',
    text: 'better results',
    detail: 'driving conversions',
    icon: <Lightbulb className="w-12 h-12 text-teal-500" />,
  },
  {
    role: 'Agency Owner',
    metric: '10x',
    text: 'more effective',
    detail: 'handle more clients, with a smaller team',
    icon: <Building className="w-12 h-12 text-teal-500" />,
  },
];

export const PaysItself = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % personas.length);
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-16 md:py-24 bg-transparent  from-slate-50 via-white to-teal-50">
      <div className="container max-w-7xl mx-auto px-4">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-cal mb-6 text-gray-900">
            Transform your{' '}
            <span className="text-teal-600 relative">
              potential
              <svg
                className="absolute -bottom-2 left-0 w-full h-2"
                viewBox="0 0 200 12"
              >
                <path
                  d="M2 6c50-3 100-3 150 0"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  className="text-teal-400"
                />
              </svg>
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Don't wait years or months to see results.
            <span className="block mt-2 text-2xl font-semibold text-teal-600">
              Start transforming in days.
            </span>
          </p>
        </div>

        {/* Grid Layout */}
        <div className="grid lg:grid-cols-3 gap-8 items-center">
          {/* Left - Static Content */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <Zap className="w-12 h-12 text-teal-500 mb-3" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Instant Impact
              </h3>
              <p className="text-gray-600">
                See measurable results from day one
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <Target className="w-12 h-12 text-teal-500 mb-3" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Tailored Growth
              </h3>
              <p className="text-gray-600">
                Customized strategies for your role
              </p>
            </div>
          </div>

          {/* Center - Dynamic Content */}
          <div className="lg:col-span-1 relative">
            <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-3xl p-8 text-white shadow-2xl transform hover:scale-105 transition-transform duration-300">
              <AnimatePresence mode="wait">
                <motion.div
                  key={current}
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: -20 }}
                  transition={{ duration: 0.5, ease: 'easeInOut' }}
                  className="text-center"
                >
                  <div className="text-6xl mb-4">
                    {personas[current].icon}
                  </div>
                  <div className="text-5xl font-cal mb-3">
                    {personas[current].metric}
                  </div>
                  <div className="text-xl font-semibold mb-2 text-teal-100">
                    {personas[current].role}
                  </div>
                  <div className="text-lg opacity-90">
                    {personas[current].detail}
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Progress Indicators */}
              <div className="flex justify-center mt-6 space-x-2">
                {personas.map((_, index) => (
                  <div
                    key={index}
                    className={`h-2 w-8 rounded-full transition-all duration-300 ${index === current
                      ? 'bg-white'
                      : 'bg-white/30'
                      }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Right - Additional Content */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <BarChart className="w-12 h-12 text-teal-500 mb-3" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Proven Results
              </h3>
              <p className="text-gray-600">
                Data-driven success across industries
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <Star className="w-12 h-12 text-teal-500 mb-3" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Real Stories
              </h3>
              <p className="text-gray-600">
                Join thousands of success stories
              </p>
            </div>
          </div>
        </div>

        {/* Testimonial Section */}
        <div className="mt-16 bg-white rounded-3xl p-8 shadow-xl border border-gray-100 max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6 items-center">
            <div className="md:col-span-2">
              <div className="text-4xl text-teal-500 mb-4">"</div>
              <blockquote className="text-lg text-gray-700 italic leading-relaxed">
                Olly has been a game-changer for our LinkedIn engagement
                process. The results speak for themselves.
              </blockquote>
              <div className="mt-4 flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center text-white font-semibold">
                  VS
                </div>
                <div>
                  <cite className="text-gray-900 font-semibold text-lg">
                    Vijay Sood
                  </cite>
                  <p className="text-gray-600">Swift Propel</p>
                </div>
              </div>
            </div>
            <div className="md:col-span-1 text-center">
              <div className="text-3xl font-cal text-teal-600 mb-2">
                2,500+
              </div>
              <p className="text-gray-600 font-medium">Happy Users</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};