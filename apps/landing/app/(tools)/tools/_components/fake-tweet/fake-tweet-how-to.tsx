import React from 'react';
import { Card, CardContent } from '@repo/ui/components/ui/card';

const FakeTweetHowToUse = () => {
  return (
    <Card className="mt-8">
      <CardContent className="pt-6">
        <h2 className="text-2xl font-bold mb-4">How to Use</h2>
        <div className="space-y-4 text-gray-600">
          <div>
            <h3 className="font-semibold text-lg mb-2">1. Customize Profile</h3>
            <p>Upload a profile picture or use the default. Enter your desired display name and username (@handle).</p>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-2">2. Write Your Tweet</h3>
            <p>Type your tweet content in the message box. You have up to 280 characters to express yourself.</p>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-2">3. Preview</h3>
            <p>Check how your tweet looks in the preview section. The preview updates in real-time as you make changes.</p>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-2">4. Download</h3>
            <p>Once you're happy with your tweet, click the Download button to save it as an image file.</p>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-blue-800">
              <strong>Pro Tip:</strong> Use the Reset button to quickly start over with default values.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FakeTweetHowToUse; 