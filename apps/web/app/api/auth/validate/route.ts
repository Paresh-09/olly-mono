import { NextResponse } from "next/server";
import { validateRequest } from "@/lib/auth";

export async function GET() {
  try {
    const { user, session } = await validateRequest();
    
    if (!user) {
      return NextResponse.json({ 
        isAuthenticated: false,
        user: null 
      });
    }
    
    return NextResponse.json({ 
      isAuthenticated: true,
      user: {
        id: user.id,
        email: user.email,
        // Only include properties that exist on ExtendedUser
      }
    });
    
  } catch (error) {
    console.error("Auth validation error:", error);
    return NextResponse.json({ 
      isAuthenticated: false,
      user: null,
      error: "Failed to validate authentication" 
    }, { status: 500 });
  }
} 