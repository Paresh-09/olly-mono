import { NextResponse } from "next/server";
import { fetchSnapshot, generateSnapshotId } from "@/lib/audit/brightData";
import { validateRequest } from "@/lib/auth";
import prismadb from "@/lib/prismadb";
import { AuditStatus, Platform } from "@repo/db";
import OpenAI from "openai";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ platform: string }> }
) {
  try {
    // Make session optional instead of required
    const session = await validateRequest();
    const userId = session?.user?.id || null; // Allow null userId for anonymous users

    const resolvedParams = await params;
    const platform = resolvedParams.platform;
    const { profileUrl } = await request.json();

    if (platform === null) {
      return NextResponse.json({ error: "Enter a valid platform" }, { status: 400 });
    }

    // Check if we already have this audit in the database (for logged in users only)
    let existingAudit = null;
    if (userId) {
      existingAudit = await prismadb.auditProfileData.findFirst({
        where: {
          userId: userId,
          platform: platform.toUpperCase() as Platform,
          profileUrl: profileUrl,
        },
        include: {
          auditResult: true,
        }
      });
    }

    // If we already have audit results, return them immediately
    if (existingAudit?.auditResult) {
      return NextResponse.json({
        success: true,
        status: 'COMPLETED',
        data: {
          profile: {
            id: existingAudit.id,
            userId: existingAudit.userId,
            platform: existingAudit.platform,
            profileUrl: existingAudit.profileUrl,
            profileUsername: existingAudit.profileUsername,
            profileName: existingAudit.profileName,
            createdAt: existingAudit.createdAt,
            updatedAt: existingAudit.updatedAt,
          },
          audit: existingAudit.auditResult,
          isAnonymous: userId === null,
          reportId: existingAudit.id
        }
      });
    }

    // Create a new audit profile record with PROCESSING status
    const newAudit = await prismadb.auditProfileData.create({
      data: {
        userId: userId,
        platform: platform.toUpperCase() as Platform,
        profileUrl: profileUrl,
        auditStatus: 'PROCESSING',
        rawData: {},
      }
    });

    processAuditInBackground(newAudit.id, platform, profileUrl, userId);

    // Return immediately with the job ID
    return NextResponse.json({
      success: true,
      status: 'PROCESSING',
      data: {
        jobId: newAudit.id,
        isAnonymous: userId === null,
        reportId: newAudit.id,
        message: "Your audit is being processed. Check back soon for results."
      }
    });

  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Failed to process social profile" },
      { status: 500 }
    );
  }
}

// Background processing function
async function processAuditInBackground(
  auditId: string,
  platform: string,
  profileUrl: string,
  userId: string | null
) {
  try {
    // Fetch data from Bright Data
    const snapshotId = await generateSnapshotId(profileUrl, platform);
    
    // If Bright Data fails to generate a snapshot ID, delete the audit and return
    if (!snapshotId) {
      console.error("Failed to generate snapshot ID from Bright Data");
      await prismadb.auditProfileData.delete({
        where: { id: auditId }
      });
      return;
    }
    
    const snapshotData = await fetchSnapshot(snapshotId);
    
    // If Bright Data fails to fetch snapshot data, delete the audit and return
    if (!snapshotData || Object.keys(snapshotData).length === 0) {
      console.error("Failed to fetch snapshot data from Bright Data");
      await prismadb.auditProfileData.delete({
        where: { id: auditId }
      });
      return;
    }

    // Check if required profile data is available
    const profileUsername = extractProfileUsername(platform, snapshotData);
    const profileName = extractProfileName(platform, snapshotData);
    
    if (!profileUsername && !profileName) {
      console.error("Failed to extract profile information from snapshot data");
      await prismadb.auditProfileData.delete({
        where: { id: auditId }
      });
      return;
    }

    // Update profile data with fetched info
    const profileData = await prismadb.auditProfileData.update({
      where: { id: auditId },
      data: {
        profileUsername: profileUsername,
        profileName: profileName,
        rawData: snapshotData,
      },
    });

    // Generate AI Analysis
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an expert social media auditor. Provide analysis in the specified JSON format.",
        },
        {
          role: "user",
          content: constructAuditPrompt(platform, {
            platform: platform,
            username: profileUsername,
            displayName: profileName,
            profileUrl: profileUrl,
            metrics: snapshotData,
          }),
        },
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const aiResponse = JSON.parse(completion.choices[0].message.content || "{}");

    // Create AuditResult
    await prismadb.auditResult.create({
      data: {
        profileDataId: profileData.id,
        // Your existing fields
        overallScore: aiResponse.scores?.overall || null,
        engagementScore: aiResponse.scores?.engagement || null,
        profileOptimizationScore: aiResponse.scores?.profileOptimization || null,
        contentQualityScore: aiResponse.scores?.contentQuality || null,
        summary: aiResponse.summary || "",
        strengths: aiResponse.strengths || [],
        weaknesses: aiResponse.weaknesses || [],
        recommendations: aiResponse.recommendations || [],
        profileAnalysis: aiResponse.analysis?.profile || "",
        contentAnalysis: aiResponse.analysis?.content || "",
        audienceAnalysis: aiResponse.analysis?.audience || null,
        engagementAnalysis: aiResponse.analysis?.engagement || "",
        keyMetrics: aiResponse.keyMetrics || {},
      },
    });

    // Update status to completed
    await prismadb.auditProfileData.update({
      where: { id: auditId },
      data: { auditStatus: 'COMPLETED' }
    });

  } catch (error) {
    console.error("Background processing error:", error);
    
    // Delete the audit entry completely instead of updating to ERROR
    try {
      await prismadb.auditProfileData.delete({
        where: { id: auditId }
      });
    } catch (deleteError) {
      console.error("Failed to delete failed audit:", deleteError);
      
      // Fallback: update status to error if deletion fails
      await prismadb.auditProfileData.update({
        where: { id: auditId },
        data: { auditStatus: 'ERROR' }
      });
    }
  }
}


