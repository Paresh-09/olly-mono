// lib/actions/subLicenseActions.ts
"use server";
import prismadb from "@/lib/prismadb";
import { validateRequest } from "@/lib/auth";
import { ActionResult } from "@/lib/form";
import { generateLicenseKey } from "@/lib/utils";
import { sendSubLicenseActivationEmail } from "@/lib/emails/sub-license";
import { inviteUserToOrganization } from "./org-actions";
import { revalidatePath } from "next/cache";

export async function getUserLicenses(userId: string): Promise<ActionResult> {
  const { user } = await validateRequest();
  if (!user || user.id !== userId) {
    return { error: "Unauthorized" };
  }

  try {
    // Fetch main licenses owned by the user
    const mainLicenses = await prismadb.licenseKey.findMany({
      where: {
        users: {
          some: {
            userId: userId,
          },
        },
      },
      select: {
        id: true,
        key: true,
        isActive: true,
        tier: true,
      },
    });

    // Fetch sublicenses assigned to the user
    const sublicenses = await prismadb.subLicense.findMany({
      where: {
        OR: [
          { assignedUserId: userId },
          { assignedEmail: user.email }
        ],
        status: 'ACTIVE',
      },
      select: {
        id: true,
        key: true,
        mainLicenseKey: {
          select: {
            id: true,
            tier: true,
            isActive: true,
          }
        }
      },
    });

    // Transform sublicenses to match the same format as main licenses
    const formattedSubLicenses = sublicenses.map(sub => ({
      id: sub.id,
      key: sub.key,
      isActive: sub.mainLicenseKey.isActive,
      tier: sub.mainLicenseKey.tier,
      isSublicense: true,
      mainLicenseKeyId: sub.mainLicenseKey.id,
    }));

    // Combine main licenses and sublicenses
    const allLicenses = [
      ...mainLicenses.map(license => ({ ...license, isSublicense: false })),
      ...formattedSubLicenses
    ];

    return { success: JSON.stringify(allLicenses) };
  } catch (error) {
    console.error("Error fetching user licenses:", error);
    return { error: "Failed to fetch licenses" };
  }
}

export async function getSubLicenses(licenseId: string): Promise<ActionResult> {
  const { user } = await validateRequest();
  if (!user) {
    return { error: "Unauthorized" };
  }

  try {
    const license = await prismadb.licenseKey.findUnique({
      where: { id: licenseId },
      include: { users: true },
    });

    if (!license || !license.users.some((lu) => lu.userId === user.id)) {
      return { error: "Unauthorized to view these sub-licenses" };
    }

    const subLicenses = await prismadb.subLicense.findMany({
      where: { mainLicenseKeyId: licenseId },
    });

    return { success: JSON.stringify(subLicenses) };
  } catch (error) {
    console.error("Error fetching sub-licenses:", error);
    return { error: "Failed to fetch sub-licenses" };
  }
}

