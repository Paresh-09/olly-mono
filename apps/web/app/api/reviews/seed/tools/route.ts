import { NextResponse } from 'next/server';
import prismadb from '@/lib/prismadb';
import { ReviewStatus, Prisma } from '@prisma/client';
import { Review } from '@/types/product';
import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';
import { toolDetails } from '@/data/tool-details';
import { ToolDetail } from '@/types/tool-details';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Helper function to get tool slugs from the directory structure
function getToolSlugs(): string[] {
  const toolsDirectory = path.join(process.cwd(), 'app', '(tools)', 'tools');
  
  // Read the directory contents
  const entries = fs.readdirSync(toolsDirectory, { withFileTypes: true });
  
  // Filter for directories and exclude _components or any hidden directories
  const slugs = entries
    .filter(entry => entry.isDirectory() && !entry.name.startsWith('_') && !entry.name.startsWith('.'))
    .map(entry => entry.name);
  
  return slugs;
}

// Enhanced diverse name generation
function generateDiverseName(): string {
  // More diverse first names from around the world
  const firstNames = [
    // Western names
    'James', 'Emma', 'Noah', 'Olivia', 'William', 'Sophia', 'Benjamin', 'Charlotte', 'Liam', 'Ava',
    // Hispanic/Latino names
    'Santiago', 'Valentina', 'Mateo', 'Isabella', 'Diego', 'Camila', 'Gabriel', 'Sofia', 'Alejandro', 'Luna',
    // Asian names
    'Wei', 'Mei', 'Hiroshi', 'Yuna', 'Jin', 'Hyun', 'Ravi', 'Priya', 'Chen', 'Soo-Jin',
    // Middle Eastern names
    'Mohammed', 'Fatima', 'Ali', 'Aisha', 'Omar', 'Leila', 'Hassan', 'Zara', 'Ahmed', 'Yasmin',
    // African names
    'Kofi', 'Nia', 'Kwame', 'Amara', 'Chijioke', 'Zuri', 'Sekou', 'Imani', 'Jabari', 'Makena',
    // Eastern European names
    'Dmitri', 'Anastasia', 'Vladimir', 'Natasha', 'Mikhail', 'Katarina', 'Nikolai', 'Olga', 'Ivan', 'Elena',
    // Indian names
    'Arjun', 'Aanya', 'Vikram', 'Divya', 'Rohan', 'Anika', 'Vijay', 'Meera', 'Rajiv', 'Prisha',
    // Indigenous names
    'Takoda', 'Kaya', 'Enapay', 'Nayeli', 'Ahanu', 'Aiyana', 'Nocona', 'Halona', 'Kitchi', 'Orenda'
  ];

  // More diverse last names
  const lastNames = [
    // Western surnames
    'Smith', 'Johnson', 'Williams', 'Brown', 'Taylor', 'Miller', 'Anderson', 'Wilson', 'Moore', 'Thompson',
    // Hispanic/Latino surnames
    'Garcia', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Perez', 'Sanchez', 'Ramirez', 'Torres',
    // Asian surnames
    'Wang', 'Li', 'Zhang', 'Chen', 'Liu', 'Yang', 'Huang', 'Kim', 'Park', 'Nguyen',
    // Middle Eastern surnames
    'Al-Farsi', 'Hassan', 'Ibrahim', 'Khan', 'Mahmoud', 'Rahman', 'Abdullah', 'Ali', 'Ahmed', 'Karimi',
    // African surnames
    'Okafor', 'Mensah', 'Osei', 'Diallo', 'Nkosi', 'Adeola', 'Okoro', 'Moyo', 'Nwosu', 'Abara',
    // Eastern European surnames
    'Ivanov', 'Petrov', 'Sokolov', 'Popov', 'Lebedev', 'Novikov', 'Kozlov', 'Morozov', 'Volkov', 'Kuznetsov',
    // Indian surnames
    'Patel', 'Kumar', 'Singh', 'Shah', 'Sharma', 'Verma', 'Gupta', 'Malhotra', 'Desai', 'Joshi',
    // Oceanian surnames
    'Hohepa', 'Rangi', 'Wiremu', 'Smith-Pohatu', 'Wikitoria', 'Aroha', 'Tamati', 'Tama', 'Mere', 'Kahurangi'
  ];

  // Track used names to avoid repetition
  const usedNames = new Set<string>();
  
  // Generate a unique name combination
  let fullName: string;
  do {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    fullName = `${firstName} ${lastName}`;
  } while (usedNames.has(fullName));
  
  usedNames.add(fullName);
  return fullName;
}

