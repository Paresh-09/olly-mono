"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/components/ui/avatar";
import { Badge } from "@repo/ui/components/ui/badge";
import { StarRating } from "@/app/(tools)/tools/_components/tool-reviews/_components/star-rating";
import { CompetitorReview } from "./types";
import { Competitor } from "@/data/competitors";
import * as LucideIcons from "lucide-react";
import Image from "next/image";

type ReviewCardProps = {
  review: CompetitorReview;
  competitor: Competitor;
}

export function ReviewCard({ review, competitor }: ReviewCardProps) {
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  // Get the correct icon component if one exists
  const IconComponent = review.authorIcon ? (LucideIcons as any)[review.authorIcon.charAt(0).toUpperCase() + review.authorIcon.slice(1)] : null;

  return (
    <div className="border rounded-xl p-5 transition-shadow hover:shadow-md">
      <div className="flex items-start gap-4">
        <Avatar className="h-10 w-10">
          {IconComponent ? (
            <div className="flex items-center justify-center w-full h-full">
              <IconComponent size={20} />
            </div>
          ) : (
            <AvatarFallback>{getInitials(review.authorName)}</AvatarFallback>
          )}
        </Avatar>

        <div className="flex-1">
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
            <h3 className="font-semibold">{review.authorName}</h3>
            {review.isVerified && (
              <Badge variant="outline" className="max-w-fit text-xs">
                Verified User
              </Badge>
            )}
          </div>

          <div className="mt-2 flex flex-col sm:flex-row gap-4">
            <div className="flex items-center">
              <span className="text-sm font-medium mr-2">Olly.social:</span>
              <StarRating rating={review.ollyRating} size="sm" />
              <div className="w-5 h-5 ml-2">
                <Image src="/icon-2.png" alt="Olly.social" width={20} height={20} />
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-sm font-medium mr-2">{competitor.name}:</span>
              <StarRating rating={review.competitorRating} size="sm" />
              {IconComponent && (
                <div className="ml-2">
                  <IconComponent size={16} />
                </div>
              )}
            </div>
          </div>

          <p className="mt-3 text-gray-600 dark:text-gray-300">{review.reviewBody}</p>

          <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
            {formatDate(review.createdAt)}
          </div>
        </div>
      </div>
    </div>
  );
} 