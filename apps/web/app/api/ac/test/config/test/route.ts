import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Prisma, CommentPlatform, ActionType, Hashtag } from "@repo/db";
import { validateRequest } from "@/lib/auth";
import prismadb from "@/lib/prismadb";
import { redirect } from "next/navigation";

// Custom prompt schema
const customPromptSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Title is required"),
  text: z.string().min(10, "Prompt must be at least 10 characters"),
});

// Platform settings schema - Updated to support both keywords and subreddits
const platformSettingsSchema = z.object({
  feedInteractions: z.object({
    numLikes: z.number().min(0).max(50),
    numComments: z.number().min(0).max(30),
  }),
  keywordTargets: z
    .array(
      z.object({
        keyword: z.string().min(1),
        numLikes: z.number().min(0),
        numComments: z.number().min(0),
      }),
    )
    .max(10)
    .optional(),
  subredditTargets: z
    .array(
      z.object({
        subreddit: z.string().min(1),
        numLikes: z.number().min(0),
        numComments: z.number().min(0),
      }),
    )
    .max(10)
    .optional(),
  promptMode: z.enum(["automatic", "custom"]).default("automatic"),
  customPrompts: z.array(customPromptSchema).optional(),
  selectedCustomPromptId: z.string().optional(),
});

// Updated request body schema - Added Reddit support
const configSchema = z.object({
  isEnabled: z.boolean().default(false),
  useBrandVoice: z.boolean().default(false),
  promoteProduct: z.boolean().default(false),
  productDetails: z.string().optional(),
  licenseKey: z.string().optional(),
  sublicenseId: z.string().optional(),
  promptMode: z.enum(["automatic", "custom"]).default("automatic"),
  customPrompts: z.array(customPromptSchema).optional(),
  selectedCustomPromptId: z.string().optional(),
  enabledPlatforms: z
    .array(
      z.enum([
        "LINKEDIN",
        "TWITTER",
        "FACEBOOK",
        "INSTAGRAM",
        "THREADS",
        "REDDIT",
        "TIKTOK",
      ]),
    )
    .default(["LINKEDIN"]),

  // LinkedIn fields (existing structure for backward compatibility)
  feedInteractions: z
    .object({
      numLikes: z.number().min(0).max(50),
      numComments: z.number().min(0).max(30),
    })
    .optional(),
  keywordTargets: z
    .array(
      z.object({
        keyword: z.string().min(1),
        numLikes: z.number().min(0),
        numComments: z.number().min(0),
      }),
    )
    .max(10)
    .optional(),

  // New platforms use JSON settings
  platformSettings: z.record(z.string(), platformSettingsSchema).default({}),
});

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await validateRequest();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "You must be logged in" },
        { status: 401 },
      );
    }
    const userId = session.user.id;
    const userEmail = session.user.email;

    // Parse and validate request body
    const body = await request.json();
    // console.log("Body Data:", body);

    const validatedData = configSchema.parse(body);

    // Convert enabled platforms to enum array
    const enabledPlatforms = validatedData.enabledPlatforms.map(
      (platform) => platform as unknown as CommentPlatform,
    );

    // Create base data for both create and update operations
    const baseData = {
      isEnabled: validatedData.isEnabled,
      useBrandVoice: validatedData.useBrandVoice,
      promoteProduct: validatedData.promoteProduct,
      productDetails: validatedData.productDetails,
      promptMode: validatedData.promptMode,
      customPrompts: validatedData.customPrompts,
      selectedCustomPromptId: validatedData.selectedCustomPromptId,
      enabledPlatforms: enabledPlatforms,

      // LinkedIn fields (existing structure for backward compatibility)
      feedLikes: validatedData.feedInteractions?.numLikes,
      feedComments: validatedData.feedInteractions?.numComments,
      keywordTargets: validatedData.keywordTargets,

      // New platforms use JSON settings
      platformSettings: validatedData.platformSettings,
      updatedAt: new Date(),
    };

    // First, check if the provided license ID is a sublicense or main license
    let isSubLicense = false;
    let licenseId = validatedData.licenseKey;

    if (licenseId) {
      const sublicense = await prismadb.subLicense.findUnique({
        where: { id: licenseId },
        select: { id: true },
      });

      isSubLicense = !!sublicense;
    }

    // Find existing configuration for the user (we'll use a single config now)
    const existingConfig = await prismadb.autoCommenterConfig.findFirst({
      where: { userId },
    });

    let result;

    if (existingConfig) {
      // Update existing configuration
      let updateInput: any = { ...baseData };

      // Handle license key or sublicense connection
      if (licenseId && !isSubLicense) {
        updateInput.licenseKey = { connect: { id: licenseId } };
        updateInput.subLicense = { disconnect: true };
      } else if (licenseId && isSubLicense) {
        updateInput.subLicense = { connect: { id: licenseId } };
        updateInput.licenseKey = { disconnect: true };
      } else {
        updateInput.licenseKey = { disconnect: true };
        updateInput.subLicense = { disconnect: true };
      }

      result = await prismadb.autoCommenterConfig.update({
        where: { id: existingConfig.id },
        data: updateInput,
      });
    } else {
      // Create new configuration
      let createInput: any = {
        user: { connect: { id: userId } },
        platform: CommentPlatform.LINKEDIN, // Keep for backward compatibility
        timeInterval: 5,
        action: [ActionType.COMMENT],
        postsPerDay: 5,
        hashtags: [],
        ...baseData,
      };

      // Handle license connection for creation
      if (licenseId && !isSubLicense) {
        createInput.licenseKey = { connect: { id: licenseId } };
      } else if (licenseId && isSubLicense) {
        createInput.subLicense = { connect: { id: licenseId } };
      }

      result = await prismadb.autoCommenterConfig.create({
        data: createInput,
      });
    }

    return NextResponse.json(
      {
        success: true,
        data: result,
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error saving auto commenter config:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Failed to save configuration", message: error.message },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await validateRequest();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "You must be logged in" },
        { status: 401 },
      );
    }

    const userEmail = session.user.email;

    if (!userEmail) {
      return NextResponse.json(
        { error: "User email not found" },
        { status: 400 },
      );
    }

    // Find the user by email
    const user = await prismadb.user.findUnique({
      where: { email: userEmail },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userId = user.id;

    // Fetch user's license keys directly from the database by email
    const userLicenseKeys = await prismadb.userLicenseKey.findMany({
      where: {
        user: {
          email: userEmail,
        },
      },
      include: {
        licenseKey: {
          select: {
            id: true,
            key: true,
            isActive: true,
            expiresAt: true,
            tier: true,
            planId: true,
            vendor: true,
          },
        },
      },
    });

    // Fetch user's sublicenses by email
    const userSubLicenses = await prismadb.subLicense.findMany({
      where: {
        assignedEmail: userEmail,
        status: "ACTIVE",
      },
      select: {
        id: true,
        key: true,
        status: true,
        mainLicenseKeyId: true,
        mainLicenseKey: {
          select: {
            key: true,
            vendor: true,
            tier: true,
          },
        },
      },
    });

    // Format licenses for response
    const formattedLicenses = userLicenseKeys.map((userLicenseKey) => ({
      id: userLicenseKey.licenseKey.id,
      key: userLicenseKey.licenseKey.key,
      name: `${userLicenseKey.licenseKey.key.substring(0, 8)}... (Main)${userLicenseKey.licenseKey.vendor ? ` - ${userLicenseKey.licenseKey.vendor}` : ""}`,
      isActive: userLicenseKey.licenseKey.isActive,
      expiresAt: userLicenseKey.licenseKey.expiresAt,
      type: "main",
      tier: userLicenseKey.licenseKey.tier,
      planId: userLicenseKey.licenseKey.planId,
      vendor: userLicenseKey.licenseKey.vendor,
      status: userLicenseKey.licenseKey.isActive ? "ACTIVE" : "INACTIVE",
    }));

    // Format sublicenses for response
    const formattedSubLicenses = userSubLicenses.map((subLicense) => ({
      id: subLicense.id,
      key: subLicense.key,
      name: `${subLicense.key.substring(0, 8)}... (Sublicense)${subLicense.mainLicenseKey?.vendor ? ` - ${subLicense.mainLicenseKey.vendor}` : ""}`,
      isActive: subLicense.status === "ACTIVE",
      type: "sub",
      mainLicenseKeyId: subLicense.mainLicenseKeyId,
      mainLicenseKey: subLicense.mainLicenseKey?.key,
      vendor: subLicense.mainLicenseKey?.vendor,
      tier: subLicense.mainLicenseKey?.tier,
      status: subLicense.status,
    }));

    // Combine both types of licenses
    const availableLicenses = [...formattedLicenses, ...formattedSubLicenses];

    const categorizedLicenses = {
      main: formattedLicenses,
      sub: formattedSubLicenses,
      all: availableLicenses,
    };

    // Get the configuration for this user (single config now)
    const config = await prismadb.autoCommenterConfig.findFirst({
      where: { userId },
      include: {
        licenseKey: {
          select: {
            id: true,
            key: true,
            vendor: true,
          },
        },
        subLicense: {
          select: {
            id: true,
            key: true,
            mainLicenseKey: {
              select: {
                vendor: true,
                key: true,
              },
            },
          },
        },
      },
    });

    // Determine the current license type
    let currentLicenseType = null;
    if (config) {
      if (config.licenseKeyId) {
        currentLicenseType = "main";
      } else if (config.subLicenseId) {
        currentLicenseType = "sub";
      }
    }

    // Sample custom prompts
    const sampleCustomPrompts = [
      {
        id: "prompt1",
        title: "Professional Engagement",
        text: "Engage with this post in a professional manner, highlighting relevant industry insights and asking thoughtful questions that demonstrate expertise in the subject matter.",
      },
      {
        id: "prompt2",
        title: "Supportive Connection",
        text: "Respond with empathy and support, acknowledging the key points of the post while offering genuine encouragement or sharing a brief relevant experience.",
      },
      {
        id: "prompt3",
        title: "Value-Adding Response",
        text: "Add value to the conversation by sharing a unique perspective, relevant resource, or actionable tip related to the post's content that would benefit the author and other readers.",
      },
    ];

    // Default platform settings - Updated to include TikTok
    const defaultPlatformSettings = {
      TWITTER: {
        feedInteractions: { numLikes: 3, numComments: 3 },
        keywordTargets: [{ keyword: "#tech", numLikes: 3, numComments: 2 }],
        promptMode: "automatic",
        customPrompts: [],
        selectedCustomPromptId: "",
      },
      FACEBOOK: {
        feedInteractions: { numLikes: 4, numComments: 4 },
        keywordTargets: [{ keyword: "#business", numLikes: 4, numComments: 2 }],
        promptMode: "automatic",
        customPrompts: [],
        selectedCustomPromptId: "",
      },
      INSTAGRAM: {
        feedInteractions: { numLikes: 6, numComments: 3 },
        keywordTargets: [
          { keyword: "#lifestyle", numLikes: 4, numComments: 2 },
        ],
        promptMode: "automatic",
        customPrompts: [],
        selectedCustomPromptId: "",
      },
      REDDIT: {
        feedInteractions: { numLikes: 5, numComments: 3 },
        keywordTargets: [
          { keyword: "technology", numLikes: 3, numComments: 2 },
        ],
        promptMode: "automatic",
        customPrompts: [],
        selectedCustomPromptId: "",
      },
      TIKTOK: {
        feedInteractions: { numLikes: 4, numComments: 2 },
        keywordTargets: [
          { keyword: "#viral", numLikes: 2, numComments: 1 },
        ],
        promptMode: "automatic",
        customPrompts: [],
        selectedCustomPromptId: "",
      },
    };

    if (!config) {
      return NextResponse.json(
        {
          data: {
            isEnabled: false,
            useBrandVoice: false,
            promoteProduct: false,
            productDetails: "",
            licenseType: null,
            licenseKey: "",
            sublicenseId: "",
            promptMode: "automatic",
            customPrompts: sampleCustomPrompts,
            selectedCustomPromptId: sampleCustomPrompts[0].id,
            enabledPlatforms: ["LINKEDIN"],
            // LinkedIn settings as direct fields
            feedInteractions: { numLikes: 5, numComments: 5 },
            keywordTargets: [
              { keyword: "#sales", numLikes: 5, numComments: 3 },
            ],
            // Other platforms in JSON
            platformSettings: defaultPlatformSettings,
          },
          availableLicenses,
          categorizedLicenses,
        },
        { status: 200 },
      );
    }

    // Cast config to any to access custom fields
    const fullConfig = config as any;

    // Transform data to match the expected form structure
    const formattedConfig = {
      isEnabled: config.isEnabled,
      useBrandVoice: config.useBrandVoice,
      promoteProduct: fullConfig.promoteProduct || false,
      productDetails: fullConfig.productDetails || "",
      licenseType: currentLicenseType,
      licenseKey: config.licenseKeyId || "",
      sublicenseId: config.subLicenseId || "",
      feedInteractions: {
        numLikes: fullConfig.feedLikes,
        numComments: fullConfig.feedComments,
      },
      keywordTargets: fullConfig.keywordTargets,
      licenseInfo: config.licenseKey
        ? {
            key: config.licenseKey.key,
            vendor: config.licenseKey.vendor,
          }
        : config.subLicense
          ? {
              key: config.subLicense.key,
              mainLicenseKey: config.subLicense.mainLicenseKey?.key,
              vendor: config.subLicense.mainLicenseKey?.vendor,
            }
          : null,
      promptMode: fullConfig.promptMode || "automatic",
      customPrompts: fullConfig.customPrompts || sampleCustomPrompts,
      selectedCustomPromptId:
        fullConfig.selectedCustomPromptId || sampleCustomPrompts[0].id,
      enabledPlatforms: fullConfig.enabledPlatforms || ["LINKEDIN"],
      platformSettings: fullConfig.platformSettings || defaultPlatformSettings,
    };

    return NextResponse.json(
      {
        data: formattedConfig,
        availableLicenses,
        categorizedLicenses,
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error fetching auto commenter config:", error);

    return NextResponse.json(
      { error: "Failed to fetch configuration", message: error.message },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const session = await validateRequest();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "You must be logged in" },
        { status: 401 },
      );
    }

    const userId = session.user.id;

    // Delete the configuration (single config now)
    await prismadb.autoCommenterConfig.deleteMany({
      where: { userId },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error("Error deleting auto commenter config:", error);

    return NextResponse.json(
      { error: "Failed to delete configuration", message: error.message },
      { status: 500 },
    );
  }
}
