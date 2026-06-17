import { calculateDailyCalorieTarget } from '@/lib/calories';
import { filterTemplates, pickMealForSlot } from '@/lib/mealTemplates';
import type { Meal, MealSlot, Profile } from '@/types';

const SLOTS: MealSlot[] = ['breakfast', 'lunch', 'dinner', 'snack'];
const MAX_MEALS = 7;
const GAP_THRESHOLD = 150;
const OVER_TARGET_LIMIT = 1.15;

export interface GeneratedDayPlan {
  meals: Meal[];
  targetCalories: number;
  actualCalories: number;
}

function totalCalories(meals: Meal[]): number {
  return meals.reduce((sum, m) => sum + m.macros.calories, 0);
}

/**
 * Pick a meal for a slot whose calories are close to the per-slot target.
 * Chooses randomly from the top 3 closest matches to keep some variety.
 */
function pickClosestMealForSlot(
  pool: Meal[],
  slot: MealSlot,
  perSlotTarget: number,
  excludeIds: string[]
): Meal | null {
  const candidates = pool
    .filter((m) => m.slot === slot && !excludeIds.includes(m.id))
    .sort(
      (a, b) =>
        Math.abs(a.macros.calories - perSlotTarget) -
        Math.abs(b.macros.calories - perSlotTarget)
    );

  if (candidates.length === 0) return null;
  const topMatches = candidates.slice(0, Math.min(3, candidates.length));
  return topMatches[Math.floor(Math.random() * topMatches.length)];
}

/** Constraint-based meal plan — TODO: replace with AI/API when ready */
export function generateMealPlan(profile: Profile, maxAttempts = 40): GeneratedDayPlan {
  const pool = filterTemplates(profile.diet_type, profile.allergies ?? []);
  const targetCalories = calculateDailyCalorieTarget(profile);
  const perSlotTarget = targetCalories / SLOTS.length;

  let best: Meal[] = [];
  let bestDiff = Infinity;

  // Step 1 — Better initial selection: prefer meals close to the per-slot target.
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const meals: Meal[] = [];
    const usedIds: string[] = [];
    for (const slot of SLOTS) {
      const meal = pickClosestMealForSlot(pool, slot, perSlotTarget, usedIds);
      if (meal) {
        meals.push(meal);
        usedIds.push(meal.id);
      }
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
      const meal = pickClosestMealForSlot(
        pool,
        slot,
        perSlotTarget,
        best.map((m) => m.id)
      );
      if (meal) best.push(meal);
    }
  }

  const meals = [...best];

  // Step 2 — Add extra snacks (or small meals) to close the calorie gap.
  let gap = targetCalories - totalCalories(meals);
  while (gap > GAP_THRESHOLD && meals.length < MAX_MEALS) {
    const usedIds = meals.map((m) => m.id);
    let extra = pickMealForSlot(pool, 'snack', usedIds);

    if (!extra) {
      // No snack available — try the smallest available meal from any slot.
      const fallbackCandidates = pool
        .filter((m) => !usedIds.includes(m.id))
        .sort((a, b) => a.macros.calories - b.macros.calories);
      extra = fallbackCandidates[0] ?? null;
    }

    if (!extra) break;

    meals.push(extra);
    gap = targetCalories - totalCalories(meals);
  }

  // Step 3 — Never exceed the target by more than 15%.
  if (totalCalories(meals) > targetCalories * OVER_TARGET_LIMIT && meals.length > SLOTS.length) {
    meals.pop();
  }

  return {
    meals,
    targetCalories,
    actualCalories: totalCalories(meals),
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
