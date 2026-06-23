/**
 * Calorie targeting for personalized meal plans.
 *
 * Converts onboarding profile data (weight, height, age, gender, activity,
 * goal) into a daily calorie target. Used by mealGenerator and the Nutrition
 * tab to size meals and macro targets.
 */
import type { ActivityLevel, Goal, Profile } from '@/types';

/** Harris-Benedict activity factors applied to BMR to estimate TDEE. */
const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  moderate: 1.55,
  active: 1.725,
};

/**
 * Calculates the user's daily calorie target using the Mifflin-St Jeor
 * equation, adjusted for their stated goal.
 *
 * Flow: BMR → TDEE (BMR × activity multiplier) → goal adjustment
 * (lose −500 kcal, gain +300 kcal, maintain unchanged).
 *
 * @param profile - User metrics: weight_kg, height_cm, age, gender,
 *   activity_level, and goal. Missing fields use sensible defaults.
 * @returns Target calories per day, rounded to nearest integer.
 */
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

  // Standard deficit/surplus offsets — ~0.5 kg/week loss or modest muscle gain.
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
