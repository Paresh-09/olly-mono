// app/api/admin/weekly-report/route.ts
import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/send-email";
import { validateRequest } from "@/lib/auth";
import prismadb from "@/lib/prismadb";

export async function POST(request: NextRequest) {
  try {
    // Validate the request and get the current user
    const session = await validateRequest();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized - Please log in to generate report" },
        { status: 401 },
      );
    }

    const currentUser = session.user;
    const userId = currentUser.id;

    // Calculate date range for the past week
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);

    // Get user information
    const userInfo = await prismadb.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    if (!userInfo) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get user statistics for the logged-in user only
    const [
      totalComments,
      commentsThisWeek,
      totalTasks,
      tasksThisWeek,
      totalActivations,
      activationsThisWeek,
      totalUsageEntries,
      usageThisWeek,
    ] = await Promise.all([
      // Total comments from this user
      prismadb.usageTracking.count({
        where: {
          userId: userId,
          action: "comment",
        },
      }),

      // Comments this week from this user
      prismadb.usageTracking.count({
        where: {
          userId: userId,
          action: "comment",
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      }),

      // Total tasks from this user
      prismadb.task.count({
        where: {
          userId: userId,
        },
      }),

      // Tasks this week from this user
      prismadb.task.count({
        where: {
          userId: userId,
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      }),

      // Total license activations from this user
      prismadb.activation.count({
        where: {
          userId: userId,
        },
      }),

      // License activations this week from this user
      prismadb.activation.count({
        where: {
          userId: userId,
          activatedAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      }),

      // Total usage tracking entries from this user
      prismadb.usageTracking.count({
        where: {
          userId: userId,
        },
      }),

      // Usage tracking entries this week from this user
      prismadb.usageTracking.count({
        where: {
          userId: userId,
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      }),
    ]);

    // Get platform usage breakdown for this week (this user only)
    const platformUsage = await prismadb.usageTracking.groupBy({
      by: ["platform"],
      where: {
        userId: userId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      _count: {
        platform: true,
      },
      orderBy: {
        _count: {
          platform: "desc",
        },
      },
    });

    // Get top actions this week (this user only)
    const topActions = await prismadb.usageTracking.groupBy({
      by: ["action"],
      where: {
        userId: userId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      _count: {
        action: true,
      },
      orderBy: {
        _count: {
          action: "desc",
        },
      },
      take: 10,
    });

    // Get recent tasks created this week
    const recentTasks = await prismadb.task.findMany({
      where: {
        userId: userId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        id: true,
        description: true,
        taskType: true,
        status: true,
        platform: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
    });

    // Calculate days since user joined
    const daysSinceJoined = Math.floor(
      (endDate.getTime() - userInfo.createdAt.getTime()) /
        (1000 * 60 * 60 * 24),
    );

    // Create HTML email content
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #4f46e5; color: white; padding: 20px; text-align: center; border-radius: 8px; }
            .user-info { background: #e0e7ff; padding: 15px; margin: 15px 0; border-radius: 5px; }
            .metric { background: #f8f9fa; margin: 10px 0; padding: 15px; border-radius: 5px; border-left: 4px solid #4f46e5; }
            .metric-value { font-size: 24px; font-weight: bold; color: #4f46e5; }
            .metric-small { font-size: 16px; font-weight: bold; color: #059669; }
            .table { width: 100%; border-collapse: collapse; margin: 15px 0; }
            .table th, .table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .table th { background-color: #f2f2f2; }
            .highlight { background-color: #fef3c7; padding: 10px; border-radius: 5px; margin: 10px 0; }
            .task-item { background: #f0f9ff; padding: 10px; margin: 5px 0; border-radius: 4px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>📊 Your Weekly Usage Report</h1>
                <p>${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}</p>
            </div>
            
            <div class="user-info">
                <h3>👤 User Information</h3>
                <p><strong>Name:</strong> ${userInfo.name || "Not provided"}</p>
                <p><strong>Email:</strong> ${userInfo.email || "Not provided"}</p>
                <p><strong>Member since:</strong> ${userInfo.createdAt.toLocaleDateString()} (${daysSinceJoined} days ago)</p>
            </div>
            
            <h2>📈 Your Activity This Week</h2>
            
            <div class="metric">
                <strong>Comments Generated:</strong>
                <div class="metric-value">${commentsThisWeek.toLocaleString()}</div>
                <small>Total all time: ${totalComments.toLocaleString()}</small>
            </div>
            
            <div class="metric">
                <strong>Tasks Created:</strong>
                <div class="metric-value">${tasksThisWeek.toLocaleString()}</div>
                <small>Total all time: ${totalTasks.toLocaleString()}</small>
            </div>
            
            <div class="metric">
                <strong>License Activations:</strong>
                <div class="metric-value">${activationsThisWeek.toLocaleString()}</div>
                <small>Total all time: ${totalActivations.toLocaleString()}</small>
            </div>
            
            <div class="metric">
                <strong>Platform Interactions:</strong>
                <div class="metric-value">${usageThisWeek.toLocaleString()}</div>
                <small>Total all time: ${totalUsageEntries.toLocaleString()}</small>
            </div>
            
            ${
              platformUsage.length > 0
                ? `
            <h2>🔥 Your Platform Usage This Week</h2>
            <table class="table">
                <thead>
                    <tr>
                        <th>Platform</th>
                        <th>Usage Count</th>
                    </tr>
                </thead>
                <tbody>
                    ${platformUsage
                      .map(
                        (p) => `
                        <tr>
                            <td>${p.platform || "Unknown"}</td>
                            <td>${p._count.platform.toLocaleString()}</td>
                        </tr>
                    `,
                      )
                      .join("")}
                </tbody>
            </table>
            `
                : '<div class="highlight">No platform usage recorded this week</div>'
            }
            
            ${
              topActions.length > 0
                ? `
            <h2>⚡ Your Top Actions This Week</h2>
            <table class="table">
                <thead>
                    <tr>
                        <th>Action</th>
                        <th>Count</th>
                    </tr>
                </thead>
                <tbody>
                    ${topActions
                      .map(
                        (a) => `
                        <tr>
                            <td>${a.action || "Unknown"}</td>
                            <td>${a._count.action.toLocaleString()}</td>
                        </tr>
                    `,
                      )
                      .join("")}
                </tbody>
            </table>
            `
                : '<div class="highlight">No actions recorded this week</div>'
            }
            
            ${
              recentTasks.length > 0
                ? `
            <h2>📋 Your Recent Tasks This Week</h2>
            ${recentTasks
              .map(
                (task) => `
                <div class="task-item">
                    <strong>${task.taskType}</strong> - ${task.status}<br>
                    <small>Platform: ${task.platform} | Created: ${task.createdAt.toLocaleDateString()}</small><br>
                    <em>${task.description.substring(0, 100)}${task.description.length > 100 ? "..." : ""}</em>
                </div>
            `,
              )
              .join("")}
            `
                : '<div class="highlight">No tasks created this week</div>'
            }
            
            <div class="highlight">
                <h3>🎯 Weekly Summary</h3>
                <p>You've been ${usageThisWeek > 0 ? "active" : "inactive"} this week with ${usageThisWeek} total interactions across ${platformUsage.length} platform${platformUsage.length !== 1 ? "s" : ""}.</p>
                ${commentsThisWeek > 0 ? `<p>Great job generating ${commentsThisWeek} comment${commentsThisWeek !== 1 ? "s" : ""} this week! 🎉</p>` : ""}
                ${tasksThisWeek > 0 ? `<p>You've been productive with ${tasksThisWeek} new task${tasksThisWeek !== 1 ? "s" : ""} created! 💪</p>` : ""}
            </div>
            
            <p><em>Report generated on ${new Date().toLocaleString()}</em></p>
        </div>
    </body>
    </html>
    `;

    // Create plain text version
    const textContent = `
Your Weekly Usage Report (${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()})

USER INFORMATION:
- Name: ${userInfo.name || "Not provided"}
- Email: ${userInfo.email || "Not provided"}
- Member since: ${userInfo.createdAt.toLocaleDateString()} (${daysSinceJoined} days ago)

YOUR ACTIVITY THIS WEEK:
- Comments Generated: ${commentsThisWeek.toLocaleString()} (Total: ${totalComments.toLocaleString()})
- Tasks Created: ${tasksThisWeek.toLocaleString()} (Total: ${totalTasks.toLocaleString()})
- License Activations: ${activationsThisWeek.toLocaleString()} (Total: ${totalActivations.toLocaleString()})
- Platform Interactions: ${usageThisWeek.toLocaleString()} (Total: ${totalUsageEntries.toLocaleString()})

YOUR PLATFORM USAGE THIS WEEK:
${platformUsage.length > 0 ? platformUsage.map((p) => `- ${p.platform || "Unknown"}: ${p._count.platform.toLocaleString()}`).join("\n") : "- No platform usage this week"}

YOUR TOP ACTIONS THIS WEEK:
${topActions.length > 0 ? topActions.map((a) => `- ${a.action || "Unknown"}: ${a._count.action.toLocaleString()}`).join("\n") : "- No actions recorded this week"}

YOUR RECENT TASKS THIS WEEK:
${recentTasks.length > 0 ? recentTasks.map((task) => `- ${task.taskType} (${task.status}) - ${task.platform} - ${task.createdAt.toLocaleDateString()}`).join("\n") : "- No tasks created this week"}

WEEKLY SUMMARY:
You've been ${usageThisWeek > 0 ? "active" : "inactive"} this week with ${usageThisWeek} total interactions across ${platformUsage.length} platform${platformUsage.length !== 1 ? "s" : ""}.
${commentsThisWeek > 0 ? `Great job generating ${commentsThisWeek} comment${commentsThisWeek !== 1 ? "s" : ""} this week!` : ""}
${tasksThisWeek > 0 ? `You've been productive with ${tasksThisWeek} new task${tasksThisWeek !== 1 ? "s" : ""} created!` : ""}

Report generated on ${new Date().toLocaleString()}
    `;

    // Send email
    await sendEmail({
      to: "aryan@explainx.ai",
      subject: `Weekly User Report: ${userInfo.name || userInfo.email || "User"} - ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`,
      text: textContent,
      html: htmlContent,
      attachments: [],
    });

    return NextResponse.json({
      success: true,
      message: `Weekly report for ${userInfo.name || userInfo.email} sent successfully!`,
      userData: {
        name: userInfo.name,
        email: userInfo.email,
        weeklyStats: {
          comments: commentsThisWeek,
          tasks: tasksThisWeek,
          activations: activationsThisWeek,
          interactions: usageThisWeek,
        },
      },
    });
  } catch (error) {
    console.error("Error generating weekly user report:", error);
    return NextResponse.json(
      {
        error: "Failed to generate and send weekly user report",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  } finally {
    await prismadb.$disconnect();
  }
}
