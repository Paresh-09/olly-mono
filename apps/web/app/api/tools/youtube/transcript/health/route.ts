import { NextResponse } from "next/server";

export async function GET() {
  try {
    return NextResponse.json({ 
      status: "ok", 
      message: "Transcript API is operational", 
      timestamp: new Date().toISOString() 
    });
  } catch (error) {
    return NextResponse.json({ 
      status: "error", 
      message: "Transcript API health check failed", 
      error: String(error) 
    }, { status: 500 });
  }
} 