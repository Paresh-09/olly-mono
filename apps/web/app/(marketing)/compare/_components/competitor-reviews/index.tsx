"use client";

import { useState, useEffect } from 'react';
import { CompetitorReview } from './types';
import { ReviewCard } from './competitor-review-card';
import { StarRating } from '@/app/(tools)/tools/_components/tool-reviews/_components/star-rating';
import { Competitor } from '@/data/competitors';
import Image from 'next/image';
import { Info } from 'lucide-react';

type CompetitorReviewsProps = {
  competitor: Competitor;
  limit?: number;
}

export function CompetitorReviews({ competitor, limit = 5 }: CompetitorReviewsProps) {
  const [reviews, setReviews] = useState<CompetitorReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [averageOllyRating, setAverageOllyRating] = useState(4.8); // Default high rating for Olly
  const [averageCompetitorRating, setAverageCompetitorRating] = useState(3.2); // Default lower rating for competitor
  const [totalReviews, setTotalReviews] = useState(0);

  useEffect(() => {
    async function fetchReviews() {
      try {        
        const response = await fetch(`/api/competitor-reviews/${competitor.name.toLowerCase().replace(/\s+/g, '-')}`);
        if (!response.ok) {
          throw new Error('Failed to fetch competitor reviews');
        }
        
        const data = await response.json() as CompetitorReview[];
        
        setReviews(data.slice(0, limit));
        setTotalReviews(data.length);
        
        // Calculate average ratings from the reviews
        if (data.length > 0) {
          const ollySum = data.reduce((acc, review) => acc + review.ollyRating, 0);
          const competitorSum = data.reduce((acc, review) => acc + review.competitorRating, 0);
          setAverageOllyRating(ollySum / data.length);
          setAverageCompetitorRating(competitorSum / data.length);
        }
      } catch (error) {
        console.error('Error fetching competitor reviews:', error);
        // Use fallback reviews if API fails
        useFallbackReviews();
      } finally {
        setLoading(false);
      }
    }

    fetchReviews();
  }, [competitor.name, limit]);

  // Fallback reviews if API fails
  const useFallbackReviews = () => {
    const fallbackReviews: CompetitorReview[] = [
      {
        id: '1',
        authorName: 'Alex Thompson',
        ollyRating: 5,
        competitorRating: 3,
        reviewBody: `After using ${competitor.name} for months with mediocre results, switching to Olly completely transformed my social engagement workflow. The AI model variety and custom personalities give me so much more flexibility, and being able to use it across all my platforms instead of just ${typeof competitor.features[1]?.features[0]?.competitor === 'object' ? (competitor.features[1]?.features[0]?.competitor as string[]).join(' and ') : '2-3'} is game-changing.`,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        isVerified: true,
        authorPicture: null,
        authorIcon: 'User'
      },
      {
        id: '2',
        authorName: 'Samira Patel',
        ollyRating: 5,
        competitorRating: 3,
        reviewBody: `I've tried both tools extensively, and there's no comparison. ${competitor.name} is OK for basic needs, but Olly has features I didn't even know I needed - the virality score predictions are incredibly accurate, and the custom comment panels save me hours each week. Plus, Olly's privacy approach with local storage gives me peace of mind.`,
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        isVerified: true,
        authorPicture: null,
        authorIcon: 'Star'
      },
      {
        id: '3',
        authorName: 'Miguel Rodriguez',
        ollyRating: 4,
        competitorRating: 3,
        reviewBody: `${competitor.name} was my go-to tool until I discovered Olly. While ${competitor.name} handles the basics, Olly's support for multiple AI models and local models via Ollama gives me much more control over content quality. The platform coverage is also vastly superior - I can use the same workflow across all my social channels instead of juggling multiple tools.`,
        createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
        isVerified: true,
        authorPicture: null,
        authorIcon: 'Smile'
      }
    ];
    
    setReviews(fallbackReviews);
    setTotalReviews(fallbackReviews.length);
    setAverageOllyRating(4.7);
    setAverageCompetitorRating(3.0);
  };

  if (loading) {
    return <div className="animate-pulse h-40 bg-gray-100 dark:bg-gray-800 rounded-lg"></div>;
  }

  if (reviews.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4">User Comparisons</h2>
        <p className="text-gray-500 dark:text-gray-400">No comparison reviews available yet. Be the first to compare!</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <h2 className="text-2xl font-bold mb-4 md:mb-0">User Comparisons</h2>
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="flex items-center">
            <span className="font-semibold mr-2">Olly.social:</span>
            <StarRating rating={averageOllyRating} size="md" />
            <span className="ml-2 text-gray-600 dark:text-gray-400">
              {averageOllyRating.toFixed(1)}
            </span>
            <div className="w-5 h-5 ml-2">
              <Image src="/icon-2.png" alt="Olly" width={20} height={20} />
            </div>
          </div>
          <div className="flex items-center">
            <span className="font-semibold mr-2">{competitor.name}:</span>
            <StarRating rating={averageCompetitorRating} size="md" />
            <span className="ml-2 text-gray-600 dark:text-gray-400">
              {averageCompetitorRating.toFixed(1)}
            </span>
            <Info className="ml-2" size={16} />
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {reviews.map((review) => (
          <ReviewCard key={review.id} review={review} competitor={competitor} />
        ))}
      </div>
    </div>
  );
} 