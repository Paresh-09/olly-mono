// app/api/admin/gift-credits/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@repo/db";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    // Check admin permissions
    const isAdmin = await checkAdminPermissions(request);
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 403 },
      );
    }

    const { email, credits, reason } = await request.json();

    // Validate input
    if (!email || !credits || credits <= 0) {
      return NextResponse.json(
        { error: "Email and valid credit amount are required" },
        { status: 400 },
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 },
      );
    }

    // Validate credits (max 10000 to prevent abuse)
    if (credits > 10000) {
      return NextResponse.json(
        { error: "Maximum 10,000 credits can be gifted at once" },
        { status: 400 },
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        credit: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Create or update user credits
    let userCredit;
    if (user.credit) {
      // Update existing credits
      userCredit = await prisma.userCredit.update({
        where: { userId: user.id },
        data: {
          balance: user.credit.balance + credits,
        },
      });
    } else {
      // Create new credit record
      userCredit = await prisma.userCredit.create({
        data: {
          userId: user.id,
          balance: credits,
        },
      });
    }

    // Create credit transaction record
    await prisma.creditTransaction.create({
      data: {
        userCreditId: userCredit.id,
        amount: credits,
        type: "GIFTED",
        description: reason || `Admin gifted ${credits} credits`,
      },
    });

    // Optional: Create notification for user
    try {
      await prisma.notification.create({
        data: {
          userId: user.id,
          title: "Credits Received!",
          message: `You have received ${credits} credits${reason ? `: ${reason}` : ""}`,
          type: "CREDIT_UPDATE",
        },
      });
    } catch (notificationError) {
      // Don't fail the whole operation if notification fails
      console.error("Failed to create notification:", notificationError);
    }

    return NextResponse.json({
      success: true,
      message: `Successfully gifted ${credits} credits to ${email}`,
      newBalance: userCredit.balance,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error("Error gifting credits:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  } finally {
    await prisma.$disconnect();
  }
}

// Admin permission check function (same as user-usage API)
async function checkAdminPermissions(request: NextRequest) {
  try {
    // Option 1: Check via Authorization header (JWT)
    const authHeader = request.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      // Implement your JWT verification logic here
      // const decoded = jwt.verify(token, process.env.JWT_SECRET);
      // return decoded.isAdmin || decoded.isSuperAdmin;
    }

    // Option 2: Check via session cookie
    const sessionCookie = request.cookies.get("session")?.value;
    if (sessionCookie) {
      // Implement your session verification logic here
      // const session = await verifySession(sessionCookie);
      // return session.user.isAdmin || session.user.isSuperAdmin;
    }

    // Option 3: Check via custom header (for internal APIs)
    const adminKey = request.headers.get("x-admin-key");
    if (adminKey && adminKey === process.env.ADMIN_API_KEY) {
      return true;
    }

    // For development/testing - remove in production
    if (process.env.NODE_ENV === "development") {
      return true;
    }

    return false;
  } catch (error) {
    console.error("Error checking admin permissions:", error);
    return false;
  }
}
