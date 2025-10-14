export interface ToolDetail {
  id: string;
  name: string;
  image:string;
  shortDescription: string;
  longDescription: string;
  tagline: string;
  testimonial?: {
    quote: string;
    author: string;
  };
  features: {
    title: string;
    list: string[];
  };
  howToUse: {
    title: string;
    steps: string[];
  };
  useCases: {
    title: string;
    cases: Array<{
      title: string;
      description: string;
    }>;
  };
  faqs: {
    title: string;
    questions: Array<{
      question: string;
      answer: string;
    }>;
  };
  bestPractices?: {
    title: string;
    practices: string[];
  };
  callToAction?: {
    text: string;
    buttonText: string;
  };
} 