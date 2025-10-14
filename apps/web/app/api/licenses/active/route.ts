// app/api/active-licenses/route.ts
import prismadb from '@/lib/prismadb';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const activeLicenseCount = await prismadb.licenseKey.count();

    return NextResponse.json({ count: activeLicenseCount });
  } catch (error) {
    console.error('Error fetching active license count:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}