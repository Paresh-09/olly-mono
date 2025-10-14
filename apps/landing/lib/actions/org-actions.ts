// app/lib/actions/org-actions.ts
"use server";

import { validateRequest } from "@/lib/auth";
import prismadb from "@/lib/prismadb";
import { redirect } from "next/navigation";
import { ActionResult } from "@/lib/form";
import { formatOrganizationName, generateLicenseKey } from "../utils";
import { sendOrganizationInviteEmail } from "../emails/org";
import { randomBytes } from "crypto";
import { validateAuthToken } from "../auth-helpers";
import { revalidatePath } from "next/cache";

export async function createOrganization(
  prevState: any,
  formData: FormData,
): Promise<ActionResult> {
  const { user } = await validateRequest();
  if (!user) {
    return { error: "Unauthorized" };
  }

  const name = formData.get("name") as string;

  if (!name || name.length < 3) {
    return { error: "Invalid organization name" };
  }

  try {
    const organization = await prismadb.organization.create({
      data: {
        name,
        users: {
          create: {
            userId: user.id,
            role: "OWNER",
          },
        },
      },
    });

    return { success: JSON.stringify(organization) };
  } catch (error) {
    console.error("Error creating organization:", error);
    return { error: "Failed to create organization" };
  }
}

export async function listOrganizations(): Promise<ActionResult> {
  const { user } = await validateRequest();
  if (!user) {
    return { error: "Unauthorized" };
  }

  try {
    const organizations = await prismadb.organizationUser.findMany({
      where: { userId: user.id },
      include: { organization: true },
    });

    return { success: organizations };
  } catch (error) {
    console.error("Error listing organizations:", error);
    return { error: "Failed to list organizations" };
  }
}

export async function updateOrganization(
  prevState: any,
  formData: FormData,
): Promise<ActionResult> {
  const { user } = await validateRequest();
  if (!user) {
    return { error: "Unauthorized" };
  }

  const organizationId = formData.get("organizationId") as string;
  const name = formData.get("name") as string;

  if (!organizationId || !name || name.length < 3) {
    return { error: "Invalid input" };
  }

  const formattedName = formatOrganizationName(name);

  try {
    const userRole = await prismadb.organizationUser.findUnique({
      where: {
        userId_organizationId: {
          userId: user.id,
          organizationId,
        },
      },
    });

    if (!userRole || (userRole.role !== "OWNER" && userRole.role !== "ADMIN")) {
      return { error: "Unauthorized to update organization" };
    }

    // Check if the new name already exists
    const existingOrg = await prismadb.organization.findFirst({
      where: {
        name: formattedName,
        id: { not: organizationId }, // Exclude the current organization
      },
    });

    if (existingOrg) {
      return { error: "An organization with this name already exists" };
    }

    const updatedOrganization = await prismadb.organization.update({
      where: { id: organizationId },
      data: { name: formattedName },
    });

    return { success: JSON.stringify(updatedOrganization) };
  } catch (error) {
    console.error("Error updating organization:", error);
    return { error: "Failed to update organization" };
  }
}

export async function inviteUserToOrganization(
  prevState: any,
  formData: FormData,
): Promise<ActionResult> {
  const { user } = await validateRequest();
  if (!user) {
    return { error: "Unauthorized" };
  }

  const organizationId = formData.get("organizationId") as string;
  const email = formData.get("email") as string;
  const role = formData.get("role") as "ADMIN" | "MEMBER";

  if (!organizationId || !email || !role) {
    return { error: "Invalid input" };
  }

  try {
    const userRole = await prismadb.organizationUser.findUnique({
      where: {
        userId_organizationId: {
          userId: user.id,
          organizationId,
        },
      },
    });

    if (!userRole || userRole.role !== "OWNER") {
      return { error: "Unauthorized to invite users" };
    }

    const token = randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

    const invite = await prismadb.organizationInvite.create({
      data: {
        email,
        organizationId,
        role,
        token,
        expires,
      },
    });

    // Send invitation email
    await sendOrganizationInviteEmail(
      email,
      user.username || "Organization Owner",
      invite.token,
    );

    return { success: "Invitation sent successfully" };
  } catch (error) {
    console.error("Error inviting user to organization:", error);
    return { error: "Failed to send invitation" };
  }
}

