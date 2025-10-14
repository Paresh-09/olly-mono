import { NextResponse } from 'next/server';
import prismadb from '@/lib/prismadb';

export async function POST(req: Request) {
  try {
    // Find low-rated reviews
    const lowRatedReviews = await prismadb.productReview.findMany({
      where: { rating: { lt: 4 } }
    });

    // Update each review
    const updates = await Promise.all(
      lowRatedReviews.map(review => 
        prismadb.productReview.update({
          where: { id: review.id },
          data: { 
            rating: Math.random() < 0.5 ? 4 : 5,
            updatedAt: new Date()
          }
        })
      )
    );

    return NextResponse.json({
      message: `Successfully updated ${updates.length} reviews`,
      count: updates.length,
      reviews: updates
    }, { status: 200 });

  } catch (error) {
    console.error('Error updating reviews:', error);
    return NextResponse.json({ 
      error: 'Failed to update reviews' 
    }, { status: 500 });
  }
}