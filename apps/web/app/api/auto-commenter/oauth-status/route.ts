// app/api/auto-commenter/oauth-status/route.ts
import { validateRequest } from "@/lib/auth";
import prismadb from "@/lib/prismadb";
import { CommentPlatform } from "@repo/db";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const session = await validateRequest();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get platform from query parameter
    const searchParams = request.nextUrl.searchParams;
    const platform = searchParams.get("platform") as CommentPlatform;

    if (!platform || !Object.values(CommentPlatform).includes(platform)) {
      return Response.json({ error: "Invalid platform" }, { status: 400 });
    }

    const oauthToken = await prismadb.oAuthToken.findFirst({
      where: {
        userId: session.user.id,
        platform: platform,
        isValid: true,
      },
    });

    if (!oauthToken) {
      return Response.json({ hasToken: false });
    }

    // Check if token is expired
    const isExpired = new Date(oauthToken.expiresAt) < new Date();
    if (isExpired) {
      await prismadb.oAuthToken.update({
        where: { id: oauthToken.id },
        data: { isValid: false },
      });
    }

    return Response.json({
      hasToken: true,
      isExpired,
    });
  } catch (error) {
    console.error("OAuth status check error:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
