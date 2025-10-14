import { NextPage } from 'next';
import { Metadata } from 'next';
import Head from 'next/head';
import { BarkToTextConverter } from '../../_components/bark-converter/bark-converter';
import { ToolReviewsSection } from '../_components/tool-reviews/review';

export const metadata: Metadata = {
  title: 'Bark to Text Converter - Convert Dog Barks to Text',
  description: 'Convert your dog\'s barks into text using advanced AI technology. Understand what your dog might be trying to communicate through their barks.',
  openGraph: {
    title: 'Bark to Text Converter | Convert Dog Barks to Text',
    description: 'Convert your dog\'s barks into text using advanced AI technology. Understand what your dog might be trying to communicate through their barks.',
    images: [
      {
        url: '/images/og/bark-to-text.png',
        width: 1200,
        height: 630,
        alt: 'Bark to Text Converter'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bark to Text Converter | Convert Dog Barks to Text',
    description: 'Convert your dog\'s barks into text using advanced AI technology. Understand what your dog might be trying to communicate through their barks.',
    images: ['/images/og/bark-to-text.png'],
  }
};

const BarkToTextPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Bark to Text Converter - Convert Dog Barks to Text</title>
        <meta 
          name="description" 
          content="Convert your dog's barks into text using advanced AI technology. Understand what your dog might be trying to communicate through their barks."
        />
      </Head>
            
      <div className="container py-12 mx-auto">
        <h1 className="text-4xl font-bold tracking-tight text-center mb-4">
          Bark to Text Converter
        </h1>
        <p className="text-lg text-muted-foreground text-center mx-auto mb-12">
          Convert your dog's barks into text using advanced AI technology. Understand what your dog might be trying to communicate through their barks.
        </p>
        
        <BarkToTextConverter />
        
        <div className="mt-16 l mx-auto">
          <h2 className="text-2xl font-semibold mb-4">How It Works</h2>
          <ol className="space-y-4 list-decimal list-inside">
            <li className="text-muted-foreground">
              <span className="font-medium text-foreground">Record or upload</span> - Record your dog's bark or upload an audio file
            </li>
            <li className="text-muted-foreground">
              <span className="font-medium text-foreground">Process the audio</span> - Our AI analyzes the bark patterns and frequencies
            </li>
            <li className="text-muted-foreground">
              <span className="font-medium text-foreground">Get the translation</span> - Receive a text interpretation of what your dog might be trying to communicate
            </li>
          </ol>
          
          <h2 className="text-2xl font-semibold mt-12 mb-4">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-2">Advanced AI Technology</h3>
              <p className="text-muted-foreground">Uses state-of-the-art AI models to analyze and interpret bark patterns.</p>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-2">Multiple Input Methods</h3>
              <p className="text-muted-foreground">Record directly in the browser or upload pre-recorded audio files.</p>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-2">Real-time Processing</h3>
              <p className="text-muted-foreground">Get instant translations of your dog's barks.</p>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-2">Detailed Analysis</h3>
              <p className="text-muted-foreground">Receive comprehensive interpretations including emotional context.</p>
            </div>
          </div>
          
          <h2 className="text-2xl font-semibold mt-12 mb-4">Tips for Best Results</h2>
          <div className="bg-gray-50 p-6 rounded-lg">
            <ul className="space-y-3 text-sm text-gray-700">
              <li>Record in a quiet environment to minimize background noise</li>
              <li>Ensure your dog is close enough to the microphone</li>
              <li>Record multiple barks for better context</li>
              <li>Try to capture the full bark sequence</li>
              <li>Use high-quality audio recording equipment when possible</li>
            </ul>
          </div>


          {/* //REVIEW */}
          <ToolReviewsSection
          productSlug="bark-to-text"
          title="Customer Reviews"
        />
        </div>
      </div>
    </>
  );
};

export default BarkToTextPage; 