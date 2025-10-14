export interface Tool {
    id: string;
    name: string;
    description: string;
    features: string[];
    keywords?: string[];
    howToUse: string[];
    faqs: Array<{
      question: string;
      answer: string;
    }>;
  }
  