export async function acceptOrganizationInvite(
  token: string,
): Promise<ActionResult> {
  const { user } = await validateRequest();
  if (!user) {
    return { error: "Unauthorized" };
  }

  try {
    const invite = await prismadb.organizationInvite.findUnique({
      where: { token },
      include: { organization: true },
    });

    if (!invite || invite.expires < new Date()) {
      return { error: "Invalid or expired invitation" };
    }

    if (invite.email !== user.email) {
      return { error: "This invitation is for a different email address" };
    }

    // Create the organization user
    await prismadb.organizationUser.create({
      data: {
        userId: user.id,
        organizationId: invite.organizationId,
        role: invite.role,
      },
    });

    // Find all sub-licenses assigned to this email
    const assignedSubLicenses = await prismadb.subLicense.findMany({
      where: {
        assignedEmail: user.email,
        assignedUserId: null,
        mainLicenseKey: {
          organizationId: invite.organizationId,
        },
      },
    });

    let assignmentMessage = "";

    if (assignedSubLicenses.length === 0) {
      assignmentMessage = "No sub-licenses were available to assign.";
    } else {
      // Assign all matching sub-licenses to the user
      await prismadb.subLicense.updateMany({
        where: {
          id: { in: assignedSubLicenses.map((sl) => sl.id) },
        },
        data: {
          assignedUserId: user.id,
        },
      });

      assignmentMessage = `Assigned ${assignedSubLicenses.length} sub-license(s) to your account.`;
    }

    // Delete the invite
    await prismadb.organizationInvite.delete({
      where: { id: invite.id },
    });

    return {
      success: `You have joined ${invite.organization.name}. ${assignmentMessage}`,
    };
  } catch (error) {
    console.error("Error accepting organization invite:", error);
    return { error: "Failed to accept invitation" };
  }
}