export async function assignSubLicense(
  prevState: any,
  formData: FormData,
): Promise<ActionResult> {
  const { user } = await validateRequest();
  if (!user) {
    return { error: "Unauthorized" };
  }

  const subLicenseId = formData.get("subLicenseId") as string;
  const recipientEmail = formData.get("email") as string;

  try {
    // Find the latest organization where the user is an OWNER
    const latestOwnedOrg = await prismadb.organizationUser.findFirst({
      where: {
        userId: user.id,
        role: "OWNER",
      },
      orderBy: {
        organization: {
          createdAt: "desc",
        },
      },
      include: {
        organization: true,
      },
    });

    if (!latestOwnedOrg) {
      return { error: "You don't have permission to assign sub-licenses" };
    }

    const subLicense = await prismadb.subLicense.findUnique({
      where: { id: subLicenseId },
      include: {
        mainLicenseKey: {
          include: {
            users: true,
            organization: true,
          },
        },
      },
    });

    if (!subLicense) {
      return { error: "Unauthorized to assign this sub-license" };
    }

    // Check if the email is already assigned to another sub-license
    const existingAssignment = await prismadb.subLicense.findFirst({
      where: {
        mainLicenseKeyId: subLicense.mainLicenseKeyId,
        assignedEmail: recipientEmail,
      },
    });

    if (existingAssignment) {
      return { error: "This email is already assigned to another sub-license" };
    }

    // Check if a user with this email exists
    const existingUser = await prismadb.user.findUnique({
      where: { email: recipientEmail },
    });

    if (existingUser) {
      // Check if the user is already in the organization
      const existingOrgUser = await prismadb.organizationUser.findFirst({
        where: {
          userId: existingUser.id,
          organizationId: latestOwnedOrg.organizationId,
        },
      });

      if (!existingOrgUser) {
        // If the user exists but is not in the organization, send an invite
        const inviteFormData = new FormData();
        inviteFormData.append("organizationId", latestOwnedOrg.organizationId);
        inviteFormData.append("email", recipientEmail);
        inviteFormData.append("role", "MEMBER");

        const inviteResult = await inviteUserToOrganization(
          null,
          inviteFormData,
        );

        if (inviteResult.error) {
          return { error: inviteResult.error };
        }
      }

      // Assign the sub-license to the existing user
      const updatedSubLicense = await prismadb.subLicense.update({
        where: { id: subLicenseId },
        data: {
          assignedEmail: recipientEmail,
          assignedUserId: existingUser.id,
        },
      });

      // Send activation email
      await sendSubLicenseActivationEmail(
        recipientEmail,
        updatedSubLicense.key,
        user.username,
        user.email,
        latestOwnedOrg.organization.name,
      );

      return {
        success: existingOrgUser
          ? "Sub-license assigned successfully to existing user"
          : "Sub-license assigned and invitation sent to existing user",
      };
    } else {
      // Create an invitation for the new user
      const inviteFormData = new FormData();
      inviteFormData.append("organizationId", latestOwnedOrg.organizationId);
      inviteFormData.append("email", recipientEmail);
      inviteFormData.append("role", "MEMBER");

      const inviteResult = await inviteUserToOrganization(null, inviteFormData);

      if (inviteResult.error) {
        return { error: inviteResult.error };
      }

      // Update the sub-license with the assigned email
      await prismadb.subLicense.update({
        where: { id: subLicenseId },
        data: { assignedEmail: recipientEmail },
      });

      return {
        success: "Invitation sent to new user and sub-license reserved",
      };
    }
  } catch (error) {
    console.error("Error assigning sub-license:", error);
    return { error: "Failed to assign sub-license" };
  }
}

export async function removeSubLicenseAssignment(
  prevState: any,
  formData: FormData,
): Promise<ActionResult> {
  const { user } = await validateRequest();
  if (!user) {
    return { error: "Unauthorized" };
  }

  const subLicenseId = formData.get("subLicenseId") as string;

  if (!subLicenseId) {
    return { error: "Sub-license ID is required" };
  }

  try {
    const subLicense = await prismadb.subLicense.findUnique({
      where: { id: subLicenseId },
      include: { mainLicenseKey: { include: { users: true } } },
    });

    if (
      !subLicense ||
      !subLicense.mainLicenseKey.users.some((lu) => lu.userId === user.id)
    ) {
      return { error: "Unauthorized to remove this sub-license assignment" };
    }

    await prismadb.subLicense.update({
      where: { id: subLicenseId },
      data: {
        assignedEmail: null,
        assignedUserId: null,
      },
    });

    return { success: "Sub-license assignment removed successfully" };
  } catch (error) {
    console.error("Error removing sub-license assignment:", error);
    return { error: "Failed to remove sub-license assignment" };
  }
}

