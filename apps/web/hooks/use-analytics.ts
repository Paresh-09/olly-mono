import { usePostHog } from 'posthog-js/react';

type Properties = Record<string, any>;

type PlanType = 'lifetime' | 'monthly' | 'free';
type PricingAction = 'view' | 'select' | 'slider_change' | 'purchase_click';

interface PricingEventProperties extends Properties {
  planName: string;
  planType?: PlanType; // Made optional
  price: string | number;
  numberOfUsers: number;
  pricePerUser: string | number;
  credits: number;
  action: PricingAction;
  location: string;
}

interface NavigationEventProperties extends Properties {
  linkName: string;
  linkHref: string;
  isExternal?: boolean;
  section?: string;
}

interface AuthEventProperties extends Properties {
  authStatus: 'logged_in' | 'logged_out';
  destination: string;
}

interface CTAEventProperties extends Properties {
  buttonType: string;
  variant?: string;
  price?: number;
  subscriptionType?: 'lifetime' | 'monthly' | 'free';
  location?: string;
}

interface VideoEventProperties extends Properties {
  videoId: string;
  videoTitle?: string;
  location: string;
  action: 'play' | 'close';
}

interface AnalyticsHook {
  trackEvent: (eventName: string, properties?: Properties) => void;
  trackButtonClick: (buttonName: string, additionalProperties?: Properties) => void;
  trackNavigation: (properties: NavigationEventProperties) => void;
  trackAuth: (properties: AuthEventProperties) => void;
  trackCTAClick: (properties: CTAEventProperties) => void;
  trackVideoInteraction: (properties: VideoEventProperties) => void;
  trackPricingInteraction: (properties: PricingEventProperties) => void;
}

export const useAnalytics = (): AnalyticsHook => {
  const posthog = usePostHog();

  const trackEvent = (eventName: string, properties: Properties = {}) => {
    try {
      posthog.capture(eventName, {
        timestamp: new Date().toISOString(),
        ...properties
      });
    } catch (error) {
      console.error('Failed to track event:', error);
    }
  };

  const trackButtonClick = (buttonName: string, additionalProperties: Properties = {}) => {
    trackEvent(`${buttonName} Clicked`, {
      buttonName,
      ...additionalProperties
    });
  };

  const trackPricingInteraction = (properties: PricingEventProperties) => {
    trackEvent('Pricing Interaction', properties);
  };

  const trackNavigation = (properties: NavigationEventProperties) => {
    trackEvent('Navigation Clicked', properties);
  };

  const trackAuth = (properties: AuthEventProperties) => {
    trackEvent('Auth Navigation', properties);
  };

  const trackCTAClick = (properties: CTAEventProperties) => {
    trackEvent('CTA Clicked', properties);
  };

  const trackVideoInteraction = (properties: VideoEventProperties) => {
    trackEvent('Video Interaction', properties);
  };

  return {
    trackEvent,
    trackButtonClick,
    trackNavigation,
    trackAuth,
    trackCTAClick,
    trackVideoInteraction,
    trackPricingInteraction
  };
};