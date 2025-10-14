import prismadb from '@/lib/prismadb';
import { NextRequest, NextResponse } from 'next/server';
import { validateRequest } from "@/lib/auth";

export async function GET(request: NextRequest) {
  // Check if the user is an admin
  const { user } = await validateRequest();
  if (!user || !user.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const skip = (page - 1) * limit;

  try {
    const activations = await prismadb.activation.groupBy({
      by: ['licenseKeyId'],
      _count: {
        licenseKeyId: true,
      },
      orderBy: {
        _count: {
          licenseKeyId: 'desc',
        },
      },
      skip,
      take: limit,
    });

    const total = await prismadb.activation.groupBy({
      by: ['licenseKeyId'],
      _count: {
        licenseKeyId: true,
      },
    });

    const activationsWithDetails = await Promise.all(
      activations.map(async (activation) => {
        const licenseKey = await prismadb.licenseKey.findUnique({
          where: { id: activation.licenseKeyId },
          include: { users: { include: { user: true } } },
        });

        if (!licenseKey) {
          return null;
        }

        return {
          licenseKey: licenseKey.key || 'N/A',
          email: licenseKey.users[0]?.user?.email || 'N/A',
          activationCount: activation._count.licenseKeyId,
        };
      })
    );

    const validActivations = activationsWithDetails.filter((activation): activation is NonNullable<typeof activation> => activation !== null);

    return NextResponse.json({
      activations: validActivations,
      total: total.length,
    });
  } catch (error) {
    console.error('Error fetching license activations:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}