// Occupations to make reviews more realistic
const OCCUPATIONS = [
  'Content Creator', 'YouTuber', 'Blogger', 'Social Media Manager', 'Digital Marketer',
  'SEO Specialist', 'Copywriter', 'Video Editor', 'Graphic Designer', 'Web Developer',
  'UX Designer', 'Entrepreneur', 'Business Owner', 'Freelancer', 'Consultant',
  'Teacher', 'Coach', 'Student', 'Researcher', 'Journalist',
  'Marketing Director', 'Product Manager', 'Community Manager', 'Agency Owner', 'Influencer'
];

// Time expressions to add realism
const TIME_EXPRESSIONS = [
  'Been using this for 2 months now', 'After 3 weeks of daily use', 'Used it for a full year',
  'Started using this 6 months ago', 'On my second week with this tool', 'Been a loyal user for over a year',
  'Regular user for the past few months', 'Daily user for 3+ months', 'Weekly user since launch',
  'Just started using it last month', 'Using it since beta', 'First-time user', 'Long-time user'
];

// Use cases to make reviews contextual
const USE_CASES = {
  'generator': [
    'creating content for my blog', 'generating ideas for my YouTube channel', 
    'building my content calendar', 'ideating for client projects',
    'coming up with fresh concepts', 'supporting my creative process'
  ],
  'youtube': [
    'growing my YouTube channel', 'optimizing my video content', 
    'improving my video SEO', 'managing my YouTube workflow',
    'analyzing my channel performance', 'creating more engaging content'
  ],
  'social-media': [
    'managing multiple social accounts', 'growing my Instagram following', 
    'boosting engagement on my posts', 'planning my content strategy',
    'analyzing performance across platforms', 'scheduling content more efficiently'
  ],
  'analyzer': [
    'tracking performance metrics', 'understanding audience behavior', 
    'optimizing my content strategy', 'making data-driven decisions',
    'measuring campaign effectiveness', 'identifying growth opportunities'
  ],
  'text': [
    'improving my writing workflow', 'ensuring error-free content', 
    'formatting text consistently', 'speeding up content production',
    'enhancing readability', 'creating more polished content'
  ],
  'default': [
    'streamlining my workflow', 'enhancing my productivity', 
    'completing projects faster', 'improving my work quality',
    'tackling complex tasks', 'supporting my daily operations'
  ]
};

// Tools for comparison to make reviews more realistic
const COMPARISON_TOOLS: Record<string, string[]> = {
  'generator': ['ChatGPT', 'Copy.ai', 'Jasper', 'Writesonic', 'ShortlyAI'],
  'youtube': ['TubeBuddy', 'VidIQ', 'Morningfame', 'TubeSift', 'Keywords Everywhere'],
  'social-media': ['Buffer', 'Hootsuite', 'Later', 'Planoly', 'Sprout Social'],
  'analyzer': ['Google Analytics', 'Semrush', 'Ahrefs', 'Moz', 'SimilarWeb'],
  'audit': ['Screaming Frog', 'SEMrush Audit', 'Ahrefs Site Audit', 'Lighthouse', 'GTmetrix'],
  'default': ['Other tools', 'Competitors', 'Premium alternatives', 'Paid solutions', 'Manual methods']
};

