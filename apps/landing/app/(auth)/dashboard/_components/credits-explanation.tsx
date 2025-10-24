import React from 'react';
import { Alert, AlertDescription } from '@repo/ui/components/ui/alert';

const CreditPurchaseParaExplanation = () => {
  return (
    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
      <Alert variant="default" className="mb-4 border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
        <AlertDescription className="text-sm text-blue-800 dark:text-blue-300">
          Your existing unlimited lifetime access remains unchanged. Credits are an additional feature.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div>
          <span className="font-medium text-gray-900 dark:text-gray-100">What's New?</span>{' '}
          <span className="text-gray-600 dark:text-gray-300">
            Credits offer an additional option for using LLMs with Olly while keeping your ability to use your own API keys.
          </span>
        </div>

        <div>
          <span className="font-medium text-gray-900 dark:text-gray-100">Why Credits?</span>{' '}
          <span className="text-gray-600 dark:text-gray-300">
            Many users wanted a simpler way to use Olly without managing API keys.
          </span>
        </div>

        <div>
          <span className="font-medium text-gray-900 dark:text-gray-100">What Do Credits Offer?</span>
          <ul className="list-disc pl-5 text-gray-600 dark:text-gray-300 mt-1">
            <li>Access to our LLM through Olly's API</li>
            <li>Use of dashboard tools like caption generators</li>
            <li>Upcoming: Brand voice feature</li>
          </ul>
        </div>

        <div>
          <span className="font-medium text-gray-900 dark:text-gray-100">How It Works:</span>{' '}
          <span className="text-gray-600 dark:text-gray-300">
            We don't store your API keys. We pay vendors as you use credits, ensuring a secure process.
          </span>
        </div>
      </div>
    </div>
  );
};

export default CreditPurchaseParaExplanation;