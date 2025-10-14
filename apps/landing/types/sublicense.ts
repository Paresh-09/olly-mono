// @/types/sublicense.ts
export interface SubLicenseGoal {
  id: string;
  description: string;
}

export interface AssignedUser {
  id: string;
  email: string;
}

export interface SubLicense {
  id: string;
  key: string;
  status: string;
  activationCount: number;
  createdAt: Date;
  updatedAt: Date;
  mainLicenseKeyId: string;
  vendor: string | null;
  converted_to_team: boolean | null;
  originalLicenseKey: string | null;
  deactivatedAt: Date | null;
  assignedUserId: string | null;
  assignedEmail: string | null;
  assignedUser?: AssignedUser;
  subLicenseGoals?: SubLicenseGoal[];
}
