import { NextRequest, NextResponse } from "next/server";
import { forgotPassword } from "@/lib/actions"

export async function POST(request: NextRequest) {
  try {
    const body: { email: string } = await request.json();
    const { email } = body;

    const formData = new FormData();
    formData.append("email", email || "");
    
    const result = await forgotPassword(null, formData);
    
    if (result.error) {
      return NextResponse.json(
        { 
          success: false,
          error: result.error 
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        success: true,
        message: result.success 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Forgot password route error:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Internal server error" 
      },
      { status: 500 }
    );
  }
}