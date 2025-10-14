//app/api/v1/chat/route.ts
import { sendDiscordNotification } from "@/service/discord-notify";
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import prismadb from "@/lib/prismadb";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function validateLemonSqueezyLicenseKey(licenseKey: string) {
  const apiUrl = "https://api.lemonsqueezy.com/v1/licenses/validate";
  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `license_key=${licenseKey}`,
    });
    const data = await response.json();

    if (data.valid) {
      const storeId = "24431";
      const productId = "327282";

      if (data.meta.store_id == storeId && data.meta.product_id == productId) {
        return { isValid: true, licenseData: data };
      } else {
        return { isValid: false };
      }
    } else {
      return { isValid: false };
    }
  } catch (error) {
    console.error("Error validating license key:", error);
    return { isValid: false };
  }
}

async function checkLicenseKeyInDb(licenseKey: string): Promise<boolean> {
  const existingLicenseKey = await prismadb.licenseKey.findUnique({
    where: { key: licenseKey },
  });
  return !!existingLicenseKey;
}

async function addLicenseKeyToDb(
  licenseKey: string,
  apiKey: string,
  userId: string,
) {
  const user = await prismadb.user.findUnique({
    where: { id: userId },
  });

  const newLicenseKey = await prismadb.licenseKey.create({
    data: {
      key: licenseKey,
      isActive: true,
    },
  });

  if (user) {
    await prismadb.userLicenseKey.create({
      data: {
        userId: user.id,
        licenseKeyId: newLicenseKey.id,
      },
    });
  }

  const apiKeyRecord = await prismadb.apiKey.upsert({
    where: { key: apiKey },
    update: {},
    create: { key: apiKey },
  });

  if (user) {
    await prismadb.userApiKey.create({
      data: {
        userId: user.id,
        apiKeyId: apiKeyRecord.id,
      },
    });
  }

  return newLicenseKey;
}

async function updateApiKeyAssociation(
  licenseKey: string,
  apiKey: string,
  userId: string,
) {
  const user = await prismadb.user.findUnique({
    where: { id: userId },
  });

  const existingLicenseKey = await prismadb.licenseKey.findUnique({
    where: { key: licenseKey },
    include: { users: true },
  });

  if (!existingLicenseKey) {
    throw new Error("License key not found");
  }
  if (user) {
    // Check if the user is already associated with this license key
    const existingUserLicenseKey = existingLicenseKey.users.find(
      (ulk) => ulk.userId === user.id,
    );

    if (!existingUserLicenseKey) {
      // If not, create the association
      await prismadb.userLicenseKey.create({
        data: {
          userId: user.id,
          licenseKeyId: existingLicenseKey.id,
        },
      });
    }

    // Upsert the API key
    const apiKeyRecord = await prismadb.apiKey.upsert({
      where: { key: apiKey },
      update: {},
      create: { key: apiKey },
    });

    // Update or create the UserApiKey association
    await prismadb.userApiKey.upsert({
      where: {
        userId_apiKeyId: {
          userId: user.id,
          apiKeyId: apiKeyRecord.id,
        },
      },
      update: {},
      create: {
        userId: user.id,
        apiKeyId: apiKeyRecord.id,
      },
    });
  }
}

export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get("origin");

  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": origin || "*",
      "Access-Control-Allow-Methods": "GET,OPTIONS,PATCH,DELETE,POST,PUT",
      "Access-Control-Allow-Headers": "*",
    },
  });
}

async function checkApiKeyInDb(
  apiKey: string,
): Promise<{ exists: boolean; isActive: boolean; vendor: string | null }> {
  const existingApiKey = await prismadb.apiKey.findUnique({
    where: { key: apiKey },
  });
  return {
    exists: !!existingApiKey,
    isActive: existingApiKey?.isActive || false,
    vendor: existingApiKey?.vendor || null,
  };
}

async function updateApiKeyVendor(apiKey: string, vendor: string) {
  await prismadb.apiKey.update({
    where: { key: apiKey },
    data: { vendor: vendor },
  });
}

async function deductCredit(
  apiKey: string,
): Promise<{ success: boolean; message?: string }> {
  const apiKeyRecord = await prismadb.apiKey.findUnique({
    where: { key: apiKey },
    include: { users: { include: { user: { include: { credit: true } } } } },
  });

  if (!apiKeyRecord || apiKeyRecord.users.length === 0) {
    return { success: false, message: "No user associated with this API key" };
  }

  const userCredit = apiKeyRecord.users[0].user.credit;
  if (!userCredit || userCredit.balance <= 0) {
    return {
      success: false,
      message:
        "Insufficient credits. Please add credits at https://www.olly.social/dashboard/plans",
    };
  }

  await prismadb.userCredit.update({
    where: { id: userCredit.id },
    data: { balance: { decrement: 1 } },
  });

  await prismadb.creditTransaction.create({
    data: {
      userCreditId: userCredit.id,
      amount: -1,
      type: "SPENT",
      description: "API usage",
    },
  });

  return { success: true };
}

