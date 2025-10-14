import { NextResponse } from 'next/server';
import { validateRequest } from '@/lib/auth';
import prismadb from '@/lib/prismadb';

export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const { user } = await validateRequest();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const postId = params.id;

    // Get the post and check if it exists
    const post = await prismadb.sharedPost.findUnique({
      where: { id: postId },
      select: {
        id: true,
        userId: true,
        title: true,
        creditsPerLike: true,
        remainingCredits: true,
        deadline: true,
        isExpired: true,
        likes: {
          where: { userId: user.id },
          select: {
            id: true,
            userId: true,
            postId: true,
            creditsPaid: true,
            createdAt: true,
          },
        },
      },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Check if user is the post owner
    if (post.userId === user.id) {
      return NextResponse.json(
        { error: 'Cannot like your own post' },
        { status: 400 }
      );
    }

    // Check if user already liked the post
    const existingLike = post.likes[0];
    if (existingLike) {
      return NextResponse.json(
        { error: 'Already liked this post' },
        { status: 400 }
      );
    }

    // Check if post has enough remaining credits
    if (post.remainingCredits < post.creditsPerLike) {
      return NextResponse.json(
        { error: 'Post has no more credit rewards available' },
        { status: 400 }
      );
    }

    // Check if post is expired
    if (post.isExpired || (post.deadline && new Date(post.deadline) <= new Date())) {
      return NextResponse.json(
        { error: 'This post has expired' },
        { status: 400 }
      );
    }

    // Process the like and credit transaction
    const result = await prismadb.$transaction(async (tx) => {
      // Create the like
      const like = await tx.sharedPostLike.create({
        data: {
          userId: user.id,
          postId: post.id,
          creditsPaid: post.creditsPerLike,
        },
      });

      // Update post's remaining credits
      await tx.sharedPost.update({
        where: { id: post.id },
        data: {
          remainingCredits: { decrement: post.creditsPerLike },
        },
      });

      // Add credits to the user who liked
      await tx.userCredit.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          balance: post.creditsPerLike,
        },
        update: {
          balance: { increment: post.creditsPerLike },
        },
      });

      // Record the credit transaction
      await tx.creditTransaction.create({
        data: {
          userCreditId: user.id,
          amount: post.creditsPerLike,
          type: 'EARNED',
          description: `Earned credits for liking post: ${post.title}`,
        },
      });

      return like;
    });

    return NextResponse.json({
      liked: true,
      creditsPaid: post.creditsPerLike,
    });
  } catch (error) {
    console.error('Error processing like:', error);
    return NextResponse.json(
      { error: 'Failed to process like' },
      { status: 500 }
    );
  }
} 