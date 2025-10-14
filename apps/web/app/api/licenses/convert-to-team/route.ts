import { NextResponse } from 'next/server';
import { validateRequest } from "@/lib/auth";
import prismadb from "@/lib/prismadb";

export async function POST(req: Request) {
  try {
    let user;
    
    // Check for test user ID
    const testUserId = (req as any).testUserId;
    
    if (testUserId) {
      // Use test user ID
      user = await prismadb.user.findUnique({
        where: { id: testUserId }
      });
    } else {
      // Use regular authentication
      const auth = await validateRequest();
      user = auth.user;
    }

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { licenseIds } = await req.json();

    if (!Array.isArray(licenseIds) || licenseIds.length < 2) {
      return new NextResponse("Invalid request. At least 2 licenses required.", { status: 400 });
    }

    const result = await prismadb.$transaction(async (tx) => {
      // Rest of the transaction code remains the same...
      // 1. Verify all licenses belong to the user and are active
      const licenses = await tx.userLicenseKey.findMany({
        where: {
          userId: user.id,
          licenseKey: {
            id: { in: licenseIds },
            isActive: true
          }
        },
        include: {
          licenseKey: true
        }
      });

      if (licenses.length !== licenseIds.length) {
        throw new Error("Invalid licenses selected");
      }

      // Check if all licenses are from the same vendor
      const vendors = new Set(licenses.map(l => l.licenseKey.vendor));
      if (vendors.size > 1) {
        throw new Error("Cannot combine licenses from different vendors");
      }

      // Check if licenses can be combined based on tier and product ID
      const canCombine = licenses.every(license => 
        license.licenseKey.tier === 1 || 
        (license.licenseKey.lemonProductId === 328561)
      );

      if (!canCombine) {
        throw new Error("Only tier 1 licenses or specific LemonSqueezy products can be combined");
      }

      // 2. Create organization with unique name
      const organization = await tx.organization.create({
        data: {
          name: `${user.username || user.email}'s Team ${Math.random().toString(36).slice(2, 7)}`,
          users: {
            create: {
              userId: user.id,
              role: 'OWNER'
            }
          },
          isPremium: true
        }
      });

      // Sort licenses by tier (higher tier first) to choose main license
      const sortedLicenses = [...licenses].sort((a, b) => {
        const tierA = a.licenseKey.tier || 0;
        const tierB = b.licenseKey.tier || 0;
        return tierB - tierA;
      });

      const mainLicense = sortedLicenses[0].licenseKey;
      const otherLicenses = sortedLicenses.slice(1);

      // Update main license
      const updatedMainLicense = await tx.licenseKey.update({
        where: { id: mainLicense.id },
        data: {
          tier: 7,
          vendor: mainLicense.vendor || 'AppSumo',
          organizationId: organization.id,
          converted_to_team: true
        }
      });

      // Create sub-licenses using original license keys
      const subLicenseData = otherLicenses.map(license => ({
        key: license.licenseKey.key,
        status: 'ACTIVE',
        mainLicenseKeyId: mainLicense.id,
        converted_to_team: true,
        vendor: mainLicense.vendor || 'AppSumo',
      }));

      const subLicenses = await tx.subLicense.createMany({
        data: subLicenseData
      });

      // Deactivate converted licenses
      await tx.licenseKey.updateMany({
        where: {
          id: { in: otherLicenses.map(l => l.licenseKey.id) }
        },
        data: {
          isActive: false
        }
      });

      // Set organization's main license
      await tx.organization.update({
        where: { id: organization.id },
        data: {
          mainLicenseKeyId: mainLicense.id
        }
      });

      return {
        mainLicense: updatedMainLicense,
        subLicenses,
        organization
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('[LICENSE_CONVERSION_ERROR]', error);
    if (error instanceof Error) {
      return new NextResponse(error.message, { status: 400 });
    }
    return new NextResponse("Internal Error", { status: 500 });
  }
}