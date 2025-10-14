export interface License {
    id: string;
    key: string;
    isActive: boolean;
    expiresAt: Date | null;
  }
  
  export interface UserLicense {
    id: string;
    userId: string;
    licenseKey: License;
  }
  
  export interface LicenseResponse {
    key: string | null;
    hasPremium: boolean;
    error?: string;
  }
  