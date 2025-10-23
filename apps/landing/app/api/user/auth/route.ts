// app/api/auth/check/route.ts
import { validateRequest } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const { user } = await validateRequest();
  
  
  return NextResponse.json({
    authenticated: !!user,
    user: user ? {
      id: user.id,
      email: user.email,
      username: user.username,
      isAdmin: user.isAdmin
    } : null
  });
}