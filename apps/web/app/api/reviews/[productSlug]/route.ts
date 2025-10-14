// app/api/reviews/[productSlug]/route.ts
import { NextResponse } from 'next/server';
import prismadb from '@/lib/prismadb';

export async function GET(request: Request, props: { params: Promise<{ productSlug: string }> }) {
  const params = await props.params;
  try {
    const { productSlug } = params;
    
    const reviews = await prismadb.productReview.findMany({
      where: {
        productSlug: productSlug,
        status: 'APPROVED'
      },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        user: {
          select: {
            name: true,
            picture: true
          }
        }
      }
    });

    const transformedReviews = reviews.map(review => ({
      id: review.id,
      authorName: review.authorName,
      rating: review.rating,
      reviewBody: review.reviewBody,
      createdAt: review.createdAt.toISOString(),
      isVerified: review.isVerified,
      authorPicture: review.user?.picture || null,
    }));

    return NextResponse.json(transformedReviews);
  } catch (error) {
    console.error('Failed to fetch reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}