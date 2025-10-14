import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Prisma, CommentPlatform, ActionType, Hashtag } from "@repo/db";
import { validateRequest } from "@/lib/auth";
import prismadb from "@/lib/prismadb";
import { getUserLicenses } from "@/lib/actions/subLicenseActions";

const customPromptSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Title is required"),
  text: z.string().min(10, "Prompt must be at least 10 characters"),
});

const keywordTargetSchema = z.object({
  keyword: z.string().min(1, "Keyword is required"),
  numLikes: z.number().min(0, "Number of likes must be at least 0"),
  numComments: z.number().min(0, "Number of comments must be at least 0"),
});

const configSchema = z.object({
  platform: z.enum(["LINKEDIN", "TWITTER", "FACEBOOK"]).default("LINKEDIN"),
  isEnabled: z.boolean().default(false),
  useBrandVoice: z.boolean().default(false),
  promoteProduct: z.boolean().default(false),
  productDetails: z.string().optional(),
  feedInteractions: z.object({
    numLikes: z.number().min(0, "Number of likes must be at least 0").max(50),
    numComments: z
      .number()
      .min(0, "Number of comments must be at least 0")
      .max(30),
  }),
  keywordTargets: z.array(keywordTargetSchema).max(10),
  timeInterval: z.number().min(1).max(24).default(5),
  postsPerDay: z.number().min(1).max(10).default(5),
  hashtags: z.array(z.string()).max(3).optional(),
  action: z.array(z.enum(["LIKE", "COMMENT", "SHARE"])).default(["COMMENT"]),
  licenseKey: z.string().optional(),
  sublicenseId: z.string().optional(), // Add support for sublicense ID
  promptMode: z.enum(["automatic", "custom"]).default("automatic"),
  customPrompts: z.array(customPromptSchema).optional(),
  selectedCustomPromptId: z.string().optional(),
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


    const body = await request.json();
    
    const validatedData = configSchema.parse(body);

    

    const platform = validatedData.platform as unknown as CommentPlatform;


    const actions = validatedData.action.map(
      (action) => action as unknown as ActionType,
    );

    // Extract and convert hashtags
    let hashtagsArray: Hashtag[] = [];
    if (validatedData.hashtags && validatedData.hashtags.length > 0) {
      // Try to convert provided hashtags to enum values
      hashtagsArray = validatedData.hashtags
        .map((tag) => {
          try {
            // Try to convert to enum or use a default
            return tag.toUpperCase() as unknown as Hashtag;
          } catch (e) {
            // If conversion fails, return a default
            return "SALES" as Hashtag;
          }
        })
        .slice(0, 3); // Maximum 3 hashtags
    } else {
      // Extract from keyword targets
      const uniqueHashtags = validatedData.keywordTargets
        .map((target) => target.keyword)
        .filter((keyword) => keyword.startsWith("#"))
        .map((hashtag) => {
          try {
            // Try to convert to enum, removing # and converting to uppercase
            return hashtag.substring(1).toUpperCase() as unknown as Hashtag;
          } catch (e) {
            // If conversion fails, return a default
            return "SALES" as Hashtag;
          }
        })
        .slice(0, 3); // Maximum 3 hashtags

      // Convert set to array without using spread operator
      hashtagsArray = Array.from(new Set(uniqueHashtags)); // Remove duplicates
    }

    // Create base data for both create and update operations
    const baseData = {
      platform,
      isEnabled: validatedData.isEnabled,
      timeInterval: validatedData.timeInterval,
      action: actions,
      postsPerDay: validatedData.postsPerDay,
      hashtags: hashtagsArray,
      useBrandVoice: validatedData.useBrandVoice,
      // Add fields
      promoteProduct: validatedData.promoteProduct,
      productDetails: validatedData.productDetails,
      feedLikes: validatedData.feedInteractions.numLikes,
      feedComments: validatedData.feedInteractions.numComments,
      keywordTargets: validatedData.keywordTargets,
      // New fields for custom prompts
      promptMode: validatedData.promptMode,
      customPrompts: validatedData.customPrompts,
      selectedCustomPromptId: validatedData.selectedCustomPromptId,
    };

    // Create base input for create operation with user relation
    let createInput: any = {
      user: { connect: { id: userId } }, // Use connect syntax for relations
      ...baseData,
    };

    // Create base input for update operation
    let updateInput: any = {
      ...baseData,
      updatedAt: new Date(),
    };

    // First, check if the provided license ID is a sublicense or main license
    let isSubLicense = false;
    let licenseId = validatedData.licenseKey;
    
    if (licenseId) {
      // Check if this is a sublicense ID by trying to find it
      const sublicense = await prismadb.subLicense.findUnique({
        where: { id: licenseId },
        select: { id: true }
      });
      
      isSubLicense = !!sublicense;
    }

   
    if (licenseId && !isSubLicense) {
    
      createInput.licenseKey = { connect: { id: licenseId } };
      updateInput.licenseKey = { connect: { id: licenseId } };
      
     
      updateInput.subLicense = { disconnect: true };
    } else if (licenseId && isSubLicense) {

      createInput.subLicense = { connect: { id: licenseId } };
      updateInput.subLicense = { connect: { id: licenseId } };
      
   
      updateInput.licenseKey = { disconnect: true };
    } else {

      updateInput.licenseKey = { disconnect: true };
      updateInput.subLicense = { disconnect: true };
    }

   
    const config = await prismadb.autoCommenterConfig.upsert({
      where: {
        userId_platform: {
          userId,
          platform,
        },
      },
      create: createInput,
      update: updateInput,
    });

    return NextResponse.json(
      {
        success: true,
        data: config,
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

    // Get user email instead of ID
    const userEmail = session.user.email;

    if (!userEmail) {
      return NextResponse.json(
        { error: "User email not found" },
        { status: 400 },
      );
    }

    // Get platform from URL params or default to LinkedIn
    const platformParam =
      request.nextUrl.searchParams.get("platform") || "LINKEDIN";
    const platform = platformParam as unknown as CommentPlatform;

    // Find the user by email
    const user = await prismadb.user.findUnique({
      where: { email: userEmail },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 },
      );
    }

    const userId = user.id;

    // Fetch user's license keys directly from the database by email
    const userLicenseKeys = await prismadb.userLicenseKey.findMany({
      where: { 
        user: {
          email: userEmail
        }
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
        status: "ACTIVE" 
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
      name: `${userLicenseKey.licenseKey.key.substring(0, 8)}... (Main)${userLicenseKey.licenseKey.vendor ? ` - ${userLicenseKey.licenseKey.vendor}` : ''}`,
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
      name: `${subLicense.key.substring(0, 8)}... (Sublicense)${subLicense.mainLicenseKey?.vendor ? ` - ${subLicense.mainLicenseKey.vendor}` : ''}`,
      isActive: subLicense.status === "ACTIVE",
      type: "sub",
      mainLicenseKeyId: subLicense.mainLicenseKeyId,
      mainLicenseKey: subLicense.mainLicenseKey?.key,
      vendor: subLicense.mainLicenseKey?.vendor,
      tier: subLicense.mainLicenseKey?.tier,
      status: subLicense.status,
    }));

    // Combine both types of licenses in a structure that matches what the frontend expects
    const availableLicenses = [...formattedLicenses, ...formattedSubLicenses];
    
    // Also store the categorized version for future use
    const categorizedLicenses = {
      main: formattedLicenses,
      sub: formattedSubLicenses,
      all: availableLicenses
    };

    // Get the configuration for this user and platform
    const config = await prismadb.autoCommenterConfig.findUnique({
      where: {
        userId_platform: {
          userId,
          platform,
        },
      },
      include: {
        licenseKey: {
          select: {
            id: true,
            key: true,
            vendor: true,
          }
        },
        subLicense: {
          select: {
            id: true,
            key: true,
            mainLicenseKey: {
              select: {
                vendor: true,
                key: true,
              }
            }
          }
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

    if (!config) {
      return NextResponse.json(
        {
          data: {
            platform: platformParam,
            isEnabled: false,
            useBrandVoice: false,
            promoteProduct: false,
            feedInteractions: {
              numLikes: 10,
              numComments: 5,
            },
            postsPerDay: 5,
            timeInterval: 5,
            action: ["COMMENT"],
            keywordTargets: [
              {
                keyword: "#sales",
                numLikes: 5,
                numComments: 3,
              },
            ],
            licenseType: null,
            licenseKey: "",
            sublicenseId: "",
            promptMode: "automatic",
            customPrompts: sampleCustomPrompts,
            selectedCustomPromptId: sampleCustomPrompts[0].id,
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
      platform: config.platform,
      isEnabled: config.isEnabled,
      useBrandVoice: config.useBrandVoice,
      promoteProduct: fullConfig.promoteProduct || false,
      productDetails: fullConfig.productDetails || "",
      feedInteractions: {
        numLikes: fullConfig.feedLikes || 10,
        numComments: fullConfig.feedComments || 5,
      },
      postsPerDay: config.postsPerDay,
      timeInterval: config.timeInterval,
      action: config.action,
      hashtags: config.hashtags,
      keywordTargets: fullConfig.keywordTargets || [
        {
          keyword: "#sales",
          numLikes: 5,
          numComments: 3,
        },
      ],
      licenseType: currentLicenseType,
      licenseKey: config.licenseKeyId || "",
      sublicenseId: config.subLicenseId || "",
      licenseInfo: config.licenseKey 
        ? { 
            key: config.licenseKey.key,
            vendor: config.licenseKey.vendor
          } 
        : config.subLicense 
            ? { 
                key: config.subLicense.key,
                mainLicenseKey: config.subLicense.mainLicenseKey?.key,
                vendor: config.subLicense.mainLicenseKey?.vendor
              } 
            : null,
      promptMode: fullConfig.promptMode || "automatic",
      customPrompts: fullConfig.customPrompts || sampleCustomPrompts,
      selectedCustomPromptId:
        fullConfig.selectedCustomPromptId || sampleCustomPrompts[0].id,
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

    // Get platform from URL params
    const platformParam = request.nextUrl.searchParams.get("platform");

    if (!platformParam) {
      return NextResponse.json(
        { error: "Platform is required" },
        { status: 400 },
      );
    }

    const platform = platformParam as unknown as CommentPlatform;

    // Delete the configuration
    await prismadb.autoCommenterConfig.delete({
      where: {
        userId_platform: {
          userId,
          platform,
        },
      },
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