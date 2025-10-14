import { randomBytes } from 'crypto';
import prismadb from "@/lib/prismadb";
import { lucia } from "@/lib/auth";
import { sendMail } from '../mail-service';
import { cookies } from 'next/headers';

// Action to send verification email
export async function sendVerificationEmail(userId: string): Promise<ActionResult> {
  const user = await prismadb.user.findUnique({ where: { id: userId } });
  if (!user || !user.email) {
    return { error: "User not found or email not set" };
  }

  const token = randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

  await prismadb.emailVerificationToken.create({
    data: {
      token,
      expires,
      userId: user.id
    }
  });

  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`;

  const emailSubject = "Verify Your Email for Olly";
  const emailText = `
    Hello,

    Please click the link below to verify your email address:

    ${verificationUrl}

    If you didn't request this, you can safely ignore this email.

    Best regards,
    The Olly Team
  `;

  try {
    await sendMail(
      emailSubject,
      user.email,
      emailText,
      "Olly Email Verification",
      undefined,
      true // Mark as important
    );

    return { success: "Verification email sent successfully" };
  } catch (error) {
    console.error("Error sending verification email:", error);
    return { error: "Failed to send verification email" };
  }
}

export async function verifyEmailToken(token: string): Promise<ActionResult> {
    const verificationToken = await prismadb.emailVerificationToken.findUnique({
      where: { token },
      include: { user: true }
    });
  
    if (!verificationToken) {
      return { error: "Invalid verification token" };
    }
  
    if (verificationToken.expires < new Date()) {
      await prismadb.emailVerificationToken.delete({ where: { id: verificationToken.id } });
      return { error: "Expired verification token" };
    }
  
    const user = await prismadb.user.findUnique({
      where: { id: verificationToken.userId }
    });
  
    if (!user) {
      return { error: "User not found" };
    }
  
    if (user.isEmailVerified) {
      await prismadb.emailVerificationToken.delete({ where: { id: verificationToken.id } });
      return { success: "Email already verified" };
    }
  
    await prismadb.user.update({
      where: { id: verificationToken.userId },
      data: { isEmailVerified: true }
    });
  
    await prismadb.emailVerificationToken.delete({ where: { id: verificationToken.id } });
  
    // Create a session for the user
    const session = await lucia.createSession(verificationToken.userId, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    (await cookies()).set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
  
    return { success: "Email verified successfully" };
  }

// Action to resend verification email
export async function resendVerificationEmail(userId: string): Promise<ActionResult> {
  const user = await prismadb.user.findUnique({ where: { id: userId } });
  if (!user || !user.email) {
    return { error: "User not found or email not set" };
  }

  if (user.isEmailVerified) {
    return { error: "Email is already verified" };
  }

  // Delete any existing verification tokens for this user
  await prismadb.emailVerificationToken.deleteMany({ where: { userId: user.id } });

  // Send a new verification email
  return sendVerificationEmail(user.id);
}

interface ActionResult {
  error?: string;
  success?: string;
}