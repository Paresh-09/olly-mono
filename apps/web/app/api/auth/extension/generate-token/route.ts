import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import { validateRequest } from "@/lib/auth";
import { generateTemporaryTokenForExtension } from "@/lib/actions/extension-auth";

export async function POST(request: Request) {
  try {
    const { user } = await validateRequest();
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const { licenseId, apiKeyId, isSubLicense } = await request.json();
    
    if (!licenseId || !apiKeyId) {
      return NextResponse.json(
        { error: "License ID and API Key ID are required" },
        { status: 400 }
      );
    }
    
    // Check if API key belongs to user
    const apiKey = await prismadb.userApiKey.findFirst({
      where: {
        userId: user.id,
        apiKeyId,
      },
    });
    
    if (!apiKey) {
      return NextResponse.json(
        { error: "Invalid API key" },
        { status: 403 }
      );
    }
    
    let token;
    
    if (isSubLicense) {
      // Verify the sublicense belongs to the user by checking the assigned email
      const sublicense = await prismadb.subLicense.findFirst({
        where: {
          id: licenseId,
          assignedEmail: user.email,
          status: "ACTIVE"
        },
      });
      
      if (!sublicense) {
        return NextResponse.json(
          { error: "Invalid sublicense" },
          { status: 403 }
        );
      }
      
      
      // Generate token with sublicense ID
      token = await generateTemporaryTokenForExtension(
        sublicense.mainLicenseKeyId,
        apiKeyId,
        licenseId // Pass sublicense ID as the third parameter
      );
    } else {
      // Verify the license key belongs to the user
      const licenseKey = await prismadb.userLicenseKey.findFirst({
        where: {
          userId: user.id,
          licenseKeyId: licenseId,
        },
      });
      
      if (!licenseKey) {
        return NextResponse.json(
          { error: "Invalid license key" },
          { status: 403 }
        );
      }
      
      
      // Generate token for main license key
      token = await generateTemporaryTokenForExtension(
        licenseId,
        apiKeyId
      );
    }

    
    return NextResponse.json({ token });
  } catch (error: any) {
    console.error("Error generating token:", error);
    return NextResponse.json(
      { error: "Failed to generate token", message: error.message },
      { status: 500 }
    );
  }
}