// Review templates to generate realistic-looking reviews with placeholders
const REVIEW_TEMPLATES = {
  positive: [
    "{time_expression}. As a {occupation}, {use_case} is crucial, and this tool has been a game-changer. The {feature_1} is exceptional, and the {feature_2} saves me hours each week. {comparison} Would definitely recommend to anyone in my field.",
    "This is exactly what I needed for {use_case}! The {feature_1} exceeds expectations, and I'm particularly impressed by the {feature_2}. {time_expression} and I can confidently say it's worth every penny. {comparison}",
    "Absolutely love this tool! {time_expression} for {use_case}, and the results have been fantastic. The {feature_1} is intuitive, and the {feature_2} is far better than I expected. {comparison} 5 stars without hesitation.",
    "Game-changer for my {occupation} work. The {feature_1} has transformed how I approach {use_case}. Additionally, the {feature_2} is incredibly well-designed. {time_expression} with consistently impressive results. {comparison}",
    "Excellent tool that delivers on its promises. As a {occupation}, I rely on this daily for {use_case}. The {feature_1} is outstanding, and the {feature_2} keeps improving with updates. {time_expression} and can't imagine my workflow without it now. {comparison}",
    "Incredibly powerful yet easy to use. The {feature_1} makes {use_case} so much more efficient, while the {feature_2} helps me stand out from competitors. {time_expression}, and it's been instrumental for my growth as a {occupation}. {comparison}"
  ],
  neutral: [
    "{time_expression}. As a {occupation}, I find it helpful for {use_case}. The {feature_1} is good but could be improved, and the {feature_2} works well enough for basic needs. {comparison} Solid tool overall, but there's room for improvement.",
    "Decent tool for {use_case}. The {feature_1} meets expectations, but the {feature_2} needs some refinement. {time_expression} and while it gets the job done, I think there's potential for more. {comparison} Worth trying for the price point.",
    "Middle-of-the-road solution for {occupation}s like me. {time_expression} for {use_case}, and it's been satisfactory. The {feature_1} is adequate, though the {feature_2} could use an update. {comparison} Good enough for now.",
    "Does what it promises, no more no less. As a {occupation}, I use this for {use_case} with reasonable results. The {feature_1} is functional, and the {feature_2} is average compared to alternatives. {time_expression} - it's reliable but not exceptional.",
    "Useful tool with some limitations. For {use_case}, the {feature_1} performs adequately, but the {feature_2} feels outdated. {time_expression} with mixed feelings. {comparison} Could be better but works for basic needs.",
    "Three stars - has potential but needs work. I use this as a {occupation} for {use_case}, and while the {feature_1} meets basic requirements, the {feature_2} falls short sometimes. {time_expression} and it's been mostly reliable. {comparison}"
  ],
  negative: [
    "{time_expression}, but I'm disappointed. As a {occupation} focused on {use_case}, I expected more. The {feature_1} is frustratingly limited, and the {feature_2} consistently underperforms. {comparison} Would not recommend until significant improvements are made.",
    "Not worth the time invested. I tried this for {use_case} as part of my {occupation} workflow, but the {feature_1} is subpar, and the {feature_2} feels unfinished. {time_expression} but will be looking for alternatives. {comparison}",
    "Promising concept, poor execution. The {feature_1} fails to deliver for serious {use_case} needs, and the {feature_2} is far behind industry standards. {time_expression} but as a {occupation}, I need something more reliable. {comparison}",
    "Disappointed with this purchase. For {occupation}s needing help with {use_case}, look elsewhere. The {feature_1} is clunky, and the {feature_2} lacks basic functionality. {time_expression} but ready to move on. {comparison}",
    "Falls short of expectations. I needed a solid solution for {use_case} in my {occupation} work, but this isn't it. The {feature_1} is frustrating to use, and the {feature_2} lacks polish. {time_expression} but wouldn't recommend. {comparison}",
    "Had high hopes but let down. As a {occupation} who depends on efficient tools for {use_case}, this doesn't deliver. The {feature_1} is outdated, and the {feature_2} is unreliable. {time_expression} but already searching for better alternatives. {comparison}"
  ]
};

