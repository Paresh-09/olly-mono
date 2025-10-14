import { NextRequest, NextResponse } from 'next/server';
import prismadb from '@/lib/prismadb';
import { RedeemCodeStatus } from '@prisma/client';
import { validateRequest } from '@/lib/auth';

/**
 * API route to expire redeem codes that have passed their validity date
 */
export async function POST(req: NextRequest) {
  try {
    // Validate the request to ensure only admins can expire codes
    const { user } = await validateRequest();
    if (!user || (!user.isAdmin && !user.isSuperAdmin)) {
      return NextResponse.json({ 
        success: false, 
        error: "Unauthorized. Only admins can expire redeem codes." 
      }, { status: 403 });
    }

    // Get current date
    const now = new Date();

    // Find batches that have expired
    const expiredBatches = await prismadb.redeemCodeBatch.findMany({
      where: {
        validity: {
          lt: now
        }
      },
      include: {
        codes: {
          where: {
            status: RedeemCodeStatus.ACTIVE
          }
        }
      }
    });

    if (expiredBatches.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: "No expired batches found",
        expiredCount: 0
      });
    }

    // Update all active codes in expired batches to EXPIRED status
    let totalExpired = 0;
    for (const batch of expiredBatches) {
      if (batch.codes.length > 0) {
        const result = await prismadb.redeemCode.updateMany({
          where: {
            batchId: batch.id,
            status: RedeemCodeStatus.ACTIVE
          },
          data: {
            status: RedeemCodeStatus.EXPIRED
          }
        });
        totalExpired += result.count;
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Successfully expired ${totalExpired} redeem codes from ${expiredBatches.length} batches`,
      expiredCount: totalExpired,
      batchCount: expiredBatches.length
    });
  } catch (error) {
    console.error('Error expiring redeem codes:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'An error occurred while expiring redeem codes'
    }, { status: 500 });
  }
} 