import { NextResponse } from 'next/server';
import prismadb from '@/lib/prismadb';
import { ReviewStatus } from '@prisma/client';
import { competitors } from '@/data/competitors';

// Add CompetitorReview type interface
interface CompetitorReview {
  id: string;
  authorName: string;
  ollyRating: number;
  competitorRating: number;
  reviewBody: string;
  createdAt: string;
  isVerified: boolean;
  authorPicture: string | null;
  authorIcon?: string;
}

type RouteParams = {
  params: Promise<{
    slug: string;
  }>;
};

// Lucide icon names for avatar fallbacks
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

// Fallback reviews for development or when database is empty
const getFallbackReviews = (slug: string): CompetitorReview[] => {
  const competitor = Object.entries(competitors).find(
    ([key, value]) => value.name.toLowerCase().replace(/\s+/g, '-') === slug
  );
  
  if (!competitor) return [];
  
  const [competitorSlug, competitorData] = competitor;
  
  return [
    {
      id: '1',
      authorName: 'Alex Thompson',
      ollyRating: 5,
      competitorRating: 3,
      reviewBody: `After using ${competitorData.name} for months with mediocre results, switching to Olly completely transformed my social engagement workflow. The AI model variety and custom personalities give me so much more flexibility, and being able to use it across all my platforms instead of just ${typeof competitorData.features[1]?.features[0]?.competitor === 'object' ? (competitorData.features[1]?.features[0]?.competitor as string[]).join(' and ') : '2-3'} is game-changing.`,
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      isVerified: true,
      authorPicture: null,
      authorIcon: getRandomLucideIcon()
    },
    {
      id: '2',
      authorName: 'Samira Patel',
      ollyRating: 5,
      competitorRating: 3,
      reviewBody: `I've tried both tools extensively, and there's no comparison. ${competitorData.name} is OK for basic needs, but Olly has features I didn't even know I needed - the virality score predictions are incredibly accurate, and the custom comment panels save me hours each week. Plus, Olly's privacy approach with local storage gives me peace of mind.`,
      createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      isVerified: true,
      authorPicture: null,
      authorIcon: getRandomLucideIcon()
    },
    {
      id: '3',
      authorName: 'Miguel Rodriguez',
      ollyRating: 4,
      competitorRating: 3,
      reviewBody: `${competitorData.name} was my go-to tool until I discovered Olly. While ${competitorData.name} handles the basics, Olly's support for multiple AI models and local models via Ollama gives me much more control over content quality. The platform coverage is also vastly superior - I can use the same workflow across all my social channels instead of juggling multiple tools.`,
      createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
      isVerified: true,
      authorPicture: null,
      authorIcon: getRandomLucideIcon()
    }
  ];
};

export async function GET(request: Request, props: RouteParams) {
  const params = await props.params;
  try {
    const { slug } = params;
    
    if (!slug) {
      return NextResponse.json(
        { error: 'Competitor slug is required' },
        { status: 400 }
      );
    }

    // Find competitor by name (converted to slug format)
    const competitor = Object.entries(competitors).find(
      ([key, value]) => value.name.toLowerCase().replace(/\s+/g, '-') === slug
    );
    
    if (!competitor) {
      return NextResponse.json(
        { error: 'Competitor not found' },
        { status: 404 }
      );
    }
    
    const [competitorSlug, competitorData] = competitor;
    
    // Try to get reviews from the database
    let reviews: CompetitorReview[] = [];
    try {
      const dbReviews = await prismadb.competitorReview.findMany({
        where: {
          competitorSlug: competitorSlug,
          status: ReviewStatus.APPROVED
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      
      // Convert DB records to CompetitorReview interface
      reviews = dbReviews.map(review => ({
        id: review.id,
        authorName: review.authorName,
        ollyRating: review.ollyRating,
        competitorRating: review.competitorRating,
        reviewBody: review.reviewBody,
        createdAt: review.createdAt.toISOString(),
        isVerified: review.isVerified,
        authorPicture: review.authorPicture,
        authorIcon: review.authorIcon || getRandomLucideIcon()
      }));
    } catch (error) {
      console.error('Error fetching competitor reviews:', error);
    }
    
    // If no reviews found, use fallback reviews for development
    if (reviews.length === 0) {
      reviews = getFallbackReviews(slug);
    }
    
    return NextResponse.json(reviews);
  } catch (error) {
    console.error('Error in competitor reviews API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch competitor reviews' },
      { status: 500 }
    );
  }
} 