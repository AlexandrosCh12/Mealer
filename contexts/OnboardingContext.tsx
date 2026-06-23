import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { OnboardingData } from '@/types';

const INITIAL: OnboardingData = {
  display_name: '',
  goal: null,
  gender: null,
  age: null,
  weight_kg: null,
  height_cm: null,
  activity_level: null,
  diet_type: null,
  allergies: [],
  budget_weekly_eur: null,
  country: null,
  city: null,
};

interface OnboardingContextValue {
  data: OnboardingData;
  step: number;
  totalSteps: number;
  setStep: (step: number) => void;
  update: (partial: Partial<OnboardingData>) => void;
  next: () => void;
  back: () => void;
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export const ONBOARDING_TOTAL_STEPS = 12;

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<OnboardingData>(INITIAL);
  const [step, setStep] = useState(1);

  const update = useCallback((partial: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...partial }));
  }, []);

  const next = useCallback(() => {
    setStep((s) => Math.min(s + 1, ONBOARDING_TOTAL_STEPS));
  }, []);

  const back = useCallback(() => {
    setStep((s) => Math.max(s - 1, 1));
  }, []);

  const value = useMemo(
    () => ({
      data,
      step,
      totalSteps: ONBOARDING_TOTAL_STEPS,
      setStep,
      update,
      next,
      back,
    }),
    [data, step, update, next, back]
  );

  return (
    <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>
  );
}

export function useOnboarding(): OnboardingContextValue {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error('useOnboarding must be used within OnboardingProvider');
  return ctx;
}
