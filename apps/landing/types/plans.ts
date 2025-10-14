// types/plans.ts

export interface PlanDetails {
    name: string;
    subLicenses: number;
    price: string;
    vendor?: string | null;
    tier?: number;
    isSubLicense?: boolean;
    productId?: number;
  }
  
  export interface UserPlanResponse {
    plan: PlanDetails | null;
    hasPremium: boolean;
  }
  