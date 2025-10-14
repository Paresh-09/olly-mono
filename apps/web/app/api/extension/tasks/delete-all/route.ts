import { NextResponse } from "next/server";
import { validateRequest } from "@/lib/auth";
import prismadb from "@/lib/prismadb";

export async function DELETE(req: Request) {
  try {
    const { user } = await validateRequest();

    if (!user) {
      return NextResponse.json({
        success: false,
        error: "Unauthorized"
      }, { status: 401 });
    }

    // Delete all tasks for the user that are not completed or failed
    await prismadb.task.deleteMany({
      where: {
        userId: user.id,
        status: {
          in: ['SCHEDULED', 'IN_PROGRESS']
        }
      },
    });

    return NextResponse.json({
      success: true,
      message: "All pending tasks deleted successfully"
    });
  } catch (error) {
    console.error("[DELETE_ALL_TASKS]", error);
    return NextResponse.json({
      success: false,
      error: "Internal error"
    }, { status: 500 });
  }
} 