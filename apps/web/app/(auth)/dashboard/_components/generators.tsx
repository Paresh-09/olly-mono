'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@repo/ui/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@repo/ui/components/ui/card";

const generators = [
  {
    title: 'Caption Generator',
    description: 'Create engaging captions for your social media posts',
    path: '/dashboard/caption-generator',
  },
  {
    title: 'Hashtag Generator',
    description: 'Generate relevant hashtags to increase your post visibility',
    path: '/dashboard/hashtag-generator',
  },
  {
    title: 'Post Generator',
    description: 'Create full social media posts tailored to your needs',
    path: '/dashboard/post-generator',
  },
];

export default function ContentGeneratorsList() {
  const router = useRouter();

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {generators.map((generator, index) => (
        <Card key={index} className="flex flex-col">
          <CardHeader>
            <CardTitle>{generator.title}</CardTitle>
            <CardDescription>{generator.description}</CardDescription>
          </CardHeader>
          <CardContent className="mt-auto">
            <Button 
              onClick={() => router.push(generator.path)} 
              className="w-full"
            >
              Use Generator
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}