// Specific tool categories with specialized features and use cases
const TOOL_CATEGORIES: Record<string, { features: string[], use_cases: string[] }> = {
  // YouTube tools
  'youtube': {
    features: [
      'video analytics', 'keyword research', 'thumbnail optimization', 'audience retention analysis',
      'engagement metrics', 'competitor analysis', 'channel growth tools', 'video SEO', 
      'tag optimization', 'description generator', 'transcript processing', 'comment management', 
      'trending topic finder', 'metadata optimization', 'video idea generation',
      'chapter marking', 'keyword suggestion algorithm', 'video performance predictions',
      'content strategy recommendations', 'subscriber growth analysis'
    ],
    use_cases: USE_CASES.youtube
  },
  
  // Text and content tools
  'text': {
    features: [
      'text formatting', 'grammar checking', 'readability analysis', 'style suggestions',
      'tone adjustments', 'plagiarism detection', 'document structuring', 'language refinement',
      'vocabulary enhancement', 'sentence restructuring', 'clarity improvements',
      'formatting options', 'export capabilities', 'template library', 'collaborative editing'
    ],
    use_cases: USE_CASES.text
  },
  
  // Image and visual tools
  'image': {
    features: [
      'image generation quality', 'style customization', 'resolution options', 'export formats',
      'template variety', 'editing capabilities', 'processing speed', 'dimension control',
      'style consistency', 'design elements', 'color management', 'visual appeal',
      'brand alignment', 'creative options', 'rendering quality', 'art style accuracy'
    ],
    use_cases: [
      'creating visual content', 'designing marketing materials', 'enhancing my brand presence',
      'generating unique imagery', 'refreshing my visual identity', 'standing out visually'
    ]
  },
  
  // Social media tools
  'social': {
    features: [
      'cross-platform management', 'engagement analytics', 'audience insights', 'content planning',
      'hashtag optimization', 'post scheduling', 'performance tracking', 'trend analysis',
      'competitor monitoring', 'content suggestion', 'profile optimization', 'growth strategies',
      'engagement automation', 'comment management', 'follower growth', 'content calendar'
    ],
    use_cases: USE_CASES['social-media']
  },
  
  // Generator tools
  'generator': {
    features: [
      'output quality', 'generation speed', 'customization options', 'variety of results',
      'relevance accuracy', 'creative suggestions', 'template diversity', 'industry-specific knowledge',
      'formatting options', 'tone control', 'style adaptability', 'personalization features',
      'export capabilities', 'idea diversity', 'contextual understanding', 'specialized outputs'
    ],
    use_cases: USE_CASES.generator
  },
  
  // Simulator tools
  'simulator': {
    features: [
      'simulation accuracy', 'scenario customization', 'results detail', 'variable control',
      'data visualization', 'predictive accuracy', 'model sophistication', 'interface usability',
      'processing power', 'scenario variety', 'parameter flexibility', 'outcome analysis',
      'comparative results', 'visual presentation', 'export options', 'mathematical modeling'
    ],
    use_cases: [
      'modeling complex scenarios', 'testing hypothetical situations', 'understanding system behavior',
      'making predictions', 'educational demonstrations', 'entertaining thought experiments'
    ]
  },
  
  // Converter tools
  'converter': {
    features: [
      'conversion accuracy', 'format support', 'processing speed', 'batch handling',
      'quality preservation', 'size optimization', 'metadata handling', 'format compatibility',
      'error handling', 'interface simplicity', 'preview functionality', 'customization options',
      'automated processing', 'cross-platform compatibility', 'output options', 'technical accuracy'
    ],
    use_cases: [
      'converting file formats', 'optimizing digital assets', 'preparing files for different platforms',
      'streamlining my file workflow', 'maintaining content quality across formats', 'technical publishing'
    ]
  },
};

