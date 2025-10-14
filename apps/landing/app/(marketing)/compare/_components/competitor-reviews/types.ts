export interface CompetitorReview {
  id: string;
  authorName: string;
  ollyRating: number; // Rating for Olly.social
  competitorRating: number; // Rating for competitor
  reviewBody: string;
  createdAt: string;
  isVerified: boolean;
  authorPicture?: string | null;
  authorIcon?: string;
} 