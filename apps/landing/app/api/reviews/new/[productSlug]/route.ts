// app/api/reviews/[productSlug]/route.ts
import { NextResponse } from 'next/server';
import prismadb from '@/lib/prismadb';
import { getProductBySlug } from '@/lib/product';

export async function GET(request: Request, props: { params: Promise<{ productSlug: string }> }) {
  const params = await props.params;
  try {
    const productSlug = params.productSlug;
    const product = getProductBySlug(productSlug);

    if (!product) {
      return NextResponse.json(
        { error: 'Invalid product' },
        { status: 400 }
      );
    }

    const reviews = await prismadb.productReview.findMany({
      where: {
        productSlug,
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

    return NextResponse.json(reviews);
  } catch (error) {
    console.error('Failed to fetch reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}