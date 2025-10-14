import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import { validateRequest } from "@/lib/auth";
import { sendDiscordNotification } from "@/service/discord-notify";

export async function GET() {
  try {
    const items = await prismadb.roadmapItem.findMany({
      orderBy: {
        votes: 'desc'
      }
    });

    return NextResponse.json(items);
  } catch (error) {
    console.log('[ROADMAP_GET]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { user } = await validateRequest();

    if (!user?.isSuperAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await req.json();
    const { feature, status, priority, description, implementationDate, assignee, expectedDeliveryDate } = body;

    if (!user?.isAdmin) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!feature || !status || !description) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const roadmapItem = await prismadb.roadmapItem.create({
      data: {
        feature,
        status,
        priority: priority || 'MEDIUM',
        description,
        implementationDate: implementationDate ? new Date(implementationDate) : null,
        assignee: assignee || null,
        expectedDeliveryDate: expectedDeliveryDate ? new Date(expectedDeliveryDate) : null,
      }
    });

    // Update Discord notification
    const discordMessage = `
🆕 **New Roadmap Item Added**

📝 **Feature:** ${feature}
🔄 **Status:** ${status}
🎯 **Priority:** ${priority || 'MEDIUM'}
📋 **Description:** ${description}
`;

    await sendDiscordNotification(discordMessage, process.env.DISCORD_ROADMAP_UPDATE_WEBHOOK_URL);

    return NextResponse.json(roadmapItem);
  } catch (error) {
    console.log('[ROADMAP_POST]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { user } = await validateRequest();

    if (!user?.isSuperAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { id, feature, status, priority, description, implementationDate, assignee, expectedDeliveryDate } = body;

    if (!id) {
      return new NextResponse("Missing id", { status: 400 });
    }

    // Get the current item to compare changes
    const currentItem = await prismadb.roadmapItem.findUnique({
      where: { id }
    });

    if (!currentItem) {
      return new NextResponse("Item not found", { status: 404 });
    }

    // Build update data based on provided fields
    const updateData: any = {};
    if (feature) updateData.feature = feature;
    if (status) updateData.status = status;
    if (priority) updateData.priority = priority;
    if (description) updateData.description = description;
    if (implementationDate !== undefined) {
      updateData.implementationDate = implementationDate ? new Date(implementationDate) : null;
    }
    if (assignee && assignee !== currentItem.assignee) {
      updateData.assignee = assignee;
    }
    if (expectedDeliveryDate !== undefined && expectedDeliveryDate !== currentItem.expectedDeliveryDate?.toISOString()) {
      updateData.expectedDeliveryDate = expectedDeliveryDate ? new Date(expectedDeliveryDate) : null;
    }

    const roadmapItem = await prismadb.roadmapItem.update({
      where: { id },
      data: updateData
    });

    // Prepare Discord notification for update
    let changes = [];
    if (status && status !== currentItem.status) {
      const emoji = getStatusEmoji(status);
      changes.push(`${emoji} **Status:** ${currentItem.status} ➔ ${status}`);
    }
    if (priority && priority !== currentItem.priority) {
      changes.push(`🎯 **Priority:** ${currentItem.priority} ➔ ${priority}`);
    }
    if (feature && feature !== currentItem.feature) {
      changes.push(`📝 **Feature:** ${currentItem.feature} ➔ ${feature}`);
    }
    if (description && description !== currentItem.description) {
      changes.push(`📋 **Description Updated**`);
    }
    if (implementationDate !== undefined && implementationDate !== currentItem.implementationDate?.toISOString()) {
      changes.push(`**Implementation Date:** ${currentItem.implementationDate?.toLocaleDateString() || 'None'} ➔ ${implementationDate ? new Date(implementationDate).toLocaleDateString() : 'None'}`);
    }
    if (assignee && assignee !== currentItem.assignee) {
      changes.push(`**Assignee:** ${currentItem.assignee || 'None'} ➔ ${assignee}`);
    }
    if (expectedDeliveryDate !== undefined && expectedDeliveryDate !== currentItem.expectedDeliveryDate?.toISOString()) {
      changes.push(`**Expected Delivery:** ${currentItem.expectedDeliveryDate?.toLocaleDateString() || 'None'} ➔ ${expectedDeliveryDate ? new Date(expectedDeliveryDate).toLocaleDateString() : 'None'}`);
    }

    // Only send Discord notification for status changes
    if (changes.length > 0 && (status !== currentItem.status || feature !== currentItem.feature)) {
      const discordMessage = `
🔄 **Roadmap Item Updated**

📝 **Feature:** ${currentItem.feature}
${changes.join('\n')}
`;

      await sendDiscordNotification(discordMessage, process.env.DISCORD_ROADMAP_UPDATE_WEBHOOK_URL);
    }

    return NextResponse.json(roadmapItem);
  } catch (error) {
    console.log('[ROADMAP_PATCH]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { user } = await validateRequest();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!user?.isSuperAdmin) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!id) {
      return new NextResponse("Missing id", { status: 400 });
    }

    // Get the item before deleting it
    const item = await prismadb.roadmapItem.findUnique({
      where: { id }
    });

    if (!item) {
      return new NextResponse("Item not found", { status: 404 });
    }

    const roadmapItem = await prismadb.roadmapItem.delete({
      where: { id }
    });

    // Update Discord notification
    const discordMessage = `
❌ **Roadmap Item Removed**

📝 **Feature:** ${item.feature}
🔄 **Status:** ${item.status}
🎯 **Priority:** ${item.priority}
`;

    await sendDiscordNotification(discordMessage, process.env.DISCORD_ROADMAP_UPDATE_WEBHOOK_URL);

    return NextResponse.json(roadmapItem);
  } catch (error) {
    console.log('[ROADMAP_DELETE]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

function getStatusEmoji(status: string) {
  switch (status) {
    case 'COMPLETED':
      return '✅';
    case 'IN_PROGRESS':
      return '🚀';
    case 'PLANNED':
      return '📅';
    case 'ALPHA':
      return '🔬';
    case 'BETA':
      return '🧪';
    default:
      return '🔄';
  }
} 