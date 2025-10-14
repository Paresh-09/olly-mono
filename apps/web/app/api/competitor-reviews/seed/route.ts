import { NextResponse } from 'next/server';
import prismadb from '@/lib/prismadb';
import { ReviewStatus, Prisma } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';
import { competitors } from '@/data/competitors';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

  // Generate a unique name combination
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  return `${firstName} ${lastName}`;
}

// Lucide icon names for avatars
const LUCIDE_ICONS = [
  'user', 'users', 'user-check', 'user-circle', 'user-cog', 'user-plus', 'briefcase', 'laptop', 
  'pencil', 'edit', 'pen-tool', 'heart', 'star', 'award', 'badge', 'globe', 'bookmark', 'book', 
  'book-open', 'coffee', 'compass', 'gift', 'glasses', 'lightbulb', 'map', 'mic', 'music', 'palette', 
  'rocket', 'send', 'smile', 'sparkles', 'target', 'thumbs-up', 'trophy', 'zap'
];

// Get a random icon from Lucide
function getRandomLucideIcon(): string {
  return LUCIDE_ICONS[Math.floor(Math.random() * LUCIDE_ICONS.length)];
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
  'Been using both tools for 3 months now', 'After testing both extensively', 'Used both tools for a year',
  'Started with competitor 6 months ago, switched to Olly recently', 'Used both tools side by side',
  'Been a user of both platforms', 'Regular user of both for the past few months',
  'Daily user of both tools for comparison', 'Weekly user of both since their launch',
  'Just completed my comparison test', 'Using both side-by-side since beta', 'First-time user of both'
];

// Review templates for competitor comparisons
const COMPARISON_TEMPLATES = [
  "{time_expression}. As a {occupation}, I've found that Olly.social vastly outperforms {competitor_name} in {feature_1}. While {competitor_name} is decent at {feature_2}, Olly's implementation is much more robust and user-friendly. The main advantage of Olly is {olly_advantage}, which {competitor_name} completely lacks.",
  
  "I switched from {competitor_name} to Olly.social after {time_expression}. The difference in {feature_1} is night and day. {competitor_name} struggles with {competitor_weakness}, whereas Olly handles it effortlessly. For my {occupation} work, Olly's {olly_advantage} saves me hours every week.",
  
  "{time_expression}, and I can confidently say Olly.social is the superior option. As a {occupation}, I rely on {feature_1} daily, and Olly's implementation is significantly better than what {competitor_name} offers. The standout difference is {olly_advantage}, which makes Olly worth every penny.",
  
  "After using {competitor_name} for months, I decided to try Olly.social. {time_expression}, and the results speak for themselves. For {occupation}s like me, Olly's {feature_1} capabilities are game-changing. While {competitor_name} does offer {feature_2}, it's not nearly as polished or effective.",
  
  "I need reliable tools for my {occupation} business, so I tested both extensively. {time_expression}, and Olly.social consistently outperforms {competitor_name}. The key difference is {olly_advantage}, which is essential for my workflow. {competitor_name}'s main weakness is {competitor_weakness}, which becomes frustrating over time.",
  
  "{time_expression}, and while {competitor_name} has its strengths in {feature_2}, Olly.social is the clear winner overall. In my {occupation} work, I particularly appreciate Olly's {olly_advantage}. {competitor_name}'s approach to {feature_1} feels outdated by comparison."
];

type CompetitorReviewData = {
  competitorSlug: string;
  ollyRating: number;
  competitorRating: number;
  reviewBody: string;
  authorName: string;
  authorIcon?: string;
};

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function generateCompetitorReview(competitorSlug: string): CompetitorReviewData {
  const competitor = competitors[competitorSlug];
  
  if (!competitor) {
    throw new Error(`Competitor ${competitorSlug} not found`);
  }
  
  // Extract key features and advantages
  const ollyAdvantages = [
    'support for multiple AI models',
    'custom AI personalities',
    'local model support',
    'cross-platform compatibility',
    'virality score predictions',
    'custom comment panels',
    'local data storage for privacy',
    'wide platform support'
  ];
  
  const competitorWeaknesses = [
    'limited platform support',
    'basic feature set',
    'lack of customization options',
    'cloud-based storage raising privacy concerns',
    'slower performance',
    'limited AI options',
    'poor user interface',
    'inconsistent results'
  ];
  
  // Extract specific features from competitor data
  let features: string[] = [];
  competitor.features.forEach(category => {
    category.features.forEach(feature => {
      features.push(feature.name.toLowerCase());
    });
  });
  
  if (features.length === 0) {
    features = ['social media management', 'content creation', 'engagement analysis', 'posting workflow'];
  }
  
  // Generate random ratings with a bias toward Olly
  const ollyRating = Math.random() < 0.7 ? 5 : (Math.random() < 0.9 ? 4 : 3);
  const competitorRating = Math.random() < 0.7 ? 3 : (Math.random() < 0.9 ? 2 : (Math.random() < 0.5 ? 4 : 1));
  
  // Fill in template
  const template = getRandomElement(COMPARISON_TEMPLATES);
  const occupation = getRandomElement(OCCUPATIONS);
  const timeExpression = getRandomElement(TIME_EXPRESSIONS);
  const feature1 = getRandomElement(features);
  const feature2 = getRandomElement(features.filter(f => f !== feature1));
  const ollyAdvantage = getRandomElement(ollyAdvantages);
  const competitorWeakness = getRandomElement(competitorWeaknesses);
  
  const reviewBody = template
    .replace('{time_expression}', timeExpression)
    .replace('{occupation}', occupation)
    .replace('{competitor_name}', competitor.name)
    .replace('{feature_1}', feature1)
    .replace('{feature_2}', feature2)
    .replace('{olly_advantage}', ollyAdvantage)
    .replace('{competitor_weakness}', competitorWeakness);
  
  return {
    competitorSlug,
    ollyRating,
    competitorRating,
    reviewBody,
    authorName: generateDiverseName(),
    authorIcon: getRandomLucideIcon()
  };
}