const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function constructAuditPrompt(platform: string, profileData: any) {
  return `You are conducting a professional social media audit for a ${platform} profile as an expert social media auditor. Provide a comprehensive performance analysis and strategic recommendations based on industry standards and best practices.

AUDIT FRAMEWORK:
1. Quantitative Performance Analysis
2. Content Strategy Evaluation
3. Audience Engagement Assessment
4. Competitive Benchmarking
5. Growth Potential Analysis

REQUIRED JSON RESPONSE FORMAT:
{
  "scores": {
    "overall": number (1-100),
    "engagement": number (1-100),
    "profileOptimization": number (1-100),
    "contentQuality": number (1-100)
  },
  "summary": "Comprehensive executive summary",
  "strengths": [
    "Detailed strength points with metrics"
  ],
  "weaknesses": [
    "Specific improvement areas with impact assessment"
  ],
  "recommendations": [
    "Actionable recommendations with implementation guidance"
  ],
  "analysis": {
    "profile": "Technical profile audit findings",
    "content": "Content strategy and performance analysis",
    "audience": "Audience quality and engagement analysis",
    "engagement": "Detailed engagement metrics analysis"
  },
  "keyMetrics": {
    "subscriberCount": number,
    "totalViews": number,
    "videoCount": number,
    "engagementRate": number,
    "avgViewsPerVideo": number,
    "growthRate": number,
    "engagementData": [
      { "name": "Month", "value": number }
    ],
    "viewsData": [
      { "name": "Month", "value": number }
    ],
    "contentTypePerformance": [
      { "name": "ContentType", "value": number }
    ]
  }
}

COMPREHENSIVE AUDIT INSTRUCTIONS:
Conduct a thorough analysis that goes beyond surface-level metrics. Your audit should:

1. Performance Metrics Deep Dive
- Calculate precise engagement rates
- Analyze month-to-month performance trends
- Identify peak performance periods and potential growth opportunities

2. Content Strategy Evaluation
- Break down content types by percentage
- Assess performance of each content category
- Provide insights into most and least effective content types

3. Engagement Analysis
- Detail monthly engagement metrics for past 6 months (use month names like "Jan", "Feb", etc.)
- Compare engagement across different content types
- Identify patterns in audience interaction

4. Growth and Potential Assessment
- Calculate overall and month-over-month growth rates
- Provide comparative analysis against industry benchmarks
- Recommend strategic improvements

5. Detailed Trend Analysis
- For viewsData and engagementData, provide exactly 6 months of data in the format { "name": "Month", "value": number }
- For contentTypePerformance, provide 4 content types in the format { "name": "ContentType", "value": number }
- Ensure the "name" field for engagementData and viewsData uses abbreviated month names ("Jan", "Feb", etc.)
- Ensure the "value" for engagementData is the engagement rate as a decimal (e.g., 2.1 for 2.1%)
- Ensure the "value" for viewsData is the total views for that month
- Ensure the "value" for contentTypePerformance is the percentage (e.g., 35 for 35%)

SPECIFIC DATA FORMAT EXAMPLES:
engagementData must look like:
[
  { "name": "Jan", "value": 2.1 },
  { "name": "Feb", "value": 1.8 },
  ...
]

viewsData must look like:
[
  { "name": "Jan", "value": 15000 },
  { "name": "Feb", "value": 18000 },
  ...
]

contentTypePerformance must look like:
[
  { "name": "Tutorials", "value": 35 },
  { "name": "Reviews", "value": 25 },
  ...
]

PROFILE DATA FOR AUDIT:
${JSON.stringify(profileData, null, 2)}

CRITICAL REQUIREMENTS:
- Provide ALL data points in the specified JSON format exactly as shown above
- Format arrays exactly as shown in the examples with the exact keys ("name" and "value")
- Always include 6 months of data for engagementData and viewsData with conversion eg Million (M) thousads(k)
- Always include 4 content types for contentTypePerformance
- Ensure numerical precision (up to 2 decimal places)
- Translate raw data into actionable strategic insights
- Maintain professional, data-driven language
- Offer clear, implementable recommendations
- Do NOT generate fake or estimated data - use ONLY the profile information provided in profileData
- All metrics, scores, and analysis should be based exclusively on the actual data supplied
- If certain data points are missing, acknowledge gaps rather than inventing figures

Generate a comprehensive audit that transforms raw metrics into a strategic roadmap for content and channel growth.
`;
}


function extractProfileName(platform: string, snapshotData: any): string | null {
  switch (platform) {
    case "youtube":
      return snapshotData[0]?.name || null;
    case "instagram":
      return snapshotData[0]?.full_name || null;
    case "linkedin":
      return snapshotData[0]?.full_name || null;
    case "tiktok":
      return snapshotData[0]?.nickname || null;
    default:
      return null;
  }
}

function extractProfileUsername(platform: string, snapshotData: any): string | null {
  switch (platform) {
    case "youtube":
      return snapshotData[0]?.handle || null;
    case "instagram":
      return snapshotData[0]?.account || null;
    case "linkedin":
      return snapshotData[0]?.id || null;
    case "tiktok":
      return snapshotData[0]?.account_id || null;
    default:
      return null;
  }
}