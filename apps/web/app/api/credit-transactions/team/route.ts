// app/api/team-credit-transactions/route.ts
import { NextRequest, NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import { validateRequest } from "@/lib/auth";
import { ApiUsage, LicenseKey, SubLicense, User, UsageTracking } from "@repo/db";

export async function GET(request: NextRequest) {
  try {
    const { user } = await validateRequest();

    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const type = searchParams.get("type");
    const search = searchParams.get("search");
    const platform = searchParams.get("platform");
    const action = searchParams.get("action");
    const mainLicenseId = searchParams.get("mainLicenseId");
    const subLicenseId = searchParams.get("subLicenseId");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortDirection = searchParams.get("sortDirection") || "desc";

    // Step 1: Get user's main licenses with their sublicenses
    const userMainLicenses = await prismadb.licenseKey.findMany({
      where: {
        users: {
          some: {
            userId: user.id,
          },
        },
        isMainKey: true,
      },
      include: {
        subLicenses: {
          include: {
            assignedUser: true,
          },
        },
        apiUsages: {
          where: {
            ...(platform && platform !== "ALL" ? {
              platform: {
                contains: platform,
                mode: "insensitive"
              }
            } : {})
          },
          orderBy: {
            createdAt: "desc"
          }
        },
      },
    });

    if (userMainLicenses.length === 0) {
      return NextResponse.json(
        { error: "You don't have access to team transactions" },
        { status: 403 },
      );
    }

    // Step 2: Get all usage tracking records for the user's licenses
    const usageTrackingRecords = await prismadb.usageTracking.findMany({
      where: {
        OR: [
          {
            licenseKeyId: {
              in: userMainLicenses.map(l => l.id)
            }
          },
          {
            subLicenseId: {
              in: userMainLicenses.flatMap(l => l.subLicenses.map(s => s.id))
            }
          }
        ],
        ...(platform && platform !== "ALL" ? {
          platform: {
            contains: platform,
            mode: "insensitive"
          }
        } : {}),
        ...(action && action !== "ALL" ? {
          action: {
            contains: action,
            mode: "insensitive"
          }
        } : {})
      },
      include: {
        licenseKey: true,
        subLicense: {
          include: {
            assignedUser: true,
            mainLicenseKey: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    // Step 3: Get credit transactions for API usage
    const apiUsageTransactions = await Promise.all(
      userMainLicenses.flatMap(license => 
        license.apiUsages.map(async usage => {
          // Find the user who owns this license
          const licenseUser = await prismadb.userLicenseKey.findFirst({
            where: { licenseKeyId: license.id },
            include: {
              user: {
                include: {
                  credit: {
                    include: {
                      transactions: {
                        where: {
                          type: "SPENT",
                          createdAt: {
                            // Look for transactions within 1 second of API usage
                            gte: new Date(new Date(usage.createdAt).getTime() - 1000),
                            lte: new Date(new Date(usage.createdAt).getTime() + 1000)
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          });

          const transaction = licenseUser?.user?.credit?.transactions[0];

          return {
            id: usage.id,
            createdAt: usage.createdAt,
            type: "API_USAGE",
            platform: usage.platform,
            event: usage.prompt,
            amount: transaction?.amount || -1,
            description: transaction?.description || `API usage: ${usage.platform}`,
            username: licenseUser?.user?.name,
            email: licenseUser?.user?.email,
            licenseKey: {
              id: license.id,
              key: license.key,
            },
            source: "api_usage"
          };
        })
      )
    );

    // Step 4: Transform usage tracking data into transactions
    const usageTrackingTransactions = usageTrackingRecords.map(usage => {
      const sublicense = usage.subLicense;
      const mainLicense = sublicense?.mainLicenseKey || usage.licenseKey;
      
      return {
        id: usage.id,
        createdAt: usage.createdAt,
        type: usage.action,
        platform: usage.platform,
        event: usage.event,
        username: sublicense?.assignedUser?.name || sublicense?.assignedEmail,
        email: sublicense?.assignedUser?.email || sublicense?.assignedEmail,
        licenseKey: mainLicense ? {
          id: mainLicense.id,
          key: mainLicense.key,
        } : null,
        subLicense: sublicense ? {
          id: sublicense.id,
          key: sublicense.key,
          assignedEmail: sublicense.assignedEmail,
          assignedUser: sublicense.assignedUser ? {
            email: sublicense.assignedUser.email,
            name: sublicense.assignedUser.name,
          } : null,
        } : null,
        source: "usage_tracking"
      };
    });

    // Combine both types of transactions
    const allTransactions = [...apiUsageTransactions, ...usageTrackingTransactions];

    // Step 5: Sort and paginate results
    const sortedTransactions = [...allTransactions].sort((a, b) => {
      // Only allow sorting by specific fields
      if (sortBy === "createdAt") {
        const aTime = new Date(a.createdAt).getTime();
        const bTime = new Date(b.createdAt).getTime();
        return sortDirection === "desc" ? bTime - aTime : aTime - bTime;
      }
      
      if (sortBy === "type" || sortBy === "platform" || sortBy === "event") {
        const aValue = a[sortBy] || "";
        const bValue = b[sortBy] || "";
        return sortDirection === "desc"
          ? bValue.localeCompare(aValue)
          : aValue.localeCompare(bValue);
      }

      // Default to sorting by createdAt if invalid sort field
      const aTime = new Date(a.createdAt).getTime();
      const bTime = new Date(b.createdAt).getTime();
      return sortDirection === "desc" ? bTime - aTime : aTime - bTime;
    });

    const totalCount = sortedTransactions.length;
    const totalPages = Math.ceil(totalCount / limit);
    const skip = (page - 1) * limit;
    const paginatedTransactions = sortedTransactions.slice(skip, skip + limit);

    // Step 6: Format response
    const paginationData = {
      totalCount,
      totalPages,
      currentPage: page,
      limit,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };

    const formattedMainLicenseKeys = userMainLicenses.map((license) => ({
      id: license.id,
      key: license.key,
      subLicenses: license.subLicenses.map((subLicense) => ({
        id: subLicense.id,
        key: subLicense.key,
        assignedEmail: subLicense.assignedEmail,
        assignedUser: subLicense.assignedUser
          ? {
              email: subLicense.assignedUser.email,
              name: subLicense.assignedUser.name,
            }
          : null,
      })),
    }));

    return NextResponse.json({
      transactions: paginatedTransactions,
      pagination: paginationData,
      mainLicenseKeys: formattedMainLicenseKeys,
      debug: {
        totalSubLicenses: userMainLicenses.reduce((acc, l) => acc + l.subLicenses.length, 0),
        totalTransactions: allTransactions.length,
      },
    });
  } catch (error) {
    console.error("❌ Error fetching team credit transactions:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}