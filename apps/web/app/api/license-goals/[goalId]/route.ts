import { NextResponse } from "next/server";
import { validateRequest } from "@/lib/auth";
import prismadb from "@/lib/prismadb";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ goalId: string }> }
) {
  try {
    const { user } = await validateRequest();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { goalId } = await params;

    if (!goalId) {
      return NextResponse.json(
        { error: "Goal ID is required" },
        { status: 400 },
      );
    }

    // Verify the goal belongs to the user
    const goal = await prismadb.licenseGoal.findFirst({
      where: {
        id: goalId,
        userId: user.id,
      },
    });

    if (!goal) {
      return NextResponse.json(
        { error: "Goal not found or unauthorized" },
        { status: 404 },
      );
    }

    // Delete the goal
    await prismadb.licenseGoal.delete({
      where: {
        id: goalId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting license goal:", error);
    return NextResponse.json(
      { error: "Failed to delete license goal" },
      { status: 500 },
    );
  }
}