// Generate features for a specific tool based on its slug
function getCategoryForTool(slug: string): string {
  if (slug.includes('youtube') || slug.includes('video')) {
    return 'youtube';
  } else if (slug.includes('text') || slug.includes('grammar') || slug.includes('readability') || 
             slug.includes('word') || slug.includes('character') || slug.includes('formatter')) {
    return 'text';
  } else if (slug.includes('image') || slug.includes('logo') || slug.includes('ico') || 
             slug.includes('favicon') || slug.includes('ghibli')) {
    return 'image';
  } else if (slug.includes('instagram') || slug.includes('social-media') || 
             slug.includes('twitter') || slug.includes('linkedin') || slug.includes('tiktok')) {
    return 'social';
  } else if (slug.includes('generator') || slug.includes('creator')) {
    return 'generator';
  } else if (slug.includes('simulator')) {
    return 'simulator';
  } else if (slug.includes('converter')) {
    return 'converter';
  } else {
    return 'default';
  }
}

// Get features specific to a tool based on its category and slug
function getFeaturesForTool(slug: string): string[] {
  const category = getCategoryForTool(slug);
  
  // Return category-specific features if available
  if (category !== 'default' && category in TOOL_CATEGORIES) {
    return TOOL_CATEGORIES[category].features;
  }
  
  // Fallback to default features based on tool type
  if (slug.includes('generator')) {
    return DEFAULT_FEATURES.generator;
  } else if (slug.includes('analyzer') || slug.includes('analysis')) {
    return DEFAULT_FEATURES.analyzer;
  } else if (slug.includes('audit')) {
    return DEFAULT_FEATURES.audit;
  } else if (slug.includes('counter')) {
    return DEFAULT_FEATURES.counter;
  } else if (slug.includes('converter')) {
    return DEFAULT_FEATURES.converter;
  } else if (slug.includes('text') || slug.includes('formatter')) {
    return DEFAULT_FEATURES.text;
  } else {
    return DEFAULT_FEATURES.default;
  }
}

// Get use cases specific to a tool
function getUseCasesForTool(slug: string): string[] {
  const category = getCategoryForTool(slug);
  
  // Return category-specific use cases if available
  if (category !== 'default' && category in TOOL_CATEGORIES) {
    return TOOL_CATEGORIES[category].use_cases;
  }
  
  // Fallback to default use cases
  if (slug.includes('youtube') || slug.includes('video')) {
    return USE_CASES.youtube;
  } else if (slug.includes('generator')) {
    return USE_CASES.generator;
  } else if (slug.includes('analyzer') || slug.includes('analysis')) {
    return USE_CASES.analyzer;
  } else if (slug.includes('instagram') || slug.includes('social') || 
             slug.includes('twitter') || slug.includes('tiktok')) {
    return USE_CASES['social-media'];
  } else if (slug.includes('text') || slug.includes('word') || slug.includes('character')) {
    return USE_CASES.text;
  } else {
    return USE_CASES.default;
  }
}

// Get comparison tools relevant to the current tool
function getComparisonForTool(slug: string, sentiment: string): string {
  // Don't always include comparisons
  if (Math.random() > 0.7) {
    return '';
  }
  
  let category = 'default';
  
  if (slug.includes('youtube') || slug.includes('video')) {
    category = 'youtube';
  } else if (slug.includes('generator')) {
    category = 'generator';
  } else if (slug.includes('audit')) {
    category = 'audit';
  } else if (slug.includes('instagram') || slug.includes('social') || 
             slug.includes('twitter') || slug.includes('tiktok')) {
    category = 'social-media';
  } else if (slug.includes('analyzer')) {
    category = 'analyzer';
  }
  
  const tools = COMPARISON_TOOLS[category] || COMPARISON_TOOLS.default;
  const tool = tools[Math.floor(Math.random() * tools.length)];
  
  if (sentiment === 'positive') {
    return `I've tried ${tool} before, but this is much better.`;
  } else if (sentiment === 'neutral') {
    return `It's comparable to ${tool} in most aspects.`;
  } else {
    return `${tool} does this much better for a similar price.`;
  }
}

