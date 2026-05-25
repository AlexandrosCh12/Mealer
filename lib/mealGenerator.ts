import { calculateDailyCalorieTarget } from '@/lib/calories';
import { filterTemplates, pickMealForSlot } from '@/lib/mealTemplates';
import type { Meal, MealSlot, Profile } from '@/types';

const SLOTS: MealSlot[] = ['breakfast', 'lunch', 'dinner', 'snack'];

export interface GeneratedDayPlan {
  meals: Meal[];
  targetCalories: number;
  actualCalories: number;
}

function totalCalories(meals: Meal[]): number {
  return meals.reduce((sum, m) => sum + m.macros.calories, 0);
}

/** Constraint-based meal plan — TODO: replace with AI/API when ready */
export function generateMealPlan(profile: Profile, maxAttempts = 40): GeneratedDayPlan {
  const pool = filterTemplates(profile.diet_type, profile.allergies ?? []);
  const targetCalories = calculateDailyCalorieTarget(profile);

  let best: Meal[] = [];
  let bestDiff = Infinity;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const meals: Meal[] = [];
    for (const slot of SLOTS) {
      const meal = pickMealForSlot(pool, slot);
      if (meal) meals.push(meal);
    }
    if (meals.length < SLOTS.length) continue;

    const actual = totalCalories(meals);
    const diff = Math.abs(actual - targetCalories);
    if (diff < bestDiff) {
      bestDiff = diff;
      best = meals;
      if (diff <= targetCalories * 0.08) break;
    }
  }

  if (best.length === 0) {
    for (const slot of SLOTS) {
      const meal = pickMealForSlot(pool, slot);
      if (meal) best.push(meal);
    }
  }

  return {
    meals: best,
    targetCalories,
    actualCalories: totalCalories(best),
  };
}

export function swapMeal(
  profile: Profile,
  currentMeals: Meal[],
  slot: MealSlot
): Meal | null {
  const pool = filterTemplates(profile.diet_type, profile.allergies ?? []);
  const excludeIds = currentMeals.map((m) => m.id);
  return pickMealForSlot(pool, slot, excludeIds);
}
