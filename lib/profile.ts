/**
 * Profile persistence layer — reads and writes user profiles in Supabase.
 *
 * Bridges onboarding data to the `profiles` table. AuthContext calls
 * fetchProfile after login; onboarding calls upsertProfile on completion.
 */
import { supabase } from '@/lib/supabase';
import type { OnboardingData, Profile } from '@/types';

/**
 * Loads a user's profile from Supabase by auth user id.
 *
 * @param userId - Supabase auth user UUID.
 * @returns Profile row or null if missing or on error.
 */
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

/**
 * Saves completed onboarding answers to the profiles table.
 *
 * Validates that all required fields are present before writing.
 * Normalizes allergies: empty or "none" becomes `['none']`.
 *
 * @param userId - Supabase auth user UUID.
 * @param onboarding - Full onboarding form state from OnboardingContext.
 * @returns `{ error: null }` on success, or an error message string.
 */
export async function upsertProfile(
  userId: string,
  onboarding: OnboardingData
): Promise<{ error: string | null }> {
  if (!onboarding.display_name?.trim()) {
    return { error: 'Incomplete onboarding data' };
  }

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

  const { data: upsertData, error } = await supabase
    .from('profiles')
    .upsert(
      {
        id: userId,
        display_name: onboarding.display_name.trim(),
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
      },
      { onConflict: 'id' }
    )
    .select();

  return { error: error?.message ?? null };
}
