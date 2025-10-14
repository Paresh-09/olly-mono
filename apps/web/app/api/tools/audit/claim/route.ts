import { NextResponse } from "next/server";
import { validateRequest } from "@/lib/auth";
import prismadb from "@/lib/prismadb";
import { Prisma } from "@repo/db";

export async function POST(request: Request) {
  try {
    const session = await validateRequest();

    // Ensure user is logged in
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be logged in to claim reports" },
        { status: 401 }
      );
    }

    const { reportIds } = await request.json();

    if (!reportIds || !Array.isArray(reportIds) || reportIds.length === 0) {
      return NextResponse.json(
        { error: "No report IDs provided" },
        { status: 400 }
      );
    }

    // Process each report separately to handle constraint violations
    const results = {
      claimed: 0,
      skipped: 0,
      errors: 0
    };

    // Get the anonymous reports first
    const anonymousReports = await prismadb.auditProfileData.findMany({
      where: {
        id: { in: reportIds },
        userId: null // Only get unclaimed reports
      }
    });

    // Process each report individually
    for (const report of anonymousReports) {
      try {
        // Check if user already has this URL/platform combination
        const existingReport = await prismadb.auditProfileData.findFirst({
          where: {
            userId: session.user.id,
            platform: report.platform,
            profileUrl: report.profileUrl
          }
        });

        if (existingReport) {
          // User already has this report - skip it
          results.skipped++;
          continue;
        }

        // Update the report to belong to this user
        await prismadb.auditProfileData.update({
          where: { id: report.id },
          data: { userId: session.user.id }
        });
        
        results.claimed++;
      } catch (error) {
        console.error(`Error processing report ${report.id}:`, error);
        results.errors++;
      }
    }

    return NextResponse.json({
      success: true,
      results: results
    });
  } catch (error) {
    console.error("Error claiming reports:", error);
    return NextResponse.json(
      { error: "Failed to claim reports" },
      { status: 500 }
    );
  }
}