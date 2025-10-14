

export interface Tool {
    id: string;
    name: string;
    description: string;
    platform: 'General' | 'Amazon' | 'Flipkart' | 'Alibaba' | 'Etsy' | 'Shopify' | 'Walmart' | 'Wish' | 'TikTok' | 'Facebook' | 'Instagram' | 'LinkedIn' | 'Twitter' | 'Pinterest' | 'Snapchat' | 'YouTube' | 'Reddit' | 'Discord' | 'Twitch' | 'Spotify' | 'SoundCloud' | 'Tumblr' | 'Reddit' | 'Discord' | 'Twitch' | 'Spotify' | 'SoundCloud' | 'Tumblr' | 'Reddit' | 'Discord' | 'Twitch' | 'Spotify' | 'SoundCloud' | 'Tumblr';
    icon?: string;
    category: string;
    component: string;
    image: string;
    ctaText: string;
    features: string[];
    useCase: {
      title: string;
      description: string;
      examples: string[];
    }[];
    targetAudience: string[];
    benefits: string[];
    keyFeatures: {
      title: string;
      description: string;
      icon?: string;
    }[];
    faq: {
      question: string;
      answer: string;
    }[];
    pricing?: {
      free?: string[];
      pro?: string[];
      price?: string;
    };
  }