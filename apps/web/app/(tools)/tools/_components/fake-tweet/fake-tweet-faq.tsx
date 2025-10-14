import React from 'react';
import { Card, CardContent } from '@repo/ui/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@repo/ui/components/ui/accordion";

const FakeTweetFAQ = () => {
  return (
    <Card className="mt-8 mb-8">
      <CardContent className="pt-6">
        <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>What is the purpose of this tool?</AccordionTrigger>
            <AccordionContent>
              This tool is designed for creating tweet mockups for legitimate purposes such as UI/UX design, presentations, educational content, and social media marketing materials. It is NOT intended for creating deceptive content or impersonating others.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2">
            <AccordionTrigger>Why is there an olly.social watermark on the downloaded images?</AccordionTrigger>
            <AccordionContent>
              The watermark helps identify that these are mockups created with our tool and not actual tweets. This promotes transparency and helps prevent misuse of the generated content.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3">
            <AccordionTrigger>What is your policy on fake tweets?</AccordionTrigger>
            <AccordionContent>
              We strictly prohibit the use of this tool for creating deceptive content, impersonating others, or spreading misinformation. The tool is intended for mockups and demonstrations only. Any misuse may result in account restrictions.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-4">
            <AccordionTrigger>What image format will I get when I download?</AccordionTrigger>
            <AccordionContent>
              The tweet mockup will be downloaded as a PNG image file with the olly.social watermark. This ensures high quality and transparency support for your designs.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-5">
            <AccordionTrigger>Can I customize all elements of the tweet?</AccordionTrigger>
            <AccordionContent>
              Yes, you can customize the profile picture, name, username, tweet content, attached images, timestamp, client information, and see engagement metrics in the preview. This allows for creating realistic mockups for your presentations or designs.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-6">
            <AccordionTrigger>Are the tweets posted to X (Twitter)?</AccordionTrigger>
            <AccordionContent>
              No, this tool only generates preview images. Nothing is ever posted to X (formerly Twitter) or any other social media platform. The tool is purely for creating visual mockups.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default FakeTweetFAQ; 