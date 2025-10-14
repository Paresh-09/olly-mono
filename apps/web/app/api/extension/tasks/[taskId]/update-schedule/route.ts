import { validateRequest } from "@/lib/auth";
import prismadb from "@/lib/prismadb";
import { NextResponse } from "next/server";

export async function PATCH(req: Request, props: { params: Promise<{ taskId: string }> }) {
  const params = await props.params;
  try {
    const {user} = await validateRequest();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { scheduleDate } = await req.json();
    if (!scheduleDate) {
      return new NextResponse("Schedule date is required", { status: 400 });
    }

    const task = await prismadb.task.findUnique({
      where: { id: params.taskId },
    });

    if (!task) {
      return new NextResponse("Task not found", { status: 404 });
    }

    if (task.organizationId !== user.organizations[0].id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const updatedTask = await prismadb.task.update({
      where: { id: params.taskId },
      data: { scheduleDate: new Date(scheduleDate) },
    });

    return NextResponse.json({ success: true, data: updatedTask });
  } catch (error) {
    console.error("[TASK_UPDATE_SCHEDULE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 