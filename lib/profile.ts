import { supabase } from '@/lib/supabase';
import type { OnboardingData, Profile } from '@/types';

export async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.error('fetchProfile error:', error.message);
    return null;
  }

  if (!data) return null;

  return { ...data, allergies: data.allergies ?? [] } as Profile;
}

export async function upsertProfile(
  userId: string,
  onboarding: OnboardingData
): Promise<{ error: string | null }> {
  if (
    !onboarding.goal ||
    !onboarding.gender ||
    onboarding.age == null ||
    onboarding.weight_kg == null ||
    onboarding.height_cm == null ||
    !onboarding.activity_level ||
    !onboarding.diet_type ||
    onboarding.budget_weekly_eur == null ||
    !onboarding.country ||
    !onboarding.city
  ) {
    return { error: 'Incomplete onboarding data' };
  }

  const allergies =
    onboarding.allergies.includes('none') || onboarding.allergies.length === 0
      ? ['none']
      : onboarding.allergies.filter((a) => a !== 'none');

  const { error } = await supabase.from('profiles').upsert({
    id: userId,
    goal: onboarding.goal,
    gender: onboarding.gender,
    age: onboarding.age,
    weight_kg: onboarding.weight_kg,
    height_cm: onboarding.height_cm,
    activity_level: onboarding.activity_level,
    diet_type: onboarding.diet_type,
    allergies,
    budget_weekly_eur: onboarding.budget_weekly_eur,
    country: onboarding.country,
    city: onboarding.city,
  });

  return { error: error?.message ?? null };
}
