import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@repo/ui/components/ui/alert';
import Link from 'next/link';

export default function ReleasesPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Olly Releases</h1>
      
      <Alert variant="destructive" className="mb-8">
        <AlertCircle className="h-4 w-4 mr-2" />
        <AlertDescription>
          Due to a technical issue with the Chrome Web Store, we&apos;re temporarily providing manual installation options. 
          Existing users are unaffected and can continue using Olly normally.
        </AlertDescription>
      </Alert>

      <div className="space-y-8">
        <div className="border rounded-lg p-6 bg-white shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Version 2.4.3.1</h2>
            <Link 
              href="/releases/olly_2_0-2.4.3.1.zip" 
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              download
            >
              Download
            </Link>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Manual Installation Instructions:</h3>
              <ol className="list-decimal list-inside space-y-2 ml-4">
                <li>Download the ZIP file using the button above</li>
                <li>Unzip the downloaded file to a folder on your computer</li>
                <li>Open Chrome and navigate to <code className="bg-gray-100 px-2 py-1 rounded">chrome://extensions</code></li>
                <li>Enable &quot;Developer mode&quot; using the toggle in the top-right corner</li>
                <li>Click &quot;Load unpacked&quot; button in the top-left</li>
                <li>Select the unzipped folder you created in step 2</li>
                <li>Olly should now be installed and ready to use!</li>
              </ol>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Important Notes:</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>This is a temporary solution while we resolve issues with the Chrome Web Store</li>
                <li>Your existing data and settings will be preserved if you&apos;re upgrading from a previous version</li>
                <li>We&apos;re working to return to the Chrome Web Store as soon as possible</li>
                <li>This version includes all the latest features and bug fixes</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
