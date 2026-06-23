/**
 * Weekly meal plan structure and generation.
 *
 * Defines DayPlan / WeeklyPlan shapes, computes week boundaries (Monday start),
 * and builds a 7-day plan by calling generateMealPlan once per day. Consumed
 * by Home, Shopping, Nutrition, and mealPlanStorage.
 */
import { generateMealPlan } from './mealGenerator';
import type { Meal, Profile } from '@/types';

/** A single calendar day within a weekly plan. */
export interface DayPlan {
  date: string; // ISO date string YYYY-MM-DD
  meals: Meal[];
  targetCalories: number;
  actualCalories: number;
}

/** Full week of day plans plus metadata for cache invalidation. */
export interface WeeklyPlan {
  weekStart: string; // Monday ISO date
  days: DayPlan[];
  generatedAt: string;
}

/**
 * Returns the ISO date string (YYYY-MM-DD) for the Monday of the given week.
 *
 * Sunday is treated as the last day of the previous week so weeks align
 * with European calendar conventions.
 *
 * @param date - Any date within the target week.
 * @returns Monday's date as YYYY-MM-DD.
 */
export function getWeekStart(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  // Shift Sunday (0) back 6 days; Mon–Sat shift to preceding Monday.
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const dayStr = String(d.getDate()).padStart(2, '0');
  return year + '-' + month + '-' + dayStr;
}

/**
 * Today's date as YYYY-MM-DD in local time.
 *
 * @returns ISO date string for the current day.
 */
export function getTodayString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return year + '-' + month + '-' + day;
}

/**
 * Builds a fresh 7-day plan for the current week.
 *
 * Each day gets an independent generateMealPlan run (same profile, new
 * random picks) so the shopping list has variety across the week.
 *
 * @param profile - Diet, allergies, and body stats for calorie targeting.
 * @returns WeeklyPlan starting on this week's Monday.
 */
export function generateWeeklyPlan(profile: Profile): WeeklyPlan {
  const weekStart = getWeekStart(new Date());
  const days: DayPlan[] = [];

  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];

    // Use the calorie-aware generator, keeping all meals (including extra snacks)
    const plan = generateMealPlan(profile);

    days.push({
      date: dateStr,
      meals: plan.meals,
      targetCalories: plan.targetCalories,
      actualCalories: plan.actualCalories,
    });
  }

  return {
    weekStart,
    days,
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Extracts today's day plan from a cached weekly plan.
 *
 * @param weeklyPlan - Stored or generated week.
 * @returns Matching DayPlan or null if today is outside the week.
 */
export function getTodayPlan(weeklyPlan: WeeklyPlan): DayPlan | null {
  const today = getTodayString();
  return weeklyPlan.days.find((d) => d.date === today) ?? null;
}
