// app/api/orgs/accept-invite/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { validateRequest } from '@/lib/auth';
import { acceptOrganizationInvite } from '@/lib/actions/org-actions';

export async function POST(req: NextRequest) {
  const { user } = await validateRequest();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { token } = await req.json();

  if (!token) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
  }

  try {
    const result = await acceptOrganizationInvite(token);
    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({ success: result.success });
  } catch (error) {
    console.error('Error accepting invitation:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}