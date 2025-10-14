// app/api/sublicenses/route.ts
import {
  assignSubLicense,
  removeSubLicenseAssignment,
} from "@/lib/actions/subLicenseActions";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const formData = new FormData();

    // Add required fields to FormData
    Object.entries(body).forEach(([key, value]) => {
      formData.append(key, value as string);
    });

    const result = await assignSubLicense(null, formData);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to assign sublicense" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const formData = new FormData();
    formData.append("subLicenseId", body.subLicenseId);

    const result = await removeSubLicenseAssignment(null, formData);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to remove sublicense" },
      { status: 500 },
    );
  }
}
