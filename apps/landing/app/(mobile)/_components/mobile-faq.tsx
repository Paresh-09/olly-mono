// app/components/mobile-faq.tsx
import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@repo/ui/components/ui/accordion";
import Link from 'next/link';

const MobileFAQ = () => {
  const faqs = [
    {
      question: "Which platforms is Olly available on?",
      answer: "Olly is available for both iOS and Android devices. You can download it from the Apple App Store or Google Play Store."
    },
    {
      question: "How do I sign up for Olly?",
      answer: "Simply download the app from your device's app store and create an account. You can sign up using your email, Google account, or Apple ID."
    },
    {
      question: "Which social media platforms does Olly support?",
      answer: "Olly supports Facebook, LinkedIn, Instagram, Reddit, Twitter/X, Threads, YouTube, TikTok, and more. We're continuously adding support for new platforms based on user feedback."
    },
    {
      question: "Is Olly free to use?",
      answer: "Olly offers a free plan with basic features. Premium features are available through a one-time payment, giving you lifetime access to advanced features."
    },
    {
      question: "What AI models are supported by Olly?",
      answer: "Olly supports various AI models including GPT-3.5, GPT-4, Claude-3 models by Anthropic, Gemini models by Google, and open-source models. You can choose which model to use based on your needs."
    },
    {
      question: "How does Olly handle my data and privacy?",
      answer: "Your privacy is our priority. All data is processed locally on your device. We never store your API keys, social media accounts, or personal information on our servers."
    },
    {
      question: "Can I use Olly in my language?",
      answer: "Yes! Olly supports multiple languages including English, Spanish, French, German, Chinese, Japanese, Korean, Arabic, Hindi, and many more. The AI will generate comments in your chosen language."
    },
    {
      question: "How do I set up my AI model API key?",
      answer: "In the app settings, you can easily add your API keys for various AI providers. We provide step-by-step guides for setting up each supported AI model."
    },
    {
      question: "Does Olly work offline?",
      answer: "Olly requires an internet connection to generate AI-powered comments and analyze content. However, some features like saved drafts are available offline."
    },
    {
      question: "How much storage space does Olly use?",
      answer: "The app is lightweight, typically using less than 100MB of storage. Data usage depends on your activity and chosen AI models."
    },
    {
      question: "Can I customize the commenting style?",
      answer: "Yes! You can create custom AI personalities, set preferred tones, and save custom actions for quick access. This helps maintain consistent engagement across your social platforms."
    },
    {
      question: "How can I get support?",
      answer: (
        <span>
          For any questions or assistance, you can reach our support team at{' '}
          <Link href="mailto:support@olly.social" className="text-emerald-600 hover:text-emerald-700 underline">
            support@olly.social
          </Link>
        </span>
      )
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-cal text-4xl md:text-5xl font-semibold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-600">
            Everything you need to know about using Olly on mobile
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="border border-gray-200 rounded-lg bg-gray-50 px-4"
            >
              <AccordionTrigger className="text-left font-cal text-lg text-gray-900 hover:no-underline hover:text-emerald-600">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-gray-600">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default MobileFAQ;