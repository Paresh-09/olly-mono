// app/api/sublicenses/available/route.ts
import { NextResponse } from "next/server";
import {
  getSubLicenses,
  getUserLicenses,
} from "@/lib/actions/subLicenseActions";
import { validateRequest } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    // First validate the user
    const { user } = await validateRequest();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all licenses for the user
    const licensesResult = await getUserLicenses(user.id);
    if (licensesResult.error) {
      return NextResponse.json(
        { error: licensesResult.error },
        { status: 400 },
      );
    }

    // Parse the licenses
    const licenses = JSON.parse(licensesResult.success || "[]");

    // Get sublicenses for all active licenses
    const activeLicenses = licenses.filter((license: any) => license.isActive);

    // Fetch sublicenses for each active license
    const allSubLicensesPromises = activeLicenses.map(async (license: any) => {
      const subLicensesResult = await getSubLicenses(license.id);
      if (subLicensesResult.error) {
        console.error(
          `Error fetching sublicenses for license ${license.id}:`,
          subLicensesResult.error,
        );
        return [];
      }
      return JSON.parse(subLicensesResult.success || "[]");
    });

    // Wait for all sublicense fetches to complete
    const allSubLicensesArrays = await Promise.all(allSubLicensesPromises);

    // Flatten all sublicenses into a single array and filter for available ones
    const allSubLicenses = allSubLicensesArrays.flat();
    const availableSubLicenses = allSubLicenses.filter(
      (license: any) => !license.assignedUserId && !license.assignedEmail,
    );

    return NextResponse.json({ sublicenses: availableSubLicenses });
  } catch (error) {
    console.error("Error fetching available sublicenses:", error);
    return NextResponse.json(
      { error: "Failed to fetch available sublicenses" },
      { status: 500 },
    );
  }
}
