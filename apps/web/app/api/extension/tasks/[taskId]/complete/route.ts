import { NextResponse } from "next/server";
import { validateRequest } from "@/lib/auth";
import prismadb from "@/lib/prismadb";

export async function PATCH(req: Request, props: { params: Promise<{ taskId: string }> }) {
  const params = await props.params;
  try {
    const { user } = await validateRequest();

    if (!user) {
      return NextResponse.json({
        success: false,
        error: "Unauthorized"
      }, { status: 401 });
    }

    const task = await prismadb.task.update({
      where: {
        id: params.taskId,
        userId: user.id,
      },
      data: {
        status: "COMPLETED",
      },
    });

    return NextResponse.json({
      success: true,
      data: task
    });
  } catch (error) {
    console.error("[COMPLETE_TASK]", error);
    return NextResponse.json({
      success: false,
      error: "Internal error"
    }, { status: 500 });
  }
} 