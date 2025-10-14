import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@repo/ui/components/ui/accordion";

const FAQComponent = () => {
  const faqs = [
    {
      question: "What is your refund policy?",
      answer: "We offer a 7-day, no-questions-asked refund policy. If you're not satisfied with our service within the first 7 days of your purchase, we'll provide a full refund."
    },
    {
      question: "How does the free plan work?",
      answer: "Our free plan allows you to use basic features of Olly, including 5 AI-generated comments per day. It's a great way to get started and see how Olly can help amplify your social media presence."
    },
    {
      question: "Can I switch between plans?",
      answer: "Yes, you can upgrade or downgrade your plan at any time. If you upgrade, you'll have immediate access to the new features. If you downgrade, the changes will take effect at the start of your next billing cycle."
    },
    {
      question: "Do you offer discounts for non-profits or educational institutions?",
      answer: "Yes, we offer special pricing for non-profits and educational institutions. Please contact our sales team at support@explainx.ai for more information."
    },
    {
      question: "How does the AI comment generation work?",
      answer: "Olly uses advanced AI models to generate contextually relevant comments based on the content of the social media post. You can customize the tone and style of these comments to match your brand voice."
    }
  ];

  return (
    <div className="py-12">
      <h2 className="text-3xl font-bold text-center mb-6">Frequently Asked Questions</h2>
      <Accordion type="single" collapsible className="w-full max-w-2xl mx-auto">
        {faqs.map((faq, index) => (
          <AccordionItem key={index} value={`item-${index}`}>
            <AccordionTrigger>{faq.question}</AccordionTrigger>
            <AccordionContent>{faq.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default FAQComponent;