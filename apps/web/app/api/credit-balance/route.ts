import prismadb from "@/lib/prismadb";
import { NextRequest, NextResponse } from "next/server";

interface CreditBalanceResponse {
  success: boolean;
  balance?: number;
  message?: string;
}

export async function GET(req: NextRequest) {
  try {
    // Get license key and user ID from URL query parameter
    const url = new URL(req.url);
    const licenseKey = url.searchParams.get("licenseKey");
    const userId = url.searchParams.get("userId");

    if (!licenseKey && !userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Either license key or user ID is required",
        },
        { status: 400 },
      );
    }

    let userCredit: number | null = null;

    // If userId is provided, directly get the credit balance
    if (userId) {
      const directCredit = await prismadb.userCredit.findUnique({
        where: { userId },
        select: { balance: true },
      });
      userCredit = directCredit?.balance ?? null;
    } else if (licenseKey) {
      // Otherwise use license key to get the credit
      userCredit = await getUserCreditByLicenseKey(licenseKey, "");
    }

    if (userCredit === null) {
      return NextResponse.json(
        {
          success: false,
          message: "No credit information available",
        },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        balance: userCredit,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error retrieving credit balance:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 },
    );
  }
}

async function getUserCreditByLicenseKey(
  licenseKey: string,
  db_user_id: string,
): Promise<number | null> {
  let userId: string | null = null;

  // First check if this is a sublicense
  const sublicense = await prismadb.subLicense.findUnique({
    where: { key: licenseKey },
    select: { assignedUserId: true },
  });

  if (sublicense && sublicense.assignedUserId) {
    userId = sublicense.assignedUserId;
  } else {
    // If not a sublicense, check regular license keys
    const license = await prismadb.licenseKey.findUnique({
      where: { key: licenseKey },
      select: {
        users: {
          select: {
            userId: true,
            user: {
              select: {
                email: true,
              },
            },
          },
        },
      },
    });

    if (license && license.users.length > 0) {
      // Instead of taking the first user, find the one with an email
      const userWithEmail = license.users.find(
        (u) => u.user.email !== null && u.user.email !== undefined,
      );

      // If a user with email is found, use that; otherwise fall back to the first user
      userId = userWithEmail
        ? userWithEmail.userId
        : license.users[0]?.userId || null;
    }
  }

  // If no user found, return null
  if (!userId) {
    return null;
  }

  // Get user credit balance
  const userCredit = await prismadb.userCredit.findUnique({
    where: { userId },
    select: { balance: true },
  });

  return userCredit ? userCredit.balance : null;
}

// Also support POST method for applications that prefer to send in request body
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { licenseKey, db_user_id } = body;

    if (!licenseKey && !db_user_id) {
      return NextResponse.json(
        {
          success: false,
          message: "Either license key or user ID is required",
        },
        { status: 400 },
      );
    }

    let userCredit: number | null = null;

    // If userId is provided, directly get the credit balance
    if (db_user_id) {
      const directCredit = await prismadb.userCredit.findUnique({
        where: { userId: db_user_id },
        select: { balance: true },
      });
      userCredit = directCredit?.balance ?? null;
    } else if (licenseKey) {
      // Otherwise use license key to get the credit
      userCredit = await getUserCreditByLicenseKey(licenseKey, db_user_id);
    }

    if (userCredit === null) {
      return NextResponse.json(
        {
          success: false,
          message: "No credit information available",
        },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        balance: userCredit,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error retrieving credit balance:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 },
    );
  }
}
