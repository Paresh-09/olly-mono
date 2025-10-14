import { NextResponse } from "next/server";
import { deleteSubLicenseGoal } from "@/lib/actions/subLicenseActions";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ goalId: string }> }
) {
  try {
    const { goalId } = await params;

    if (!goalId) {
      return NextResponse.json(
        { error: "Goal ID is required" },
        { status: 400 },
      );
    }

    const result = await deleteSubLicenseGoal(goalId);
    
    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: result.error === "Unauthorized" ? 401 : 404 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting sub-license goal:", error);
    return NextResponse.json(
      { error: "Failed to delete sub-license goal" },
      { status: 500 },
    );
  }
}