export async function regenerateSubLicense(
  prevState: any,
  formData: FormData,
): Promise<ActionResult> {
  const { user } = await validateRequest();
  if (!user) {
    return { error: "Unauthorized" };
  }

  const subLicenseId = formData.get("subLicenseId") as string;

  if (!subLicenseId) {
    return { error: "Sub-license ID is required" };
  }

  try {
    const subLicense = await prismadb.subLicense.findUnique({
      where: { id: subLicenseId },
      include: {
        mainLicenseKey: {
          include: {
            users: true,
            organization: true,
          },
        },
      },
    });

    if (
      !subLicense ||
      !subLicense.mainLicenseKey.users.some((lu) => lu.userId === user.id)
    ) {
      return { error: "Unauthorized to regenerate this sub-license" };
    }

    const newKey = generateLicenseKey();

    const updatedSubLicense = await prismadb.subLicense.update({
      where: { id: subLicenseId },
      data: {
        key: newKey,
        activationCount: 0,
      },
    });

    if (updatedSubLicense.assignedEmail) {
      const organizationName =
        subLicense.mainLicenseKey.organization?.name || "Your Team";
      try {
        await sendSubLicenseActivationEmail(
          updatedSubLicense.assignedEmail,
          newKey,
          user.username,
          user.email,
          organizationName,
        );
      } catch (emailError) {
        console.error("Failed to send activation email:", emailError);
        return {
          success:
            "Sub-license regenerated successfully, but failed to send activation email",
        };
      }
    }

    return { success: "Sub-license regenerated successfully" };
  } catch (error) {
    console.error("Error regenerating sub-license:", error);
    return { error: "Failed to regenerate sub-license" };
  }
}

export async function addSubLicenseGoal(
  prevState: any,
  formData: FormData,
): Promise<ActionResult> {
  const { user } = await validateRequest();
  if (!user) {
    return { error: "Unauthorized" };
  }

  const subLicenseId = formData.get("subLicenseId") as string;
  const platform = formData.get("platform") as string;
  const goal = formData.get("goal") as string;
  const daysToAchieve = formData.get("daysToAchieve") as string;
  const target = formData.get("target") as string;

  if (!subLicenseId || !platform || !goal || !daysToAchieve) {
    return {
      error: "Sub-license ID, platform, goal, and days to achieve are required",
    };
  }

  try {
    // Check if this sub-license already has an active goal for this platform (regardless of user)
    const existingGoal = await prismadb.subLicenseGoal.findFirst({
      where: {
        subLicenseId,
        platform: platform,
        status: {
          not: "achieved"
        }
      },
    });

    if (existingGoal) {
      return {
        error: "This sub-license already has an active goal for this platform. Complete the current goal before creating a new one.",
      };
    }

    const subLicense = await prismadb.subLicense.findUnique({
      where: { id: subLicenseId },
      include: { mainLicenseKey: { include: { users: true } } },
    });

    if (!subLicense) {
      return { error: "No license key found" };
    }

    // Check if user is either:
    // 1. Owner of the main license (team owner), OR
    // 2. Assigned to this specific sublicense (team member)
    const isMainLicenseOwner = subLicense.mainLicenseKey.users.some((lu) => lu.userId === user.id);
    const isSubLicenseAssigned = subLicense.assignedUserId === user.id || subLicense.assignedEmail === user.email;

    if (!isMainLicenseOwner && !isSubLicenseAssigned) {
      return { error: "Unauthorized to add a goal for this sub-license" };
    }

    const newGoal = await prismadb.subLicenseGoal.create({
      data: {
        subLicenseId,
        userId: user.id,
        platform,
        goal,
        daysToAchieve: parseInt(daysToAchieve),
        target: target ? parseInt(target) : null,
        progress: 0, // Default progress to 0
        status: "in_progress", // Default status to "in_progress"
      },
    });

    return { success: "Goal added successfully", goal: newGoal };
  } catch (error) {
    console.error("Error adding sub-license goal:", error);
    return { error: "Failed to add sub-license goal" };
  }
}

