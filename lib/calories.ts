import type { ActivityLevel, Goal, Profile } from '@/types';

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  moderate: 1.55,
  active: 1.725,
};

/** Mifflin-St Jeor BMR with goal adjustment */
export function calculateDailyCalorieTarget(profile: Pick<
  Profile,
  'weight_kg' | 'height_cm' | 'age' | 'gender' | 'activity_level' | 'goal'
>): number {
  const weight = profile.weight_kg ?? 70;
  const height = profile.height_cm ?? 170;
  const age = profile.age ?? 25;
  const isMale = (profile.gender ?? 'male').toLowerCase() === 'male';

  const bmr = isMale
    ? 10 * weight + 6.25 * height - 5 * age + 5
    : 10 * weight + 6.25 * height - 5 * age - 161;

  const tdee = bmr * ACTIVITY_MULTIPLIERS[profile.activity_level ?? 'moderate'];

  switch (profile.goal ?? 'maintain') {
    case 'lose_weight':
      return Math.round(tdee - 500);
    case 'gain_muscle':
      return Math.round(tdee + 300);
    case 'maintain':
    default:
      return Math.round(tdee);
  }
}
