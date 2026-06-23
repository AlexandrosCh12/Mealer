/**
 * Daily meal plan generator — constraint-based selection from templates.
 *
 * Picks breakfast, lunch, dinner, and snack from filterTemplates, then
 * iteratively adds snacks until calories are within ~8% of target (or
 * caps at 15% over). swapMeal supports one-tap replacement on Home.
 *
 * Algorithm is template-driven today; intended to be replaced by AI/API later.
 */
import { calculateDailyCalorieTarget } from '@/lib/calories';
import { filterTemplates, pickMealForSlot } from '@/lib/mealTemplates';
import type { Meal, MealSlot, Profile } from '@/types';

const SLOTS: MealSlot[] = ['breakfast', 'lunch', 'dinner', 'snack'];
const MAX_MEALS = 7;
/** Only add extra meals when under target by more than this many kcal. */
const GAP_THRESHOLD = 150;
/** Hard cap: drop last added meal if total exceeds target by more than 15%. */
const OVER_TARGET_LIMIT = 1.15;

/** Result of generateMealPlan — meals plus calorie bookkeeping. */
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
 *
 * @param pool - Diet/allergy-filtered template pool.
 * @param slot - Meal slot to fill.
 * @param perSlotTarget - targetCalories / number of base slots.
 * @param excludeIds - Meal ids already chosen (no duplicates).
 * @returns Best-fit meal or null if none available.
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
  // Random among top 3 avoids identical plans every day while staying on-target.
  const topMatches = candidates.slice(0, Math.min(3, candidates.length));
  return topMatches[Math.floor(Math.random() * topMatches.length)];
}

/**
 * Builds a full day of meals matching the user's calorie target.
 *
 * Three phases:
 * 1. Monte Carlo: up to 40 attempts picking closest meals per slot; keep best.
 * 2. Gap fill: add snacks (or smallest meals) while under target by >150 kcal.
 * 3. Cap: remove last addition if total exceeds 115% of target.
 *
 * @param profile - Diet type, allergies, and body stats.
 * @param maxAttempts - Retry count for phase 1 (default 40).
 * @returns Meals array with target and actual calorie totals.
 */
export function generateMealPlan(profile: Profile, maxAttempts = 40): GeneratedDayPlan {
  const pool = filterTemplates(profile.diet_type, profile.allergies ?? []);
  const targetCalories = calculateDailyCalorieTarget(profile);
  const perSlotTarget = targetCalories / SLOTS.length;

  let best: Meal[] = [];
  let bestDiff = Infinity;

  // Phase 1 — Better initial selection: prefer meals close to the per-slot target.
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
      // Within 8% of target — good enough to stop searching.
      if (diff <= targetCalories * 0.08) break;
    }
  }

  // Fallback if every attempt failed to fill all four slots.
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

  // Phase 2 — Add extra snacks (or small meals) to close the calorie gap.
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

  // Phase 3 — Never exceed the target by more than 15%.
  if (totalCalories(meals) > targetCalories * OVER_TARGET_LIMIT && meals.length > SLOTS.length) {
    meals.pop();
  }

  return {
    meals,
    targetCalories,
    actualCalories: totalCalories(meals),
  };
}

/**
 * Picks a random replacement meal for one slot, excluding current day meals.
 *
 * @param profile - Used to filter templates by diet and allergies.
 * @param currentMeals - Existing day meals (ids excluded from pool).
 * @param slot - Which meal slot to replace.
 * @returns New meal or null if no candidates remain.
 */
export function swapMeal(
  profile: Profile,
  currentMeals: Meal[],
  slot: MealSlot
): Meal | null {
  const pool = filterTemplates(profile.diet_type, profile.allergies ?? []);
  const excludeIds = currentMeals.map((m) => m.id);
  return pickMealForSlot(pool, slot, excludeIds);
}
