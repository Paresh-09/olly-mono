"use server";

import { lucia, validateRequest } from "@/lib/auth";
import { redirect } from "next/navigation";
import { cookies, headers } from "next/headers";
import bcrypt from "bcryptjs";
import prismadb from "@/lib/prismadb";
import { ActionResult } from "@/lib/form";
import { sendMail } from "./mail-service";
import { randomBytes } from "crypto";
import { sendDiscordNotification } from "@/service/discord-notify";
import { User } from "@repo/db";
import {
  formatOrganizationName,
  generateApiKey,
  generateRandomName,
} from "./utils";
import { generateCodeVerifier, generateState } from "arctic";
import { googleOAuthClient } from "./auth/google-oauth";
import { updateBrevoContact } from "./brevo-contact-update";
import { createCreditUpdateNotification } from "./notifications/create";
import { generateTemporaryTokenForExtension } from "./actions/extension-auth";

const genericDomains = [
  "gmail.com",
  "yahoo.com",
  "hotmail.com",
  "outlook.com",
  "aol.com",
  "icloud.com",
  "protonmail.com",
  "mail.com",
];

// Function to generate a unique organization name
async function getUniqueOrgName(
  baseName: string,
  attempt: number = 1,
): Promise<string> {
  const orgName = attempt === 1 ? baseName : `${baseName}-${attempt}`;
  const formattedOrgName = formatOrganizationName(orgName);

  const existingOrg = await prismadb.organization.findUnique({
    where: { name: formattedOrgName },
  });

  if (!existingOrg) {
    return formattedOrgName;
  }

  return getUniqueOrgName(baseName, attempt + 1);
}

export async function logout(): Promise<ActionResult> {
  const { session } = await validateRequest();
  if (!session) {
    return {
      error: "Unauthorized",
    };
  }

  await lucia.invalidateSession(session.id);

  const sessionCookie = lucia.createBlankSessionCookie();
  (await cookies()).set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes,
  );

  // Set a cookie flag that triggers PostHog user reset in the client
  // This maintains the device ID but switches back to anonymous tracking
  (await cookies()).set("ph_reset", "true", {
    httpOnly: false, // Make accessible to client-side JS
    path: "/",
    maxAge: 60, // Only needs to live for a minute
    sameSite: "strict",
  });

  return redirect("/login");
}