export async function getSubLicenseGoals(
  subLicenseId: string | null,
): Promise<ActionResult> {
  const { user } = await validateRequest();
  if (!user) {
    return { error: "Unauthorized" };
  }

  if (!subLicenseId) {
    return { error: "Sub-license ID is required" };
  }

  try {
    // First check if user has permission to view goals for this sublicense
    const subLicense = await prismadb.subLicense.findUnique({
      where: { id: subLicenseId },
      include: {
        mainLicenseKey: {
          include: {
            users: true,
          },
        },
      },
    });

    if (!subLicense) {
      return { error: "Sub-license not found" };
    }

    // Check if user is either:
    // 1. Owner of the main license (can see all goals for this sublicense), OR
    // 2. Assigned to this specific sublicense (can see their own goals)
    const isMainLicenseOwner = subLicense.mainLicenseKey.users.some((lu) => lu.userId === user.id);
    const isSubLicenseAssigned = subLicense.assignedUserId === user.id || subLicense.assignedEmail === user.email;

    if (!isMainLicenseOwner && !isSubLicenseAssigned) {
      return { error: "Unauthorized to view goals for this sub-license" };
    }

    // If user is the main license owner, show only goals created by them for this sublicense
    // If user is the sublicense assignee, show only their own goals
    const whereClause = isMainLicenseOwner 
      ? { subLicenseId, userId: user.id }  // Show only goals created by the license owner
      : { subLicenseId, userId: user.id };  // Show only user's own goals

    const goals = await prismadb.subLicenseGoal.findMany({
      where: whereClause,
    });

    return { success: JSON.stringify(goals) };
  } catch (error) {
    console.error("Error fetching sub-license goals:", error);
    return { error: "Failed to fetch sub-license goals" };
  }
}

export async function deleteSubLicenseGoal(goalId: string): Promise<ActionResult> {
  const { user } = await validateRequest();
  if (!user) {
    return { error: "Unauthorized" };
  }

  try {
    // Find the goal with sublicense and main license info
    const goal = await prismadb.subLicenseGoal.findFirst({
      where: {
        id: goalId,
      },
      include: {
        subLicense: {
          include: {
            mainLicenseKey: {
              include: {
                users: true,
              },
            },
          },
        },
      },
    });

    if (!goal) {
      return { error: "Goal not found" };
    }

    // Check if user is either:
    // 1. The goal creator (team member), OR
    // 2. Owner of the main license (team owner)
    const isGoalCreator = goal.userId === user.id;
    const isMainLicenseOwner = goal.subLicense.mainLicenseKey.users.some((lu) => lu.userId === user.id);

    if (!isGoalCreator && !isMainLicenseOwner) {
      return { error: "You don't have permission to delete this goal" };
    }

    // Delete the goal
    await prismadb.subLicenseGoal.delete({
      where: {
        id: goalId,
      },
    });

    return { success: "Goal deleted successfully" };
  } catch (error) {
    console.error("Error deleting sub-license goal:", error);
    return { error: "Failed to delete sub-license goal" };
  }
}

export async function updateSubLicenseGoal(
  goalId: string,
  status?: string,
  progress?: number,
  goal?: string,
  platform?: string,
  daysToAchieve?: number,
  target?: number | null
): Promise<ActionResult> {
  const { user } = await validateRequest();
  if (!user) {
    return { error: "Unauthorized" };
  }

  try {
    // Verify the goal belongs to the user
    const goal = await prismadb.subLicenseGoal.findFirst({
      where: {
        id: goalId,
        userId: user.id,
      },
    });

    if (!goal) {
      return { error: "Goal not found or unauthorized" };
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

    const updatedGoal = await prismadb.subLicenseGoal.update({
      where: { id: goalId },
      data: updateData,
    });

    return { success: "Goal updated successfully", goal: updatedGoal };
  } catch (error) {
    console.error("Error updating sub-license goal:", error);
    return { error: "Failed to update sub-license goal" };
  }
}