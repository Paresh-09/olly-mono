import { NextResponse } from "next/server";
import { validateRequest } from "@/lib/auth";
import prismadb from "@/lib/prismadb";
import { Platform } from "@repo/db";

export async function GET(
  request: Request,
  props: { params: Promise<{ platform: string, id: string }> }
) {
  const params = await props.params;
  try {
    const session = await validateRequest();
    const { platform, id } = params;

    // Validate platform and ID
    if (!platform || !id) {
      return NextResponse.json(
        { error: "Platform and ID are required" }, 
        { status: 400 }
      );
    }

    // Find the audit profile data with the follower check result
    const auditData = await prismadb.auditProfileData.findFirst({
      where: {
        id: id,
        platform: platform.toUpperCase() as Platform,
        // If user is logged in, ensure they own the report
        userId: session?.user?.id || undefined
      },
      include: {
        followerCheckAnalysis: true
      }
    });

    // Handle cases where no data is found
    if (!auditData) {
      return NextResponse.json(
        { error: "Follower check report not found or access denied" }, 
        { status: 404 }
      );
    }

    // Prepare the response
    const result = {
      profile: {
        id: auditData.id,
        userId: auditData.userId,
        platform: auditData.platform,
        profileUrl: auditData.profileUrl,
        profileUsername: auditData.profileUsername,
        profileName: auditData.profileName,
        createdAt: auditData.createdAt,
        updatedAt: auditData.updatedAt,
        isAnonymous: !auditData.userId
      },
      audit: {
        overallScore: auditData.followerCheckAnalysis?.fakeFollowerScore || null,
        summary: auditData.followerCheckAnalysis?.summary || "",
        keyMetrics: {
          totalFollowers: auditData.followerCheckAnalysis?.totalFollowers,
          realFollowers: auditData.followerCheckAnalysis?.realFollowers,
          fakeFollowers: auditData.followerCheckAnalysis?.fakeFollowers,
          followBackRatio: auditData.followerCheckAnalysis?.followBackRatio,
          fakeFollowerPercentage: auditData.followerCheckAnalysis?.fakeFollowerPercentage
        },
        detailedAnalysis: auditData.followerCheckAnalysis?.detailedAnalysis || [],
        insights: auditData.followerCheckAnalysis?.insights || [],
        strengths: auditData.followerCheckAnalysis?.strengths || [],
        weaknesses: auditData.followerCheckAnalysis?.weaknesses || [],
        recommendations: auditData.followerCheckAnalysis?.recommendations || []
      },
      // Include raw data if needed for debugging or advanced analysis
      rawData: auditData.rawData
    };

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error("Error fetching follower check report:", error);
    return NextResponse.json(
      { error: "Failed to fetch follower check report" }, 
      { status: 500 }
    );
  }
}