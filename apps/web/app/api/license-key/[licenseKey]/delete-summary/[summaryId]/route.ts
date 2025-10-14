import prismadb from "@/lib/prismadb";
import { NextRequest, NextResponse } from "next/server";
import { validateRequest } from "@/lib/auth";

export async function DELETE(
    request: NextRequest,
    props: { params: Promise<{ licenseKey: string; summaryId: string }> }
) {
    const params = await props.params;
    try {
        const { user } = await validateRequest();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { licenseKey, summaryId } = params;

        if (!licenseKey || !summaryId) {
            return NextResponse.json({ error: "License key and summary ID are required" }, { status: 400 });
        }

        // Try main license key
        let license = await prismadb.licenseKey.findUnique({
            where: { key: licenseKey },
            include: { customKnowledge: true }
        });

        // Fallback to sub-license if not found
        if (!license) {
            const subLicense = await prismadb.subLicense.findUnique({
                where: { key: licenseKey },
                include: {
                    mainLicenseKey: {
                        include: { customKnowledge: true }
                    }
                }
            });

            if (!subLicense || !subLicense.mainLicenseKey) {
                return NextResponse.json({ error: "License key not found" }, { status: 404 });
            }

            license = subLicense.mainLicenseKey;
        }

        // Check ownership
        const userLicense = await prismadb.userLicenseKey.findFirst({
            where: {
                licenseKeyId: license.id,
                userId: user.id
            }
        });

        const subLicense = !userLicense
            ? await prismadb.subLicense.findFirst({
                where: {
                    key: licenseKey,
                    assignedUserId: user.id,
                    status: "ACTIVE"
                }
            })
            : null;

        if (!userLicense && !subLicense) {
            return NextResponse.json({ error: "Not authorized to access this license key" }, { status: 403 });
        }

        // No custom knowledge found
        if (!license.customKnowledge) {
            return NextResponse.json({ error: "No custom knowledge found for this license" }, { status: 404 });
        }

        // Confirm summary belongs to this license's custom knowledge
        const summary = await prismadb.licenseKeyKnowledgeSummary.findFirst({
            where: {
                id: summaryId,
                licenseKeyCustomKnowledgeId: license.customKnowledge.id
            }
        });

        if (!summary) {
            return NextResponse.json({ error: "Summary not found or doesn't belong to this license" }, { status: 404 });
        }

        // Delete the summary
        await prismadb.licenseKeyKnowledgeSummary.delete({
            where: { id: summaryId }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting summary:", error);
        return NextResponse.json({ error: "Failed to delete summary" }, { status: 500 });
    }
}
