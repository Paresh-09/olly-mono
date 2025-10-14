import { SubLicense } from "@repo/db";

export type UserRole = "OWNER" | "ADMIN" | "MEMBER";

export interface Credit {
  balance: number;
}

export interface User {
  id: string;
  email: string;
  username: string;
  credit: Credit | null;
}

export interface OrganizationUser {
  id: string;
  role: UserRole;
  user: User;
  organizationId: string;
  userId: string;
  assignedAt: Date;
}

export interface ExtendedUser extends User {
  sublicenses?: SubLicense[];
}

export interface ExtendedOrganizationUser
  extends Omit<OrganizationUser, "user"> {
  user: ExtendedUser;
}

export interface TransferLog {
  id: string;
  fromUserEmail: string;
  toUserEmail: string;
  amount: number;
  transferredByEmail: string;
  createdAt: string;
}

export interface TransferCreditsFormData {
  fromUserId: string;
  toUserId: string;
  amount: number;
}
