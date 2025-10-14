import { NextRequest, NextResponse } from 'next/server';
import { validateRequest } from "@/lib/auth";
import prismadb from '@/lib/prismadb';
import { Prisma, TransactionType } from '@prisma/client';
import { hash } from 'bcryptjs';

export async function GET(request: NextRequest) {
  try {
    // Validate admin access
    const { user } = await validateRequest();
    if (!user?.isSuperAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    let whereClause = {};
    if (email) {
      whereClause = {
        email: {
          contains: email,
          mode: 'insensitive'
        }
      };
    }

    type UserWithRelations = Prisma.UserGetPayload<{
      include: {
        licenseKeys: {
          include: {
            licenseKey: true
          }
        },
        credit: true,
        onboarding: true
      }
    }>;

    const users = await prismadb.user.findMany({
      where: whereClause,
      include: {
        licenseKeys: {
          include: {
            licenseKey: true
          }
        },
        credit: true,
        onboarding: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit
    });

    const total = await prismadb.user.count({
      where: whereClause
    });

    return NextResponse.json({
      users: users.map((user: UserWithRelations) => ({
        id: user.id,
        email: user.email,
        name: user.name,
        isAdmin: user.isAdmin,
        isSales: user.isSales,
        credits: user.credit?.balance || 0,
        activeLicenses: user.licenseKeys.filter(lk => lk.licenseKey.isActive).length,
        totalLicenses: user.licenseKeys.length,
        role: user.onboarding?.role || user.onboarding?.roleOther,
        createdAt: user.createdAt
      })),
      total
    });

  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// Add credits to user
export async function POST(request: NextRequest) {
  try {
    // Validate admin access
    const { user } = await validateRequest();
    if (!user?.isSuperAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { email, credits } = body;

    if (!email || typeof credits !== 'number') {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const targetUser = await prismadb.user.findUnique({
      where: { email },
      include: { credit: true }
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const updatedCredit = await prismadb.userCredit.upsert({
      where: { userId: targetUser.id },
      update: {
        balance: {
          increment: credits
        }
      },
      create: {
        userId: targetUser.id,
        balance: credits
      }
    });

    // Create transaction record
    await prismadb.creditTransaction.create({
      data: {
        userCreditId: updatedCredit.id,
        amount: credits,
        type: TransactionType.PLAN_CREDITS_ADJUSTED,
        description: `Admin credit adjustment: ${credits > 0 ? 'Added' : 'Removed'} ${Math.abs(credits)} credits`
      }
    });

    return NextResponse.json({
      success: true,
      newBalance: updatedCredit.balance
    });

  } catch (error) {
    console.error("Error adding credits:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// Reset user's password
export async function PUT(request: NextRequest) {
  try {
    // Validate admin access
    const { user } = await validateRequest();
    if (!user?.isSuperAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { email, newPassword } = body;

    if (!email || !newPassword) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const targetUser = await prismadb.user.findUnique({
      where: { email }
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Hash the new password
    const hashedPassword = await hash(newPassword, 10);

    // Update user's password
    await prismadb.user.update({
      where: { email },
      data: {
        password: hashedPassword,
        // Optionally force logout by revoking all sessions and tokens
        sessions: {
          updateMany: {
            where: {},
            data: { isRevoked: true }
          }
        },
        refreshTokens: {
          updateMany: {
            where: {},
            data: { isRevoked: true }
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Password reset successful'
    });

  } catch (error) {
    console.error("Error resetting password:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// Delete user
export async function DELETE(request: NextRequest) {
  try {
    // Validate admin access
    const { user } = await validateRequest();
    if (!user?.isSuperAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const targetUser = await prismadb.user.findUnique({
      where: { email },
      include: {
        licenseKeys: true,
        credit: true,
        sessions: true,
        refreshTokens: true,
        organizations: true
      }
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Delete user and all related data in a transaction
    await prismadb.$transaction([
      // Delete user's credit transactions
      prismadb.creditTransaction.deleteMany({
        where: { userCreditId: targetUser.credit?.id }
      }),
      // Delete user's credit
      prismadb.userCredit.delete({
        where: { userId: targetUser.id }
      }),
      // Delete user's sessions
      prismadb.session.deleteMany({
        where: { userId: targetUser.id }
      }),
      // Delete user's refresh tokens
      prismadb.refreshToken.deleteMany({
        where: { userId: targetUser.id }
      }),
      // Delete user's organization memberships
      prismadb.organizationUser.deleteMany({
        where: { userId: targetUser.id }
      }),
      // Delete user's license keys
      prismadb.userLicenseKey.deleteMany({
        where: { userId: targetUser.id }
      }),
      // Finally delete the user
      prismadb.user.delete({
        where: { id: targetUser.id }
      })
    ]);

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
} 