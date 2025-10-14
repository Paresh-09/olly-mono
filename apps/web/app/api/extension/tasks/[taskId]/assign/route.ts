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

    const body = await req.json();
    const { assignedToId } = body;

    // Verify that the assigner and assignee are in the same organization
    const organizationUser = await prismadb.organizationUser.findFirst({
      where: {
        userId: user.id,
      },
      include: {
        organization: true,
      },
    });

    if (!organizationUser) {
      return NextResponse.json({
        success: false,
        error: "User not part of any organization"
      }, { status: 400 });
    }

    // If assignedToId is provided, verify the user is in the same organization
    if (assignedToId) {
      const assigneeInOrg = await prismadb.organizationUser.findFirst({
        where: {
          userId: assignedToId,
          organizationId: organizationUser.organizationId,
        },
      });

      if (!assigneeInOrg) {
        return NextResponse.json({
          success: false,
          error: "Assignee not found in organization"
        }, { status: 400 });
      }
    }

    const task = await prismadb.task.update({
      where: {
        id: params.taskId,
        userId: user.id,
      },
      data: {
        assignedToId: assignedToId || null,
        organizationId: organizationUser.organizationId,
      },
      include: {
        assignedTo: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: task
    });
  } catch (error) {
    console.error("[ASSIGN_TASK]", error);
    return NextResponse.json({
      success: false,
      error: "Internal error"
    }, { status: 500 });
  }
} 