export async function listOrganizationUsers(
  organizationId: string,
): Promise<ActionResult> {
  const { user } = await validateRequest();
  if (!user) {
    return { error: "Unauthorized" };
  }

  try {
    // Check if user is member of organization
    const userRole = await prismadb.organizationUser.findUnique({
      where: {
        userId_organizationId: {
          userId: user.id,
          organizationId,
        },
      },
    });

    if (!userRole) {
      return { error: "You are not a member of this organization" };
    }

    // Get all users with their credits and sublicenses
    const users = await prismadb.organizationUser.findMany({
      where: {
        organizationId,
      },
      include: {
        user: {
          include: {
            credit: true,
            sublicenses: {
              include: {
                mainLicenseKey: true, // Changed from 'license' to 'mainLicenseKey'
                assignedUser: {
                  // Changed from 'assignedTo' to match model
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
                subLicenseGoals: {
                  // Changed from 'goals' to 'subLicenseGoals'
                  orderBy: {
                    createdAt: "desc",
                  },
                },
                usageAnalytics: true, // Added usage analytics
              },
              orderBy: {
                createdAt: "desc",
              },
            },
          },
        },
      },
    });

    return { success: JSON.stringify(users) };
  } catch (error) {
    console.error("Error listing organization users:", error);
    return { error: "Failed to list organization users" };
  }
}

export async function updateUserRole(
  prevState: any,
  formData: FormData,
): Promise<ActionResult> {
  const { user } = await validateRequest();
  if (!user) {
    return { error: "Unauthorized" };
  }

  const organizationId = formData.get("organizationId") as string;
  const userId = formData.get("userId") as string;
  const newRole = formData.get("role") as "OWNER" | "ADMIN" | "MEMBER";

  if (!organizationId || !userId || !newRole) {
    return { error: "Invalid input" };
  }

  try {
    const currentUserRole = await prismadb.organizationUser.findUnique({
      where: {
        userId_organizationId: {
          userId: user.id,
          organizationId,
        },
      },
    });

    if (!currentUserRole || currentUserRole.role !== "OWNER") {
      return { error: "Unauthorized to update user roles" };
    }

    // Prevent owners from changing their own role
    if (userId === user.id) {
      return { error: "Cannot modify your own role as an owner" };
    }

    const updatedUser = await prismadb.organizationUser.update({
      where: {
        userId_organizationId: {
          userId,
          organizationId,
        },
      },
      data: { role: newRole },
    });

    return { success: JSON.stringify(updatedUser) };
  } catch (error) {
    console.error("Error updating user role:", error);
    return { error: "Failed to update user role" };
  }
}

export async function removeUserFromOrganization(
  prevState: any,
  formData: FormData,
): Promise<ActionResult> {
  const { user } = await validateRequest();
  if (!user) {
    return { error: "Unauthorized" };
  }

  const organizationId = formData.get("organizationId") as string;
  const userId = formData.get("userId") as string;

  if (!organizationId || !userId) {
    return { error: "Invalid input" };
  }

  try {
    const currentUserRole = await prismadb.organizationUser.findUnique({
      where: {
        userId_organizationId: {
          userId: user.id,
          organizationId,
        },
      },
    });

    if (!currentUserRole || currentUserRole.role !== "OWNER") {
      return { error: "Unauthorized to remove users" };
    }

    await prismadb.organizationUser.delete({
      where: {
        userId_organizationId: {
          userId,
          organizationId,
        },
      },
    });

    return { success: "User removed successfully" };
  } catch (error) {
    console.error("Error removing user from organization:", error);
    return { error: "Failed to remove user" };
  }
}

export async function createSubLicense(
  organizationId: string,
): Promise<ActionResult> {
  const { user } = await validateRequest();
  if (!user) {
    return { error: "Unauthorized" };
  }

  try {
    const orgUser = await prismadb.organizationUser.findUnique({
      where: {
        userId_organizationId: {
          userId: user.id,
          organizationId,
        },
      },
      include: {
        organization: true,
      },
    });

    if (
      !orgUser ||
      orgUser.role !== "OWNER" ||
      !orgUser.organization.isPremium
    ) {
      return { error: "Unauthorized to create sublicenses" };
    }

    const newLicenseKey = generateLicenseKey();

    const newLicense = await prismadb.licenseKey.create({
      data: {
        key: newLicenseKey,
        organizationId,
        isActive: true,
      },
    });

    return { success: true, licenseKey: newLicense.key };
  } catch (error) {
    console.error("Error creating sublicense:", error);
    return { error: "Failed to create sublicense" };
  }
}

export async function transferCredits(
  fromUserId: string,
  toUserId: string,
  amount: number,
  organizationId: string,
  currentUserId: string,
): Promise<{ success: boolean; error?: string; data?: any }> {
  try {
    const session = await validateRequest();

    if (!session) {
      return { success: false, error: "Unauthorized" };
    }

    // Input validation
    if (!fromUserId || !toUserId || !amount || amount <= 0 || !organizationId) {
      return { success: false, error: "Invalid input parameters" };
    }

    // Prevent self-transfer
    if (fromUserId === toUserId) {
      return {
        success: false,
        error: "Cannot transfer credits to the same account",
      };
    }

    // Start transaction
    const result = await prismadb.$transaction(
      async (tx) => {
        // Check if current user has admin permissions
        const userOrg = await tx.organizationUser.findFirst({
          where: {
            userId: currentUserId,
            organizationId: organizationId,
            role: { in: ["OWNER", "ADMIN"] },
          },
        });

        if (!userOrg) {
          throw new Error("Insufficient permissions");
        }

        // Get user details
        const [fromUser, toUser, transferringUser] = await Promise.all([
          tx.user.findUnique({
            where: { id: fromUserId },
            include: { credit: true },
          }),
          tx.user.findUnique({
            where: { id: toUserId },
            include: { credit: true },
          }),
          tx.user.findUnique({
            where: { id: currentUserId },
            select: { email: true },
          }),
        ]);

        if (!fromUser || !toUser || !transferringUser) {
          throw new Error("One or more users not found");
        }

        // Verify organization membership
        const [fromUserOrg, toUserOrg] = await Promise.all([
          tx.organizationUser.findUnique({
            where: {
              userId_organizationId: {
                userId: fromUserId,
                organizationId,
              },
            },
          }),
          tx.organizationUser.findUnique({
            where: {
              userId_organizationId: {
                userId: toUserId,
                organizationId,
              },
            },
          }),
        ]);

        if (!fromUserOrg || !toUserOrg) {
          throw new Error("One or both users are not part of the organization");
        }

        // Check sufficient balance
        if (!fromUser.credit || fromUser.credit.balance < amount) {
          throw new Error("Insufficient credits");
        }

        // Update credits
        const [updatedFromCredit, updatedToCredit] = await Promise.all([
          tx.userCredit.update({
            where: { userId: fromUserId },
            data: { balance: { decrement: amount } },
          }),
          tx.userCredit.upsert({
            where: { userId: toUserId },
            create: { userId: toUserId, balance: amount },
            update: { balance: { increment: amount } },
          }),
        ]);

        // Create credit records first to ensure we have valid credit IDs
        const toUserCredit = await tx.userCredit.findUnique({
          where: { userId: toUserId },
        });

        if (!toUserCredit) {
          throw new Error("Failed to create or find recipient's credit record");
        }

        // Create transaction records
        await Promise.all([
          tx.creditTransaction.create({
            data: {
              userCreditId: fromUser.credit.id,
              amount: -amount,
              type: "GIFTED",
              description: `Transferred to ${toUser.email}`,
            },
          }),
          tx.creditTransaction.create({
            data: {
              userCreditId: toUserCredit.id, // Using the verified credit ID
              amount: amount,
              type: "GIFTED",
              description: `Received from ${fromUser.email}`,
            },
          }),
        ]);

        // Create notifications
        await Promise.all([
          tx.notification.create({
            data: {
              userId: fromUserId,
              title: "Credits Transferred",
              message: `${amount} credits have been transferred to ${toUser.email}`,
              type: "CREDIT_UPDATE",
            },
          }),
          tx.notification.create({
            data: {
              userId: toUserId,
              title: "Credits Received",
              message: `You have received ${amount} credits from ${fromUser.email}`,
              type: "CREDIT_UPDATE",
            },
          }),
        ]);

        return {
          fromUserBalance: updatedFromCredit.balance,
          toUserBalance: updatedToCredit.balance,
        };
      },
      {
        timeout: 15000,
        maxWait: 15000,
      },
    );

    revalidatePath(`orgs/${organizationId}`);
    return { success: true, data: result };
  } catch (error: any) {
    console.log(error);
    console.error("Credit transfer error:", error);
    return {
      success: false,
      error: error.message || "Failed to transfer credits",
    };
  }
}
// export async function getTransferLogs(
//   orgId: string,
// ): Promise<{ error?: string; data?: any }> {
//   try {
//     const session = await validateRequest();
//     if (!session?.user?.id) {
//       return { error: "Unauthorized" };
//     }

//     // Check if user belongs to organization
//     const userOrg = await prismadb.organizationUser.findFirst({
//       where: {
//         userId: session.user.id,
//         organizationId: orgId,
//       },
//     });

//     if (!userOrg) {
//       return { error: "Not a member of this organization" };
//     }

//     // Get transfer logs
//     const logs = await prismadb.creditTransferLog.findMany({
//       where: {
//         organizationId: orgId,
//       },
//       orderBy: {
//         createdAt: "desc",
//       },
//       take: 50, // Limit to last 50 transfers
//     });

//     return { data: logs };
//   } catch (error: any) {
//     console.error("Error fetching transfer logs:", error);
//     return { error: error.message || "Failed to fetch transfer logs" };
//   }
// }
