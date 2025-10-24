"use client";

import * as React from "react";
import { Card, CardContent } from "@repo/ui/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@repo/ui/components/ui/carousel";
import UserReviewsData from './user-reviews-data';
import Autoplay from 'embla-carousel-autoplay';

export function UserReviews() {

  const renderStars = (rating: number) => {
    let stars = "";
    for (let i = 0; i < 5; i++) {
      stars += i < rating ? "★" : "☆";
    }
    return stars;
  };

  return (
    <div className="w-5/6 md:w-full">
      <h2 className="text-2xl md:text-4xl font-bold mb-4 text-center my-8">What our Users say</h2>
      <Carousel className="w-full max-w-sm md:max-w-md mx-auto" plugins={[
        Autoplay({
          delay: 3500,
        })
      ]}>
        <CarouselContent>
          {UserReviewsData.map((review, index) => (
            <CarouselItem key={index}>
              <div className="p-1">
                <Card>
                  <CardContent className="flex flex-col items-center justify-center p-4 md:p-6">
                    <div className="text-lg md:text-xl font-semibold mb-1">{review.reviewerName}</div>
                    <div className="text-xs text-gray-400 mb-1">{review.reviewDate}</div>
                    <p className="text-sm text-gray-600 mb-1">{review.review}</p>
                    <div className="text-sm font-medium text-yellow-400 mb-1">
                      {renderStars(review.reviewStar)}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  )
}

export default UserReviews