async function isValidImageUrl(url: string): Promise<boolean> {
  try {
    // Basic URL validation
    new URL(url);

    // Check if URL is properly formatted and not truncated
    if (url.endsWith(".") || url.includes("...") || !url.startsWith("http")) {
      return false;
    }

    // Special handling for Instagram URLs - skip validation and assume valid
    if (url.includes("instagram.") || url.includes("fbcdn.net")) {
      return true;
    }

    // Try to fetch the image to validate it's accessible
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(url, {
      method: "HEAD",
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const contentType = response.headers.get("content-type");
    return response.ok && (contentType?.startsWith("image/") ?? false);
  } catch (error) {
    // For any error, log it but don't fail the validation
    console.warn("Image URL validation warning:", error);
    // If it's an Instagram/Facebook URL that failed validation, still return true
    if (url.includes("instagram.") || url.includes("fbcdn.net")) {
      return true;
    }
    return false;
  }
}

export async function POST(request: NextRequest) {
  const extensionId = request.headers.get("X-Extension-ID");
  const authHeader = request.headers.get("Authorization");
  const userAgent = request.headers.get("User-Agent") || "Unknown";

  if (extensionId !== process.env.EXTENSION_ID) {
    return new NextResponse("Unauthorized", { status: 403 });
  }

  if (request.method === "OPTIONS") {
    return OPTIONS(request);
  }

  // Extract the API key from the Authorization header
  const apiKey = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!apiKey || apiKey.trim() === "") {
    await sendDiscordNotification("API key error: Empty or missing API key");
    return new NextResponse("Invalid API key", { status: 401 });
  }

  try {
    const { exists, isActive, vendor } = await checkApiKeyInDb(apiKey);

    if (!exists || !isActive) {
      return new NextResponse("Invalid or inactive API key", { status: 401 });
    }

    if (!vendor) {
      // If no vendor, check LemonSqueezy first
      const { isValid } = await validateLemonSqueezyLicenseKey(apiKey);
      if (isValid) {
        await updateApiKeyVendor(apiKey, "lemon");
      } else {
        // If not valid in LemonSqueezy, mark as Olly
        await updateApiKeyVendor(apiKey, "olly");
      }
    }

    // Recheck vendor after potential update
    const updatedApiKey = await prismadb.apiKey.findUnique({
      where: { key: apiKey },
    });

    if (updatedApiKey?.vendor === "olly") {
      const { success, message } = await deductCredit(apiKey);
      if (!success) {
        return new NextResponse(message, { status: 402 });
      }
    }

    const body = await request.json();
    const { prompt, user_id, date, model, platform, images, action_type } =
      body;

    const messages: ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: `You are a human browsing through social media. You are a people person. You avoid using words most people do not understand. People like that your content is engaging, does not contain double quotes, is not too long, and is fun to read.`,
      },
    ];

    let validImages: string[] = [];
    if (images && images.length > 0) {
      // Validate all image URLs and filter out invalid ones
      const validationPromises = images.map(async (imageUrl: string) => {
        const isValid = await isValidImageUrl(imageUrl);
        return { url: imageUrl, isValid };
      });

      const validationResults = await Promise.all(validationPromises);
      validImages = validationResults
        .filter((result) => result.isValid)
        .map((result) => result.url);

      // Log invalid images for debugging
      const invalidImages = validationResults
        .filter((result) => !result.isValid)
        .map((result) => result.url);

      if (invalidImages.length > 0) {
        // console.warn(
        //   `Invalid or inaccessible image URLs: ${invalidImages.join(", ")}`,
        // );
      }
    }

    const createCompletion = async (useImages: boolean) => {
      const content: Array<
        | { type: "text"; text: string }
        | { type: "image_url"; image_url: { url: string } }
      > = [
        { type: "text", text: prompt },
        ...(useImages
          ? validImages.map((imageUrl) => ({
              type: "image_url" as const,
              image_url: {
                url: imageUrl,
              },
            }))
          : []),
      ];

      messages.push({
        role: "user",
        content: content,
      });

      try {
        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini", // Always using gpt-4o-mini
          messages: messages,
          n: 1,
          temperature: 0.8,
          max_tokens: 2500,
        });

        return completion.choices[0].message.content;
      } catch (error: any) {
        console.error("Error during OpenAI completion:", error);

        // If we were using images and got an error, retry without images
        if (useImages) {
          console.warn(
            "OpenAI failed to process images, retrying without images",
          );
          // Remove the last message that contained images
          messages.pop();
          return createCompletion(false);
        }
        
        // If we're already not using images or get a different error, rethrow
        throw error;
      }
    };

    const generatedContent = await createCompletion(validImages.length > 0);

    await prismadb.apiUsage.create({
      data: {
        content: generatedContent || "",
        prompt: prompt,
        platform: platform,
        apiKey: { connect: { key: apiKey } },
      },
    });

    const response = new NextResponse(
      JSON.stringify({
        success: true,
        data: {
          generatedContent: generatedContent,
        },
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET,OPTIONS,PATCH,DELETE,POST,PUT",
          "Access-Control-Allow-Headers": "*",
        },
      },
    );

    return response;
  } catch (error: any) {
    console.error(`Error processing request: ${error.message}`);
    const errorResponse = new NextResponse(
      JSON.stringify({
        success: false,
        error: error.message || "An unexpected error occurred",
      }),
      {
        status: error.status || 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET,OPTIONS,PATCH,DELETE,POST,PUT",
          "Access-Control-Allow-Headers": "*",
        },
      },
    );
    return errorResponse;
  }
}
