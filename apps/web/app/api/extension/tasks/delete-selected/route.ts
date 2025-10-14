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

    const { taskIds } = await req.json();

    await prismadb.task.deleteMany({
      where: {
        id: {
          in: taskIds
        },
        userId: user.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Selected tasks deleted successfully"
    });
  } catch (error) {
    console.error("[DELETE_SELECTED_TASKS]", error);
    return NextResponse.json({
      success: false,
      error: "Internal error"
    }, { status: 500 });
  }
} 