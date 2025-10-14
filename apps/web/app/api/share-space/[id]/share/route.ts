import { NextResponse } from 'next/server';
import { validateRequest } from '@/lib/auth';
import prisma from '@/lib/prismadb';

export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const { user } = await validateRequest();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const postId = params.id;

    // Get the post and check if it exists
    const post = await prisma.sharedPost.findUnique({
      where: { id: postId },
      select: {
        id: true,
        userId: true,
        title: true,
        creditsPerShare: true,
        remainingCredits: true,
        deadline: true,
        isExpired: true,
        shares: {
          where: { userId: user.id },
          select: { id: true },
        },
      },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Check if user is the post owner
    if (post.userId === user.id) {
      return NextResponse.json({ error: 'Cannot interact with your own post' }, { status: 400 });
    }

    // Check if user already interacted with the post
    if (post.shares.length > 0) {
      return NextResponse.json({ error: 'Already viewed this post' }, { status: 400 });
    }

    // Check if post has enough remaining credits
    if (post.remainingCredits < post.creditsPerShare) {
      return NextResponse.json({ error: 'Post has no more credit rewards available' }, { status: 400 });
    }

    // Check if post is expired
    if (post.isExpired || (post.deadline && new Date(post.deadline) <= new Date())) {
      return NextResponse.json({ error: 'This post has expired' }, { status: 400 });
    }

    // Process the interaction and credit transaction
    const result = await prisma.$transaction(async (tx) => {
      // First, create or get user credit record
      const userCredit = await tx.userCredit.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          balance: post.creditsPerShare,
        },
        update: {
          balance: { increment: post.creditsPerShare },
        },
      });

      // Record the interaction
      const share = await tx.sharedPostShare.create({
        data: {
          userId: user.id,
          postId: post.id,
          platform: 'LINKEDIN', // Default to LINKEDIN for tracking
          creditsPaid: post.creditsPerShare,
        },
      });

      // Update post's remaining credits
      await tx.sharedPost.update({
        where: { id: post.id },
        data: {
          remainingCredits: { decrement: post.creditsPerShare },
        },
      });

      // Record the credit transaction
      await tx.creditTransaction.create({
        data: {
          userCreditId: userCredit.id, // Use the userCredit.id instead of user.id
          amount: post.creditsPerShare,
          type: 'EARNED',
          description: `Earned credits for viewing post: ${post.title}`,
        },
      });

      return share;
    });

    return NextResponse.json({
      credited: true,
      creditsPaid: post.creditsPerShare,
    });
  } catch (error) {
    console.error('Error processing post interaction:', error);
    return NextResponse.json({ error: 'Failed to process interaction' }, { status: 500 });
  }
} 