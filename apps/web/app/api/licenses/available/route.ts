import { getUserLicenses } from "@/lib/actions/subLicenseActions";
import { validateRequest } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const { user } = await validateRequest();

  if (!user) {
    return NextResponse.json({ error: "User ID is required" }, { status: 403 });
  }

  const result = await getUserLicenses(user.id);

  if ("error" in result) {
    console.error(result.error);
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  // Parse the licenses from the success string
  const licenses = JSON.parse(result.success);

  return NextResponse.json({ licenses });
}