// Default features for different tool types
const DEFAULT_FEATURES = {
  // Content related tools
  'generator': ['content quality', 'generation speed', 'customization options', 'creative suggestions', 'ease of use', 'output variety'],
  
  // Analytics tools
  'analyzer': ['analysis accuracy', 'data visualization', 'insight depth', 'processing speed', 'trend identification', 'actionable recommendations'],
  
  // Audit tools
  'audit': ['comprehensive analysis', 'actionable insights', 'performance metrics', 'comparative benchmarks', 'growth recommendations', 'data visualization'],
  
  // Utilities
  'counter': ['calculation accuracy', 'real-time updates', 'metric variety', 'data visualization', 'export options', 'interface simplicity'],
  'converter': ['conversion accuracy', 'format options', 'processing speed', 'batch capabilities', 'output quality', 'interface design'],
  
  // Text tools
  'text': ['formatting options', 'text processing', 'customization capabilities', 'output quality', 'user interface', 'processing speed'],
  
  // Default for any other type
  'default': ['user interface', 'performance speed', 'feature set', 'customization options', 'output quality', 'ease of use']
};

type ReviewCreationData = Omit<Review, 'id' | 'createdAt' | 'updatedAt'>;

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function generateDetailedReview(productSlug: string, sentiment: 'positive' | 'neutral' | 'negative'): Pick<ReviewCreationData, 'rating' | 'reviewBody' | 'authorName'> {
  // Get tool-specific data
  const features = getFeaturesForTool(productSlug);
  const useCases = getUseCasesForTool(productSlug);
  
  // Select random elements for personalization
  const feature1 = getRandomElement(features);
  const feature2 = getRandomElement(features.filter(f => f !== feature1));
  const useCase = getRandomElement(useCases);
  const occupation = getRandomElement(OCCUPATIONS);
  const timeExpression = getRandomElement(TIME_EXPRESSIONS);
  const comparison = getComparisonForTool(productSlug, sentiment);
  
  // Get template based on sentiment
  const template = getRandomElement(REVIEW_TEMPLATES[sentiment]);
  
  // Fill in the template
  let reviewBody = template
    .replace('{feature_1}', feature1)
    .replace('{feature_2}', feature2)
    .replace('{use_case}', useCase)
    .replace('{occupation}', occupation)
    .replace('{time_expression}', timeExpression)
    .replace('{comparison}', comparison);
  
  const authorName = generateDiverseName();
  
  const ratingRanges = {
    positive: [4, 5],
    neutral: [3],
    negative: [1, 2]
  };
  
  // For positive reviews, make most of them 5 stars
  let rating: number;
  if (sentiment === 'positive') {
    rating = Math.random() < 0.7 ? 5 : 4;
  } else if (sentiment === 'neutral') {
    rating = 3;
  } else {
    rating = Math.random() < 0.7 ? 2 : 1;
  }
  
  return {
    rating,
    reviewBody,
    authorName
  };
}

// Function to get tool details from the tool-details.ts file
function getToolDetails(slug: string): {
  name: string;
  description: string;
  features: string[];
  useCases: string[];
} {
  // Try to get tool details from the tool-details.ts file
  const toolDetail = toolDetails[slug] as ToolDetail | undefined;
  
  if (toolDetail) {
    // Extract features from the tool details
    const features = toolDetail.features?.list || [];
    
    // Extract use cases from the tool details
    const useCases = toolDetail.useCases?.cases.map(c => c.title) || [];
    
    return {
      name: toolDetail.name,
      description: toolDetail.longDescription || toolDetail.shortDescription,
      features,
      useCases,
    };
  }
  
  // Fallback to parsing the slug if the tool details are not available
  return parseToolInfo(slug);
}

