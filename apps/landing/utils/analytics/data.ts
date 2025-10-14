// utils/fetch-initial-data.ts

import prismadb from "@/lib/prismadb";

export async function fetchInitialData(licenseKey: string, startDate: Date, endDate: Date) {
  try {
    const queryParams = new URLSearchParams({
      licenseKey,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    });

    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/analytics/team?${queryParams}`);
    if (!response.ok) throw new Error('Failed to fetch analytics data');
    
    const data = await response.json();
    
    // Ensure each sublicense has the mainLicenseKey property
    const enhancedData = {
      ...data,
      subLicenses: data.subLicenses.map((license: any) => ({
        ...license,
        mainLicenseKey: {
          id: licenseKey,
          tier: license.tier || null,
          vendor: license.vendor || null,
          lemonProductId: license.lemonProductId || null
        }
      }))
    };

    return enhancedData;
  } catch (error) {
    console.error('Error fetching initial data:', error);
    return null;
  }
}