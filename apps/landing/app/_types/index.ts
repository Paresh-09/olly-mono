export interface Lead {
  id: string;
  linkedinUrl: string | null;
  firstName: string;
  lastName: string;
  email: string | null;
  title: string | null;
  company: string | null;
  phoneNumber: string | null;
  apolloId: string | null;
  createdAt: string;
  seniority: string | null;
  location: string | null;
  organizationLocation: string | null;
  organizationDomain: string | null;
  organizationSize: string | null;
  emailStatus: string | null;
}

export interface SearchParams {
  person_titles?: string[];
  person_locations?: string[];
  person_seniorities?: string[];
  organization_locations?: string[];
  q_organization_domains_list?: string[];
  contact_email_status?: string[];
  organization_num_employees_ranges?: string[];
  q_keywords?: string;
}

export interface CreditInfo {
  creditsUsed?: number;
  remainingCredits?: number;
  insufficientCredits?: boolean;
  creditCost?: number;
  currentBalance?: number;
} 