import { NextRequest, NextResponse } from "next/server";
import { validateRequest } from "@/lib/auth";
import prisma from "@/lib/prismadb";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION_NAME || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

// Helper function to upload buffer to S3
async function uploadToS3(buffer: Buffer, fileName: string, contentType: string): Promise<string> {
  const bucketName = process.env.AWS_BUCKET_NAME || "";
  const key = `uploads/${fileName}`;
  
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

export async function POST(request: NextRequest) {
  try {
    // Validate user authentication
    const { user } = await validateRequest();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Parse form data
    const formData = await request.formData();
    const files: File[] = [];
    const category = formData.get('category') as string || "uncategorized";
    const tags = formData.get('tags') ? (formData.get('tags') as string).split(',').map(tag => tag.trim()) : [];
    
    // Collect all files from form data
    for (const [key, value] of Array.from(formData.entries())) {
      // In some runtimes File may not be recognized by instanceof; use duck-typing
      if (key.startsWith('file') && value && typeof (value as any).arrayBuffer === 'function') {
        files.push(value as unknown as File);
      }
    }

    if (files.length === 0) {
      return new NextResponse(JSON.stringify({ error: "No files provided" }), { status: 400 });
    }

    // Process each file
    const uploadResults = [];
    
    for (const file of files) {
      // Skip non-image files
      if (!file.type.startsWith('image/')) {
        continue;
      }
      
      const fileBytes = await file.arrayBuffer();
      const buffer = Buffer.from(fileBytes);
      
      // Generate unique filename with original extension
      const fileExtension = file.name.split('.').pop() || '';
      const uniqueFilename = `${crypto.randomUUID()}.${fileExtension}`;
      
      // Upload to S3
      const fileUrl = await uploadToS3(buffer, uniqueFilename, file.type);
      
      // Store file reference in database
      const fileRecord = await prisma.userFile.create({
        data: {
          userId: user.id,
          filename: file.name,
          fileSize: file.size,
          fileType: file.type,
          fileUrl: fileUrl,
          metadata: {
            uploadedAt: new Date().toISOString(),
            dimensions: null, // Could be populated with image dimensions if needed
            originalName: file.name
          },
          tags: tags,
          category: category
        },
      });
      
      uploadResults.push({
        originalName: file.name,
        storedName: uniqueFilename,
        fileUrl: fileUrl,
        fileId: fileRecord.id,
        fileSize: file.size,
        fileType: file.type
      });
    }

    return NextResponse.json({
      success: true,
      uploadResults
    });
    
  } catch (error: any) {
    console.error('Error uploading files:', error);
    return new NextResponse(JSON.stringify({ 
      error: "Failed to upload files", 
      details: error.message 
    }), { status: 500 });
  }
}

// Endpoint to get user's image files with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    // Validate user authentication
    const { user } = await validateRequest();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get URL parameters
    const url = new URL(request.url);
    const category = url.searchParams.get('category');
    const tags = url.searchParams.get('tags')?.split(',') || [];
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const search = url.searchParams.get('search') || '';
    
    // Build filters
    const where: any = { 
      userId: user.id,
      fileType: { startsWith: 'image/' } // Only return image files
    };
    
    if (category) {
      where.category = category;
    }
    
    if (tags.length > 0) {
      where.tags = {
        hasSome: tags
      };
    }
    
    if (search) {
      where.OR = [
        { filename: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Get total count
    const totalCount = await prisma.userFile.count({ where });
    
    // Get files with pagination
    const files = await prisma.userFile.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        filename: true,
        fileSize: true,
        fileType: true,
        fileUrl: true,
        category: true,
        tags: true,
        metadata: true,
        createdAt: true,
      }
    });
    
    // Get distinct categories
    const categories = await prisma.userFile.groupBy({
      by: ['category'],
      where: { 
        userId: user.id,
        fileType: { startsWith: 'image/' }
      }
    });
    
    // Get all tags
    const allTags = await prisma.userFile.findMany({
      where: { 
        userId: user.id,
        fileType: { startsWith: 'image/' }
      },
      select: { tags: true }
    });
    
    // Create a unique list of all tags
    const uniqueTags = Array.from(new Set(allTags.flatMap(file => file.tags)));

    return NextResponse.json({
      files,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      categories: categories.map(c => c.category),
      tags: uniqueTags
    });
    
  } catch (error: any) {
    console.error('Error fetching files:', error);
    return new NextResponse(JSON.stringify({ error: "Failed to fetch files" }), { status: 500 });
  }
}