import React from 'react';
import { Card, CardContent } from '@repo/ui/components/ui/card';
import { Alert, AlertDescription } from '@repo/ui/components/ui/alert';
const FakeTweetPageIntroduction = () => {
  return (
    <Card className="mt-8">
      <CardContent className="pt-6">
        <h2 className="text-2xl font-bold mb-4">About Tweet Generator</h2>
        <Alert className="mb-6 bg-yellow-50 text-yellow-900 border-yellow-200">
          <AlertDescription>
            <strong>Important Notice:</strong> This tool is designed for creating tweet mockups for legitimate purposes such as presentations, UI designs, and educational content. We do not support or encourage the generation of fake tweets for impersonation, misinformation, or any malicious purposes.
          </AlertDescription>
        </Alert>
        <p className="text-gray-600 mb-4">
          Create professional tweet mockups for X (formerly Twitter) with our comprehensive tweet generator. Customize every aspect of your tweet preview:
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-600 mb-4">
          <li>Profile picture and display name</li>
          <li>Username (@handle)</li>
          <li>Tweet content with image support</li>
          <li>Customizable timestamp and client information</li>
          <li>Engagement metrics display</li>
          <li>Download as high-quality PNG with olly.social watermark</li>
        </ul>
        <p className="text-gray-600">
          Perfect for social media mockups, presentations, educational materials, and UI/UX design work.
        </p>
      </CardContent>
    </Card>
  );
};

export default FakeTweetPageIntroduction; 