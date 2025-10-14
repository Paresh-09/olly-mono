import { NextRequest, NextResponse } from 'next/server';
import prismadb from '@/lib/prismadb';
import { lucia } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');
  
  if (!token) {
    return NextResponse.json({ error: "Token is required" }, { status: 400 });
  }

  const verificationToken = await prismadb.emailVerificationToken.findUnique({
    where: { token },
    include: { user: true }
  });

  if (!verificationToken) {
    return NextResponse.json({ error: "Invalid verification token" }, { status: 400 });
  }

  if (verificationToken.expires < new Date()) {
    await prismadb.emailVerificationToken.delete({ where: { id: verificationToken.id } });
    return NextResponse.json({ error: "Expired verification token" }, { status: 400 });
  }

  const user = await prismadb.user.findUnique({
    where: { id: verificationToken.userId }
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 400 });
  }

  if (user.isEmailVerified) {
    // If already verified, don't delete the token, just return success
    return NextResponse.json({ message: "Email already verified" }, { status: 200 });
  }

  await prismadb.user.update({
    where: { id: verificationToken.userId },
    data: { isEmailVerified: true }
  });

  // Create a session for the user
  const session = await lucia.createSession(verificationToken.userId, {});
  const sessionCookie = lucia.createSessionCookie(session.id);
  
  const response = NextResponse.json({ message: "Email verified successfully" }, { status: 200 });
  response.cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);

  // Delete the token after successful verification
  await prismadb.emailVerificationToken.delete({ where: { id: verificationToken.id } });

  return response;
}