export const platformUrlPatterns = {
    instagram: /instagram\.com\/[a-zA-Z0-9_\.]+/,
    tiktok: /tiktok\.com\/@[a-zA-Z0-9_\.]+/,
    linkedin: /linkedin\.com\/in\/[a-zA-Z0-9_\-\.]+/
  };
  
  export function validateProfileUrl(platform: string, url: string): boolean {
    const pattern = platformUrlPatterns[platform as keyof typeof platformUrlPatterns];
    return pattern ? pattern.test(url) : false;
  }