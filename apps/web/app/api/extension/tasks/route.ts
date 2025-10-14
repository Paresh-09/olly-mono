import { NextResponse } from "next/server";
import { validateRequest } from "@/lib/auth";
import prismadb from "@/lib/prismadb";

export async function POST(req: Request) {
  try {
    const { user } = await validateRequest();

    if (!user) {
      return NextResponse.json({
        success: false,
        error: "Unauthorized"
      }, { status: 401 });
    }

    const body = await req.json();
    const {
      userId,
      licenseKey,
      taskType,
      description,
      context,
      scheduleDate,
      platform,
      status,
    } = body;

    // Validate license key
    const licenseKeyRecord = await prismadb.licenseKey.findUnique({
      where: { key: licenseKey },
    });

    if (!licenseKeyRecord) {
      return NextResponse.json({
        success: false,
        error: "Invalid license key"
      }, { status: 400 });
    }

    // Get AI-enhanced description
    const aiResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/extension/tasks/ai`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': req.headers.get('cookie') || '',
      },
      body: JSON.stringify({
        description,
        context,
        platform,
        taskType,
      }),
    });

    const aiData = await aiResponse.json();

    // Map incoming taskType to enum value
    const validTaskTypes = ["REMINDER", "POST_SCHEDULE", "COMMENT_SCHEDULE", "CUSTOM"];
    let mappedTaskType = taskType === "POST" ? "POST_SCHEDULE" : taskType.toUpperCase();
    
    if (!validTaskTypes.includes(mappedTaskType)) {
      mappedTaskType = "CUSTOM";
    }

    // Create task with all fields
    const task = await prismadb.task.create({
      data: {
        userId: user.id,
        licenseKeyId: licenseKeyRecord.id,
        taskType: mappedTaskType,
        description: description, // Original description
        context: context, // Store original context
        aiTaskOutput: aiData.data.description, // Store AI generated content
        scheduleDate: new Date(scheduleDate),
        platform,
        status: "SCHEDULED",
        metadata: {
          ...aiData.data.context,
          ...aiData.data.metadata,
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: task
    });
  } catch (error) {
    console.error("[TASKS_POST]", error);
    return NextResponse.json({
      success: false,
      error: "Internal error"
    }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { user } = await validateRequest();

    if (!user) {
      return NextResponse.json({
        success: false,
        error: "Unauthorized"
      }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const platform = searchParams.get("platform");

    let where: any = {
      userId: user.id,
    };

    if (status) {
      switch (status) {
        case 'OPEN':
          where.status = {
            in: ['SCHEDULED', 'IN_PROGRESS']
          };
          break;
        case 'PENDING':
          where.status = 'SCHEDULED';
          break;
        case 'ALL_STATUSES':
          break;
        default:
          where.status = status;
      }
    }

    if (platform && platform !== "all") {
      where.platform = platform;
    }

    const tasks = await prismadb.task.findMany({
      where,
      orderBy: {
        scheduleDate: "asc",
      },
      select: {
        id: true,
        taskType: true,
        description: true,
        context: true,
        aiTaskOutput: true,
        scheduleDate: true,
        platform: true,
        status: true,
        metadata: true,
        createdAt: true,
        updatedAt: true,
        assignedToId: true,
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: tasks
    });
  } catch (error) {
    console.error("[TASKS_GET]", error);
    return NextResponse.json({
      success: false,
      error: "Internal error"
    }, { status: 500 });
  }
} 