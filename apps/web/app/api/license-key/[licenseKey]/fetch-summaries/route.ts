import prismadb from "@/lib/prismadb";
import { NextRequest, NextResponse } from "next/server";

// Helper function to find license (main or sub)
async function findLicense(licenseKey: string) {
    // First try to find as main license
    let license = await prismadb.licenseKey.findUnique({
        where: { key: licenseKey },
        select: {
            id: true,
            key: true,
        }
    });

    if (license) {
        return { license, isSubLicense: false };
    }

    // If not found as main license, try to find as sub-license
    const subLicense = await prismadb.subLicense.findUnique({
        where: { key: licenseKey },
        select: {
            id: true,
            key: true,
            status: true,
            mainLicenseKeyId: true,
            mainLicenseKey: {
                select: {
                    id: true,
                    key: true,
                }
            }
        }
    });

    if (subLicense && subLicense.status === 'ACTIVE') {
        return {
            license: {
                id: subLicense.mainLicenseKey.id, // Use main license ID for custom knowledge lookup
                key: subLicense.key,
                subLicenseId: subLicense.id
            },
            isSubLicense: true
        };
    }

    return null;
}

export async function GET(request: NextRequest, props: { params: Promise<{ licenseKey: string }> }) {
    const params = await props.params;
    try {
        const { licenseKey } = params;

        // Find the license (main or sub)
        const result = await findLicense(licenseKey);

        if (!result) {
            return NextResponse.json({ error: 'License key not found' }, { status: 404 });
        }

        const { license } = result;

        // Get the custom knowledge and include summaries
        const customKnowledge = await prismadb.licenseKeyCustomKnowledge.findUnique({
            where: { licenseKeyId: license.id },
            include: {
                knowledgeSummaries: {
                    orderBy: { createdAt: 'desc' },
                    select: {
                        id: true,
                        summary: true,
                        createdAt: true
                    }
                }
            }
        });

        // If no custom knowledge exists yet, return empty array instead of error
        if (!customKnowledge) {
            return NextResponse.json([], {
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Return just the summaries array
        return NextResponse.json(customKnowledge.knowledgeSummaries, {
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('Error fetching summary history:', error);
        return NextResponse.json(
            { error: "Error fetching summary history" },
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            }
        );
    }
}