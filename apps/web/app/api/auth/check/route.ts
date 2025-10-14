import { NextResponse } from "next/server";
import { validateRequest } from "@/lib/auth";

export async function GET() {
  try {
    const { user } = await validateRequest();
    return NextResponse.json({ 
      authenticated: !!user,
      user: user ? {
        id: user.id,
        username: user.username,
        email: user.email
      } : null
    });
  } catch (error) {
    console.error("Error checking authentication status:", error);
    return NextResponse.json({ 
      authenticated: false, 
      error: "Error checking authentication status" 
    }, { status: 500 });
  }
} 