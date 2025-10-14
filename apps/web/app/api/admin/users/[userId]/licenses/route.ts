import { NextResponse } from "next/server";
import { validateRequest } from "@/lib/auth";
import prismadb from "@/lib/prismadb";

export async function GET(request: Request, props: { params: Promise<{ userId: string }> }) {
  const params = await props.params;
  const { userId } = params;

  try {
    // Validate admin access
    const { user } = await validateRequest();
    if (!user?.isSuperAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find all license keys for the user
    const userWithLicenses = await prismadb.user.findUnique({
      where: { id: userId },
      include: {
        licenseKeys: {
          include: {
            licenseKey: {
              include: {
                subLicenses: true,
                installations: true,
              },
            },
          },
        },
      },
    });

    if (!userWithLicenses) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Map to license structure used in admin licenses API
    const licenses = userWithLicenses.licenseKeys.map((lk) => {
      const license = lk.licenseKey;
      return {
        id: license.id,
        key: license.key,
        isActive: license.isActive,
        vendor: license.vendor,
        tier: license.tier,
        user: {
          id: userWithLicenses.id,
          email: userWithLicenses.email,
          name: userWithLicenses.name,
        },
        subLicenses: license.subLicenses.length,
        installations: license.installations.length,
        activatedAt: license.activatedAt,
        deActivatedAt: license.deActivatedAt,
        createdAt: license.createdAt,
      };
    });

    return NextResponse.json({ licenses });
  } catch (error) {
    console.error("Error fetching user licenses:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
