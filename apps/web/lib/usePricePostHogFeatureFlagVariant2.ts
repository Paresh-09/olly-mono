import { useFeatureFlagVariantKey, usePostHog } from 'posthog-js/react';

export function usePostHogFeatureFlagVariant(featureFlagName: string): string {
  const posthog = usePostHog();

  const variant = useFeatureFlagVariantKey("button_price_testing");

  if (typeof variant === 'string') {
    return variant;
  } else {
    return '';
  }
}
