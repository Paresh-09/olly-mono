// app/api/sub-license-goals/route.ts
import { NextResponse } from 'next/server';
import { addSubLicenseGoal, getSubLicenseGoals } from '@/lib/actions/subLicenseActions';
import { validateRequest } from '@/lib/auth';

export async function POST(request: Request) {
  const { user } = await validateRequest();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  formData.append("userId", user.id); // Add the user ID to the form data
  const result = await addSubLicenseGoal(null, formData);
  return NextResponse.json(result);
}

export async function GET(request: Request) {
  const { user } = await validateRequest();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const subLicenseId = searchParams.get("subLicenseId");
  const result = await getSubLicenseGoals(subLicenseId);
  return NextResponse.json(result);
}

export async function PATCH(request: Request) {
  const { user } = await validateRequest();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { goalId, status, progress, goal, platform, daysToAchieve, target } = body;

  if (!goalId) {
    return NextResponse.json({ error: "Goal ID is required" }, { status: 400 });
  }

  try {
    // Import the update function here to avoid circular import
    const { updateSubLicenseGoal } = await import('@/lib/actions/subLicenseActions');
    const result = await updateSubLicenseGoal(goalId, status, progress, goal, platform, daysToAchieve, target);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error updating sub-license goal:", error);
    return NextResponse.json({ error: "Failed to update goal" }, { status: 500 });
  }
}