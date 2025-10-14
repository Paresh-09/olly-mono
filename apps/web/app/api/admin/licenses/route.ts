import { NextRequest, NextResponse } from 'next/server';
import { validateRequest } from "@/lib/auth";
import prismadb from '@/lib/prismadb';
import { TransactionType } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    // Validate admin access
    const { user } = await validateRequest();
    if (!user?.isSuperAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const licenseKey = searchParams.get('licenseKey');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    let whereClause: any = {};
    if (email) {
      whereClause = {
        users: {
          some: {
            user: {
              email: {
                contains: email,
                mode: 'insensitive'
              }
            }
          }
        }
      };
    }
    if (licenseKey) {
      whereClause = {
        ...whereClause,
        key: {
          contains: licenseKey,
          mode: 'insensitive'
        }
      };
    }

    const licenses = await prismadb.licenseKey.findMany({
      where: whereClause,
      include: {
        users: {
          include: {
            user: true
          }
        },
        subLicenses: true,
        installations: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit
    });

    const total = await prismadb.licenseKey.count({
      where: whereClause
    });

    return NextResponse.json({
      licenses: licenses.map(license => ({
        id: license.id,
        key: license.key,
        isActive: license.isActive,
        vendor: license.vendor,
        tier: license.tier,
        user: license.users[0]?.user ? {
          id: license.users[0].user.id,
          email: license.users[0].user.email,
          name: license.users[0].user.name
        } : null,
        subLicenses: license.subLicenses.length,
        installations: license.installations.length,
        activatedAt: license.activatedAt,
        deActivatedAt: license.deActivatedAt,
        createdAt: license.createdAt
      })),
      total
    });

  } catch (error) {
    console.error("Error fetching licenses:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// Transfer license
export async function POST(request: NextRequest) {
  try {
    // Validate admin access
    const { user } = await validateRequest();
    if (!user?.isSuperAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { licenseKey, newEmail } = body;

    if (!licenseKey || !newEmail) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    // Find the license
    const license = await prismadb.licenseKey.findFirst({
      where: { key: licenseKey },
      include: {
        users: {
          include: {
            user: true
          }
        }
      }
    });

    if (!license) {
      return NextResponse.json({ error: 'License not found' }, { status: 404 });
    }

    // Find or create the new user
    const newUser = await prismadb.user.upsert({
      where: { email: newEmail },
      update: {},
      create: {
        email: newEmail
      }
    });

    // Remove old user-license relationship
    if (license.users.length > 0) {
      await prismadb.userLicenseKey.deleteMany({
        where: { licenseKeyId: license.id }
      });
    }

    // Create new user-license relationship
    await prismadb.userLicenseKey.create({
      data: {
        userId: newUser.id,
        licenseKeyId: license.id
      }
    });

    return NextResponse.json({
      success: true,
      message: `License transferred to ${newEmail}`
    });

  } catch (error) {
    console.error("Error transferring license:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
} 