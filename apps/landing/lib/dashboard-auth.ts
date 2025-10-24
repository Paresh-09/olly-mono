/**
 * Utility functions for redirecting to dashboard for authentication
 */

export function getDashboardAuthUrl(action: 'login' | 'signup', returnUrl?: string): string {
  const dashboardUrl = process.env.DASHBOARD_URL || process.env.NEXT_PUBLIC_DASHBOARD_URL;
  
  if (!dashboardUrl) {
    console.error('DASHBOARD_URL not configured');
    return '/';
  }

  const currentUrl = returnUrl || (typeof window !== 'undefined' ? window.location.href : '');
  const url = new URL(`/${action}`, dashboardUrl);
  
  if (currentUrl) {
    url.searchParams.set('returnUrl', currentUrl);
  }
  
  return url.toString();
}

export function redirectToDashboardAuth(action: 'login' | 'signup', returnUrl?: string): void {
  if (typeof window !== 'undefined') {
    const authUrl = getDashboardAuthUrl(action, returnUrl);
    window.location.href = authUrl;
  }
}

export function getDashboardUrl(): string {
  return process.env.DASHBOARD_URL || process.env.NEXT_PUBLIC_DASHBOARD_URL || '';
}