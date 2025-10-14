import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import { validateRequest } from "@/lib/auth";

export async function GET() {
  try {
    // Validate that the user is authenticated
    const { user } = await validateRequest();
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Get user's email for sublicense lookup
    const userEmail = user.email;
    
    if (!userEmail) {
      return NextResponse.json(
        { error: "User email not found" },
        { status: 400 }
      );
    }

    // Fetch user's main licenses from the database
    const userLicenseKeys = await prismadb.userLicenseKey.findMany({
      where: { 
        userId: user.id 
      },
      include: {
        licenseKey: {
          select: {
            id: true,
            key: true,
            isActive: true,
            expiresAt: true,
            tier: true,
            planId: true,
            vendor: true,
          },
        },
      },
    });

    // Fetch user's sublicenses by email
    const userSubLicenses = await prismadb.subLicense.findMany({
      where: { 
        assignedEmail: userEmail,
        status: "ACTIVE" 
      },
      select: {
        id: true,
        key: true,
        status: true,
        mainLicenseKeyId: true,
        mainLicenseKey: {
          select: {
            key: true,
            vendor: true,
            tier: true,
          },
        },
      },
    });

    // Format main licenses for response
    const formattedLicenses = userLicenseKeys
      .filter(license => license.licenseKey.isActive)
      .map((userLicenseKey) => ({
        id: userLicenseKey.licenseKey.id,
        key: userLicenseKey.licenseKey.key,
        type: "main" as const,
        vendor: userLicenseKey.licenseKey.vendor,
        tier: userLicenseKey.licenseKey.tier,
        expiresAt: userLicenseKey.licenseKey.expiresAt,
      }));

    // Format sublicenses for response
    const formattedSubLicenses = userSubLicenses.map((subLicense) => ({
      id: subLicense.id,
      key: subLicense.key,
      type: "sub" as const,
      mainLicenseKey: subLicense.mainLicenseKey?.key,
      mainLicenseKeyId: subLicense.mainLicenseKeyId,
      vendor: subLicense.mainLicenseKey?.vendor,
      tier: subLicense.mainLicenseKey?.tier,
    }));

    // Combine both types of licenses
    const combinedLicenses = [...formattedLicenses, ...formattedSubLicenses];

    // Return the combined licenses
    return NextResponse.json({ 
      licenses: combinedLicenses,
      mainLicenses: formattedLicenses,
      subLicenses: formattedSubLicenses 
    });
    
  } catch (error: any) {
    console.error("Error fetching licenses:", error);
    return NextResponse.json(
      { error: "Failed to fetch licenses", message: error.message },
      { status: 500 }
    );
  }
} 