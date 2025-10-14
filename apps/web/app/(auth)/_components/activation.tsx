import React, { useState } from 'react';
import { Button } from "@repo/ui/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import Image from "next/image";
import { Chrome, Key, HelpCircle, Play } from 'lucide-react';

export default function ActivationGuide() {
  const [showVideo, setShowVideo] = useState(false);

  const handleAddToChrome = () => {
    window.open("https://chromewebstore.google.com/detail/olly-ai-assistant-for-soc/ofjpapfmglfjdhmadpegoeifocomaeje", "_blank");
  };

  const handleGetLicense = () => {
    window.open("https://olly-ai.lemonsqueezy.com/buy/fa11a2cb-4f49-4959-a95a-215b29c51e89", "_blank");
  };

  const handleVideoPlay = () => {
    setShowVideo(true);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-12">Get Started with Olly</h1>
      
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <Card className="flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl">
              <Chrome className="mr-3 h-8 w-8" />
              Step 1: Add Olly to Chrome
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col justify-end">
            <p className="mb-6 text-lg">Install the Olly extension to your Chrome browser to get started.</p>
            <Button onClick={handleAddToChrome} className="w-full py-6 text-lg">
              Add to Chrome
            </Button>
          </CardContent>
        </Card>

        <Card className="flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl">
              <Key className="mr-3 h-8 w-8" />
              Looking for Advanced Analytics?
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col justify-end">
            <p className="mb-6 text-lg">Activate Olly with a license key to unlock all features.</p>
            <Button onClick={handleGetLicense} className="w-full py-6 text-lg">
              Get License Key
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-12">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl">
            <HelpCircle className="mr-3 h-8 w-8" />
            How to Use Olly
          </CardTitle>
        </CardHeader>
        <CardContent>
          {showVideo ? (
            <div className="aspect-w-16 aspect-h-9 h-[600px]">
              <iframe
                src="https://www.youtube.com/embed/878N5HT68g0"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              ></iframe>
            </div>
          ) : (
            <div className="relative h-[600px]">
              <Image
                src="/how-to-use.jpg"
                alt="How to use Olly"
                layout="fill"
                objectFit="cover"
                className="rounded-lg shadow-md cursor-pointer"
                onClick={handleVideoPlay}
              />
              <Button
                onClick={handleVideoPlay}
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full p-4 bg-white bg-opacity-75 hover:bg-opacity-100 transition-all duration-300"
                aria-label="Play video"
              >
                <Play className="h-12 w-12 text-blue-600" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="text-center text-gray-600">
        <p className="text-lg">
          If you have any questions, please reach out to us at{' '}
          <a href="mailto:support@explainx.ai" className="text-blue-600 hover:underline">
            support@explainx.ai
          </a>
          .
        </p>
      </div>
    </div>
  );
}