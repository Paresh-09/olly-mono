import { Platform } from "@repo/db";
import { validateRequest } from "@/lib/auth";
import prismadb from "@/lib/prismadb";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  props: { params: Promise<{ id: string, platform: string }> }
) {
  const params = await props.params;
  try {
    ;

    const session = await validateRequest();

    const { id: auditId, platform } = params;


  
    // Validate platform before processing
    if (!platform) {
      return NextResponse.json(
        { error: "Platform is required" }, 
        { status: 400 }
      );
    }

    const auditData = await prismadb.auditProfileData.findFirst({
      where: {
        id: auditId,
        userId: session?.user?.id,
        platform: platform.toUpperCase() as Platform,
      },
      include: {
        auditResult: true,
      },
    });

    if (!auditData) {
      return NextResponse.json(
        { error: "Audit result not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        profile: {
          id: auditData.id,
          userId: auditData.userId,
          platform: auditData.platform,
          profileUrl: auditData.profileUrl,
          profileUsername: auditData.profileUsername,
          profileName: auditData.profileName,
          createdAt: auditData.createdAt,
          updatedAt: auditData.updatedAt,
        },
        audit: auditData.auditResult,
      },
    });
  } catch (error) {
    console.error("Error fetching audit result:", error);
    return NextResponse.json(
      { error: "Failed to fetch audit result" },
      { status: 500 }
    );
  }
}