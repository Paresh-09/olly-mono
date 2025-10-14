import prismadb from "@/lib/prismadb";
import { NextResponse } from "next/server";
import { Hashtag } from "@repo/db";
import { Prisma } from "@repo/db";

type UrlInput = {
  url: string;
  hashtag: Hashtag;
};

type RequestBody = {
  urls: UrlInput[];
};

export async function POST(request: Request) {
  try {
    const { urls } = (await request.json()) as RequestBody;

    if (!Array.isArray(urls)) {
      return NextResponse.json({ error: "Invalid input format" }, { status: 400 });
    }

    // Validate URLs and hashtags
    for (const url of urls) {
      if (!url.hashtag || !Object.values(Hashtag).includes(url.hashtag)) {
        return NextResponse.json({ error: `Invalid hashtag for URL: ${url.url}` }, { status: 400 });
      }
    }

    // Extract post IDs
    const processedUrls = urls.map((input: UrlInput) => {
      try {
        const parsedUrl = new URL(input.url.trim());
        let postId = "";

        const pathSegments = parsedUrl.pathname.split("/").filter(Boolean);

        if (pathSegments[0] === "posts") {
          postId = pathSegments[1];
        } else if (pathSegments[0] === "feed" && pathSegments[1] === "update" && pathSegments[2]?.startsWith("urn:li")) {
          postId = pathSegments[2].split(":").pop() || "";
        }

        if (!postId) throw new Error(`Could not extract post ID from URL: ${input.url}`);

        return { url: input.url, postId, hashtag: input.hashtag };
      } catch {
        throw new Error(`Invalid URL format: ${input.url}`);
      }
    });

    // Check for existing URLs
    const existingUrls = await prismadb.userPostUrls.findMany({
      where: {
        url: { in: processedUrls.map(u => u.url) },
      },
      select: { url: true },
    });

    const existingUrlSet = new Set(existingUrls.map(u => u.url));

    // Filter out already existing URLs
    const newUrls = processedUrls.filter(url => !existingUrlSet.has(url.url));

    if (newUrls.length === 0) {
      return NextResponse.json({
        message: "All URLs already exist",
        skippedUrls: processedUrls.length,
        addedUrls: 0,
      });
    }

    // Transaction to create UserPostUrls and ensure PostCache entries exist
    const createdPosts = await prismadb.$transaction(async (prisma) => {
      const urlPosts = await Promise.all(
        processedUrls.map(async ({ url, postId, hashtag }) => {
          // Create UserPostUrls entry if it doesn't exist
          const userPostUrl = await prisma.userPostUrls.upsert({
            where: { url },
            update: {}, // No updates, just ensuring it exists
            create: { url, postId, hashtag },
          });

          // Ensure a corresponding PostCache entry exists with PENDING status
          await prisma.postCache.upsert({
            where: { url },
            update: { status: "PENDING" }, // Always reset status to PENDING
            create: { url, snapshotData: {}, status: "PENDING" },
          });

          return userPostUrl;
        })
      );

      return urlPosts;
    });

    return NextResponse.json({
      message: "Posts added successfully",
      addedUrls: createdPosts.length,
      skippedUrls: processedUrls.length - createdPosts.length,
      posts: createdPosts,
    });

  } catch (error) {
    console.error("Error processing LinkedIn posts:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json(
        { message: "Database error occurred", error: `Database error: ${error.code}`, details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Error processing LinkedIn posts", error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}