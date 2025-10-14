import { NextResponse } from 'next/server';
import { validateRequest } from '@/lib/auth';
import prismadb from '@/lib/prismadb';
import { Platform, SharedPostStatus } from '@prisma/client';

export async function GET(req: Request) {
  try {
    const { user } = await validateRequest();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const platformParam = searchParams.get('platform');
    const statusParam = searchParams.get('status');
    const showExpired = searchParams.get('showExpired') === 'true';

    const where = {
      ...(statusParam && { status: statusParam as SharedPostStatus }),
      ...(platformParam && { platform: platformParam as Platform }),
      ...(!showExpired && { isExpired: false }), // Only show non-expired posts by default
    };

    const [posts, total] = await Promise.all([
      prismadb.sharedPost.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              picture: true,
            },
          },
          _count: {
            select: {
              likes: true,
              shares: true,
              comments: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prismadb.sharedPost.count({ where }),
    ]);

    const formattedPosts = posts.map(post => ({
      ...post,
      user: {
        ...post.user,
        image: post.user.picture,
      },
    }));

    return NextResponse.json({
      posts: formattedPosts,
      total,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error fetching shared posts:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { user } = await validateRequest();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { title, url, platform, description, creditBudget, creditsPerLike, creditsPerShare, creditsPerComment, deadline } = body;

    if (!title || !url || !platform || !deadline) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate deadline
    const deadlineDate = new Date(deadline);
    if (deadlineDate <= new Date()) {
      return NextResponse.json({ error: 'Deadline must be in the future' }, { status: 400 });
    }

    // Validate credit settings
    if (creditBudget < 0 || creditsPerLike < 0 || creditsPerShare < 0 || creditsPerComment < 0) {
      return NextResponse.json({ error: 'Credit values cannot be negative' }, { status: 400 });
    }

    // Check if user has enough credits
    const userCredit = await prismadb.userCredit.findUnique({
      where: { userId: user.id },
    });

    if (!userCredit || userCredit.balance < creditBudget) {
      return NextResponse.json({ error: 'Insufficient credits' }, { status: 400 });
    }

    // Create transaction
    const post = await prismadb.$transaction(async (tx) => {
      // Deduct credits from user
      await tx.userCredit.update({
        where: { userId: user.id },
        data: { balance: { decrement: creditBudget } },
      });

      // Create credit transaction record
      await tx.creditTransaction.create({
        data: {
          userCreditId: userCredit.id,
          amount: -creditBudget,
          type: 'SPENT',
          description: `Credit allocation for shared post: ${title}`,
        },
      });

      // Create the post
      return tx.sharedPost.create({
        data: {
          title,
          url,
          platform: platform as Platform,
          description,
          userId: user.id,
          creditBudget,
          creditsPerLike,
          creditsPerShare,
          creditsPerComment,
          remainingCredits: creditBudget,
          deadline: deadlineDate,
          isExpired: false,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              picture: true,
            },
          },
          _count: {
            select: {
              likes: true,
              shares: true,
              comments: true,
            },
          },
        },
      });
    });

    // Format the response to match GET endpoint
    const formattedPost = {
      ...post,
      user: {
        ...post.user,
        image: post.user.picture,
      },
    };

    return NextResponse.json(formattedPost);
  } catch (error) {
    console.error('Error creating shared post:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 