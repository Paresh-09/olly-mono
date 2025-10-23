import { NextRequest, NextResponse } from "next/server";
import { validateRequest } from "@/lib/auth";
import prisma from "@/lib/prismadb";
import OpenAI from "openai";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import axios from "axios";
import crypto from "crypto";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

// Helper function to upload buffer to S3
async function uploadToS3(buffer: Buffer, fileName: string, contentType: string): Promise<string> {
  const bucketName = process.env.S3_BUCKET_NAME || "";
  const key = `images/${fileName}`;
  
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  });

  await s3Client.send(command);
  
  // Generate a signed URL for accessing the uploaded image
  const getCommand = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
  });
  
  const signedUrl = await getSignedUrl(s3Client, getCommand, { expiresIn: 3600 });
  const publicUrl = `https://${bucketName}.s3.amazonaws.com/${key}`;
  
  return publicUrl;
}

// Helper function to generate image using GPT Image API
async function generateGptImage(prompt: string, referenceImageUrls: string[] = [], options: any = {}) {
  try {
    // Default parameters
    const params: any = {
      model: "gpt-image-1",
      prompt: prompt,
      quality: options.quality || "medium",
      size: options.size || "1024x1024",
    };

    // For reference images, use the edits endpoint
    if (referenceImageUrls.length > 0) {
      // Fetch all reference images
      const imagePromises = referenceImageUrls.map(url => axios.get(url, { responseType: 'arraybuffer' }));
      const imageResponses = await Promise.all(imagePromises);
      
      // Prepare form data with all images
      const formData = new FormData();
      formData.append('model', 'gpt-image-1');
      imageResponses.forEach((response, index) => {
        const imageBuffer = Buffer.from(response.data);
        formData.append('image[]', new Blob([imageBuffer]), `image${index}.png`);
      });
      formData.append('prompt', prompt);
      
      if (options.quality) formData.append('quality', options.quality);
      if (options.size) formData.append('size', options.size);
      
      // If mask is provided for inpainting
      if (options.mask) {
        const maskResponse = await axios.get(options.mask, { responseType: 'arraybuffer' });
        const maskBuffer = Buffer.from(maskResponse.data);
        formData.append('mask', new Blob([maskBuffer]), 'mask.png');
      }
      
      const response = await fetch('https://api.openai.com/v1/images/edits', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: formData,
      });
      
      const data = await response.json();
      if (!data?.data?.[0]?.b64_json) {
        throw new Error('Failed to generate image: No base64 data returned from OpenAI');
      }
      return data.data[0].b64_json;
    } else {
      // Use generations endpoint for text-to-image
      const response = await openai.images.generate(params);
      if (!response?.data?.[0]?.b64_json) {
        throw new Error('Failed to generate image: No base64 data returned from OpenAI');
      }
      return response.data[0].b64_json;
    }
  } catch (error: any) {
    console.error("Error generating image with GPT Image API:", error);
    throw error;
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

    // Parse form data
    const formData = await request.formData();
    const prompt = formData.get('prompt') as string;
    const size = formData.get('size') as string || "1024x1024";
    const quality = formData.get('quality') as string || "medium";
    const isBulkProcessing = formData.get('bulk') === 'true';
    
    // Get all image files from form data
    const imageFiles: File[] = [];
    for (const [key, value] of Array.from(formData.entries())) {
      if (key.startsWith('image') && value && typeof (value as any).arrayBuffer === 'function') {
        imageFiles.push(value as unknown as File);
      }
    }

    // For bulk processing, check sufficient credits
    const requiredCredits = Math.max(1, imageFiles.length);
    if (!userCredit || userCredit.balance < requiredCredits) {
      return new NextResponse(JSON.stringify({ 
        error: `Insufficient credits. You need ${requiredCredits} credits for this operation.` 
      }), { status: 402 });
    }

    // Array to store generated results
    const generatedResults = [];
    
    // Upload reference images to S3 first
    const referenceImageUrls: string[] = [];
    for (const imageFile of imageFiles) {
      const imageBytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(imageBytes);
      
      // Generate unique filename
      const fileExtension = imageFile.name.split('.').pop() || 'png';
      const uniqueFilename = `${crypto.randomUUID()}.${fileExtension}`;
      
      // Upload to S3
      const imageUrl = await uploadToS3(buffer, uniqueFilename, imageFile.type);
      referenceImageUrls.push(imageUrl);
    }

    if (isBulkProcessing) {
      // Process each image individually with the same prompt
      for (const referenceUrl of referenceImageUrls) {
        const enhancedPrompt = `Transform this image into Studio Ghibli style. ${prompt || 'Add magical elements and Ghibli atmosphere'}`;
        
        // Generate image using GPT Image API
        const b64Image = await generateGptImage(enhancedPrompt, [referenceUrl], { size, quality });
        
        // Convert base64 to buffer
        const imageBuffer = Buffer.from(b64Image, 'base64');
        
        // Upload generated image to S3
        const uniqueFilename = `generated-${crypto.randomUUID()}.png`;
        const generatedImageUrl = await uploadToS3(imageBuffer, uniqueFilename, 'image/png');
        
        // Store result
        generatedResults.push({
          originalImage: referenceUrl,
          generatedImage: generatedImageUrl,
          prompt: enhancedPrompt
        });
        
        // Store in database
        await prisma.imageGeneration.create({
          data: {
            userId: user.id,
            prompt: prompt || "",
            revisedPrompt: enhancedPrompt,
            imageUrl: generatedImageUrl,
            referenceImageUrl: referenceUrl,
            size: size,
            style: "ghibli",
            route: "/tools/ghibli-image-generator",
          },
        });
      }
      
      // Deduct credits
      await prisma.userCredit.update({
        where: { userId: user.id },
        data: { balance: userCredit.balance - referenceImageUrls.length },
      });
      
      // Create credit transaction records
      await prisma.creditTransaction.create({
        data: {
          userCreditId: userCredit.id,
          amount: -referenceImageUrls.length,
          type: "SPENT",
          description: `Bulk Ghibli image generation (${referenceImageUrls.length} images)`,
        },
      });
    } else {
      // Single image processing
      const enhancedPrompt = `Transform this image into Studio Ghibli style. ${prompt || 'Add magical elements and Ghibli atmosphere'}`;
      
      // Generate image using GPT Image API
      const b64Image = await generateGptImage(enhancedPrompt, referenceImageUrls, { size, quality });
      
      // Convert base64 to buffer
      const imageBuffer = Buffer.from(b64Image, 'base64');
      
      // Upload generated image to S3
      const uniqueFilename = `generated-${crypto.randomUUID()}.png`;
      const generatedImageUrl = await uploadToS3(imageBuffer, uniqueFilename, 'image/png');
      
      // Store result
      generatedResults.push({
        originalImages: referenceImageUrls,
        generatedImage: generatedImageUrl,
        prompt: enhancedPrompt
      });
      
      // Store in database
      const savedImage = await prisma.imageGeneration.create({
        data: {
          userId: user.id,
          prompt: prompt || "",
          revisedPrompt: enhancedPrompt,
          imageUrl: generatedImageUrl,
          referenceImageUrl: referenceImageUrls.length > 0 ? referenceImageUrls[0] : null,
          size: size,
          style: "ghibli",
          route: "/tools/ghibli-image-generator",
        },
      });
      
      // Deduct 1 credit
      await prisma.userCredit.update({
        where: { userId: user.id },
        data: { balance: userCredit.balance - 1 },
      });
      
      // Create credit transaction record
      await prisma.creditTransaction.create({
        data: {
          userCreditId: userCredit.id,
          amount: -1,
          type: "SPENT",
          description: "Ghibli image generation",
        },
      });
    }

    // Get remaining credits
    const remainingCredits = userCredit.balance - (isBulkProcessing ? referenceImageUrls.length : 1);

    return NextResponse.json({
      results: generatedResults,
      creditsRemaining: remainingCredits,
      toolType: 'ghibli-image-generator',
    });
  } catch (error: any) {
    console.error('Error generating images:', error);
    return new NextResponse(JSON.stringify({ error: "Failed to generate image", details: error.message }), { status: 500 });
  }
}

// Endpoint to get all user's generated images
export async function GET(request: NextRequest) {
  try {
    // Validate user authentication
    const { user } = await validateRequest();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get all images generated by this user
    const generations = await prisma.imageGeneration.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        prompt: true,
        revisedPrompt: true,
        imageUrl: true,
        referenceImageUrl: true,
        size: true,
        createdAt: true,
      }
    });

    return NextResponse.json({
      generations,
    });
  } catch (error: any) {
    console.error('Error fetching images:', error);
    return new NextResponse(JSON.stringify({ error: "Failed to fetch images" }), { status: 500 });
  }
}