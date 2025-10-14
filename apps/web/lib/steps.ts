// steps.ts
import { STEPS } from '@/types/onboarding';

export const STEPS_ARRAY = [
  { step: STEPS.WELCOME, label: 'Welcome' },
  { step: STEPS.TEXT_SELECTION, label: 'Usage' },
  { step: STEPS.LICENSE_ACTIVATION, label: 'License' },
  { step: STEPS.LLM_SELECTION, label: 'AI Setup' },
  { step: STEPS.COMPLETION, label: 'Complete' },
];