// Function to parse tool name and extract key features for AI prompt (fallback)
function parseToolInfo(slug: string): { 
  name: string;
  description: string;
  features: string[];
  useCases: string[];
} {
  // Convert slug to readable name
  const name = slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  
  // Extract key features based on the tool type
  let features: string[] = [];
  let description = `${name} is a tool that helps users `;
  let useCases: string[] = [];
  
  if (slug.includes('youtube')) {
    description += 'analyze, optimize, and extract content from YouTube videos.';
    features = ['YouTube content analysis', 'video optimization', 'channel growth', 'transcript generation'];
    useCases = ['Content creation', 'Video analysis', 'Channel growth', 'Research'];
  } else if (slug.includes('generator')) {
    description += 'generate professional and creative content easily.';
    features = ['content creation', 'customization options', 'creative suggestions', 'time-saving'];
    useCases = ['Content creation', 'Marketing', 'Creative work', 'Brainstorming'];
  } else if (slug.includes('analyzer') || slug.includes('audit')) {
    description += 'analyze data and provide valuable insights.';
    features = ['performance analysis', 'data insights', 'optimization recommendations', 'comparative benchmarks'];
    useCases = ['Analytics', 'Performance tracking', 'Optimization', 'Research'];
  } else if (slug.includes('image') || slug.includes('logo')) {
    description += 'create and customize visual content.';
    features = ['visual design', 'customization options', 'professional output', 'brand consistency'];
    useCases = ['Branding', 'Design', 'Visual content', 'Marketing'];
  } else if (slug.includes('converter')) {
    description += 'convert content from one format to another.';
    features = ['format conversion', 'quality preservation', 'batch processing', 'file optimization'];
    useCases = ['File management', 'Content repurposing', 'Technical work', 'Web development'];
  } else {
    description += 'improve efficiency and productivity in their workflow.';
    features = ['ease of use', 'time-saving functionality', 'professional results', 'workflow optimization'];
    useCases = ['Productivity', 'Workflow optimization', 'Professional tasks', 'Time management'];
  }
  
  return { name, description, features, useCases };
}

async function generateAIReview(toolSlug: string): Promise<Pick<ReviewCreationData, 'rating' | 'reviewBody' | 'authorName'>> {
  // Get actual tool details
  const toolInfo = getToolDetails(toolSlug);
  
  const prompt = `Generate a review for the following AI tool:
  
Tool Name: ${toolInfo.name}
Tool Description: ${toolInfo.description}

Key Features: ${toolInfo.features.slice(0, 3).join(', ')}
Use Cases: ${toolInfo.useCases.slice(0, 3).join(', ')}

The review should:
1. Be realistic and specific to the tool's actual features and benefits
2. Mention a specific use case or experience with the tool
3. Be 2-4 sentences long
4. Sound authentic and conversational
5. Include both praise and one minor suggestion for improvement
6. Be helpful for potential users
7. Mention how the tool helped solve a specific problem

Also, ratings should be mostly positive but realistic (majority 4-5 stars, occasionally 3 stars).

DO NOT generate a name for the reviewer. I will handle that separately.

Format the response exactly like this:
Rating: [number 1-5]
Review: [review text]`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.8,
      max_tokens: 400,
    });

    const response = completion.choices[0].message.content || '';
    
    // Parse the response
    const ratingMatch = response.match(/Rating: (\d+)/);
    const reviewMatch = response.match(/Review: (.+)/);

    if (!ratingMatch || !reviewMatch) {
      throw new Error('Failed to parse AI response');
    }

    return {
      rating: parseInt(ratingMatch[1]),
      authorName: generateDiverseName(),
      reviewBody: reviewMatch[1].trim()
    };
  } catch (error) {
    console.error(`Error generating AI review for ${toolSlug}:`, error);
    // Fallback to simpler review generation if AI fails
    return fallbackReviewGeneration(toolSlug);
  }
}

