// app/api/sublicenses/remove/route.ts
import { removeSubLicenseAssignment } from "@/lib/actions/subLicenseActions";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { subLicenseId } = body;

    const formData = new FormData();
    formData.append("subLicenseId", subLicenseId);

    const result = await removeSubLicenseAssignment(null, formData);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: result.success });
  } catch (error) {
    console.error("Error removing sublicense:", error);
    return NextResponse.json(
      { error: "Failed to remove sublicense" },
      { status: 500 },
    );
  }
}
