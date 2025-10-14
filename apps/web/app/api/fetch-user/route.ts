import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from 'uuid';
import { generateUsername } from "@/lib/generate-username";
import prismadb from "@/lib/prismadb";
import { Prisma } from "@repo/db";

type UserData = {
  externalUserId: string;
  username: string;
  level: number;
  totalComments: number;
  licenseKey: string | null;
  isPaidUser: boolean;
  organizationName?: string;
  organizationRole?: string;
};

async function getOrCreateUser(licenseKey: string | null): Promise<UserData | { error: string }> {
  if (licenseKey) {
    // Check for existing license key and associated user
    const existingLicenseKey = await prismadb.licenseKey.findUnique({
      where: { key: licenseKey },
      include: { 
        users: { 
          include: { 
            user: { 
              include: { 
                leaderboard: true,
                organizations: {
                  include: {
                    organization: true
                  }
                }
              } 
            } 
          } 
        },
        organization: true
      },
    });

    if (!existingLicenseKey) {
      // If not found in LicenseKey table, check SubLicense table
      const existingSubLicense = await prismadb.subLicense.findUnique({
        where: { key: licenseKey },
        include: {
          assignedUser: {
            include: { 
              leaderboard: true,
              organizations: {
                include: {
                  organization: true
                }
              }
            }
          },
          mainLicenseKey: {
            include: {
              organization: true
            }
          }
        }
      });

      if (!existingSubLicense) {
        return { error: "Invalid license key" };
      }

      if (existingSubLicense.assignedUser) {
        // Existing user with sub-license
        const user = existingSubLicense.assignedUser;
        const organization = existingSubLicense.mainLicenseKey.organization;
        const organizationUser = user.organizations.find(ou => ou.organizationId === organization?.id);
        
        return {
          externalUserId: user.externalUserId || '',
          username: user.username || '',
          level: user.leaderboard?.level || 1,
          totalComments: user.leaderboard?.totalComments || 0,
          licenseKey,
          isPaidUser: true,
          organizationName: organization?.name,
          organizationRole: organizationUser?.role
        };
      } else {
        // New user with sub-license
        const externalUserId = uuidv4();
        const username = generateUsername();
        const newUser = await prismadb.user.create({
          data: {
            externalUserId,
            username,
            email: `${externalUserId}@placeholder.com`,
            isPaidUser: true,
            sublicenses: {
              connect: { id: existingSubLicense.id }
            },
            leaderboard: {
              create: {
                level: 1,
                totalComments: 0,
              },
            },
            organizations: existingSubLicense.mainLicenseKey.organization ? {
              create: {
                organization: {
                  connect: { id: existingSubLicense.mainLicenseKey.organization.id }
                },
                role: 'MEMBER'
              }
            } : undefined
          },
          include: { 
            leaderboard: true,
            organizations: {
              include: {
                organization: true
              }
            }
          },
        });

        // Update the SubLicense with the new user
        await prismadb.subLicense.update({
          where: { id: existingSubLicense.id },
          data: {
            assignedUserId: newUser.id,
            assignedEmail: newUser.email,
          },
        });

        return {
          externalUserId: newUser.externalUserId || '',
          username: newUser.username || '',
          level: newUser.leaderboard?.level || 1,
          totalComments: newUser.leaderboard?.totalComments || 0,
          licenseKey,
          isPaidUser: true,
          organizationName: newUser.organizations[0]?.organization.name,
          organizationRole: newUser.organizations[0]?.role
        };
      }
    }

    if (existingLicenseKey.users.length > 0) {
      // Existing paid user
      const user = existingLicenseKey.users[0].user;
      const organization = existingLicenseKey.organization;
      const organizationUser = user.organizations.find(ou => ou.organizationId === organization?.id);
      
      return {
        externalUserId: user.externalUserId || '',
        username: user.username || '',
        level: user.leaderboard?.level || 1,
        totalComments: user.leaderboard?.totalComments || 0,
        licenseKey,
        isPaidUser: true,
        organizationName: organization?.name,
        organizationRole: organizationUser?.role
      };
    } else {
      // New paid user
      const externalUserId = uuidv4();
      const username = generateUsername();
      const newUser = await prismadb.user.create({
        data: {
          externalUserId,
          username,
          email: `${externalUserId}@placeholder.com`,
          isPaidUser: true,
          licenseKeys: {
            create: {
              licenseKeyId: existingLicenseKey.id,
            },
          },
          leaderboard: {
            create: {
              level: 1,
              totalComments: 0,
            },
          },
          organizations: existingLicenseKey.organization ? {
            create: {
              organization: {
                connect: { id: existingLicenseKey.organization.id }
              },
              role: 'MEMBER'
            }
          } : undefined
        },
        include: { 
          leaderboard: true,
          organizations: {
            include: {
              organization: true
            }
          }
        },
      });

      return {
        externalUserId: newUser.externalUserId || '',
        username: newUser.username || '',
        level: newUser.leaderboard?.level || 1,
        totalComments: newUser.leaderboard?.totalComments || 0,
        licenseKey,
        isPaidUser: true,
        organizationName: newUser.organizations[0]?.organization.name,
        organizationRole: newUser.organizations[0]?.role
      };
    }
  } else {
    // Free user (unchanged)
    const externalUserId = uuidv4();
    const username = generateUsername();
    const newFreeUser = await prismadb.freeUser.create({
      data: {
        externalUserId,
        username,
        leaderboard: {
          create: {
            level: 1,
            totalComments: 0,
          },
        },
      },
      include: { leaderboard: true },
    });

    return {
      externalUserId: newFreeUser.externalUserId,
      username: newFreeUser.username,
      level: newFreeUser.leaderboard?.level || 1,
      totalComments: newFreeUser.leaderboard?.totalComments || 0,
      licenseKey: null,
      isPaidUser: false,
    };
  }
}

async function handleRequest(req: NextRequest) {
  let licenseKey: string | null = null;

  if (req.method === 'GET') {
    const url = new URL(req.url);
    licenseKey = url.searchParams.get('licenseKey');
  } else if (req.method === 'POST') {
    const body = await req.json();
    licenseKey = body.licenseKey;
  }

  try {
    const userData = await getOrCreateUser(licenseKey);

    if ('error' in userData) {
      return NextResponse.json(userData, { status: 400 });
    }

    const response = NextResponse.json(userData);
    response.headers.set('Cache-Control', 'no-store, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    return response;
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json({ error: "An error occurred while processing your request" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  return handleRequest(req);
}

export async function POST(req: NextRequest) {
  return handleRequest(req);
}