// app/api/tools/picasso/route.ts
import { NextRequest, NextResponse } from "next/server";
import { validateRequest } from "@/lib/auth";
import prisma from "@/lib/prismadb";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import axios from "axios";
import crypto from "crypto";
import FormData from "form-data";
import sharp from "sharp";
import path from "path";
import os from "os";
import { promises as fsPromises } from "fs";
import { Readable } from "stream";

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION_NAME || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

// Helper function to upload buffer to S3
async function uploadToS3(
  buffer: Buffer,
  fileName: string,
  contentType: string,
): Promise<string> {
  const bucketName = process.env.AWS_BUCKET_NAME || "";
  const key = `generated/${fileName}`;

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  });

  await s3Client.send(command);

  // Generate public URL
  const publicUrl = `https://${bucketName}.s3.amazonaws.com/${key}`;

  return publicUrl;
}

// Style prompts for different styles
const STYLE_PROMPTS = {
  ghibli:
    "Transform this image into Studio Ghibli style animation with its characteristic warm tones, detailed backgrounds, and whimsical atmosphere.",
  watercolor:
    "Convert this image into a soft, dreamy watercolor painting with gentle color washes, subtle transitions, and a light, airy quality.",
  cyberpunk:
    "Transform this image into a cyberpunk aesthetic with neon lights, high tech elements, dark rainy streets, and futuristic dystopian elements.",
  vintage:
    "Convert this image into a vintage photograph with faded colors, film grain texture, light leaks, and a nostalgic retro atmosphere.",
  comic:
    "Transform this image into a comic book style with bold outlines, vibrant flat colors, dynamic compositions, and characteristic halftone patterns.",
  // 'custom' style is handled separately based on user input
};

// Credit costs for different quality levels
const QUALITY_CREDIT_COSTS = {
  high: 10,
  medium: 7,
  low: 5,
  auto: 7,
};

// Helper function to create a buffer stream for FormData
function bufferToStream(buffer: Buffer) {
  const readable = new Readable();
  readable._read = () => {}; // _read is required but you can noop it
  readable.push(buffer);
  readable.push(null);
  return readable;
}

// Helper function to generate image using OpenAI API
async function generateGptImage(
  prompt: string,
  referenceImageUrl: string,
  options: any = {},
) {
  let tempDir = "";
  let tempImagePath = "";

  try {
    // Create a temporary directory to store the image
    tempDir = await fsPromises.mkdtemp(path.join(os.tmpdir(), "openai-"));
    tempImagePath = path.join(tempDir, "input.png");

    // Fetch the reference image
    const imageResponse = await axios.get(referenceImageUrl, {
      responseType: "arraybuffer",
    });
    const imageBuffer = Buffer.from(imageResponse.data);

    // Process the image with sharp to ensure proper format and size
    const processedImage = await sharp(imageBuffer).toFormat("png").toBuffer();

    // Write the processed image to the temporary file
    await fsPromises.writeFile(tempImagePath, processedImage);

    // Create form data with the proper structure for the edits endpoint
    const formData = new FormData();

    // Add the required parameters
    formData.append("model", "gpt-image-1");

    // Use a buffer stream instead of fs.createReadStream
    const imageData = await fsPromises.readFile(tempImagePath);
    formData.append("image[]", bufferToStream(imageData), {
      filename: "input.png",
      contentType: "image/png",
    });

    formData.append("prompt", prompt);
    formData.append("n", "1");
    formData.append("size", options.size || "1024x1024");
    formData.append("quality", options.quality || "low");

    // Use the correct endpoint for transformation
    const openaiResponse = await axios.post(
      "https://api.openai.com/v1/images/edits",
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      },
    );

    if (openaiResponse.status !== 200) {
      console.error("OpenAI API error:", openaiResponse.data);
      throw new Error(
        openaiResponse.data.error?.message || "Image generation failed",
      );
    }

    // gpt-image-1 always returns base64-encoded images
    return openaiResponse.data.data[0].b64_json;
  } catch (error: any) {
    console.error("Error generating image with OpenAI API:", error.message);
    if (error.response) {
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
    }
    throw error;
  } finally {
    // Clean up the temporary files
    try {
      if (
        tempImagePath &&
        (await fsPromises.stat(tempImagePath).catch(() => null))
      ) {
        await fsPromises.unlink(tempImagePath);
      }
      if (tempDir && (await fsPromises.stat(tempDir).catch(() => null))) {
        await fsPromises.rmdir(tempDir);
      }
    } catch (cleanupError) {
      console.error("Error cleaning up temporary files:", cleanupError);
    }
  }
}

