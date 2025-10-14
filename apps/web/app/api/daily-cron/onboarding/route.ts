import { NextResponse } from "next/server";
import { sendDiscordNotification } from "@/service/discord-notify";
import prismadb from "@/lib/prismadb";
import { processOnboardingData } from "@/lib/onboarding-data";

async function fetchOnboardingData() {
  const onboardingData = await prismadb.onboarding.findMany({
    include: {
      user: true,
    },
    orderBy: {
      completedAt: 'desc',
    },
  });

  return onboardingData;
}

function chunkMessage(message: string, maxLength: number = 1900): string[] {
    const chunks: string[] = [];
    let currentChunk = "";
  
    message.split('\n').forEach(line => {
      if (currentChunk.length + line.length + 1 > maxLength) {
        chunks.push(currentChunk);
        currentChunk = "";
      }
      currentChunk += line + '\n';
    });
  
    if (currentChunk) {
      chunks.push(currentChunk);
    }
  
    return chunks;
  }
  
  export async function GET(req: Request) {
    try {
      const isCronAuthorized = req.headers.get('Authorization') === `Bearer ${process.env.CRON_SECRET}`;
  
      if (!isCronAuthorized) {
        return new NextResponse("Unauthorized.", { status: 401 });
      }
  
      const onboardingData = await fetchOnboardingData();
      const processedData = processOnboardingData(onboardingData);
  
      const {
        dailySummaries,
        roleSummary,
        platformSummary,
        engagementGoalSummary,
        contentFrequencySummary,
        commentFrequencySummary,
        companySizeSummary,
        aiExperienceSummary,
        totalUsers,
        skippedUsers,
      } = processedData;
  
      const message = `
  *OLLY Onboarding Analytics*
  
  **User Metrics:**
  - Total Users: ${totalUsers}
  - Completed Onboarding: ${totalUsers - skippedUsers}
  - Skipped Onboarding: ${skippedUsers}
  
  **Role Breakdown:**
  ${Object.entries(roleSummary).map(([role, count]) => `- ${role}: ${count}`).join('\n')}
  
  **Primary Platform Breakdown:**
  ${Object.entries(platformSummary).map(([platform, count]) => `- ${platform}: ${count}`).join('\n')}
  
  **Engagement Goal Breakdown:**
  ${Object.entries(engagementGoalSummary).map(([goal, count]) => `- ${goal}: ${count}`).join('\n')}
  
  **Content Frequency Breakdown:**
  ${Object.entries(contentFrequencySummary).map(([frequency, count]) => `- ${frequency}: ${count}`).join('\n')}
  
  **Comment Frequency Breakdown:**
  ${Object.entries(commentFrequencySummary).map(([frequency, count]) => `- ${frequency}: ${count}`).join('\n')}
  
  **Company Size Breakdown:**
  ${Object.entries(companySizeSummary).map(([size, count]) => `- ${size}: ${count}`).join('\n')}
  
  **AI Experience Breakdown:**
  ${Object.entries(aiExperienceSummary).map(([experience, count]) => `- ${experience}: ${count}`).join('\n')}
  
  **Daily Breakdown (Last 7 Days):**
  ${Object.entries(dailySummaries)
    .sort((a, b) => b[0].localeCompare(a[0]))
    .slice(0, 7)
    .map(([date, { count, roles, platforms }]) => 
      `- ${date}: ${count} users\n  Roles: ${Object.entries(roles).map(([r, c]) => `${r} (${c})`).join(', ')}\n  Platforms: ${Object.entries(platforms).map(([p, c]) => `${p} (${c})`).join(', ')}`
    )
    .join('\n')}
      `;
  
      const messageChunks = chunkMessage(message);
  
      for (const chunk of messageChunks) {
        try {
          await sendDiscordNotification(chunk, chunk === messageChunks[0]);
        } catch (error) {
          console.error("Error sending chunk to Discord:", error);
        }
      }
  
      return NextResponse.json({ message: "Onboarding analytics sent to Discord." });
  
    } catch (error) {
      console.error("Error processing onboarding analytics:", error);
      return new NextResponse("Internal Server Error", { status: 500 });
    } finally {
      await prismadb.$disconnect();
    }
  }
  