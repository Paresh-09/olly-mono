// types/link-shortener.ts

export interface LinkData {
    id: string;
    originalUrl: string;
    shortCode: string;
    createdAt: Date;
    totalClicks: number;
    userId?: string;
  }
  
  export interface LinkAnalytics {
    totalClicks: number;
    uniqueVisitors: number;
    topReferrers: Array<{
      source: string;
      clicks: number;
    }>;
    clicksByDevice: Array<{
      device: 'mobile' | 'desktop' | 'tablet';
      clicks: number;
    }>;
    clicksByCountry: Array<{
      country: string;
      clicks: number;
    }>;
  }
  
  export interface CreateLinkRequest {
    originalUrl: string;
    customAlias?: string;
    expirationDate?: Date;
  }
  
  export interface CreateLinkResponse {
    shortUrl: string;
    originalUrl: string;
    shortCode: string;
    createdAt: Date;
  }
  
  export interface LinkClickData {
    shortCode: string;
    timestamp: Date;
    ipAddress: string;
    userAgent: string;
    country: string;
    device: 'mobile' | 'desktop' | 'tablet';
    referrer: string;
  }