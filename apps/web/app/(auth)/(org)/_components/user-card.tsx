import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@repo/ui/components/ui/card";
import { useRouter } from "next/navigation";
import { UserInfo } from "./user-info";
import { SublicenseSection } from "./sublicense-section";
import { MainLicenseSection } from "./main-license-section";
import { SubLicense } from "@/types/sublicense";
import { ExtendedOrganizationUser, UserRole } from "@/types/orgs";
import { UserCardSkeleton } from "./user-card-skeleton";

export interface MainLicense {
  id: string;
  key: string;
  isActive: boolean;
  tier: number;
}

interface UserCardProps {
  user: ExtendedOrganizationUser;
  onRoleUpdate: (userId: string, newRole: UserRole) => void;
  onRemoveUser: (userId: string) => void;
}

const UserCard: React.FC<UserCardProps> = ({
  user,
  onRoleUpdate,
  onRemoveUser,
}) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [availableSubLicenses, setAvailableSubLicenses] = useState<
    SubLicense[]
  >([]);
  const [mainLicenses, setMainLicenses] = useState<MainLicense[]>([]);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await fetchAvailableSubLicenses();

      if (user.role === "OWNER") {
        const { licenses, error: licenseError } = await fetchUserMainLicenses(
          user.user.id,
        );
        if (licenses) {
          setMainLicenses(licenses);
        }
        if (licenseError) {
          setError(licenseError);
        }
      }

      setIsLoading(false);
    };

    loadData();
  }, [user.role, user.user.id]);

  const fetchAvailableSubLicenses = async () => {
    try {
      const response = await fetch(`/api/sublicenses/available`);
      if (!response.ok) {
        throw new Error("Failed to fetch available licenses");
      }
      const data = await response.json();
      setAvailableSubLicenses(data.sublicenses);
    } catch (error) {
      console.error("Error fetching available licenses:", error);
      setError("Failed to load available licenses");
    }
  };

  const fetchUserMainLicenses = async (userId: string) => {
    try {
      const response = await fetch(`/api/licenses/available`);

      if (!response.ok) {
        throw new Error("Failed to fetch user licenses");
      }

      const data = await response.json();
      return { licenses: data.licenses, error: null };
    } catch (error) {
      console.error("Error fetching user licenses:", error);
      return { licenses: null, error: "Failed to load user licenses" };
    }
  };

  const handleAssignLicense = async (subLicenseId: string) => {
    try {
      setError("");
      const response = await fetch("/api/sublicenses/assign", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subLicenseId,
          email: user.user.email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to assign license");
      }

      // Force a hard refresh to get updated data from server
      window.location.reload();
      return true;
    } catch (error: any) {
      console.error("Error assigning license:", error);
      setError(error.message);
      return false;
    }
  };

  const handleRemoveLicense = async (licenseId: string) => {
    try {
      setError("");
      const response = await fetch("/api/sublicenses/remove", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subLicenseId: licenseId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to remove license");
      }

      // Force a hard refresh to get updated data from server
      window.location.reload();
      return true;
    } catch (error: any) {
      console.error("Error removing license:", error);
      setError(error.message);
      return false;
    }
  };

  const isOwner = user.role === "OWNER";
  const sublicenses = user.user.sublicenses || [];

  if (isLoading) {
    return <UserCardSkeleton />;
  }

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-6 space-y-6">
        <UserInfo
          user={user.user}
          role={user.role}
          isOwner={isOwner}
          onRoleUpdate={(role) => onRoleUpdate(user.user.id, role)}
          onRemoveUser={() => onRemoveUser(user.user.id)}
        />

        {!isOwner ? (
          <SublicenseSection
            sublicenses={sublicenses}
            availableSubLicenses={availableSubLicenses}
            userEmail={user.user.email}
            onAssignLicense={handleAssignLicense}
            onRemoveLicense={handleRemoveLicense}
            error={error}
          />
        ) : (
          <MainLicenseSection
            licenses={mainLicenses}
            userEmail={user.user.email}
            error={error}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default UserCard;
