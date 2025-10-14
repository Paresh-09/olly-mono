import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";

export async function GET(req: Request) {
  try {
    const isCronAuthorized = req.headers.get('Authorization') === `Bearer ${process.env.CRON_SECRET}`;

    if (!isCronAuthorized) {
      return new NextResponse("Unauthorized.", { status: 401 });
    }

    // Get date ranges for metrics
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startOfYesterday = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());

    // Parallel database queries for better performance
    const [
      totalSignups,
      newSignupsToday,
      extensionInstalls,
      newExtensionInstallsToday,
      licenseActivations,
      newLicenseActivationsToday,
      usageTracking,
      newUsageToday,
      creditsPurchased,
      newCreditsPurchasedToday,
      creditsUsed,
      newCreditsUsedToday,
      productSales,
      newProductSalesToday
    ] = await Promise.all([
      // Total signups
      prismadb.user.count(),
      
      // New signups today
      prismadb.user.count({
        where: {
          createdAt: {
            gte: startOfToday
          }
        }
      }),
      
      // Extension installations (total)
      prismadb.installation.count({
        where: {
          status: 'INSTALLED'
        }
      }),
      
      // New extension installations today
      prismadb.installation.count({
        where: {
          status: 'INSTALLED',
          installedAt: {
            gte: startOfToday
          }
        }
      }),
      
      // License key activations (total)
      prismadb.activation.count(),
      
      // New license key activations today
      prismadb.activation.count({
        where: {
          activatedAt: {
            gte: startOfToday
          }
        }
      }),
      
      // License key usage tracking (total)
      prismadb.usageTracking.count(),
      
      // New usage tracking today
      prismadb.usageTracking.count({
        where: {
          createdAt: {
            gte: startOfToday
          }
        }
      }),
      
      // Credits purchased (total)
      prismadb.creditTransaction.aggregate({
        where: {
          type: {
            in: ['PURCHASED', 'PLAN_CREDITS']
          }
        },
        _sum: {
          amount: true
        }
      }),
      
      // Credits purchased today
      prismadb.creditTransaction.aggregate({
        where: {
          type: {
            in: ['PURCHASED', 'PLAN_CREDITS']
          },
          createdAt: {
            gte: startOfToday
          }
        },
        _sum: {
          amount: true
        }
      }),
      
      // Credits used (total)
      prismadb.creditTransaction.aggregate({
        where: {
          type: 'SPENT'
        },
        _sum: {
          amount: true
        }
      }),
      
      // Credits used today
      prismadb.creditTransaction.aggregate({
        where: {
          type: 'SPENT',
          createdAt: {
            gte: startOfToday
          }
        },
        _sum: {
          amount: true
        }
      }),
      
      // Product sales (active license keys)
      prismadb.licenseKey.count({
        where: {
          isActive: true
        }
      }),
      
      // New product sales today
      prismadb.licenseKey.count({
        where: {
          isActive: true,
          createdAt: {
            gte: startOfToday
          }
        }
      })
    ]);

    // Format the metrics message
    const metrics = {
      signups: {
        total: totalSignups,
        today: newSignupsToday,
        yesterday: await prismadb.user.count({
          where: {
            createdAt: {
              gte: startOfYesterday,
              lt: startOfToday
            }
          }
        })
      },
      extensionAdded: {
        total: extensionInstalls,
        today: newExtensionInstallsToday
      },
      licenseActivations: {
        total: licenseActivations,
        today: newLicenseActivationsToday
      },
      licenseUsage: {
        total: usageTracking,
        today: newUsageToday
      },
      creditsPurchased: {
        total: creditsPurchased._sum.amount || 0,
        today: newCreditsPurchasedToday._sum.amount || 0
      },
      creditsUsed: {
        total: Math.abs(creditsUsed._sum.amount || 0), // Make positive for display
        today: Math.abs(newCreditsUsedToday._sum.amount || 0)
      },
      productSales: {
        total: productSales,
        today: newProductSalesToday
      }
    };

    // Create simple Discord message
    const message = `**Olly Daily Metrics - ${today.toLocaleDateString()}**

**Signups:** ${metrics.signups.total.toLocaleString()} (+${metrics.signups.today} today)
**Extensions:** ${metrics.extensionAdded.total.toLocaleString()} (+${metrics.extensionAdded.today} today)
**Activations:** ${metrics.licenseActivations.total.toLocaleString()} (+${metrics.licenseActivations.today} today)
**Usage:** ${metrics.licenseUsage.total.toLocaleString()} (+${metrics.licenseUsage.today} today)
**Credits Purchased:** ${metrics.creditsPurchased.total.toLocaleString()} (+${metrics.creditsPurchased.today} today)
**Credits Used:** ${metrics.creditsUsed.total.toLocaleString()} (+${metrics.creditsUsed.today} today)
**Sales:** ${metrics.productSales.total.toLocaleString()} (+${metrics.productSales.today} today)`;

    const discordMessage = {
      content: message
    };

    // Send to Discord webhook
    const discordWebhookUrl = process.env.TEAM_DISCORD_WEBHOOK;
    
    if (!discordWebhookUrl) {
      console.error('DISCORD_WEBHOOK_URL environment variable is not set');
      return new NextResponse("Discord webhook URL not configured", { status: 500 });
    }

    const discordResponse = await fetch(discordWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(discordMessage)
    });

    if (!discordResponse.ok) {
      throw new Error(`Discord webhook failed: ${discordResponse.statusText}`);
    }

    return NextResponse.json({ 
      message: "Metrics sent to Discord successfully",
      metrics 
    });

  } catch (error) {
    console.error("Error sending metrics to Discord:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  } finally {
    await prismadb.$disconnect();
  }
}