// app/api/sublicenses/assign/route.ts
import { assignSubLicense } from "@/lib/actions/subLicenseActions";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { subLicenseId, email } = body;

    const formData = new FormData();
    formData.append("subLicenseId", subLicenseId);
    formData.append("email", email);

    const result = await assignSubLicense(null, formData);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: result.success });
  } catch (error) {
    console.error("Error assigning sublicense:", error);
    return NextResponse.json(
      { error: "Failed to assign sublicense" },
      { status: 500 },
    );
  }
}
