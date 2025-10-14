import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prismadb";

// Helper function to validate the request origin
const isValidOrigin = (req: NextRequest) => {
  const origin = req.headers.get("origin");
  // Allow requests when Origin is null (from extensions)
  if (!origin) return true;
  const validExtensionIds = [
    "pkomeokalhjlopcgnoefibpdhphfcgam", // local
    "ofjpapfmglfjdhmadpegoeifocomaeje", // production
    "ekmgobjflopmpkfeookodjcfjmaiilcp", // new extension
  ];
  return validExtensionIds.some((id) => origin === `chrome-extension://${id}`);
};

// Helper function to determine if a key is a sublicense
async function isSubLicenseKey(key: string): Promise<boolean> {
  const sublicense = await prisma.subLicense.findUnique({
    where: { key: key },
    select: { id: true, mainLicenseKeyId: true },
  });
  return !!sublicense;
}

export async function POST(req: NextRequest) {
  // if (!isValidOrigin(req)) {
  //   return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  // }

  const searchParams = req.nextUrl.searchParams;
  const licenseKey = searchParams.get("licenseKey");

  if (!licenseKey) {
    return NextResponse.json(
      { error: "License key is required" },
      { status: 400 },
    );
  }

  try {
    // Determine if the provided key is a sublicense
    const isSubLicense = await isSubLicenseKey(licenseKey);

    const body = await req.json();
    const {
      customButtons,
      customActions,
      model,
      replyTone,
      replyLength,
      toneIntent,
      language,
      usePostNativeLanguage,
      sampleReply,
      ollyActionEnable,
      llmVendor,
      defaultAction,
      // Auto commenter config
      autoCommenterConfig,
    } = body;

    // Find the license key or sublicense based on the key type
    let license;
    if (isSubLicense) {
      license = await prisma.subLicense.findUnique({
        where: { key: licenseKey },
        select: { id: true, mainLicenseKeyId: true },
      });
    } else {
      license = await prisma.licenseKey.findUnique({
        where: { key: licenseKey },
        select: { id: true },
      });
    }

    if (!license) {
      return NextResponse.json(
        {
          error: isSubLicense
            ? "Invalid sublicense key"
            : "Invalid license key",
        },
        { status: 404 },
      );
    }

    // Update settings based on license type
    if (isSubLicense) {
      // Update sublicense settings
      await prisma.subLicenseSettings.upsert({
        where: { subLicenseId: license.id },
        update: {
          customButtons,
          customActions,
          model,
          replyTone,
          replyLength,
          toneIntent,
          language,
          usePostNativeLanguage,
          llmVendor,
        },
        create: {
          subLicenseId: license.id,
          customButtons,
          customActions,
          model,
          replyTone,
          replyLength,
          toneIntent,
          language,
          usePostNativeLanguage,
          llmVendor,
        },
      });
    } else {
      // Update regular license settings
      await prisma.licenseKeySettings.upsert({
        where: { licenseKeyId: license.id },
        update: {
          customButtons,
          customActions,
          model,
          replyTone,
          replyLength,
          toneIntent,
          language,
          usePostNativeLanguage,
          llmVendor,
        },
        create: {
          licenseKeyId: license.id,
          customButtons,
          customActions,
          model,
          replyTone,
          replyLength,
          toneIntent,
          language,
          usePostNativeLanguage,
          llmVendor,
        },
      });
    }

    // Update auto commenter config if provided
    if (autoCommenterConfig) {
      // Get the user ID based on license type
      let userId;

      if (isSubLicense) {
        // For sublicense, get the assigned user
        const subLicense = await prisma.subLicense.findUnique({
          where: { id: license.id },
          select: { assignedUserId: true },
        });
        userId = subLicense?.assignedUserId;
      } else {
        // For regular license, get the first user with this license
        const licenseUser = await prisma.userLicenseKey.findFirst({
          where: { licenseKeyId: license.id },
          select: { userId: true },
        });
        userId = licenseUser?.userId;
      }

      if (!userId) {
        return NextResponse.json(
          { error: "No user found for this license key" },
          { status: 400 },
        );
      }

      // Check if an existing config exists for this user and platform
      const existingConfig = await prisma.autoCommenterConfig.findFirst({
        where: {
          userId: userId,
          platform: autoCommenterConfig.platform,
        },
      });

      if (existingConfig) {
        // Update existing config
        await prisma.autoCommenterConfig.update({
          where: { id: existingConfig.id },
          data: {
            //@ts-ignore
            licenseKeyId: isSubLicense ? license.mainLicenseKeyId : license.id, // Use main license key ID for sublicenses
            isEnabled: autoCommenterConfig.isEnabled,
            timeInterval: autoCommenterConfig.timeInterval,
            action: autoCommenterConfig.action,
            postsPerDay: autoCommenterConfig.postsPerDay,
            hashtags: autoCommenterConfig.hashtags,
            useBrandVoice: autoCommenterConfig.useBrandVoice,
            platform: autoCommenterConfig.platform,
            promoteProduct: autoCommenterConfig.promoteProduct,
            productDetails: autoCommenterConfig.productDetails,
            feedLikes: autoCommenterConfig.feedLikes,
            feedComments: autoCommenterConfig.feedComments,
            sampleReplies: autoCommenterConfig.sampleReplies,
            keywordTargets: autoCommenterConfig.keywordTargets,
            promptMode: autoCommenterConfig.promptMode,
            customPrompts: autoCommenterConfig.customPrompts,
            selectedCustomPromptId: autoCommenterConfig.selectedCustomPromptId,
            accessToken: autoCommenterConfig.accessToken,
            enabledPlatforms: autoCommenterConfig.enabledPlatforms,
            platformSettings: autoCommenterConfig.platformSettings,
          },
        });
      } else {
        // Create new config
        await prisma.autoCommenterConfig.create({
          data: {
            userId: userId,
            //@ts-ignore
            licenseKeyId: isSubLicense ? license.mainLicenseKeyId : license.id, // Use main license key ID for sublicenses
            isEnabled: autoCommenterConfig.isEnabled || false,
            timeInterval: autoCommenterConfig.timeInterval || 5,
            action: autoCommenterConfig.action || ["COMMENT"],
            postsPerDay: autoCommenterConfig.postsPerDay || 5,
            hashtags: autoCommenterConfig.hashtags || [],
            useBrandVoice: autoCommenterConfig.useBrandVoice || false,
            platform: autoCommenterConfig.platform || "LINKEDIN",
            promoteProduct: autoCommenterConfig.promoteProduct || false,
            productDetails: autoCommenterConfig.productDetails || null,
            feedLikes: autoCommenterConfig.feedLikes || 10,
            feedComments: autoCommenterConfig.feedComments || 5,
            sampleReplies: autoCommenterConfig.sampleReplies || null,
            keywordTargets: autoCommenterConfig.keywordTargets || null,
            promptMode: autoCommenterConfig.promptMode || "automatic",
            customPrompts: autoCommenterConfig.customPrompts || null,
            selectedCustomPromptId:
              autoCommenterConfig.selectedCustomPromptId || null,
            accessToken: autoCommenterConfig.accessToken || null,
            enabledPlatforms: autoCommenterConfig.enabledPlatforms || [],
            platformSettings: autoCommenterConfig.platformSettings || null,
          },
        });
      }
    }

    // Fetch the latest data to return
    let responseData;

    if (isSubLicense) {
      // Get sublicense data with settings
      const subLicenseData = await prisma.subLicense.findUnique({
        where: { key: licenseKey },
        include: {
          settings: true,
          mainLicenseKey: {
            include: {
              customKnowledge: {
                include: {
                  knowledgeSummaries: {
                    orderBy: {
                      createdAt: "desc",
                    },
                    take: 1,
                    select: {
                      id: true,
                      summary: true,
                      createdAt: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      // Get the assigned user for this sublicense
      const subLicenseUser = await prisma.subLicense.findUnique({
        where: { id: license.id },
        select: { assignedUserId: true },
      });

      let autoCommenterConfigResponse = null;
      let userCreditBalance = null;
      if (subLicenseUser?.assignedUserId) {
        // Fetch the auto commenter config for this user
        autoCommenterConfigResponse =
          await prisma.autoCommenterConfig.findFirst({
            where: {
              userId: subLicenseUser.assignedUserId,
            },
          });

        // Fetch user credit balance
        const userCredit = await prisma.userCredit.findUnique({
          where: { userId: subLicenseUser.assignedUserId },
          select: { balance: true },
        });
        userCreditBalance = userCredit?.balance ?? 0;
      }

      let latestSummary = null;
      // Get the main license key's brand voice summary
      latestSummary =
        subLicenseData?.mainLicenseKey?.customKnowledge
          ?.knowledgeSummaries[0] || null;

      // Prepare response data
      responseData = {
        // Settings data (from sublicense settings or defaults)
        customButtons: subLicenseData?.settings?.customButtons || [],
        customActions: subLicenseData?.settings?.customActions || [],
        model: subLicenseData?.settings?.model || "olly_v1",
        llmVendor: subLicenseData?.settings?.llmVendor || "olly",
        replyTone: subLicenseData?.settings?.replyTone || "friendly",
        replyLength:
          subLicenseData?.settings?.replyLength || "short (150 Characters)",
        toneIntent:
          subLicenseData?.settings?.toneIntent || "Ask an Interesting Question",
        language: subLicenseData?.settings?.language || "english",
        usePostNativeLanguage:
          subLicenseData?.settings?.usePostNativeLanguage || false,

        // Include the auto commenter config
        autoCommenterConfig: autoCommenterConfigResponse,
        userLicenseBrandVoice: latestSummary?.summary || null,
        // Include credit balance
        creditBalance: userCreditBalance,
      };
    } else {
      // Get regular license data with settings
      const licenseData = await prisma.licenseKey.findUnique({
        where: { key: licenseKey },
        include: {
          settings: true,
        },
      });

      // Get custom knowledge and summaries
      const licenseKeyData = await prisma.licenseKey.findUnique({
        where: {
          key: licenseKey,
        },
        include: {
          customKnowledge: {
            include: {
              knowledgeSummaries: {
                orderBy: {
                  createdAt: "desc",
                },
                take: 1,
                select: {
                  id: true,
                  summary: true,
                  createdAt: true,
                },
              },
            },
          },
        },
      });

      let latestSummary = null;
      // Return just the latest summary if it exists
      latestSummary =
        licenseKeyData?.customKnowledge?.knowledgeSummaries[0] || null;

      // Find the user for this license
      const licenseUser = await prisma.userLicenseKey.findFirst({
        where: { licenseKeyId: license.id },
        select: { userId: true },
      });

      let autoCommenterConfigResponse = null;
      let userCreditBalance = null;
      if (licenseUser) {
        // Fetch the auto commenter config for this user
        autoCommenterConfigResponse =
          await prisma.autoCommenterConfig.findFirst({
            where: {
              userId: licenseUser.userId,
            },
          });

        // Fetch user credit balance
        const userCredit = await prisma.userCredit.findUnique({
          where: { userId: licenseUser.userId },
          select: { balance: true },
        });
        userCreditBalance = userCredit?.balance ?? 0;
      }

      // Prepare response data in the same format as before
      responseData = {
        // Settings data
        customButtons: licenseData?.settings?.customButtons || [],
        customActions: licenseData?.settings?.customActions || [],
        model: licenseData?.settings?.model || "olly_v1",
        llmVendor: licenseData?.settings?.llmVendor || "olly",
        replyTone: licenseData?.settings?.replyTone || "friendly",
        replyLength:
          licenseData?.settings?.replyLength || "short (150 Characters)",
        toneIntent:
          licenseData?.settings?.toneIntent || "Ask an Interesting Question",
        language: licenseData?.settings?.language || "english",
        usePostNativeLanguage:
          licenseData?.settings?.usePostNativeLanguage || false,

        // Include the auto commenter config
        autoCommenterConfig: autoCommenterConfigResponse,
        userLicenseBrandVoice: latestSummary?.summary || null,
        // Include credit balance
        creditBalance: userCreditBalance,
      };
    }

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Error updating user data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  if (!isValidOrigin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const searchParams = req.nextUrl.searchParams;
  const licenseKey = searchParams.get("licenseKey");

  if (!licenseKey) {
    return NextResponse.json(
      { error: "License key is required" },
      { status: 400 },
    );
  }

  try {
    // Determine if the provided key is a sublicense
    const isSubLicense = await isSubLicenseKey(licenseKey);

    let responseData;

    if (isSubLicense) {
      // Handle sublicense logic
      const sublicense = await prisma.subLicense.findUnique({
        where: { key: licenseKey },
        include: {
          settings: true,
          mainLicenseKey: {
            include: {
              customKnowledge: {
                include: {
                  knowledgeSummaries: {
                    orderBy: {
                      createdAt: "desc",
                    },
                    take: 1,
                    select: {
                      id: true,
                      summary: true,
                      createdAt: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!sublicense) {
        return NextResponse.json(
          { error: "Invalid sublicense key" },
          { status: 404 },
        );
      }

      let latestSummary = null;
      // Get the main license key's brand voice summary
      latestSummary =
        sublicense?.mainLicenseKey?.customKnowledge?.knowledgeSummaries[0] ||
        null;

      // Get the assigned user for this sublicense
      let autoCommenterConfig = null;
      let userCreditBalance = null;
      if (sublicense.assignedUserId) {
        // Fetch the auto commenter config for this user
        autoCommenterConfig = await prisma.autoCommenterConfig.findFirst({
          where: {
            userId: sublicense.assignedUserId,
          },
        });

        // Fetch user credit balance
        const userCredit = await prisma.userCredit.findUnique({
          where: { userId: sublicense.assignedUserId },
          select: { balance: true },
        });
        userCreditBalance = userCredit?.balance ?? 0;
      }

      // Prepare response data for sublicense
      responseData = {
        // Settings data (from sublicense settings or defaults)
        customButtons: sublicense.settings?.customButtons || [],
        customActions: sublicense.settings?.customActions || [],
        model: sublicense.settings?.model || "olly_v1",
        llmVendor: sublicense.settings?.llmVendor || "olly",
        replyTone: sublicense.settings?.replyTone || "friendly",
        replyLength:
          sublicense.settings?.replyLength || "short (150 Characters)",
        toneIntent:
          sublicense.settings?.toneIntent || "Ask an Interesting Question",
        language: sublicense.settings?.language || "english",
        usePostNativeLanguage:
          sublicense.settings?.usePostNativeLanguage || false,

        // Include the auto commenter config
        autoCommenterConfig: autoCommenterConfig,
        userLicenseBrandVoice: latestSummary?.summary || null,
        // Include credit balance
        creditBalance: userCreditBalance,
      };
    } else {
      // Original license key logic
      const license = await prisma.licenseKey.findUnique({
        where: { key: licenseKey },
        include: {
          settings: true,
        },
      });

      if (!license) {
        return NextResponse.json(
          { error: "Invalid license key" },
          { status: 404 },
        );
      }

      const licenseKeyData = await prisma.licenseKey.findUnique({
        where: {
          key: licenseKey,
        },
        include: {
          customKnowledge: {
            include: {
              knowledgeSummaries: {
                orderBy: {
                  createdAt: "desc",
                },
                take: 1,
                select: {
                  id: true,
                  summary: true,
                  createdAt: true,
                },
              },
            },
          },
        },
      });

      let latestSummary = null;
      // Return just the latest summary if it exists
      latestSummary =
        licenseKeyData?.customKnowledge?.knowledgeSummaries[0] || null;

      // Find the user for this license
      const licenseUser = await prisma.userLicenseKey.findFirst({
        where: { licenseKeyId: license.id },
        select: { userId: true },
      });

      let autoCommenterConfig = null;
      let userCreditBalance = null;
      if (licenseUser) {
        // Fetch the auto commenter config for this user
        autoCommenterConfig = await prisma.autoCommenterConfig.findFirst({
          where: {
            userId: licenseUser.userId,
          },
        });

        // Fetch user credit balance
        const userCredit = await prisma.userCredit.findUnique({
          where: { userId: licenseUser.userId },
          select: { balance: true },
        });
        userCreditBalance = userCredit?.balance ?? 0;
      }

      // Prepare response data
      responseData = {
        // Settings data
        customButtons: license.settings?.customButtons || [],
        customActions: license.settings?.customActions || [],
        model: license.settings?.model || "olly_v1",
        llmVendor: license.settings?.llmVendor || "olly",
        replyTone: license.settings?.replyTone || "friendly",
        replyLength: license.settings?.replyLength || "short (150 Characters)",
        toneIntent:
          license.settings?.toneIntent || "Ask an Interesting Question",
        language: license.settings?.language || "english",
        usePostNativeLanguage: license.settings?.usePostNativeLanguage || false,

        // Include the auto commenter config
        autoCommenterConfig: autoCommenterConfig,
        userLicenseBrandVoice: latestSummary?.summary || null,
        // Include credit balance
        creditBalance: userCreditBalance,
      };
    }

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Error fetching user data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
