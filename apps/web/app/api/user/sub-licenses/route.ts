import { NextRequest, NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import { validateRequest } from "@/lib/auth";

// GET /api/user/sub-licenses
export async function GET(request: NextRequest) {
  try {
    const { user } = await validateRequest();

    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find sub-licenses by either assignedEmail or assignedUserId
    const rawSubLicenses = await prismadb.subLicense.findMany({
      where: {
        OR: [
          { assignedEmail: user.email },
          { assignedUserId: user.id }
        ]
      },
      select: {
        id: true,
        key: true,
        status: true,
        assignedEmail: true,
        createdAt: true,
        mainLicenseKey: {
          select: {
            id: true,
            tier: true,
            vendor: true,
            lemonProductId: true,
            organization: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Format the response following dashboard logic
    const licenses = rawSubLicenses.map(subLicense => {
      const key = subLicense.key;
      // Show only first 8 characters, mask the rest
      const maskedKey = `${key.substring(0, 8)}${'•'.repeat(16)}`;

      return {
        id: subLicense.id,
        key: key, // Full key is needed for navigation
        maskedKey,
        isActive: subLicense.status === "ACTIVE",
        status: subLicense.status,
        assignedEmail: subLicense.assignedEmail,
        tier: subLicense.mainLicenseKey.tier,
        vendor: subLicense.mainLicenseKey.vendor || "unknown", // Handle null vendor like dashboard
        lemonProductId: subLicense.mainLicenseKey.lemonProductId,
        organization: subLicense.mainLicenseKey.organization || undefined,
        createdAt: subLicense.createdAt,
      };
    });

    return NextResponse.json({ licenses });

  } catch (error) {
    console.error("Error fetching sub licenses:", error);
    return NextResponse.json({ error: "Failed to fetch sub licenses" }, { status: 500 });
  }
}