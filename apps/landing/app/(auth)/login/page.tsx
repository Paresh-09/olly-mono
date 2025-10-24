import { validateRequest } from "@/lib/auth";
import { redirect } from "next/navigation";
import LoginForm from "../_components/login-form";
import { Metadata } from "next";
import { generateTemporaryTokenForExtension } from "@/lib/actions/extension-auth";
import prismadb from "@/lib/prismadb";
import Link from "next/link";
import { Button } from "@repo/ui/components/ui/button";

export default async function Page(
  props: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
  }
) {
  const searchParams = await props.searchParams;
  const { user } = await validateRequest();
  const redirectUrl = searchParams.redirect_url as string;
  const extension = searchParams.isExtensionLogin;
  const isExtensionLogin = extension === "true";

  // If not logged in, show login form
  if (!user) {
    return <LoginForm />;
  }

  // If it's not an extension login, redirect to dashboard
  if (!isExtensionLogin) {
    redirect("/dashboard");
  }

  // Handle extension login
  // Get user's license keys
  const userLicenseKeys = await prismadb.userLicenseKey.findMany({
    where: { userId: user.id },
    include: { licenseKey: true },
  });

  // Get user's sublicenses
  const userSubLicenses = await prismadb.subLicense.findMany({
    where: { 
      assignedEmail: user.email,
      status: "ACTIVE" 
    },
    select: {
      id: true,
      key: true,
      status: true,
      mainLicenseKeyId: true,
      mainLicenseKey: {
        select: {
          key: true,
          vendor: true,
          tier: true,
        },
      },
    },
  });

  const userApiKey = await prismadb.userApiKey.findFirst({
    where: { userId: user.id },
    include: { apiKey: true },
  });

  // Generate a temporary token for the user
  const authCode = await generateTemporaryTokenForExtension(
    userSubLicenses[0]?.mainLicenseKeyId || null,
    userApiKey?.apiKeyId || null,
    userSubLicenses[0]?.id || null,
    user.id
  );

  // Always redirect to license selection page with the auth code
  const redirectParams = new URLSearchParams({
    apiKeyId: userApiKey?.apiKeyId || "",
    ...(redirectUrl && { redirect_url: redirectUrl }),
    isExtensionLogin: String(isExtensionLogin),
    code: authCode,
    isFreePlan: String(!userLicenseKeys.length && !userSubLicenses.length)
  });
  redirect(`/login/extension-select-license?${redirectParams.toString()}`);
}
