import { validateRequest } from "@/lib/auth";
import { redirect } from "next/navigation";
import prismadb from "@/lib/prismadb";
import ActivationSteps from "../../_components/activation-steps";

export default async function SetupPage() {
  const { user } = await validateRequest();
  if (!user) {
    return redirect("/login");
  }

  const userLicense = await prismadb.userLicenseKey.findFirst({
    where: { userId: user.id },
    include: { licenseKey: true }
  });

  let licenseKey = userLicense?.licenseKey.key;

  if (!licenseKey) {
    // If no user license is found, check for sub-licenses assigned to user ID
    const subLicenseByUserId = await prismadb.subLicense.findFirst({
      where: { assignedUserId: user.id },
    });

    licenseKey = subLicenseByUserId?.key;
  }

  if (!licenseKey && user.email) {
    // If still no license is found, check for sub-licenses assigned to user's email
    const subLicenseByEmail = await prismadb.subLicense.findFirst({
      where: { assignedEmail: user.email },
    });

    licenseKey = subLicenseByEmail?.key;
  }

  // if (!licenseKey) {
  //   return redirect("/dashboard");
  // }

  return (
    <div className="container mx-auto px-4 py-8">
      <ActivationSteps activationKey={licenseKey || "You don't have a key. Please check dashboard just in case."} />
    </div>
  );
}