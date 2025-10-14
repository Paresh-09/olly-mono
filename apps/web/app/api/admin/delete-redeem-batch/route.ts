import { NextRequest, NextResponse } from 'next/server';
import prismadb from '@/lib/prismadb';
import { validateRequest } from '@/lib/auth';

/**
 * API route to delete a redeem code batch and all its associated codes
 */
export async function DELETE(req: NextRequest) {
  try {
    // Validate the request to ensure only admins can delete batches
    const { user } = await validateRequest();
    if (!user || (!user.isAdmin && !user.isSuperAdmin)) {
      return NextResponse.json({ 
        success: false, 
        error: "Unauthorized. Only admins can delete redeem code batches." 
      }, { status: 403 });
    }

    // Get the batch ID from the URL
    const { searchParams } = new URL(req.url);
    const batchId = searchParams.get('batchId');

    if (!batchId) {
      return NextResponse.json({ 
        success: false, 
        error: "Missing batch ID" 
      }, { status: 400 });
    }

    // Check if the batch exists
    const batch = await prismadb.redeemCodeBatch.findUnique({
      where: { id: batchId },
      include: { codes: true }
    });

    if (!batch) {
      return NextResponse.json({ 
        success: false, 
        error: "Batch not found" 
      }, { status: 404 });
    }

    // Delete the batch and all its codes in a transaction
    await prismadb.$transaction(async (prisma) => {
      // First, delete all redeem codes in the batch
      await prisma.redeemCode.deleteMany({
        where: { batchId }
      });

      // Then delete the batch itself
      await prisma.redeemCodeBatch.delete({
        where: { id: batchId }
      });
    });

    return NextResponse.json({ 
      success: true, 
      message: `Successfully deleted batch "${batch.name}" with ${batch.codes.length} codes`
    });
  } catch (error) {
    console.error('Error deleting redeem code batch:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'An error occurred while deleting the redeem code batch'
    }, { status: 500 });
  }
} 