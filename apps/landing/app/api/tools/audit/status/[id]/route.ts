import prismadb from "@/lib/prismadb"; 
import { AuditStatus } from "@repo/db"; 
import { NextResponse } from "next/server";

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const { id } = params;
    if (!id) {
      return NextResponse.json({ error: "Job Id is required" }, { status: 400 });
    }
    
    const audit = await prismadb.auditProfileData.findUnique({
      where: { id },
      include: {
        auditResult: true
      }
    });
    
    if (!audit) {
      return NextResponse.json({ error: "Audit not found" }, { status: 404 });
    }
    
    // If completed and has audit results, return the full data
    if (audit.auditStatus === AuditStatus.COMPLETED && audit.auditResult) {
      return NextResponse.json({
        success: true,
        status: 'COMPLETED',
        data: {
          profile: {
            id: audit.id,
            userId: audit.userId,
            platform: audit.platform,
            profileUrl: audit.profileUrl,
            profileUsername: audit.profileUsername,
            profileName: audit.profileName,
            createdAt: audit.createdAt,
            updatedAt: audit.updatedAt,
          },
          audit: audit.auditResult,
          isAnonymous: audit.userId === null,
          reportId: audit.id
        }
      });
    }
    
    return NextResponse.json({
      success: true,
      status: audit.auditStatus || AuditStatus.PROCESSING,
      message: getStatusMessage(audit.auditStatus)
    });
  } catch (error) {
    console.error("Error checking audit status:", error);
    return NextResponse.json(
      { error: "Failed to check audit status" },
      { status: 500 }
    );
  }
}

function getStatusMessage(status: AuditStatus | null) {
  switch (status) {
    case AuditStatus.PROCESSING:
      return "Your audit is currently being processed. This may take a few minutes.";
    case AuditStatus.COMPLETED:
      return "Your audit is complete.";
    case AuditStatus.ERROR:
      return "There was an error processing your audit. Please try again.";
    default:
      return "Your audit is being processed.";
  }
}