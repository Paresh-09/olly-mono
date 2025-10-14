import { NextPage } from 'next';
import { Metadata } from 'next';
import Head from 'next/head';
import { TextToBarkConverter } from '../../_components/text-to-bark-converter/text-to-bark-converter';

export const metadata: Metadata = {
  title: 'Text to Bark Converter - Convert Text to Dog Bark Sounds',
  description: 'Convert your text into realistic dog bark sounds using advanced AI technology. Create custom bark sounds for your projects.',
  openGraph: {
    title: 'Text to Bark Converter | Convert Text to Dog Bark Sounds',
    description: 'Convert your text into realistic dog bark sounds using advanced AI technology. Create custom bark sounds for your projects.',
    images: [
      {
        url: '/images/og/text-to-bark.png',
        width: 1200,
        height: 630,
        alt: 'Text to Bark Converter'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Text to Bark Converter | Convert Text to Dog Bark Sounds',
    description: 'Convert your text into realistic dog bark sounds using advanced AI technology. Create custom bark sounds for your projects.',
    images: ['/images/og/text-to-bark.png'],
  }
};

const TextToBarkPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Text to Bark Converter - Convert Text to Dog Bark Sounds</title>
        <meta 
          name="description" 
          content="Convert your text into realistic dog bark sounds using advanced AI technology. Create custom bark sounds for your projects."
        />
      </Head>
            
      <div className="container py-12 mx-auto">
        <h1 className="text-4xl font-bold tracking-tight text-center mb-4">
          Text to Bark Converter
        </h1>
        <p className="text-lg text-muted-foreground text-center max-w-3xl mx-auto mb-12">
          Convert your text into realistic dog bark sounds using advanced AI technology. Create custom bark sounds for your projects.
        </p>
        
        <TextToBarkConverter />
        
        <div className="mt-16 max-w-3xl mx-auto">
          <h2 className="text-2xl font-semibold mb-4">How It Works</h2>
          <ol className="space-y-4 list-decimal list-inside">
            <li className="text-muted-foreground">
              <span className="font-medium text-foreground">Enter your text</span> - Type what you want to convert into a bark sound
            </li>
            <li className="text-muted-foreground">
              <span className="font-medium text-foreground">Choose bark style</span> - Select the type of bark you want to generate
            </li>
            <li className="text-muted-foreground">
              <span className="font-medium text-foreground">Generate bark</span> - Our AI creates a realistic dog bark sound
            </li>
            <li className="text-muted-foreground">
              <span className="font-medium text-foreground">Download or share</span> - Save your bark sound or share it with others
            </li>
          </ol>
          
          <h2 className="text-2xl font-semibold mt-12 mb-4">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-2">Realistic Bark Sounds</h3>
              <p className="text-muted-foreground">Generate natural-sounding dog barks using advanced AI technology.</p>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-2">Multiple Bark Styles</h3>
              <p className="text-muted-foreground">Choose from different bark types and intensities.</p>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-2">Instant Generation</h3>
              <p className="text-muted-foreground">Get your bark sound in seconds with our fast processing.</p>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-2">Easy Download</h3>
              <p className="text-muted-foreground">Download your generated bark sounds in high-quality audio format.</p>
            </div>
          </div>
          
          <h2 className="text-2xl font-semibold mt-12 mb-4">Use Cases</h2>
          <div className="bg-gray-50 p-6 rounded-lg">
            <ul className="space-y-3 text-sm text-gray-700">
              <li>Create sound effects for games and animations</li>
              <li>Generate training sounds for dog training apps</li>
              <li>Add realistic dog sounds to videos and podcasts</li>
              <li>Create custom bark sounds for pet toys</li>
              <li>Develop educational content about dog communication</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default TextToBarkPage; 