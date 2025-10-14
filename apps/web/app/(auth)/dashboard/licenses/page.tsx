import { validateRequest } from "@/lib/auth";
import { redirect } from "next/navigation";
import LicenseManagement from "../_components/license-management";
import { getUserLicenses } from "@/lib/actions/subLicenseActions";

export default async function LicensesPage() {
  const { user } = await validateRequest();
  if (!user) {
    redirect("/login");
  }

  const licensesResult = await getUserLicenses(user.id);
  const licenses = licensesResult.success
    ? JSON.parse(licensesResult.success)
    : [];

  // const orgDetails = await getOrganizationDetails(user.id);

  return <LicenseManagement userId={user.id} initialLicenses={licenses} />;
}
