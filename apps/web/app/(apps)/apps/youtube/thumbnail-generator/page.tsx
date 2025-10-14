import { Metadata } from 'next';
import YouTubeThumbnailGenerator from '../_components/youtube-thumbnail';

export const metadata: Metadata = {
  title: 'YouTube Thumbnail Generator | AI-Powered Thumbnail Creation',
  description: 'Create eye-catching YouTube thumbnails with our AI-powered generator to increase your video click-through rates.',
  keywords: 'YouTube thumbnail generator, video thumbnails, content creation, AI generator',
};

export default function YouTubeThumbnailGeneratorPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8 text-center">YouTube Thumbnail Generator</h1>
      <YouTubeThumbnailGenerator />
    </div>
  );
}