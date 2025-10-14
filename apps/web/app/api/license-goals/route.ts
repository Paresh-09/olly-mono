import { NextResponse } from "next/server";
import { validateRequest } from "@/lib/auth";
import prismadb from "@/lib/prismadb";

export async function GET(request: Request) {
  try {
    const { user } = await validateRequest();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const licenseId = searchParams.get("licenseId");

    if (!licenseId) {
      return NextResponse.json(
        { error: "License ID is required" },
        { status: 400 },
      );
    }

    // First, determine if the licenseId is a main license key ID or a sublicense ID
    const isSubLicense = await prismadb.subLicense.findUnique({
      where: { id: licenseId },
      select: {
        id: true,
        mainLicenseKeyId: true,
      },
    });

    let mainLicenseKeyId: string;
    let licenseGoals: any[] = [];
    let subLicenseGoals: any[] = [];

    if (isSubLicense) {
      // If it's a sublicense ID, get the main license key ID and fetch sublicense goals
      mainLicenseKeyId = isSubLicense.mainLicenseKeyId;
      
      // First, verify the user has access to this sublicense
      const userHasAccessToSubLicense = await prismadb.subLicense.findFirst({
        where: {
          id: licenseId,
          OR: [
            { assignedUserId: user.id },
            { assignedEmail: user.email }
          ],
          status: 'ACTIVE',
        },
      });

      if (!userHasAccessToSubLicense) {
        return NextResponse.json(
          { error: "Unauthorized to view goals for this sublicense" },
          { status: 403 },
        );
      }
      
      // Fetch ALL goals for this specific sublicense (not just user's own goals)
      subLicenseGoals = await prismadb.subLicenseGoal.findMany({
        where: {
          subLicenseId: licenseId,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    } else {
      // It's a main license key ID
      mainLicenseKeyId = licenseId;
      
      // Fetch goals from licenseGoal table (for main license users)
      licenseGoals = await prismadb.licenseGoal.findMany({
        where: {
          licenseKeyId: licenseId,
          userId: user.id,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      // Also fetch goals from subLicenseGoal table (for sublicense users of this main license)
      const subLicenses = await prismadb.subLicense.findMany({
        where: {
          mainLicenseKeyId: licenseId,
          OR: [
            { assignedUserId: user.id },
            { assignedEmail: user.email }
          ],
          status: 'ACTIVE',
        },
        select: {
          id: true,
        },
      });

      if (subLicenses.length > 0) {
        const subLicenseIds = subLicenses.map(sl => sl.id);
        const additionalSubLicenseGoals = await prismadb.subLicenseGoal.findMany({
          where: {
            subLicenseId: { in: subLicenseIds },
            userId: user.id,
          },
          orderBy: {
            createdAt: "desc",
          },
        });
        subLicenseGoals = additionalSubLicenseGoals;
      }
    }

    // Combine both types of goals
    const allGoals = [
      ...licenseGoals,
      ...subLicenseGoals,
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ success: JSON.stringify(allGoals) });
  } catch (error) {
    console.error("Error fetching license goals:", error);
    return NextResponse.json(
      { error: "Failed to fetch license goals" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const { user } = await validateRequest();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Change from formData to json parsing
    const body = await request.json();

    // Get values from the JSON body
    const { goal, platform, daysToAchieve, target } = body;

    // Validate inputs
    if (!goal || !platform) {
      return new NextResponse("Missing required fields", {
        status: 400,
      });
    }

    // Check if user already has an active goal for this platform
    const existingGoal = await prismadb.licenseGoal.findFirst({
      where: {
        userId: user.id,
        platform: platform,
        status: {
          not: "achieved"
        }
      },
    });

    if (existingGoal) {
      return new NextResponse("You already have an active goal for this platform. Complete your current goal before creating a new one.", {
        status: 409,
      });
    }

    // Get the user's primary license key
    const userLicense = await prismadb.userLicenseKey.findFirst({
      where: {
        userId: user.id,
      },
      include: {
        licenseKey: true,
      },
    });

    // If no main license found, check for sublicenses
    let licenseKeyId = null;
    let isSubLicense = false;
    let subLicenseId = null;

    if (userLicense) {
      licenseKeyId = userLicense.licenseKeyId;
    } else {
      // Check if user has a sublicense assigned
      const userSubLicense = await prismadb.subLicense.findFirst({
        where: {
          OR: [
            { assignedUserId: user.id },
            { assignedEmail: user.email }
          ],
          status: 'ACTIVE',
        },
        include: {
          mainLicenseKey: true,
        },
      });

      if (userSubLicense) {
        // For sublicense users, we need to create the goal in the subLicenseGoal table
        isSubLicense = true;
        subLicenseId = userSubLicense.id;
        licenseKeyId = userSubLicense.mainLicenseKeyId; // Keep for compatibility, but won't be used
      }
    }

    if (!licenseKeyId && !isSubLicense) {
      return new NextResponse("No license key found", {
        status: 400,
      });
    }

    if (isSubLicense && subLicenseId) {
      // Check if this sub-license already has an active goal for this platform (regardless of user)
      const existingSubLicenseGoal = await prismadb.subLicenseGoal.findFirst({
        where: {
          subLicenseId,
          platform: platform,
          status: {
            not: "achieved"
          }
        },
      });

      if (existingSubLicenseGoal) {
        return new NextResponse("This sub-license already has an active goal for this platform. Complete the current goal before creating a new one.", {
          status: 409,
        });
      }

      // Create the sub-license goal
      const subLicenseGoal = await prismadb.subLicenseGoal.create({
        data: {
          subLicenseId,
          userId: user.id,
          platform,
          goal,
          daysToAchieve: daysToAchieve || null,
          target: target || null,
          progress: 0, // Default progress to 0
          status: "in_progress", // Default status to "in_progress"
        },
      });

      return NextResponse.json(subLicenseGoal);
    } else {
      // Create the license goal for main license users
      if (!licenseKeyId) {
        return new NextResponse("License key ID is required for main license goals", {
          status: 400,
        });
      }
      
      const licenseGoal = await prismadb.licenseGoal.create({
        data: {
          goal,
          platform,
          daysToAchieve: daysToAchieve || null,
          target: target || null,
          progress: 0, // Default progress to 0
          status: "in_progress", // Default status to "in_progress"
          userId: user.id,
          licenseKeyId: licenseKeyId,
        },
      });

      return NextResponse.json(licenseGoal);
    }
  } catch (error) {
    console.error("Error creating license goal:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { user } = await validateRequest();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { goalId, status, progress, goal, platform, daysToAchieve, target } = body;

    if (!goalId) {
      return new NextResponse("Goal ID is required", { status: 400 });
    }

    // Try to find the goal in licenseGoal table first
    const existingLicenseGoal = await prismadb.licenseGoal.findFirst({
      where: {
        id: goalId,
        userId: user.id,
      },
    });

    // If not found in licenseGoal, try subLicenseGoal table
    const existingSubLicenseGoal = !existingLicenseGoal ? await prismadb.subLicenseGoal.findFirst({
      where: {
        id: goalId,
        userId: user.id,
      },
    }) : null;

    if (!existingLicenseGoal && !existingSubLicenseGoal) {
      return NextResponse.json(
        { error: "Goal not found or you don't have permission to update it" },
        { status: 404 },
      );
    }

    // Update the goal
    const updateData: any = {};
    if (status !== undefined) {
      updateData.status = status;
      if (status === "achieved") {
        updateData.achievedAt = new Date();
      }
    }
    if (progress !== undefined) {
      updateData.progress = progress;
    }
    if (goal !== undefined) {
      updateData.goal = goal;
    }
    if (platform !== undefined) {
      updateData.platform = platform;
    }
    if (daysToAchieve !== undefined) {
      updateData.daysToAchieve = daysToAchieve;
    }
    if (target !== undefined) {
      updateData.target = target;
    }

    let updatedGoal;
    if (existingLicenseGoal) {
      updatedGoal = await prismadb.licenseGoal.update({
        where: { id: goalId },
        data: updateData,
      });
    } else if (existingSubLicenseGoal) {
      updatedGoal = await prismadb.subLicenseGoal.update({
        where: { id: goalId },
        data: updateData,
      });
    }

    return NextResponse.json(updatedGoal);
  } catch (error) {
    console.error("Error updating license goal:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { user } = await validateRequest();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const goalId = searchParams.get("goalId");

    if (!goalId) {
      return NextResponse.json(
        { error: "Goal ID is required" },
        { status: 400 },
      );
    }

    // Try to find the goal in licenseGoal table first
    const existingLicenseGoal = await prismadb.licenseGoal.findFirst({
      where: {
        id: goalId,
        userId: user.id,
      },
    });

    // If not found in licenseGoal, try subLicenseGoal table
    const existingSubLicenseGoal = !existingLicenseGoal ? await prismadb.subLicenseGoal.findFirst({
      where: {
        id: goalId,
        userId: user.id,
      },
    }) : null;

    if (!existingLicenseGoal && !existingSubLicenseGoal) {
      return NextResponse.json(
        { error: "Goal not found or you don't have permission to delete it" },
        { status: 404 },
      );
    }

    // Delete the goal from the appropriate table
    if (existingLicenseGoal) {
      await prismadb.licenseGoal.delete({
        where: {
          id: goalId,
        },
      });
    } else if (existingSubLicenseGoal) {
      await prismadb.subLicenseGoal.delete({
        where: {
          id: goalId,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Goal deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting license goal:", error);
    return NextResponse.json(
      { error: "Failed to delete license goal" },
      { status: 500 },
    );
  }
}