async function generateAICompetitorReview(competitorSlug: string): Promise<CompetitorReviewData> {
  const competitor = competitors[competitorSlug];
  
  if (!competitor) {
    throw new Error(`Competitor ${competitorSlug} not found`);
  }
  
  const prompt = `Generate a comparison review between Olly.social and ${competitor.name} (${competitor.shortDescription}). 
  
The review should:
1. Compare specific features between both tools
2. Highlight Olly.social's advantages (AI models variety, platform support, local storage, etc.)
3. Mention some limitations of ${competitor.name}
4. Be 2-4 sentences long
5. Sound authentic and conversational
6. Include specific examples of how Olly solved problems that ${competitor.name} couldn't

The reviewer has used both tools and prefers Olly.social overall.

Format the response exactly like this:
Olly Rating: [number 4-5]
Competitor Rating: [number 1-3]
Review: [review text]`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 300,
    });

    const response = completion.choices[0].message.content || '';
    
    // Parse the response
    const ollyRatingMatch = response.match(/Olly Rating: (\d+)/);
    const competitorRatingMatch = response.match(/Competitor Rating: (\d+)/);
    const reviewMatch = response.match(/Review: ([\s\S]+)/);

    if (!ollyRatingMatch || !competitorRatingMatch || !reviewMatch) {
      throw new Error('Failed to parse AI response');
    }

    return {
      competitorSlug,
      ollyRating: parseInt(ollyRatingMatch[1]),
      competitorRating: parseInt(competitorRatingMatch[1]),
      reviewBody: reviewMatch[1].trim(),
      authorName: generateDiverseName(),
      authorIcon: getRandomLucideIcon()
    };
  } catch (error) {
    console.error(`Error generating AI review for ${competitorSlug}:`, error);
    // Fallback to template-based review generation if AI fails
    return generateCompetitorReview(competitorSlug);
  }
}

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Helper function to create reviews for a single competitor
async function createReviewsForCompetitor(competitorSlug: string, count: number) {
  try {
    const reviews = [];
    
    for (let i = 0; i < count; i++) {
      try {
        // Generate review using AI if possible
        let review;
        if (process.env.OPENAI_API_KEY) {
          review = await generateAICompetitorReview(competitorSlug);
        } else {
          review = generateCompetitorReview(competitorSlug);
        }
        
        reviews.push({
          competitorSlug,
          authorName: review.authorName,
          ollyRating: review.ollyRating,
          competitorRating: review.competitorRating,
          reviewBody: review.reviewBody,
          status: ReviewStatus.APPROVED,
          isVerified: Math.random() < 0.8, // 80% of reviews are verified
          authorId: null,
          authorIcon: review.authorIcon
        });
        
        // Brief pause to avoid rate limiting
        await sleep(200);
      } catch (error) {
        console.error(`Error generating review #${i+1} for ${competitorSlug}:`, error);
      }
    }
    
    // Insert reviews for this competitor
    if (reviews.length > 0) {
      const result = await prismadb.competitorReview.createMany({
        data: reviews
      });
      
      return {
        competitorSlug,
        count: result.count
      };
    }
    
    return {
      competitorSlug,
      count: 0,
      error: 'No reviews generated'
    };
    
  } catch (error) {
    console.error(`Error creating reviews for ${competitorSlug}:`, error);
    return {
      competitorSlug,
      count: 0,
      error: (error as Error).message
    };
  }
}

export async function POST(req: Request) {
  try {
    const results = [];
    const competitorSlugs = Object.keys(competitors);
    
    if (competitorSlugs.length === 0) {
      return NextResponse.json({ error: 'No competitors found' }, { status: 404 });
    }
    
    // Extract request body to see if specific competitor was requested
    const requestData = await req.json().catch(() => ({}));
    const reviewsPerCompetitor = requestData.reviewsPerCompetitor || 3; // Default to 3 reviews per competitor
    const specificCompetitorSlug = requestData.competitorSlug || ''; // If specified, only generate for this competitor
    
    if (specificCompetitorSlug) {
      // Generate reviews for a specific competitor
      if (!competitors[specificCompetitorSlug]) {
        return NextResponse.json({ error: `Competitor ${specificCompetitorSlug} not found` }, { status: 404 });
      }
      
     
      const result = await createReviewsForCompetitor(specificCompetitorSlug, reviewsPerCompetitor);
      results.push(result);
    } else {
      // Generate reviews for all competitors sequentially
      for (const competitorSlug of competitorSlugs) {
    
        const result = await createReviewsForCompetitor(competitorSlug, reviewsPerCompetitor);
        results.push(result);
        
        // Pause between competitors to manage rate limits
        await sleep(1000);
      }
    }

    // Calculate the total count of created reviews
    const totalCount = results.reduce((sum, result) => sum + result.count, 0);
    const successfulCompetitors = results.filter(result => result.count > 0).length;

    return NextResponse.json({
      message: `Successfully created ${totalCount} competitor comparison reviews for ${successfulCompetitors} competitors`,
      results: results,
      totalCount: totalCount,
      competitorCount: successfulCompetitors
    }, { status: 200 });

  } catch (error) {
    console.error('Error creating competitor reviews:', error);
    return NextResponse.json({ 
      error: 'Failed to create competitor reviews',
      details: (error as Error).message
    }, { status: 500 });
  }
} 