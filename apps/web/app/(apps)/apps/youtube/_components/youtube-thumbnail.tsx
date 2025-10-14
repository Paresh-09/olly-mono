"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@repo/ui/components/ui/button';
import { Input } from '@repo/ui/components/ui/input';
import { Textarea } from '@repo/ui/components/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@repo/ui/components/ui/select';
import { v4 as uuidv4 } from 'uuid';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@repo/ui/components/ui/card';
import { Label } from '@repo/ui/components/ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@repo/ui/components/ui/accordion';

const MAX_TITLE_LENGTH = 100;

const MAX_DESCRIPTION_LENGTH = 1000;

export default function YouTubeThumbnailGenerator() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [style, setStyle] = useState('realistic');
  const [mood, setMood] = useState('energetic');
  const [generatedThumbnail, setGeneratedThumbnail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState('');

  useEffect(() => {
    const storedUserId = localStorage.getItem('youtubeGeneratorUserId');
    if (storedUserId) {
      setUserId(storedUserId);
    } else {
      const newUserId = uuidv4();
      setUserId(newUserId);
      localStorage.setItem('youtubeGeneratorUserId', newUserId);
    }
  }, []);

  const generateThumbnail = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/openai/youtube', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title, 
          description, 
          style, 
          mood, 
          type: 'thumbnail', 
          userId 
        }),
      });
      const data = await response.json();
      if (data.error) {
        alert(data.error);
      } else {
        setGeneratedThumbnail(data.thumbnail);
      }
    } catch (error) {
      console.error('Error generating thumbnail:', error);
      alert('Failed to generate thumbnail. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTitleChange = (e: any) => {
    const newTitle = e.target.value.slice(0, MAX_TITLE_LENGTH);
    setTitle(newTitle);
  };

  const handleDescriptionChange = (e: any) => {
    const newDescription = e.target.value.slice(0, MAX_DESCRIPTION_LENGTH);
    setDescription(newDescription);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Create Your Thumbnail</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Video Title ({title.length}/{MAX_TITLE_LENGTH})</Label>
            <Input 
              id="title"
              placeholder="Enter video title" 
              value={title} 
              onChange={handleTitleChange} 
              maxLength={MAX_TITLE_LENGTH}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Video Description ({description.length}/{MAX_DESCRIPTION_LENGTH})</Label>
            <Textarea 
              id="description"
              placeholder="Enter video description" 
              value={description} 
              onChange={handleDescriptionChange} 
              maxLength={MAX_DESCRIPTION_LENGTH}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="style">Style</Label>
              <Select value={style} onValueChange={setStyle}>
                <SelectTrigger id="style">
                  <SelectValue placeholder="Select style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="realistic">Realistic</SelectItem>
                  <SelectItem value="cartoon">Cartoon</SelectItem>
                  <SelectItem value="minimalist">Minimalist</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="mood">Mood</Label>
              <Select value={mood} onValueChange={setMood}>
                <SelectTrigger id="mood">
                  <SelectValue placeholder="Select mood" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="energetic">Energetic</SelectItem>
                  <SelectItem value="calm">Calm</SelectItem>
                  <SelectItem value="mysterious">Mysterious</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={generateThumbnail} disabled={isLoading} className="w-full">
            {isLoading ? 'Generating...' : 'Generate Thumbnail'}
          </Button>
        </CardFooter>
      </Card>
      
      {generatedThumbnail && (
        <Card>
          <CardContent className="pt-6">
            <Image src={generatedThumbnail} alt="Generated Thumbnail" width={1280} height={720} className="w-full rounded-lg shadow-md" />
          </CardContent>
          <CardFooter>
            <Button onClick={() => window.open(generatedThumbnail, '_blank')} className="w-full">
              Download Thumbnail
            </Button>
          </CardFooter>
        </Card>
      )}

      <BenefitSection />
      <FAQSection />
    </div>
  );
}

function BenefitSection() {
  const benefits = [
    { title: "Eye-catching Designs", description: "Create visually appealing thumbnails that stand out in search results." },
    { title: "Time-saving", description: "Generate professional-looking thumbnails in seconds, not hours." },
    { title: "Customizable", description: "Tailor your thumbnails to match your brand and video content." },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Benefits of Our Thumbnail Generator</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3">
          {benefits.map((benefit, index) => (
            <div key={index} className="space-y-2">
              <h3 className="font-semibold">{benefit.title}</h3>
              <p className="text-sm text-gray-600">{benefit.description}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function FAQSection() {
  const faqs = [
    {
      question: 'How does the AI create thumbnails?',
      answer: 'Our AI uses your video title, description, style preference, and mood to generate a custom prompt. This prompt is then used to create a unique thumbnail image tailored to your content.',
    },
    {
      question: 'Can I customize the generated thumbnails?',
      answer: 'Yes, you can influence the thumbnail generation by providing a detailed title and description, and selecting your preferred style and mood. However, for direct editing, you\'ll need to download the image and use an external editor.',
    },
    {
      question: 'Are the generated thumbnails copyright-free?',
      answer: 'Yes, all thumbnails generated by our AI are copyright-free and can be used for your YouTube videos without any licensing concerns.',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Frequently Asked Questions</CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger>{faq.question}</AccordionTrigger>
              <AccordionContent>{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}