// Helper function to process a single image
async function processImage(
  file: any,
  enhancedPrompt: string,
  options: any,
  userId: string,
) {
  try {
    // Generate image using OpenAI API
    const b64Image = await generateGptImage(
      enhancedPrompt,
      file.fileUrl,
      options,
    );

    // Convert base64 to buffer
    const imageBuffer = Buffer.from(b64Image, "base64");

    // Upload generated image to S3
    const generatedFilename = `generated-${crypto.randomUUID()}.png`;
    const generatedImageUrl = await uploadToS3(
      imageBuffer,
      generatedFilename,
      "image/png",
    );

    // Store in database
    const savedGeneration = await prisma.imageGeneration.create({
      data: {
        userId: userId,
        prompt: enhancedPrompt,
        imageUrl: generatedImageUrl,
        referenceImageUrl: file.fileUrl,
        size: options.size,
        style: options.style,
        customStyle: options.customStyle || null,
        quality: options.quality || "auto",
        route: "/tools/picasso",
      },
    });

    // Return the result
    return {
      success: true,
      id: savedGeneration.id,
      originalImageId: file.id,
      originalImageUrl: file.fileUrl,
      originalImageName: file.filename,
      generatedImageUrl: generatedImageUrl,
      prompt: enhancedPrompt,
      quality: options.quality || "auto",
    };
  } catch (error: any) {
    console.error(`Error processing image ${file.id}:`, error);
    return {
      success: false,
      originalImageId: file.id,
      originalImageUrl: file.fileUrl,
      originalImageName: file.filename,
      error: error.message || "Failed to process image",
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    // Validate user authentication
    const { user } = await validateRequest();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Check if user has credit available
    const userCredit = await prisma.userCredit.findUnique({
      where: { userId: user.id },
    });

    if (!userCredit) {
      return new NextResponse(
        JSON.stringify({
          error: "No credit record found for this user",
        }),
        { status: 402 },
      );
    }

    // Parse form data
    const formData = await request.formData();
    const style = (formData.get("style") as string) || "ghibli";
    const customStyleDescription =
      (formData.get("customStyleDescription") as string) || "";
    const customPrompt = (formData.get("prompt") as string) || "";
    const size = (formData.get("size") as string) || "1024x1024";
    const quality = (formData.get("quality") as string) || "auto";

    // Get credit cost based on quality level
    const creditCostPerImage =
      QUALITY_CREDIT_COSTS[quality as keyof typeof QUALITY_CREDIT_COSTS] ||
      QUALITY_CREDIT_COSTS.auto;

    // Handle file IDs (either directly provided or from selected files)
    let fileIds: string[] = [];

    // Check if fileIds are provided directly
    const fileIdsParam = formData.get("fileIds");
    if (fileIdsParam) {
      fileIds = JSON.parse(fileIdsParam as string);
    } else {
      // Otherwise, check if files are uploaded in this request
      const fileUploadPromises = [];

      for (const [key, value] of Array.from(formData.entries())) {
        // Check if value is a File by checking for blob-like properties instead of instanceof
        if (
          value &&
          typeof value === "object" &&
          "arrayBuffer" in value &&
          "type" in value &&
          "name" in value &&
          "size" in value &&
          key.startsWith("image")
        ) {
          // Create a promise for each file upload
          const uploadPromise = (async () => {
            // Upload the file first
            const fileBytes = await (value as Blob).arrayBuffer();
            const buffer = Buffer.from(fileBytes);

            // Generate unique filename
            const fileExtension = (value as any).name.split(".").pop() || "png";
            const uniqueFilename = `${crypto.randomUUID()}.${fileExtension}`;

            // Upload to S3
            const imageUrl = await uploadToS3(
              buffer,
              uniqueFilename,
              (value as any).type,
            );

            // Store file reference in database
            const fileRecord = await prisma.userFile.create({
              data: {
                userId: user.id,
                filename: (value as any).name,
                fileSize: (value as any).size,
                fileType: (value as any).type,
                fileUrl: imageUrl,
                metadata: {
                  uploadedAt: new Date().toISOString(),
                  originalName: (value as any).name,
                },
                tags: ["bulk-processing"],
                category: "uploads",
              },
            });

            return fileRecord.id;
          })();

          fileUploadPromises.push(uploadPromise);
        }
      }

      // Wait for all file uploads to complete
      fileIds = await Promise.all(fileUploadPromises);
    }

    if (fileIds.length === 0) {
      return new NextResponse(JSON.stringify({ error: "No images provided" }), {
        status: 400,
      });
    }

    // Validate all fileIds belong to the user
    const files = await prisma.userFile.findMany({
      where: {
        id: { in: fileIds },
        userId: user.id,
      },
    });

    if (files.length !== fileIds.length) {
      return new NextResponse(
        JSON.stringify({
          error: "Some file IDs are invalid or don't belong to this user",
        }),
        { status: 403 },
      );
    }

    // Calculate required credits based on quality level
    const requiredCredits = files.length * creditCostPerImage;

    if (userCredit.balance < requiredCredits) {
      return new NextResponse(
        JSON.stringify({
          error: `Insufficient credits. You need ${requiredCredits} credits for this operation (${files.length} images at ${creditCostPerImage} credits each for ${quality} quality), but you only have ${userCredit.balance}.`,
          requiredCredits,
          creditsPerImage: creditCostPerImage,
        }),
        { status: 402 },
      );
    }

    // Prepare the base prompt using selected style or custom style description
    let basePrompt = "";

    if (style === "custom") {
      if (!customStyleDescription) {
        return new NextResponse(
          JSON.stringify({
            error: "Custom style selected but no description provided",
          }),
          { status: 400 },
        );
      }
      basePrompt = `Transform this image into the following style: ${customStyleDescription}`;
    } else {
      basePrompt =
        STYLE_PROMPTS[style as keyof typeof STYLE_PROMPTS] ||
        STYLE_PROMPTS.ghibli;
    }

    // Combine with custom prompt if provided
    const enhancedPrompt = customPrompt
      ? `${basePrompt} ${customPrompt}`
      : basePrompt;

    // Map size values to OpenAI supported sizes
    let apiSize = size;
    // Ensure size is one of the supported values for gpt-image-1
    if (!["1024x1024", "1536x1024", "1024x1536", "auto"].includes(apiSize)) {
      apiSize = "1024x1024";
    }

    // Process each image in parallel (but with concurrency control)
    const BATCH_SIZE = 3; // Process 3 images at a time to avoid overwhelming the API
    const results = [];
    const processedFileIds = [];

    // Process files in batches
    for (let i = 0; i < files.length; i += BATCH_SIZE) {
      const batch = files.slice(i, i + BATCH_SIZE);
      const batchPromises = batch.map((file) =>
        processImage(
          file,
          enhancedPrompt,
          {
            size: apiSize,
            quality: quality,
            style: style,
            customStyle: style === "custom" ? customStyleDescription : null,
          },
          user.id,
        ),
      );

      // Wait for the current batch to complete
      const batchResults = await Promise.all(batchPromises);

      // Add successful results to final results array
      for (const result of batchResults) {
        if (result.success) {
          results.push(result);
          processedFileIds.push(result.originalImageId);
        }
      }
    }

    // Only deduct credits for successfully processed images
    const creditsToDeduct = processedFileIds.length * creditCostPerImage;

    if (creditsToDeduct > 0) {
      // Deduct credits
      await prisma.userCredit.update({
        where: { userId: user.id },
        data: { balance: userCredit.balance - creditsToDeduct },
      });

      // Create credit transaction records
      await prisma.creditTransaction.create({
        data: {
          userCreditId: userCredit.id,
          amount: -creditsToDeduct,
          type: "SPENT",
          description:
            style === "custom"
              ? `Style generator: ${processedFileIds.length} images in custom style (${quality} quality)`
              : `Style generator: ${processedFileIds.length} images in ${style} style (${quality} quality)`,
        },
      });
    }

    // Get remaining credits after deduction
    const remainingCredits = userCredit.balance - creditsToDeduct;

    return NextResponse.json({
      results: results,
      creditsRemaining: remainingCredits,
      creditsUsed: creditsToDeduct,
      creditsPerImage: creditCostPerImage,
      style: style,
      quality: quality,
      customStyle: style === "custom" ? customStyleDescription : null,
      totalProcessed: results.length,
      totalRequested: files.length,
    });
  } catch (error: any) {
    console.error("Error in style generation:", error);
    return new NextResponse(
      JSON.stringify({
        error: "Failed to generate styled images",
        details: error.message,
      }),
      { status: 500 },
    );
  }
}

