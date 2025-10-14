import { NextRequest, NextResponse } from 'next/server';
import { validateRequest } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import prismadb from '@/lib/prismadb';
import { sendMail } from '@/lib/mail-service';

export async function POST(request: NextRequest) {
  try {
    // Validate user authentication
    const { user } = await validateRequest();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { oldPassword, newPassword } = body;

    // Validate input
    if (!oldPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Old password and new password are required' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'New password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    if (oldPassword === newPassword) {
      return NextResponse.json(
        { error: 'New password must be different from current password' },
        { status: 400 }
      );
    }

    // Get current user with password
    const currentUser = await prismadb.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        password: true,
      },
    });

    if (!currentUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user has a password set
    if (!currentUser.password) {
      return NextResponse.json(
        { error: 'No password set for this account. Please use password reset instead.' },
        { status: 400 }
      );
    }

    // Verify old password
    const isOldPasswordValid = await bcrypt.compare(oldPassword, currentUser.password);
    if (!isOldPasswordValid) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prismadb.user.update({
      where: { id: user.id },
      data: {
        password: hashedNewPassword,
      },
    });

    // Send confirmation email
    const emailSubject = "Your Olly Password Has Been Changed";
    const emailText = `
      Hello,

      This is to confirm that your password for your Olly account has been successfully changed.

      If you did not make this change, please contact our support team immediately.

      Best regards,
      The Olly Team
    `;

    try {
      await sendMail(
        emailSubject,
        currentUser.email!,
        emailText,
        "Yash @ Olly",
        undefined,
        true, // Mark as important
      );
    } catch (emailError) {
      console.error('Error sending password change confirmation email:', emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      message: 'Password changed successfully. A confirmation email has been sent.',
    });

  } catch (error) {
    console.error('Error changing password:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 