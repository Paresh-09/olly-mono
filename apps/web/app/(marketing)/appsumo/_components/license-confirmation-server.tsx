import { ExtendedUser } from "@/lib/auth";
import LicenseConfirmationClient from "./license-confirmation-client";

interface Props {
  user: ExtendedUser;
  licenseData: {
    license_key: string;
    status: string;
    scopes: string[];
    accessToken?: string;
  };
}

export default function LicenseConfirmation({ user, licenseData }: Props) {
  return (
    <LicenseConfirmationClient
      userEmail={user.email}
      userName={user.username || user.email.split('@')[0]}
      licenseKey={licenseData.license_key}
      accessToken={licenseData.accessToken}
    />
  );
}