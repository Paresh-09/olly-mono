import { validateRequest } from "@/lib/auth";
import prismadb from "@/lib/prismadb";
import { autoCommenterSchema } from "@/lib/validation";
import { CommentPlatform } from "@repo/db";
import { NextRequest } from "next/server";

async function validateLicenseAccess(userId: string) {
  const userLicenseKey = await prismadb.userLicenseKey.findFirst({
    where: { userId },
    include: {
      licenseKey: {
        include: {
          subLicenses: {
            where: {
              status: "ACTIVE",
              assignedUserId: userId,
            },
          },
        },
      },
    },
  });

  if (!userLicenseKey) {
    return false;
  }

  if (userLicenseKey.licenseKey.isActive) {
    return true;
  }

  if (userLicenseKey.licenseKey.subLicenses.length > 0) {
    const activeSublicense = userLicenseKey.licenseKey.subLicenses.find(
      (sublicense) =>
        sublicense.status === "ACTIVE" && sublicense.assignedUserId === userId,
    );
    return !!activeSublicense;
  }

  return false;
}

export async function GET(request: NextRequest) {
  try {
    const session = await validateRequest();

    if (!session?.user?.id || !session.user.isBetaTester) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const config = await prismadb.autoCommenterConfig.findFirst({
      where: {
        userId: session?.user?.id,
      },
    });

    if (!config) {
      return Response.json({});
    }

    return Response.json(config);
  } catch (error) {
    console.error("Fetch config error:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await validateRequest();

    if (!session?.user?.id || !session.user.isBetaTester) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validationResult = autoCommenterSchema.safeParse(body);
    if (!validationResult.success) {
      return Response.json(
        { errors: validationResult.error.errors },
        { status: 400 },
      );
    }

    // Validate license access
    const hasValidLicense = await validateLicenseAccess(session.user.id);
    if (!hasValidLicense) {
      return Response.json(
        { error: "No active license found" },
        { status: 404 },
      );
    }

    const userLicenseKey = await prismadb.userLicenseKey.findFirst({
      where: { userId: session.user.id },
      include: { licenseKey: true },
    });
    // Check for existing config for this platform
    const existingConfig = await prismadb.autoCommenterConfig.findFirst({
      where: {
        licenseKeyId: userLicenseKey!.licenseKeyId,
      },
    });

    const config = await prismadb.autoCommenterConfig.upsert({
      where: {
        id: existingConfig?.id || "new",
        userId: session.user.id,
      },
      update: {
        isEnabled: validationResult.data.isEnabled,
        timeInterval: validationResult.data.timeInterval,
        action: validationResult.data.action,
        hashtags: validationResult.data.hashtags,
        licenseKeyId: userLicenseKey!.licenseKeyId,
      },
      create: {
        userId: session.user.id,
        isEnabled: validationResult.data.isEnabled,
        timeInterval: validationResult.data.timeInterval,
        action: validationResult.data.action,
        hashtags: validationResult.data.hashtags,
        licenseKeyId: userLicenseKey!.licenseKeyId,
      },
    });

    return Response.json(config);
  } catch (error) {
    console.error("Save config error:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
