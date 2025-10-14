import { NextResponse } from "next/server";
import { validateRequest } from "@/lib/auth";
import prismadb from "@/lib/prismadb";
import { Platform, AuditStatus } from "@repo/db";
import OpenAI from "openai";
import { fetchSnapshot, generateSnapshotId } from "@/lib/audit/brightData";
import { validateProfileUrl } from "@/lib/audit/profile-urls-validation";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request, props: { params: Promise<{ platform: string }> }) {
  const params = await props.params;
  try {
    const session = await validateRequest();
    const userId = session?.user?.id || null;
    const platform = params.platform.toUpperCase() as Platform;

    const { profileUrl } = await request.json();

    // Validate URL
    if (!validateProfileUrl(platform.toLowerCase(), profileUrl)) {
      return NextResponse.json(
        { error: "Invalid profile URL for the selected platform" }, 
        { status: 400 }
      );
    }

    // Generate snapshot ID

    const snapshotId = await generateSnapshotId(profileUrl, platform.toLowerCase());
    
    if (!snapshotId) {
      return NextResponse.json(
        { error: "Failed to generate snapshot for the profile" }, 
        { status: 400 }
      );
    }

    // Fetch snapshot data
    const snapshotData = await fetchSnapshot(snapshotId);
    
    if (!snapshotData || Object.keys(snapshotData).length === 0) {
      return NextResponse.json(
        { error: "Failed to retrieve profile data" }, 
        { status: 400 }
      );
    }

    // Extract profile details
    const profileUsername = extractProfileUsername(platform, snapshotData);
    const profileName = extractProfileName(platform, snapshotData);

    // Generate AI-powered follower analysis
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an expert social media analyst specializing in detecting fake followers and assessing follower authenticity."
        },
        {
          role: "user",
          content: constructFollowerAnalysisPrompt(platform, {
            platform,
            username: profileUsername,
            displayName: profileName,
            profileUrl,
            metrics: snapshotData
          })
        }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" }
    });

    const aiResponse = JSON.parse(completion.choices[0].message.content || "{}");

    // Create audit profile record with follower analysis
    const auditRecord = await prismadb.auditProfileData.create({
      data: {
        userId,
        platform,
        profileUrl,
        profileUsername,
        profileName,
        rawData: snapshotData,
        auditStatus: 'COMPLETED',
        // Create associated follower check analysis
        followerCheckAnalysis: {
          create: {
            totalFollowers: aiResponse.totalFollowers,
            realFollowers: aiResponse.realFollowers,
            fakeFollowers: aiResponse.fakeFollowers,
            followBackRatio: aiResponse.followBackRatio,
            fakeFollowerScore: aiResponse.fakeFollowerScore,
            fakeFollowerPercentage: aiResponse.fakeFollowerPercentage,
            summary: aiResponse.summary,
            detailedAnalysis: aiResponse.detailedAnalysis,
            insights: aiResponse.insights,
            strengths: aiResponse.strengths,
            weaknesses: aiResponse.weaknesses,
            recommendations: aiResponse.recommendations
          }
        }
      },
      include: {
        followerCheckAnalysis: true
      }
    });

    return NextResponse.json({
      success: true,
      result: {
        profileId: auditRecord.id,
        totalFollowers: aiResponse.totalFollowers,
        realFollowers: aiResponse.realFollowers,
        fakeFollowers: aiResponse.fakeFollowers,
        followBackRatio: aiResponse.followBackRatio,
        fakeFollowerScore: aiResponse.fakeFollowerScore,
        fakeFollowerPercentage: aiResponse.fakeFollowerPercentage,
        summary: aiResponse.summary,
        detailedAnalysis: aiResponse.detailedAnalysis || [],
        insights: aiResponse.insights || [],
        strengths: aiResponse.strengths || [],
        weaknesses: aiResponse.weaknesses || [],
        recommendations: aiResponse.recommendations || []
      }
    });

  } catch (error) {
    console.error("Follower check error:", error);
    return NextResponse.json(
      { error: "Failed to perform follower check" }, 
      { status: 500 }
    );
  }
}

// Helper functions for extracting profile details
function extractProfileName(platform: string, snapshotData: any): string | null {
  const nameMap: Record<string, string[]> = {
    INSTAGRAM: ['full_name', 'name'],
    TIKTOK: ['nickname', 'name'],
    LINKEDIN: ['full_name', 'name']
  };

  const keys = nameMap[platform] || [];
  for (const key of keys) {
    const name = snapshotData[0]?.[key];
    if (name) return name;
  }
  return null;
}

function extractProfileUsername(platform: string, snapshotData: any): string | null {
  const usernameMap: Record<string, string[]> = {
    INSTAGRAM: ['account', 'username'],
    TIKTOK: ['account_id', 'username'],
    LINKEDIN: ['id', 'username']
  };

  const keys = usernameMap[platform] || [];
  for (const key of keys) {
    const username = snapshotData[0]?.[key];
    if (username) return username;
  }
  return null;
}

function constructFollowerAnalysisPrompt(platform: string, profileData: any) {
  return `Conduct a professional fake follower analysis for a ${platform} profile.

CRITICAL ANALYSIS GUIDELINES:
1. Follow-back Ratio Interpretation:
   - 2-10% follow-back rate is considered healthy and authentic
   - Less than 2% or more than 10% suggests potential bot activity

2. Follower Authenticity Factors:
   - Account age
   - Profile completeness
   - Post frequency
   - Engagement patterns
   - Interaction quality

REQUIRED JSON RESPONSE FORMAT:
{
  "totalFollowers": number,
  "realFollowers": number,
  "fakeFollowers": number,
  "followBackRatio": number (0-100),
  "fakeFollowerScore": number (0-100),
  "fakeFollowerPercentage": number (0-100),
  "summary": "Concise overview of follower authenticity",
  "detailedAnalysis": [
    "Specific points about follower composition"
  ],
  "insights": [
    "Key observations about follower quality"
  ],
  "strengths": [
    "Positive aspects of the follower base"
  ],
  "weaknesses": [
    "Potential issues with follower authenticity"
  ],
  "recommendations": [
    "Actionable steps to improve follower quality"
  ]
}

PROFILE DATA FOR ANALYSIS:
${JSON.stringify(profileData, null, 2)}

DETECTION METHODOLOGY:
- Analyze follower creation timestamps
- Check for uniform or suspicious follower characteristics
- Assess interaction quality and frequency
- Use advanced machine learning techniques
- Consider global and platform-specific follower dynamics`;
}