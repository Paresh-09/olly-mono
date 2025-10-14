import { NextRequest, NextResponse } from 'next/server';
import { validateRequest } from '@/lib/auth';
import { resendVerificationEmail } from '@/lib/actions/email-verification';

export async function POST(request: NextRequest) {
  const { user } = await validateRequest();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await resendVerificationEmail(user.id);

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ message: result.success }, { status: 200 });
}