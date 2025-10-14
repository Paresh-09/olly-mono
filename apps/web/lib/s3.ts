import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || "";

/**
 * Uploads a file to S3
 * @param file File buffer
 * @param key S3 object key
 * @param contentType MIME type of the file
 */
export async function uploadToS3(
  file: Buffer,
  key: string,
  contentType: string
): Promise<void> {
  const params = {
    Bucket: BUCKET_NAME,
    Key: key,
    Body: file,
    ContentType: contentType,
  };

  const command = new PutObjectCommand(params);
  await s3Client.send(command);
}

/**
 * Deletes a file from S3
 * @param key S3 object key
 */
export async function deleteFromS3(key: string): Promise<void> {
  const params = {
    Bucket: BUCKET_NAME,
    Key: key,
  };

  const command = new DeleteObjectCommand(params);
  await s3Client.send(command);
}

/**
 * Generates a presigned URL for a file in S3
 * @param key S3 object key
 * @param expiresIn Expiration time in seconds (default: 3600)
 */
export async function getPresignedUrl(
  key: string,
  expiresIn: number = 3600
): Promise<string> {
  const params = {
    Bucket: BUCKET_NAME,
    Key: key,
  };

  const command = new GetObjectCommand(params);
  return getSignedUrl(s3Client, command, { expiresIn });
}

/**
 * Generates a unique key for S3 object
 * @param userId User ID
 * @param fileName Original file name
 * @param category File category
 */
export function generateS3Key(
  userId: string,
  fileName: string,
  category: string
): string {
  const timestamp = Date.now();
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
  return `knowledge-base/${userId}/${category}/${timestamp}-${sanitizedFileName}`;
} 