'use client';

import { useEffect, useState } from 'react';
import { redirectToDashboardAuth } from '@/lib/dashboard-auth';

interface UseAuthReturn {
  isAuthenticated: boolean;
  isLoading: boolean;
  redirectToLogin: () => void;
  redirectToSignup: () => void;
}

export function useDashboardAuth(): UseAuthReturn {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth', {
        method: 'GET',
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setIsAuthenticated(!!data.user);
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const redirectToLogin = () => {
    redirectToDashboardAuth('login');
  };

  const redirectToSignup = () => {
    redirectToDashboardAuth('signup');
  };

  return {
    isAuthenticated,
    isLoading,
    redirectToLogin,
    redirectToSignup,
  };
}