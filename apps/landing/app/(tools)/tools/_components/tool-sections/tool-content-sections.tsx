'use client'
import { FC } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@repo/ui/components/ui/accordion';
import Image from 'next/image';
import { ToolDetail } from '@/types/tool-details';
import { Button } from '@repo/ui/components/ui/button';

interface ToolContentSectionsProps {
  toolDetail: ToolDetail;
}

export const ToolContentSections: FC<ToolContentSectionsProps> = ({ toolDetail }) => {
  return (
    <div className="">
      <div className="w-full max-w-7xl mx-auto">
        {/* Header */}
        <section className="mb-12">
          <h1 className="text-3xl md:text-3xl font-bold mb-4">{toolDetail.name}</h1>

          {/* Tagline */}
          <h2 className="text-2xl md:text-2xl font-semibold mb-6">
            {toolDetail.tagline}
          </h2>

          {/* Long Description */}
          <div className="text-gray-700 text-lg space-y-4 mb-8">
            {toolDetail.longDescription.split('\n\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>

          {/* Testimonial */}
          {toolDetail.testimonial && (
            <blockquote className="border-l-4 border-blue-500 pl-4 italic my-8">
              <p className="text-gray-700">"{toolDetail.testimonial.quote}"</p>
              <footer className="text-black font-bold mt-2">– {toolDetail.testimonial.author}</footer>
            </blockquote>
          )}
        </section>

        {/* Features Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">{toolDetail.features.title}</h2>
          <ul className="space-y-4">
            {toolDetail.features.list.map((feature, index) => {
              // Split feature at the first colon if it exists
              const colonIndex = feature.indexOf(':');
              const featureTitle = colonIndex > 0 ? feature.substring(0, colonIndex) : '';
              const featureDesc = colonIndex > 0 ? feature.substring(colonIndex + 1) : feature;

              return (
                <li key={index} className="flex items-start gap-3">
                  <span className="text-blue-500 mt-1 flex-shrink-0">
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  <div>
                    {colonIndex > 0 ? (
                      <>
                        <span className="font-medium">{featureTitle}:</span>
                        <span className="text-gray-700">{featureDesc}</span>
                      </>
                    ) : (
                      <span>{feature}</span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        {/* How to Use Section - Visual Guide */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">{toolDetail.howToUse.title}</h2>

          {/* Text-based numbered steps (as a fallback or additional info) */}
          <ol className="space-y-6 mt-8">
            {toolDetail.howToUse.steps.map((step, index) => {
              // Split step at the first colon if it exists
              const colonIndex = step.indexOf(':');
              const stepTitle = colonIndex > 0 ? step.substring(0, colonIndex) : '';
              const stepDesc = colonIndex > 0 ? step.substring(colonIndex + 1) : step;

              return (
                <li key={index} className="flex items-start gap-4">
                  <span className="flex items-center justify-center bg-blue-500 text-white rounded-full h-7 w-7 mt-1 flex-shrink-0 font-bold">
                    {index + 1}
                  </span>
                  <div>
                    {colonIndex > 0 ? (
                      <>
                        <span className="font-medium">{stepTitle}:</span>
                        <span>{stepDesc}</span>
                      </>
                    ) : (
                      <span>{step}</span>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </section>

        {/* Use Cases Section */}
        <section className="mb-12">
          {/* Main image at top of benefits section (only if there's an image) */}
          {toolDetail.image && (
            <div className="relative w-full h-80 md:h-[600px] md:p-5 border-2 border-gray-300 mb-8 rounded-lg overflow-hidden">
              <Image
                src={toolDetail.image}
                alt={toolDetail.name || "Benefits"}
                fill
                className="object-fit p-5"
              />
            </div>
          )}

          {/* Benefits as cards without images */}
          <h2 className="text-2xl font-bold mb-6">{toolDetail.useCases.title}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {toolDetail.useCases.cases.map((useCase, index) => {
              // Define icons based on index (can be customized further based on useCase type)
              const icons = ["🔍", "📝", "📚", "📈", "⚡", "💡", "🔄", "📱"];
              const icon = icons[index % icons.length];

              return (
                <Card key={index} className="border border-gray-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <span className="text-blue-500 text-2xl">{icon}</span>
                      {useCase.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700">{useCase.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Best Practices Section */}
        {toolDetail.bestPractices && (
          <section className="bg-blue-50 p-8 rounded-xl mb-12">
            <h2 className="text-2xl font-bold mb-6">{toolDetail.bestPractices.title}</h2>
            <ul className="space-y-4">
              {toolDetail.bestPractices.practices.map((practice, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="text-blue-500 mt-1 flex-shrink-0">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </span>
                  <span>{practice}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* FAQ Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">{toolDetail.faqs.title}</h2>
          <Accordion type="single" collapsible className="w-full">
            {toolDetail.faqs.questions.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left font-medium py-4 text-gray-800 hover:text-blue-600">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="py-3 text-gray-700">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        {/* Call to Action */}
        {toolDetail.callToAction && (
          <Card className="shadow-lg">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">{toolDetail.callToAction.text}</h2>
              <Button
                onClick={() => {
                  window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                  });
                }}
                className="bg-blue-500 hover:bg-blue-600 text-white"
                aria-label="Go to top and use tool"
              >
                <span>{toolDetail.callToAction.buttonText}</span>
                <span className="text-xl">↑</span>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};