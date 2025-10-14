import { NextRequest, NextResponse } from 'next/server';
import prismadb from '@/lib/prismadb';
import { validateRequest } from '@/lib/auth';

export async function GET(request: Request, props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  try {
    const { slug } = params;

    const reviews = await prismadb.productReview.findMany({
      where: {
        productSlug: slug,
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


export async function POST(request: NextRequest) {
  try {
      const { user } = await validateRequest();
  
    const body = await request.json();
    
    // Extract required fields
    const { productSlug, rating, reviewBody, authorName } = body;
    
    // Validate input
    if (!productSlug) {
      return NextResponse.json({ error: 'Product slug is required' }, { status: 400 });
    }
    
    if (!rating || isNaN(Number(rating)) || Number(rating) < 1 || Number(rating) > 5) {
      return NextResponse.json({ error: 'Valid rating (1-5) is required' }, { status: 400 });
    }
    
    if (!reviewBody || reviewBody.trim().length === 0) {
      return NextResponse.json({ error: 'Review text is required' }, { status: 400 });
    }
    
    if (!authorName || authorName.trim().length === 0) {
      return NextResponse.json({ error: 'Author name is required' }, { status: 400 });
    }
    
    // Create the review
    const review = await prismadb.productReview.create({
      data: {
        productSlug,
        rating: Number(rating),
        reviewBody: reviewBody.trim(),
        authorName: authorName.trim(),
        ...(user?.id ? { authorId: user.id } : {}),

        isVerified: !!user?.id,
        status: 'PENDING'
      }
    });
    
    return NextResponse.json({ 
      success: true,
      message: 'Review submitted successfully and is pending approval',
      review: {
        id: review.id,
        authorName: review.authorName,
        rating: review.rating,
        reviewBody: review.reviewBody,
        createdAt: review.createdAt.toISOString(),
        isVerified: review.isVerified,
        status: review.status
      }
    });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { error: 'Failed to submit review. Please try again later.' },
      { status: 500 }
    );
  }
}