export async function signup(
  prevState: any,
  formData: FormData,
): Promise<ActionResult> {
  const email = formData.get("email");
  const username = formData.get("username");
  const password = formData.get("password");

  if (typeof email !== "string" || !email.includes("@")) {
    return { error: "Invalid email" };
  }
  if (
    typeof username !== "string" ||
    username.length < 3 ||
    username.length > 31 ||
    !/^[a-z0-9_-]+$/.test(username)
  ) {
    return { error: "Invalid username" };
  }
  if (
    typeof password !== "string" ||
    password.length < 6 ||
    password.length > 255
  ) {
    return { error: "Invalid password" };
  }

  try {
    const existingUser = await prismadb.user.findFirst({
      where: {
        OR: [{ email: email }, { username: username }],
      },
    });

    if (existingUser) {
      if (existingUser.email === email && !existingUser.password) {
        // User exists but has no password, initiate password reset flow
        const token = randomBytes(32).toString("hex");
        const expires = new Date(Date.now() + 3600000); // 1 hour from now

        await prismadb.passwordResetToken.create({
          data: {
            token,
            expires,
            userId: existingUser.id,
          },
        });

        const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;

        const emailSubject = "Set Your Olly Password";
        const emailText = `
          Hello,

          You've attempted to sign up for an Olly account, but an account with this email already exists. 
          Click the link below to set your password:

          ${resetUrl}

          If you didn't request this, you can safely ignore this email.

          Best regards,
          The Olly Team
        `;

        await sendMail(
          emailSubject,
          email,
          emailText,
          "Olly Password Setup",
          undefined,
          true, // Mark as important
        );

        return {
          error:
            "Account already exists, please check your email for password reset.",
        };
      } else {
        return {
          error:
            existingUser.email === email
              ? "Email already in use"
              : "Username already taken",
        };
      }
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prismadb.user.create({
      data: {
        email,
        username,
        password: passwordHash,
      },
    });

    await prismadb.userCredit.create({
      data: {
        userId: user.id,
        balance: 10,
      },
    });

    const apiKey = generateApiKey();

    await prismadb.apiKey.create({
      data: {
        key: apiKey,
        users: {
          create: {
            userId: user.id,
          },
        },
      },
    });

    await createCreditUpdateNotification({
      userId: user.id,
      amount: 10,
      reason: "signup_bonus",
    });

    // Create organization with unique name
    const domain = email.split("@")[1];
    let baseName: string;

    if (!genericDomains.includes(domain)) {
      baseName = domain.split(".")[0]; // Use the domain name
    } else {
      // Try to use the first name from the email
      const firstName = email.split("@")[0].split(".")[0];
      if (firstName && firstName.length > 1) {
        baseName = firstName.charAt(0).toUpperCase() + firstName.slice(1);
      } else {
        // Generate a random name if no suitable name is found
        baseName = generateRandomName();
      }
    }

    const uniqueOrgName = await getUniqueOrgName(baseName);

    const organization = await prismadb.organization.create({
      data: {
        name: uniqueOrgName,
        users: {
          create: {
            userId: user.id,
            role: "OWNER",
          },
        },
      },
    });

    try {
      const firstName = username.split(/[._-]/)[0]; // Extract first part of username as firstName
      await updateBrevoContact({
        email,
        attributes: {
          FIRSTNAME: firstName,
          PAID: false, // Boolean value for new signups
          SOURCE: "Website Signup",
        },
        listIds: [16],
      });
    } catch (brevoError) {
      console.error("Error updating Brevo contact:", brevoError);
      // Continue with signup even if Brevo update fails
    }

    const session = await lucia.createSession(user.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    (await cookies()).set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes,
    );

    try {
      await sendDiscordNotification(
        `New user signed up: ${username} (${email})`,
      );
    } catch (error) {
      console.error("Error sending Discord notification:", error);
      // We don't return here, as the signup was successful even if the notification failed
    }

    const ip =
      (await headers()).get("x-forwarded-for") || (await headers()).get("cf-connecting-ip");

    const existingMilestone = await prismadb.userJourneyMilestone.findFirst({
      where: {
        userId: user.id,
        milestone: "SIGNUP",
      },
    });

    if (!existingMilestone) {
      await prismadb.userJourneyMilestone.create({
        data: {
          userId: user.id,
          milestone: "SIGNUP",
        },
      });
    }

    return { success: "Account created successfully", userId: user.id };
  } catch (e: any) {
    console.error("Error during signup:", e);
    if (e.code === "P2002") {
      return { error: "Username or email already used" };
    }
    return { error: "An unknown error occurred during signup" };
  }
}

export async function login(
  prevState: any,
  formData: FormData,
): Promise<ActionResult> {
  const email = formData.get("email");
  const password = formData.get("password");

  // Check if this is an extension login
  const isExtensionLogin = formData.get("isExtensionLogin") === "true";
  const extensionClientId = formData.get("client_id");

  // Validate email
  if (typeof email !== "string" || !email.includes("@")) {
    return {
      error: "Invalid email",
    };
  }

  // Validate password
  if (
    typeof password !== "string" ||
    password.length < 6 ||
    password.length > 255
  ) {
    return {
      error: "Invalid password",
    };
  }

  // Find the user
  const existingUser = await prismadb.user.findUnique({
    where: { email: email },
  });

  if (!existingUser) {
    return {
      error: "Incorrect email or password",
    };
  }

  // Check if the account is deactivated
  if (existingUser.deactivated) {
    // Generate a reactivation token
    const token = randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 3600000); // 1 hour from now

    await prismadb.passwordResetToken.create({
      data: {
        token,
        expires,
        userId: existingUser.id,
      },
    });

    const reactivationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reactivate-account?token=${token}`;

    const emailSubject = "Reactivate Your Olly Account";
    const emailText = `
        Hello,
  
        Your account has been deactivated. To reactivate your account and reset your password, please click the link below:
  
        ${reactivationUrl}
  
        If you didn't request this, you can safely ignore this email.
  
        Best regards,
        The Olly Team
      `;

    try {
      await sendMail(
        emailSubject,
        email,
        emailText,
        "Olly Account Reactivation",
        undefined,
        true, // Mark as important
      );

      return {
        error:
          "Account is deactivated. A reactivation link has been sent to your email.",
      };
    } catch (error) {
      console.error("Error sending reactivation email:", error);
      return {
        error:
          "There was an error sending the reactivation email. Please try again later.",
      };
    }
  }

  // Check if the user has a password
  if (!existingUser.password) {
    // User exists but has no password, send reset link
    const token = randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 3600000); // 1 hour from now

    await prismadb.passwordResetToken.create({
      data: {
        token,
        expires,
        userId: existingUser.id,
      },
    });

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;

    const emailSubject = "Set Your Olly Password";
    const emailText = `
      Hello,

      You've attempted to log in to your Olly account, but you haven't set a password yet. 
      Click the link below to set your password:

      ${resetUrl}

      If you didn't request this, you can safely ignore this email.

      Best regards,
      The Olly Team
    `;

    try {
      await sendMail(
        emailSubject,
        email,
        emailText,
        "Olly Password Setup",
        undefined,
        true, // Mark as important
      );

      return {
        error: "User exists but has no password",
      };
    } catch (error) {
      console.error("Error sending password setup email:", error);
      return {
        error:
          "There was an error sending the password setup email. Please try again later.",
      };
    }
  }

  try {
    // Verify password
    const validPassword = await bcrypt.compare(password, existingUser.password);
    if (!validPassword) {
      return {
        error: "Incorrect email or password",
      };
    }

    // Create session
    const session = await lucia.createSession(existingUser.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    (await cookies()).set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes,
    );

    // Check if FIRST_LOGIN milestone already exists before creating it
    const existingMilestone = await prismadb.userJourneyMilestone.findFirst({
      where: {
        userId: existingUser.id,
        milestone: "FIRST_LOGIN",
      },
    });

    if (!existingMilestone) {
      await prismadb.userJourneyMilestone.create({
        data: {
          userId: existingUser.id,
          milestone: "FIRST_LOGIN",
        },
      });
    }

    // Handle extension authentication after successful login
    if (isExtensionLogin) {
      // Find user's license key
      const userLicenseKey = await prismadb.userLicenseKey.findFirst({
        where: { userId: existingUser.id },
        include: { licenseKey: true },
      });

      const userApiKey = await prismadb.userApiKey.findFirst({
        where: { userId: existingUser.id },
        include: { apiKey: true },
      });

      if (!userLicenseKey) {
        return {
          success: "Logged in successfully",
          error:
            "No license key found for this user. Please add a license key in your dashboard.",
          extensionAuth: true,
          noLicenseKey: true,
        };
      }

      // Generate temporary token for extension auth
      const authCode = await generateTemporaryTokenForExtension(
        userLicenseKey.licenseKeyId,
        userApiKey?.apiKeyId || "",
      );

      return {
        success: "Logged in successfully",
        extensionAuth: true,
        authCode,
      };
    }

    const ip =
      (await headers()).get("x-forwarded-for") || (await headers()).get("cf-connecting-ip");

    // Standard web login success
    return {
      success: "Logged in successfully",
    };
  } catch (error) {
    console.error("Error during login:", error);
    return {
      error: "An error occurred during login",
    };
  }
}

export const getGoogleOauthConsentUrl = async (
  returnUrl: string = "/dashboard",
) => {
  try {
    const state = generateState();
    // Encode the return URL with the state
    const combinedState = JSON.stringify({ state, returnUrl });
    const encodedState = Buffer.from(combinedState).toString("base64");

    const codeVerifier = generateCodeVerifier();

    (await cookies()).set("codeVerifier", codeVerifier, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });
    (await cookies()).set("state", encodedState, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });

    const authUrl = await googleOAuthClient.createAuthorizationURL(
      encodedState,
      codeVerifier,
      {
        scopes: ["email", "profile"],
      },
    );
    return { success: true, url: authUrl.toString() };
  } catch (error) {
    return { success: false, error: "Something went wrong" };
  }
};

export async function forgotPassword(
  prevState: any,
  formData: FormData,
): Promise<ActionResult> {
  const email = formData.get("email")?.toString();

  if (typeof email !== "string" || !email.includes("@")) {
    return {
      error: "Invalid email",
    };
  }

  // Use case insensitive search
  const user = await prismadb.user.findFirst({
    where: {
      email: {
        equals: email,
        mode: "insensitive", // This enables case-insensitive matching
      },
    },
  });

  if (!user || !user.email) {
    // Add null check for email
    // Don't reveal that the user doesn't exist
    return {
      success:
        "If an account with that email exists, we've sent a password reset link.",
    };
  }

  const token = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 3600000); // 1 hour from now

  await prismadb.passwordResetToken.create({
    data: {
      token,
      expires,
      userId: user.id,
    },
  });

  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;

  const emailSubject = "Reset Your Olly Password";
  const emailText = `
    Hello,

    You've requested to reset your password for your Olly account. 
    Click the link below to set a new password:

    ${resetUrl}

    If you didn't request this, you can safely ignore this email.

    Best regards,
    The Olly Team
  `;

  try {
    await sendMail(
      emailSubject,
      user.email,
      emailText,
      "Olly Password Reset",
      undefined,
      true, // Mark as important
    );

    return {
      success:
        "If an account with that email exists, we've sent a password reset link.",
    };
  } catch (error) {
    console.error("Error sending password reset email:", error);
    return {
      error:
        "There was an error sending the password reset email. Please try again later.",
    };
  }
}

export async function resetPassword(
  prevState: any,
  formData: FormData,
): Promise<ActionResult> {
  const token = formData.get("token");
  const password = formData.get("password");
  const confirmPassword = formData.get("confirmPassword");

  if (
    typeof token !== "string" ||
    typeof password !== "string" ||
    typeof confirmPassword !== "string"
  ) {
    return {
      error: "Invalid input",
    };
  }

  if (password !== confirmPassword) {
    return {
      error: "Passwords do not match",
    };
  }

  if (password.length < 6 || password.length > 255) {
    return {
      error: "Invalid password",
    };
  }

  const resetToken = await prismadb.passwordResetToken.findUnique({
    where: { token },
    include: { user: true },
  });

  if (
    !resetToken ||
    resetToken.expires < new Date() ||
    !resetToken.user.email
  ) {
    return {
      error: "Invalid or expired reset token",
    };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await prismadb.user.update({
    where: { id: resetToken.userId },
    data: {
      password: passwordHash,
      isEmailVerified: true,
    },
  });

  await prismadb.passwordResetToken.delete({
    where: { id: resetToken.id },
  });

  // Send confirmation email
  const emailSubject = "Your Olly Password Has Been Reset";
  const emailText = `
    Hello,

    This is to confirm that your password for your Olly account has been successfully reset.

    If you did not make this change, please contact our support team immediately.

    Best regards,
    The Olly Team
  `;

  try {
    // Use the email from the database record with null check
    await sendMail(
      emailSubject,
      resetToken.user.email, // This is now safe because we checked for null above
      emailText,
      "Olly Security",
      undefined,
      true, // Mark as important
    );

    return {
      success:
        "Your password has been reset successfully. A confirmation email has been sent.",
    };
  } catch (error) {
    console.error("Error sending password reset confirmation email:", error);
    return {
      success:
        "Your password has been reset successfully, but there was an error sending the confirmation email.",
    };
  }
}

export async function updateUsername(
  formData: FormData,
): Promise<ActionResult> {
  const { user } = await validateRequest();
  if (!user) {
    return { error: "Unauthorized" };
  }

  const username = formData.get("username");
  if (
    typeof username !== "string" ||
    username.length < 3 ||
    username.length > 31 ||
    !/^[a-z0-9_-]+$/.test(username)
  ) {
    return {
      error:
        "Invalid username. Use 3-31 characters, lowercase letters, numbers, underscore, or hyphen.",
    };
  }

  try {
    const existingUser = await prismadb.user.findUnique({
      where: { username: username },
    });

    if (existingUser && existingUser.id !== user.id) {
      return { error: "Username is already taken" };
    }

    await prismadb.user.update({
      where: { id: user.id },
      data: { username: username },
    });

    return { success: "Username updated successfully" };
  } catch (error) {
    console.error("Error updating username:", error);
    return { error: "An error occurred while updating the username" };
  }
}

export async function fetchUserProfile(): Promise<ActionResult> {
  const { user } = await validateRequest();
  if (!user) {
    return { error: "Unauthorized" };
  }

  try {
    const userProfile = await prismadb.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        credit: {
          select: {
            balance: true
          }
        }
      },
    });

    if (!userProfile) {
      return { error: "User not found" };
    }

    // Transform the data to include credits at the top level for consistency with navbar
    const transformedProfile = {
      ...userProfile,
      credits: userProfile.credit?.balance || 0
    };

    return { success: JSON.stringify(transformedProfile) };
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return { error: "An error occurred while fetching the user profile" };
  }
}

export async function updateUserProfile(
  prevState: any,
  formData: FormData,
): Promise<ActionResult> {
  const { user } = await validateRequest();
  if (!user) {
    return { error: "Unauthorized" };
  }

  const name = formData.get("name") as string;
  const username = formData.get("username") as string;

  if (
    typeof username !== "string" ||
    username.length < 3 ||
    username.length > 31 ||
    !/^[a-z0-9_-]+$/.test(username)
  ) {
    return {
      error:
        "Invalid username. Use 3-31 characters, lowercase letters, numbers, underscore, or hyphen.",
    };
  }

  try {
    const existingUser = await prismadb.user.findUnique({
      where: { username: username },
    });

    if (existingUser && existingUser.id !== user.id) {
      return { error: "Username is already taken" };
    }

    const updatedUser = await prismadb.user.update({
      where: { id: user.id },
      data: {
        name,
        username,
      },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
      },
    });

    return { success: JSON.stringify(updatedUser) };
  } catch (error) {
    console.error("Error updating user profile:", error);
    return { error: "An error occurred while updating the user profile" };
  }
}

export async function deactivateProfile(): Promise<ActionResult> {
  const { user } = await validateRequest();
  if (!user) {
    return { error: "Unauthorized" };
  }

  try {
    await prismadb.user.update({
      where: { id: user.id },
      data: { deactivated: true },
    });

    // Invalidate all sessions for this user
    await prismadb.session.deleteMany({
      where: { userId: user.id },
    });

    // Clear the session cookie
    const sessionCookie = lucia.createBlankSessionCookie();
    (await cookies()).set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes,
    );

    return { success: "Your profile has been deactivated" };
  } catch (error) {
    console.error("Error deactivating profile:", error);
    return { error: "An error occurred while deactivating your profile" };
  }
}

export async function reactivateAccount(
  prevState: any,
  formData: FormData,
): Promise<ActionResult> {
  const token = formData.get("token");
  const password = formData.get("password");
  const confirmPassword = formData.get("confirmPassword");

  if (
    typeof token !== "string" ||
    typeof password !== "string" ||
    typeof confirmPassword !== "string"
  ) {
    return { error: "Invalid input" };
  }

  if (password !== confirmPassword) {
    return { error: "Passwords do not match" };
  }

  if (password.length < 6 || password.length > 255) {
    return { error: "Invalid password" };
  }

  const resetToken = await prismadb.passwordResetToken.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!resetToken || resetToken.expires < new Date()) {
    return { error: "Invalid or expired reactivation token" };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  try {
    await prismadb.user.update({
      where: { id: resetToken.userId },
      data: {
        password: passwordHash,
        deactivated: false,
      },
    });

    await prismadb.passwordResetToken.delete({
      where: { id: resetToken.id },
    });

    // Send confirmation email
    const emailSubject = "Your Olly Account Has Been Reactivated";
    const emailText = `
      Hello,

      This is to confirm that your Olly account has been successfully reactivated and your password has been reset.

      If you did not make this change, please contact our support team immediately.

      Best regards,
      The Olly Team
    `;

    await sendMail(
      emailSubject,
      resetToken.user.email || "support@explainx.ai",
      emailText,
      "Olly Account Reactivation",
      undefined,
      true, // Mark as important
    );

    return {
      success:
        "Your account has been reactivated and your password has been reset successfully.",
    };
  } catch (error) {
    console.error("Error reactivating account:", error);
    return { error: "An error occurred while reactivating your account" };
  }
}

export async function initiateSetPassword(
  prevState: any,
  formData: FormData,
): Promise<ActionResult> {
  const email = formData.get("email");

  if (typeof email !== "string" || !email.includes("@")) {
    return {
      error: "Invalid email",
    };
  }

  let existingUser;
  try {
    existingUser = await prismadb.user.findUnique({
      where: { email: email },
    });
  } catch (error) {
    console.error("Error finding user:", error);
    return {
      error:
        "An error occurred while checking the account. Please try again later.",
    };
  }

  if (!existingUser) {
    return {
      error: "No account found with this email address",
    };
  }

  if (existingUser.password) {
    return {
      error:
        "This account already has a password. Please use the 'Forgot Password' link to reset it.",
    };
  }

  const token = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 3600000); // 1 hour from now

  try {
    await prismadb.$transaction(async (prisma) => {
      await prisma.passwordResetToken.create({
        data: {
          token,
          expires,
          userId: existingUser.id,
        },
      });

      try {
        // Check if user already has an organization
        const existingOrg = await prisma.organization.findFirst({
          where: {
            users: {
              some: {
                userId: existingUser.id,
              },
            },
          },
        });

        if (!existingOrg) {
          // Create organization with unique name
          const domain = email.split("@")[1];
          let baseName: string;

          if (!genericDomains.includes(domain)) {
            baseName = domain.split(".")[0]; // Use the domain name
          } else {
            // Try to use the first name from the email
            const firstName = email.split("@")[0].split(".")[0];
            if (firstName && firstName.length > 1) {
              baseName = firstName.charAt(0).toUpperCase() + firstName.slice(1);
            } else {
              // Generate a random name if no suitable name is found
              baseName = generateRandomName();
            }
          }

          const uniqueOrgName = await getUniqueOrgName(baseName);

          await prisma.organization.create({
            data: {
              name: uniqueOrgName,
              users: {
                create: {
                  userId: existingUser.id,
                  role: "OWNER",
                },
              },
            },
          });
        }
      } catch (orgError) {
        console.error("Error creating organization:", orgError);
        // We don't throw here, as we want to continue with password reset even if org creation fails
      }
    });

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;

    const emailSubject = "Set Your Olly Password";
    const emailText = `
      Hello,

      You've requested to set a password for your Olly account. 
      Click the link below to set your password:

      ${resetUrl}

      If you didn't request this, you can safely ignore this email.

      Best regards,
      The Olly Team
    `;

    try {
      await sendMail(
        emailSubject,
        email,
        emailText,
        "Olly Password Setup",
        undefined,
        true, // Mark as important
      );
    } catch (emailError) {
      console.error("Error sending email:", emailError);
      return {
        error:
          "Password reset token created, but there was an error sending the email. Please contact support.",
      };
    }

    return {
      success: "Password setup instructions have been sent to your email.",
    };
  } catch (error) {
    console.error("Error initiating password setup:", error);
    return {
      error:
        "There was an error initiating the password setup. Please try again later.",
    };
  }
}

export async function checkAuthStatus() {
  const { user } = await validateRequest();
  return { isLoggedIn: !!user };
}
