// app/api/license-key/[licenseKey]/commenter-config/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prismadb";
export async function GET(request: Request, props: { params: Promise<{ licenseKey: string }> }) {
  const params = await props.params;
  try {
    const { licenseKey } = params;

    // First check for main license key
    let licenseKeyData = await prisma.licenseKey.findUnique({
      where: {
        key: licenseKey,
      },
      include: {
        AutoCommenterConfig: {
          where: {
            platform: "LINKEDIN",
          },
          select: {
            id: true,
            isEnabled: true,
            timeInterval: true,
            action: true,
            postsPerDay: true,
            hashtags: true,
            useBrandVoice: true,
            platform: true,
            promoteProduct: true,
            productDetails: true,
            feedLikes: true,
            feedComments: true,
            sampleReplies: true,
            keywordTargets: true,
            enabledPlatforms: true,
            platformSettings: true,
            promptMode: true,
            customPrompts: true,
            selectedCustomPromptId: true,


            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    // If no license key found, check for sublicense
    if (!licenseKeyData) {
      // Look for the sublicense
      const subLicense = await prisma.subLicense.findUnique({
        where: {
          key: licenseKey,
        },
        include: {
          autoCommenterConfigs: {
            where: {
              platform: "LINKEDIN",
            },
            select: {
              id: true,
              isEnabled: true,
              timeInterval: true,
              action: true,
              postsPerDay: true,
              hashtags: true,
              useBrandVoice: true,
              platform: true,
              promoteProduct: true,
              productDetails: true,
              feedLikes: true,
              feedComments: true,
              sampleReplies: true,
              keywordTargets: true,
              enabledPlatforms: true,
              platformSettings: true,
              promptMode: true,
              customPrompts: true,
              selectedCustomPromptId: true,
              createdAt: true,
              updatedAt: true,
            },
          },
        },
      });

      if (!subLicense) {
        return new NextResponse(
          JSON.stringify({ error: "License key or sublicense key not found" }),
          { status: 404 },
        );
      }

      // Get the auto commenter config for the sublicense
      const commenterConfig = subLicense.autoCommenterConfigs[0] || null;

      if (!commenterConfig) {
        return new NextResponse(
          JSON.stringify({
            error: "No auto commenter configuration found for this sublicense",
            licenseKey,
          }),
          { status: 404 },
        );
      }

      // Return the configuration data for sublicense
      return new NextResponse(JSON.stringify({
        ...commenterConfig,
        isSubLicense: true,
      }), { status: 200 });
    }

    // If main license key was found, get its commenter config
    const commenterConfig = licenseKeyData.AutoCommenterConfig[0] || null;

    if (!commenterConfig) {
      return new NextResponse(
        JSON.stringify({
          error: "No auto commenter configuration found for this license key",
          licenseKey,
        }),
        { status: 404 },
      );
    }

    // Return the configuration data for main license
    return new NextResponse(JSON.stringify({
      ...commenterConfig,
      isSubLicense: false,
    }), { status: 200 });

  } catch (error: any) {
    console.error(`Error fetching auto commenter config: ${error.message}`);
    return new NextResponse(
      JSON.stringify({
        error: "Error fetching auto commenter configuration",
        message: error.message,
      }),
      { status: 500 },
    );
  }
}

// POST endpoint to create or update auto commenter config
export async function POST(request: Request, props: { params: Promise<{ licenseKey: string }> }) {
  const params = await props.params;
  try {
    const { licenseKey } = params;
    const data = await request.json();

    // First, check if this is a main license key
    const mainLicense = await prisma.licenseKey.findUnique({
      where: {
        key: licenseKey,
      },
    });

    if (mainLicense) {
      // Handle main license key config
      const updatedOrCreatedConfig = await prisma.autoCommenterConfig.upsert({
        where: {
          // Use a compound unique identifier if you have one
          // Or create a unique ID based on licenseKeyId and platform
          userId_platform: {
            userId: data.userId,
            platform: data.platform || "LINKEDIN",
          },
        },
        update: {
          ...data,
          licenseKeyId: mainLicense.id,
        },
        create: {
          ...data,
          licenseKeyId: mainLicense.id,
          userId: data.userId,
          platform: data.platform || "LINKEDIN",
        },
      });

      return new NextResponse(JSON.stringify(updatedOrCreatedConfig), { status: 200 });
    }

    // If not a main license, check if it's a sublicense
    const subLicense = await prisma.subLicense.findUnique({
      where: {
        key: licenseKey,
      },
    });

    if (!subLicense) {
      return new NextResponse(
        JSON.stringify({ error: "License key or sublicense key not found" }),
        { status: 404 },
      );
    }

    // Handle sublicense key config
    const updatedOrCreatedConfig = await prisma.autoCommenterConfig.upsert({
      where: {
        // Use a compound unique identifier
        userId_platform: {
          userId: data.userId,
          platform: data.platform || "LINKEDIN",
        },
      },
      update: {
        ...data,
        subLicenseId: subLicense.id,
      },
      create: {
        ...data,
        subLicenseId: subLicense.id,
        userId: data.userId,
        platform: data.platform || "LINKEDIN",
      },
    });

    return new NextResponse(JSON.stringify(updatedOrCreatedConfig), { status: 200 });

  } catch (error: any) {
    console.error(`Error updating auto commenter config: ${error.message}`);
    return new NextResponse(
      JSON.stringify({
        error: "Error updating auto commenter configuration",
        message: error.message,
      }),
      { status: 500 },
    );
  }
}
