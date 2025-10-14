import { NextResponse } from 'next/server';
import prismadb from '@/lib/prismadb';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: Request) {
  try {
    // Verify that this is a cron job request
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET_KEY}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    
    // Find all non-expired posts that have passed their deadline
    const expiredPosts = await prismadb.sharedPost.findMany({
      where: {
        isExpired: false,
        deadline: {
          lt: now,
        },
      },
    });

    const results = [];

    // Process each expired post
    for (const post of expiredPosts) {
      try {
        const result = await prismadb.$transaction(async (tx) => {
          // Mark post as expired
          await tx.sharedPost.update({
            where: { id: post.id },
            data: { isExpired: true },
          });

          // Return remaining credits to post creator if any
          if (post.remainingCredits > 0) {
            await tx.userCredit.update({
              where: { userId: post.userId },
              data: {
                balance: { increment: post.remainingCredits },
              },
            });

            // Record the credit transaction
            await tx.creditTransaction.create({
              data: {
                userCreditId: post.userId,
                amount: post.remainingCredits,
                type: 'REFUNDED',
                description: `Refunded ${post.remainingCredits} credits from expired post: ${post.title}`,
              },
            });

            // Update post's remaining credits to 0
            await tx.sharedPost.update({
              where: { id: post.id },
              data: { remainingCredits: 0 },
            });
          }

          return {
            postId: post.id,
            creditsRefunded: post.remainingCredits,
          };
        });

        results.push(result);
      } catch (error) {
        console.error(`Error processing expired post ${post.id}:`, error);
        results.push({
          postId: post.id,
          error: 'Failed to process expired post',
        });
      }
    }

    return NextResponse.json({
      success: true,
      processed: results.length,
      results,
    });
  } catch (error) {
    console.error('Error handling expired posts:', error);
    return NextResponse.json(
      { error: 'Failed to handle expired posts' },
      { status: 500 }
    );
  }
} 