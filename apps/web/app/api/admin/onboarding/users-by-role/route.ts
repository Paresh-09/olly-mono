import { NextRequest, NextResponse } from 'next/server';
import { validateRequest } from "@/lib/auth";
import prismadb from '@/lib/prismadb';

export async function GET(request: NextRequest) {
  try {
    const { user } = await validateRequest();
    if (!user?.isSales) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const role = request.nextUrl.searchParams.get('role');
    if (!role) {
      return NextResponse.json({ error: 'Role is required' }, { status: 400 });
    }

    const users = await prismadb.user.findMany({
        where: {
          onboarding: {
            OR: [
              { role: role },
              { roleOther: role }
            ]
          }
        },
        select: {
          email: true,
          createdAt: true,
          onboarding: {
            select: {
              role: true,
              roleOther: true
            }
          },
          licenseKeys: {
            select: {
              licenseKey: {
                select: {
                  isActive: true,
                  vendor: true,
                  tier: true,
                  lemonProductId: true,
                  deActivatedAt: true,  // Add this
                  activatedAt: true,    // Add this
                }
              }
            },
            orderBy: {
              licenseKey: {
                activatedAt: 'desc'
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
  
      const formattedUsers = users.map(user => {
        const activeLicense = user.licenseKeys.find(lk => lk.licenseKey.isActive);
        const inactiveLicense = !activeLicense && user.licenseKeys.length > 0 
          ? user.licenseKeys[0].licenseKey 
          : null;
  
        return {
          email: user.email,
          role: user.onboarding?.role || user.onboarding?.roleOther || role,
          createdAt: user.createdAt,
          licenseStatus: {
            hasActiveLicense: !!activeLicense,
            hasInactiveLicense: !!inactiveLicense,
            deactivatedAt: inactiveLicense?.deActivatedAt || null,
            activeLicense: activeLicense ? {
              vendor: activeLicense.licenseKey.vendor,
              tier: activeLicense.licenseKey.tier,
              lemonProductId: activeLicense.licenseKey.lemonProductId
            } : null,
            inactiveLicense: inactiveLicense ? {
              vendor: inactiveLicense.vendor,
              tier: inactiveLicense.tier,
              lemonProductId: inactiveLicense.lemonProductId,
              deActivatedAt: inactiveLicense.deActivatedAt
            } : null
          }
        };
      });
  
      return NextResponse.json(formattedUsers);
      
    } catch (error) {
      console.error("Error fetching users by role:", error);
      return NextResponse.json(
        { error: "Internal Server Error" }, 
        { status: 500 }
      );
    }
  }