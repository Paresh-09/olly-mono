import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";

async function updateDatabase(userId: string | null, licenseKey: string | null, level: number, totalComments: number, username: string | null) {
  try {
    let user = null;

    if (licenseKey) {
      const userLicenseKey = await prismadb.userLicenseKey.findFirst({
        where: {
          licenseKey: {
            key: licenseKey
          }
        },
        include: {
          user: {
            include: { leaderboard: true }
          }
        }
      });

      if (userLicenseKey) {
        user = userLicenseKey.user;
      }
    }

    if (!user && userId) {
      user = await prismadb.user.findUnique({
        where: { id: userId },
        include: { leaderboard: true },
      });
    }

    if (!user) {
      console.error(`User not found with licenseKey ${licenseKey} or userId ${userId}`);
      return;
    }

    // Update username if provided
    if (username) {
      await prismadb.user.update({
        where: { id: user.id },
        data: { username },
      });
    }

    // Update or create leaderboard entry
    await prismadb.leaderboard.upsert({
      where: { userId: user.id },
      update: { level, totalComments },
      create: { userId: user.id, level, totalComments },
    });

    console.log("Database updated successfully");
  } catch (error) {
    console.error("Error updating database:", error);
    // Don't throw, just log the error
  }
}

export async function POST(req: Request) {
  try {
    const { userId, licenseKey, level, totalComments, username } = await req.json();

    if ((!userId && !licenseKey) || !level || totalComments === undefined) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Update Google Sheets
    // await updateGoogleSheets(userId, licenseKey, level, totalComments, username);

    // Update Database
    await updateDatabase(userId, licenseKey, level, totalComments, username);

    return NextResponse.json({ message: "User data updated successfully" });

  } catch (error) {
    console.error("Error in POST request:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}