// Fallback review generation in case the AI call fails
function fallbackReviewGeneration(toolSlug: string): Pick<ReviewCreationData, 'rating' | 'reviewBody' | 'authorName'> {
  const toolInfo = getToolDetails(toolSlug);
  
  const reviewTemplates = [
    `This {tool} has been very helpful for my projects. {feature} is particularly impressive, though the interface could be a bit more intuitive.`,
    `I've been using the {tool} for my {useCase} work and it's saved me hours. Very reliable and user-friendly.`,
    `The {tool} delivers exactly what it promises. {feature} helped me solve several problems that I was facing in my workflow.`,
    `Good tool overall. The {tool} has most features I need for {useCase} and performs well for day-to-day tasks.`,
    `As a {useCase} professional, I find this {tool} invaluable. The {feature} functionality is excellent, though I wish it had more export options.`,
    `{tool} has become essential for my daily work. It streamlines my {useCase} process, especially with its {feature} capability.`,
    `I'm impressed with how well {tool} handles {useCase} tasks. The {feature} saved me countless hours, although the learning curve was steeper than expected.`,
    `Solid performance from {tool} for all my {useCase} needs. {feature} works flawlessly, but I'd love to see more customization options in future updates.`
  ];
  
  const template = reviewTemplates[Math.floor(Math.random() * reviewTemplates.length)]
    .replace('{tool}', toolInfo.name)
    .replace('{feature}', toolInfo.features[Math.floor(Math.random() * toolInfo.features.length)] || 'The functionality')
    .replace(/{useCase}/g, toolInfo.useCases[Math.floor(Math.random() * toolInfo.useCases.length)] || 'professional');
  
  return {
    rating: Math.random() < 0.7 ? 5 : (Math.random() < 0.9 ? 4 : 3),
    authorName: generateDiverseName(),
    reviewBody: template
  };
}

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function POST(req: Request) {
  try {
    const reviews: ReviewCreationData[] = [];
    const toolSlugs = getToolSlugs();
    
    if (toolSlugs.length === 0) {
      return NextResponse.json({ error: 'No tool slugs found' }, { status: 404 });
    }
    
    // Extract request body to see if specific number of reviews per tool was requested
    const requestData = await req.json().catch(() => ({}));
    const reviewsPerTool = requestData.reviewsPerTool || 3; // Default to 3 reviews per tool
    const maxTools = requestData.maxTools || toolSlugs.length; // Default to all tools
    const specificTools = requestData.tools || []; // Specific tools to generate reviews for
    
    // Get a subset of tools if maxTools is specified or specific tools are requested
    let selectedToolSlugs = toolSlugs.filter(slug => slug !== 'page.tsx');
    
    if (specificTools.length > 0) {
      selectedToolSlugs = selectedToolSlugs.filter(slug => specificTools.includes(slug));
    } else {
      selectedToolSlugs = selectedToolSlugs
        .sort(() => 0.5 - Math.random()) // Randomize order
        .slice(0, maxTools); // Take only the requested number of tools
    }
    
    
    // Generate reviews for each tool using AI
    for (const productSlug of selectedToolSlugs) {
      for (let i = 0; i < reviewsPerTool; i++) {
        try {
          // Generate review using AI
          const review = await generateAIReview(productSlug);
          
          reviews.push({
            productSlug,
            ...review,
            status: ReviewStatus.APPROVED,
            isVerified: Math.random() < 0.8, // 80% of reviews are verified
            authorId: null,
          });
          
          // Brief pause to avoid rate limiting
          await sleep(200);
        } catch (error) {
          console.error(`Error generating review #${i+1} for ${productSlug}:`, error);
        }
      }
      
      // Pause between tools to manage rate limits
      await sleep(1000);
    }
    
    // Insert all reviews in a single transaction
    const result = await prismadb.$transaction(async (tx) => {
      return await tx.productReview.createMany({
        data: reviews
      });
    });

    return NextResponse.json({
      message: `Successfully created ${result.count} AI-generated reviews for ${selectedToolSlugs.length} tools`,
      count: result.count,
      toolCount: selectedToolSlugs.length
    }, { status: 200 });

  } catch (error) {
    console.error('Error creating AI tool reviews:', error);
    return NextResponse.json({ 
      error: 'Failed to create tool reviews',
      details: (error as Error).message
    }, { status: 500 });
  }
}