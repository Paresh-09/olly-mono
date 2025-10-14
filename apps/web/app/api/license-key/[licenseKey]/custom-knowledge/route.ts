import { NextRequest, NextResponse } from 'next/server';
import prismadb from '@/lib/prismadb';

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
        return license;
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
        // Return main license info for custom knowledge operations
        return {
            id: subLicense.mainLicenseKey.id,
            key: subLicense.key,
        };
    }

    return null;
}

export async function GET(request: NextRequest, props: { params: Promise<{ licenseKey: string }> }) {
    const params = await props.params;
    const { licenseKey } = params;

    try {
        const license = await findLicense(licenseKey);

        if (!license) {
            return NextResponse.json({ error: 'License key not found' }, { status: 404 });
        }

        const customKnowledge = await prismadb.licenseKeyCustomKnowledge.findUnique({
            where: { licenseKeyId: license.id },
        });

        if (!customKnowledge) {
            return NextResponse.json({});
        }

        return NextResponse.json(customKnowledge);
    } catch (error) {
        console.error('Error fetching custom knowledge:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest, props: { params: Promise<{ licenseKey: string }> }) {
    const params = await props.params;
    const { licenseKey } = params;
    const data = await request.json();

    try {
        const license = await findLicense(licenseKey);

        if (!license) {
            return NextResponse.json({ error: 'License key not found' }, { status: 404 });
        }

        const customKnowledge = await prismadb.licenseKeyCustomKnowledge.upsert({
            where: {
                licenseKeyId: license.id,
            },
            update: {
                ...data,
            },
            create: {
                ...data,
                licenseKeyId: license.id,
            },
        });

        return NextResponse.json(customKnowledge, { status: 201 });
    } catch (error) {
        console.error('Error creating custom knowledge:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest, props: { params: Promise<{ licenseKey: string }> }) {
    const params = await props.params;
    const { licenseKey } = params;
    const data = await request.json();

    try {
        const license = await findLicense(licenseKey);

        if (!license) {
            return NextResponse.json({ error: 'License key not found' }, { status: 404 });
        }

        const customKnowledge = await prismadb.licenseKeyCustomKnowledge.upsert({
            where: { licenseKeyId: license.id },
            update: data,
            create: {
                ...data,
                licenseKeyId: license.id,
            },
        });

        return NextResponse.json(customKnowledge);
    } catch (error) {
        console.error('Error updating custom knowledge:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}