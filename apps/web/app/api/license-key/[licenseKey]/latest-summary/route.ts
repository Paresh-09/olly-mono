import { NextResponse } from "next/server";
import prisma from "@/lib/prismadb";

// Helper function to find license (main or sub)
async function findLicense(licenseKey: string) {
  // First try to find as main license
  let license = await prisma.licenseKey.findUnique({
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
  const subLicense = await prisma.subLicense.findUnique({
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

  if (subLicense && subLicense.status === 'ACTIVE' && subLicense.mainLicenseKey) {
    // Return main license info for summary operations
    return {
      id: subLicense.mainLicenseKey.id,
      key: subLicense.key,
    };
  }

  return null;
}

export async function GET(request: Request, props: { params: Promise<{ licenseKey: string }> }) {
  const params = await props.params;
  try {
    const { licenseKey } = params;

    // Use the helper to find the license (main or sub)
    const license = await findLicense(licenseKey);

    if (!license) {
      return new NextResponse(
        JSON.stringify({ error: "License key not found" }),
        { status: 404 },
      );
    }

    // Now fetch the custom knowledge and latest summary using the found license id
    const licenseKeyData = await prisma.licenseKey.findUnique({
      where: { id: license.id },
      include: {
        customKnowledge: {
          include: {
            knowledgeSummaries: {
              orderBy: {
                createdAt: "desc",
              },
              take: 1,
              select: {
                id: true,
                summary: true,
                createdAt: true,
              },
            },
          },
        },
      },
    });

    if (!licenseKeyData || !licenseKeyData.customKnowledge) {
      return new NextResponse(
        JSON.stringify({
          error: "No custom knowledge found for this license key",
        }),
        { status: 404 },
      );
    }

    // Return just the latest summary if it exists
    const latestSummary =
      licenseKeyData.customKnowledge.knowledgeSummaries[0] || null;

    return new NextResponse(JSON.stringify(latestSummary), { status: 200 });
  } catch (error: any) {
    console.error(`Error fetching latest summary: ${error.message}`);
    return new NextResponse(
      JSON.stringify({ error: "Error fetching latest summary" }),
      { status: 500 },
    );
  }
}

