// app/api/user/licenses/route.ts
import { NextRequest, NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import { validateRequest } from "@/lib/auth";

// GET /api/user/licenses
export async function GET(request: NextRequest) {
  try {
    const {user} = await validateRequest();
    
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const userId = user.id;
    
    // Fetch the user's license keys
    const userLicenseKeys = await prismadb.userLicenseKey.findMany({
      where: {
        userId,
      },
      include: {
        licenseKey: true,
      },
      orderBy: {
        assignedAt: 'desc',
      },
    });
    
    // Format the response to mask the actual keys
    const licenses = userLicenseKeys.map(userLicenseKey => {
      const { licenseKey } = userLicenseKey;
      const key = licenseKey.key;
      // Show only first 8 characters, mask the rest
      const maskedKey = `${key.substring(0, 8)}${'•'.repeat(16)}`;
      
      return {
        id: licenseKey.id,
        key: key, // Full key is needed for copy to clipboard
        maskedKey,
        isActive: licenseKey.isActive,
        tier: licenseKey.tier,
        vendor: licenseKey.vendor,
        createdAt: userLicenseKey.assignedAt,
      };
    });
    
    return NextResponse.json({ licenses });
    
  } catch (error) {
    console.error("Error fetching license keys:", error);
    return NextResponse.json({ error: "Failed to fetch license keys" }, { status: 500 });
  }
}