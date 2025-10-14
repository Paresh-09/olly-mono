import { NextRequest, NextResponse } from 'next/server';
import { validateRequest } from "@/lib/auth";
import prismadb from '@/lib/prismadb';
import { v4 as uuidv4 } from 'uuid';

export async function GET(request: NextRequest) {
  try {
    // Validate admin access
    const { user } = await validateRequest();
    if (!user?.isSuperAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const mainLicenseKey = searchParams.get('mainLicenseKey');
    const email = searchParams.get('email');

    if (!mainLicenseKey) {
      return NextResponse.json({ error: 'Main license key is required' }, { status: 400 });
    }

    const license = await prismadb.licenseKey.findFirst({
      where: { key: mainLicenseKey },
      include: {
        subLicenses: {
          include: {
            assignedUser: true
          }
        }
      }
    });

    if (!license) {
      return NextResponse.json({ error: 'License not found' }, { status: 404 });
    }

    return NextResponse.json({
      subLicenses: license.subLicenses.map(sub => ({
        id: sub.id,
        key: sub.key,
        status: sub.status,
        assignedEmail: sub.assignedEmail,
        assignedUser: sub.assignedUser ? {
          id: sub.assignedUser.id,
          email: sub.assignedUser.email,
          name: sub.assignedUser.name
        } : null,
        createdAt: sub.createdAt,
        deactivatedAt: sub.deactivatedAt
      }))
    });

  } catch (error) {
    console.error("Error fetching sub-licenses:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// Create sub-licenses
export async function POST(request: NextRequest) {
  try {
    // Validate admin access
    const { user } = await validateRequest();
    if (!user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { mainLicenseKey, quantity, assignedEmail } = body;

    if (!mainLicenseKey || !quantity || quantity < 1) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const license = await prismadb.licenseKey.findFirst({
      where: { key: mainLicenseKey },
      include: { subLicenses: true }
    });

    if (!license) {
      return NextResponse.json({ error: 'License not found' }, { status: 404 });
    }

    // Create sub-licenses
    const newSubLicenses = [];
    for (let i = 0; i < quantity; i++) {
      let subLicenseKey = uuidv4();
      const subLicense = await prismadb.subLicense.create({
        data: {
          key: subLicenseKey,
          status: "ACTIVE",
          mainLicenseKeyId: license.id,
          assignedEmail: assignedEmail || null,
          originalLicenseKey: mainLicenseKey,
          vendor: license.vendor
        }
      });
      newSubLicenses.push(subLicense);
    }

    return NextResponse.json({
      success: true,
      subLicenses: newSubLicenses
    });

  } catch (error) {
    console.error("Error creating sub-licenses:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// Update sub-license (assign/unassign/deactivate)
export async function PUT(request: NextRequest) {
  try {
    // Validate admin access
    const { user } = await validateRequest();
    if (!user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { subLicenseKey, action, assignedEmail } = body;

    if (!subLicenseKey || !action) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const subLicense = await prismadb.subLicense.findUnique({
      where: { key: subLicenseKey }
    });

    if (!subLicense) {
      return NextResponse.json({ error: 'Sub-license not found' }, { status: 404 });
    }

    let updateData: any = {};

    switch (action) {
      case 'assign':
        if (!assignedEmail) {
          return NextResponse.json({ error: 'Email is required for assignment' }, { status: 400 });
        }
        // Find or create user
        const assignedUser = await prismadb.user.upsert({
          where: { email: assignedEmail },
          update: {},
          create: {
            email: assignedEmail
          }
        });
        updateData = {
          assignedEmail: assignedEmail,
          assignedUserId: assignedUser.id
        };
        break;

      case 'unassign':
        updateData = {
          assignedEmail: null,
          assignedUserId: null
        };
        break;

      case 'deactivate':
        updateData = {
          status: "INACTIVE",
          deactivatedAt: new Date()
        };
        break;

      case 'activate':
        updateData = {
          status: "ACTIVE",
          deactivatedAt: null
        };
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const updatedSubLicense = await prismadb.subLicense.update({
      where: { key: subLicenseKey },
      data: updateData,
      include: {
        assignedUser: true
      }
    });

    return NextResponse.json({
      success: true,
      subLicense: {
        id: updatedSubLicense.id,
        key: updatedSubLicense.key,
        status: updatedSubLicense.status,
        assignedEmail: updatedSubLicense.assignedEmail,
        assignedUser: updatedSubLicense.assignedUser ? {
          id: updatedSubLicense.assignedUser.id,
          email: updatedSubLicense.assignedUser.email,
          name: updatedSubLicense.assignedUser.name
        } : null,
        createdAt: updatedSubLicense.createdAt,
        deactivatedAt: updatedSubLicense.deactivatedAt
      }
    });

  } catch (error) {
    console.error("Error updating sub-license:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
} 